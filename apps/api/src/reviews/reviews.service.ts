import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma, type ExperienceMode } from '@creator/database';
import { ModelRouter, runCriticReview } from '@creator/ai';

@Injectable()
export class ReviewsService {
  private readonly router = new ModelRouter();

  async latest(projectId: string) {
    const run = await prisma.generationRun.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: { reviewReports: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (!run) throw new NotFoundException('Run not found');
    return run.reviewReports[0] ?? null;
  }

  async run(projectId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    const run = await prisma.generationRun.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    if (!run) throw new NotFoundException('Run not found');

    const files = await prisma.fileNode.findMany({ where: { projectId } });
    const report = await runCriticReview({
      router: this.router,
      mode: project.mode as ExperienceMode,
      files,
      architecture: run.architecture,
    });

    return prisma.reviewReport.create({
      data: {
        runId: run.id,
        overall: report.overall,
        summary: report.summary,
        scores: report.axes,
        findings: report.axes.flatMap((a) => a.findings),
      },
    });
  }
}
