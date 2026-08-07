import { Injectable } from '@nestjs/common';
import { createAuth } from '@creator/auth';
import { prisma } from '@creator/database';

@Injectable()
export class AuthService {
  readonly auth = createAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
    secret: process.env.BETTER_AUTH_SECRET ?? 'dev-only-change-me-creator-secret-key',
    github:
      process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
        ? {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          }
        : undefined,
    google:
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }
        : undefined,
  });

  async demoUser(): Promise<{
    id: string;
    email: string;
    name: string | null;
    mode: 'beginner' | 'intermediate' | 'senior';
  }> {
    const email = 'demo@creator.dev';
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return {
        id: existing.id,
        email: existing.email,
        name: existing.name,
        mode: existing.mode,
      };
    }
    const created = await prisma.user.create({
      data: {
        email,
        name: 'Demo Engineer',
        emailVerified: true,
        mode: 'intermediate',
      },
    });
    return {
      id: created.id,
      email: created.email,
      name: created.name,
      mode: created.mode,
    };
  }
}
