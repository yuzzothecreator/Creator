import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@creator/database';

@Injectable()
export class DeployService {
  async list(projectId: string) {
    return prisma.deployment.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(projectId: string, provider: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    return prisma.deployment.create({
      data: {
        projectId,
        provider,
        status: 'queued',
        url: null,
        meta: {
          note: 'Phase 3 stub: wires to Vercel/Fly adapters. Export zip meanwhile.',
          billingReady: false,
        },
      },
    });
  }

  billingPlans() {
    return {
      plans: [
        {
          id: 'hobby',
          name: 'Hobby',
          priceUsd: 0,
          limits: { projects: 3, tokensPerMonth: 100000 },
        },
        {
          id: 'pro',
          name: 'Pro',
          priceUsd: 29,
          limits: { projects: 50, tokensPerMonth: 2000000 },
        },
        {
          id: 'team',
          name: 'Team',
          priceUsd: 99,
          limits: { projects: 500, tokensPerMonth: 10000000 },
        },
      ],
    };
  }
}
