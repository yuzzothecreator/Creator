import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { prisma, type ExperienceMode } from '@creator/database';
import { ModelRouter, generateProjectFiles, runCriticReview } from '@creator/ai';
import { scanForVulnerabilities, analyzePerformance } from '@creator/security';

const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const router = new ModelRouter();

async function processCodegen(data: { projectId: string; runId: string; jobId: string }) {
  await prisma.job.update({
    where: { id: data.jobId },
    data: { status: 'active' },
  });

  const project = await prisma.project.findUniqueOrThrow({ where: { id: data.projectId } });
  const run = await prisma.generationRun.findUniqueOrThrow({
    where: { id: data.runId },
    include: { steps: true },
  });

  const context: Record<string, unknown> = {};
  for (const step of run.steps) {
    if (step.payload) context[step.type] = step.payload;
  }

  await prisma.pipelineStep.updateMany({
    where: { runId: run.id, type: 'codegen' },
    data: { status: 'running' },
  });

  const files = await generateProjectFiles({
    router,
    mode: project.mode as ExperienceMode,
    idea: project.idea,
    context,
  });

  for (const file of files) {
    await prisma.fileNode.upsert({
      where: { projectId_path: { projectId: project.id, path: file.path } },
      create: {
        projectId: project.id,
        path: file.path,
        content: file.content,
        language: file.language,
      },
      update: {
        content: file.content,
        language: file.language,
      },
    });
  }

  await prisma.pipelineStep.updateMany({
    where: { runId: run.id, type: 'codegen' },
    data: { status: 'completed', payload: { fileCount: files.length } },
  });

  await prisma.pipelineStep.updateMany({
    where: { runId: run.id, type: 'review' },
    data: { status: 'running' },
  });

  const report = await runCriticReview({
    router,
    mode: project.mode as ExperienceMode,
    files,
    architecture: run.architecture,
  });
  const security = scanForVulnerabilities(files);
  const performance = analyzePerformance(files);

  await prisma.reviewReport.create({
    data: {
      runId: run.id,
      overall: Number(((report.overall + security.score + performance.score) / 3).toFixed(2)),
      summary: `${report.summary} Security ${security.score}/10. Performance ${performance.score}/10.`,
      scores: JSON.parse(
        JSON.stringify({
          critic: report.axes,
          security,
          performance,
        }),
      ) as object,
      findings: [
        ...report.axes.flatMap((a) => a.findings),
        ...security.findings.map((f) => f.message),
        ...performance.findings.map((f) => f.message),
      ],
    },
  });

  await prisma.pipelineStep.updateMany({
    where: { runId: run.id, type: 'review' },
    data: { status: 'completed' },
  });

  const docs = files.filter((f) => f.path.endsWith('.md'));
  await prisma.artifact.create({
    data: {
      projectId: project.id,
      kind: 'docs_pack',
      title: 'Documentation pack',
      content: { files: docs.map((d) => d.path) },
    },
  });

  await prisma.pipelineStep.updateMany({
    where: { runId: run.id, type: 'docs_pack' },
    data: { status: 'completed', payload: { docs: docs.map((d) => d.path) } },
  });

  await prisma.generationRun.update({
    where: { id: run.id },
    data: { stage: 'docs_pack' },
  });

  await prisma.project.update({
    where: { id: project.id },
    data: { status: 'ready' },
  });

  await prisma.job.update({
    where: { id: data.jobId },
    data: {
      status: 'completed',
      result: { fileCount: files.length, overall: report.overall },
    },
  });
}

const concurrency = Number(process.env.WORKER_CONCURRENCY ?? 2);

const worker = new Worker(
  'codegen',
  async (job) => {
    await processCodegen(job.data as { projectId: string; runId: string; jobId: string });
  },
  { connection, concurrency },
);

worker.on('ready', () => {
  console.log(`Creator worker ready (concurrency=${concurrency})`);
});

worker.on('failed', async (job, err) => {
  console.error('Job failed', job?.id, err);
  const jobId = (job?.data as { jobId?: string } | undefined)?.jobId;
  if (jobId) {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'failed', error: err.message },
    });
  }
});
