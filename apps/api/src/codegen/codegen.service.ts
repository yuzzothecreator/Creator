import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@creator/database';

@Injectable()
export class CodegenService {
  async listFiles(projectId: string) {
    return prisma.fileNode.findMany({
      where: { projectId },
      orderBy: { path: 'asc' },
    });
  }

  async getFile(projectId: string, path: string) {
    const file = await prisma.fileNode.findUnique({
      where: { projectId_path: { projectId, path } },
    });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async explainFile(projectId: string, path: string) {
    const file = await this.getFile(projectId, path);
    return {
      path: file.path,
      language: file.language,
      explanation: `This file at \`${file.path}\` contributes to the generated application.`,
      why: 'Creator keeps explanations beside code so beginners learn structure, not just syntax.',
      lineNotes: file.content
        .split('\n')
        .slice(0, 20)
        .map((line, index) => ({
          line: index + 1,
          text: line,
          note: line.trim() ? 'Part of the module surface.' : 'Whitespace for readability.',
        })),
      securityNotes: ['Do not commit secrets into generated files.'],
      performanceNotes: ['Keep modules focused to improve tree-shaking and reviewability.'],
      nextStep: 'Open related files in the tree to see how this module connects.',
    };
  }
}
