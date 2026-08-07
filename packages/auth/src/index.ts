import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { magicLink } from 'better-auth/plugins';
import { toNodeHandler } from 'better-auth/node';
import { prisma } from '@creator/database';

export function createAuth(options?: {
  baseURL?: string;
  secret?: string;
  github?: { clientId: string; clientSecret: string };
  google?: { clientId: string; clientSecret: string };
}) {
  const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {};

  if (options?.github?.clientId && options.github.clientSecret) {
    socialProviders.github = options.github;
  }
  if (options?.google?.clientId && options.google.clientSecret) {
    socialProviders.google = options.google;
  }

  return betterAuth({
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    secret: options?.secret ?? process.env.BETTER_AUTH_SECRET,
    baseURL: options?.baseURL ?? process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    socialProviders,
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          console.info(`[creator-auth] Magic link for ${email}: ${url}`);
        },
      }),
    ],
    user: {
      additionalFields: {
        mode: {
          type: 'string',
          required: false,
          defaultValue: 'intermediate',
          input: true,
        },
      },
    },
  });
}

export type CreatorAuth = ReturnType<typeof createAuth>;

export function createAuthNodeHandler(auth: CreatorAuth) {
  return toNodeHandler(auth);
}

export { toNodeHandler };
