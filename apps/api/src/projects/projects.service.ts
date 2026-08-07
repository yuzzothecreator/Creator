import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma, type ExperienceMode } from '@creator/database';
import { CreateProjectSchema, PIPELINE_STEP_ORDER } from '@creator/shared';
import { AuthService } from '../auth/auth.service';
import archiver from 'archiver';
import { PassThrough } from 'node:stream';

@Injectable()
export class ProjectsService {
  constructor(private readonly auth: AuthService) {}

  async list() {
    const user = await this.auth.demoUser();
    return prisma.project.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        generationRuns: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
  }

  async get(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        fileNodes: true,
        artifacts: true,
        generationRuns: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { steps: { orderBy: { sortOrder: 'asc' } }, reviewReports: true },
        },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(body: unknown) {
    const input = CreateProjectSchema.parse(body);
    const user = await this.auth.demoUser();

    const project = await prisma.project.create({
      data: {
        name: input.name,
        idea: input.idea,
        mode: input.mode as ExperienceMode,
        status: 'planning',
        ownerId: user.id,
        generationRuns: {
          create: {
            stage: 'understand',
            steps: {
              create: PIPELINE_STEP_ORDER.map((type, index) => ({
                type,
                status: 'pending',
                sortOrder: index,
              })),
            },
          },
        },
      },
      include: {
        generationRuns: { include: { steps: true } },
      },
    });

    return project;
  }

  async exportZip(id: string): Promise<Buffer> {
    const project = await this.get(id);
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = new PassThrough();
    const chunks: Buffer[] = [];
    stream.on('data', (c) => chunks.push(c as Buffer));

    const done = new Promise<Buffer>((resolve, reject) => {
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);
    });

    archive.pipe(stream);
    for (const file of project.fileNodes) {
      archive.append(file.content, { name: file.path });
    }
    if (project.fileNodes.length === 0) {
      archive.append(`# ${project.name}\n\n${project.idea}\n`, { name: 'README.md' });
    }
    await archive.finalize();
    return done;
  }
}
