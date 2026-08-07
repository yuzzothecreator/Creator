import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { prisma, type ExperienceMode, type PipelineStepType } from '@creator/database';
import { PipelineEngine, type PipelineState } from '@creator/ai';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

@Injectable()
export class PipelineService {
  private readonly engine = new PipelineEngine();
  private readonly connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
  });
  private readonly codegenQueue = new Queue('codegen', { connection: this.connection });

  async getRun(projectId: string) {
    const run = await prisma.generationRun.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: { steps: { orderBy: { sortOrder: 'asc' } }, reviewReports: true },
    });
    if (!run) throw new NotFoundException('Generation run not found');
    return run;
  }

  async advance(projectId: string, userAnswers?: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    const run = await this.getRun(projectId);

    const state = this.toState(run);
    const next = await this.engine.advance({
      state,
      idea: project.idea,
      mode: project.mode as ExperienceMode,
      userAnswers,
    });

    await this.persistState(run.id, next, projectId);
    return this.getRun(projectId);
  }

  async approve(projectId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    const run = await this.getRun(projectId);
    const state = this.toState(run);

    let approved: PipelineState;
    try {
      approved = this.engine.approve(state);
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Cannot approve');
    }

    await this.persistState(run.id, approved, projectId);
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'generating' },
    });

    const job = await prisma.job.create({
      data: {
        runId: run.id,
        queue: 'codegen',
        status: 'queued',
        payload: { projectId },
      },
    });

    const bullJob = await this.codegenQueue.add('generate', {
      projectId,
      runId: run.id,
      jobId: job.id,
    });

    await prisma.job.update({
      where: { id: job.id },
      data: { bullId: String(bullJob.id) },
    });

    return this.getRun(projectId);
  }

  async regenerateStep(projectId: string, stepType: PipelineStepType) {
    const run = await this.getRun(projectId);
    await prisma.pipelineStep.updateMany({
      where: { runId: run.id, type: stepType },
      data: { status: 'pending', payload: undefined, mentoring: undefined, error: null },
    });
    await prisma.generationRun.update({
      where: { id: run.id },
      data: { stage: stepType, approvedForCode: stepType === 'codegen' ? run.approvedForCode : false },
    });
    return this.advance(projectId);
  }

  private toState(run: {
    stage: PipelineStepType;
    approvedForCode: boolean;
    prd: unknown;
    stories: unknown;
    features: unknown;
    architecture: unknown;
    steps: Array<{
      type: PipelineStepType;
      status: PipelineState['steps'][number]['status'];
      payload: unknown;
      mentoring: unknown;
      error: string | null;
    }>;
  }): PipelineState {
    const context: Record<string, unknown> = {};
    for (const step of run.steps) {
      if (step.payload) context[step.type] = step.payload;
    }
    if (run.prd) context.prd = run.prd;
    if (run.stories) context.stories = run.stories;
    if (run.features) context.features = run.features;
    if (run.architecture) context.architecture = run.architecture;

    return {
      stage: run.stage,
      approvedForCode: run.approvedForCode,
      context,
      steps: run.steps.map((s) => ({
        type: s.type,
        status: s.status,
        payload: s.payload ?? undefined,
        mentoring: (s.mentoring as PipelineState['steps'][number]['mentoring']) ?? undefined,
        error: s.error ?? undefined,
      })),
    };
  }

  private async persistState(runId: string, state: PipelineState, projectId: string) {
    await prisma.generationRun.update({
      where: { id: runId },
      data: {
        stage: state.stage,
        approvedForCode: state.approvedForCode,
        prd: (state.context.prd as object) ?? undefined,
        stories: (state.context.user_stories as object) ?? undefined,
        features: (state.context.features as object) ?? undefined,
        architecture: (state.context.architecture as object) ?? undefined,
      },
    });

    for (const step of state.steps) {
      await prisma.pipelineStep.updateMany({
        where: { runId, type: step.type },
        data: {
          status: step.status,
          payload: (step.payload as object) ?? undefined,
          mentoring: (step.mentoring as object) ?? undefined,
          error: step.error ?? null,
        },
      });
    }

    const status =
      state.stage === 'await_approval'
        ? 'awaiting_approval'
        : state.stage === 'codegen' || state.stage === 'review' || state.stage === 'docs_pack'
          ? 'generating'
          : 'planning';

    await prisma.project.update({
      where: { id: projectId },
      data: { status },
    });
  }
}
