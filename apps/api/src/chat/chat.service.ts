import { Injectable } from '@nestjs/common';
import { prisma, type ExperienceMode } from '@creator/database';
import { CreatorAgents, ModelRouter } from '@creator/ai';
import { SendMessageSchema } from '@creator/shared';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class ChatService {
  private readonly agents = new CreatorAgents(new ModelRouter());

  constructor(private readonly auth: AuthService) {}

  async listSessions() {
    const user = await this.auth.demoUser();
    return prisma.chatSession.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: { messages: { orderBy: { createdAt: 'asc' }, take: 1 } },
    });
  }

  async getSession(id: string) {
    return prisma.chatSession.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async send(body: unknown) {
    const input = SendMessageSchema.parse(body);
    const user = await this.auth.demoUser();
    const mode = (input.mode ?? user.mode) as ExperienceMode;

    let sessionId = input.sessionId;
    if (!sessionId) {
      const session = await prisma.chatSession.create({
        data: {
          userId: user.id,
          projectId: input.projectId,
          title: input.content.slice(0, 60),
        },
      });
      sessionId = session.id;
    }

    await prisma.message.create({
      data: {
        sessionId,
        role: 'user',
        content: input.content,
      },
    });

    const mentoring = await this.agents.chat({ content: input.content, mode });

    const assistant = await prisma.message.create({
      data: {
        sessionId,
        role: 'assistant',
        content: mentoring.explanation,
        mentoring,
      },
    });

    await prisma.usageEvent.create({
      data: {
        userId: user.id,
        kind: 'chat',
        model: 'router',
        tokensIn: 0,
        tokensOut: 0,
      },
    });

    return { sessionId, message: assistant, mentoring };
  }
}
