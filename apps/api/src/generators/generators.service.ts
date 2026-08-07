import { Injectable } from '@nestjs/common';
import { scanForVulnerabilities, analyzePerformance } from '@creator/security';

@Injectable()
export class GeneratorsService {
  generateUi(prompt: string) {
    return {
      kind: 'ui',
      prompt,
      componentName: 'GeneratedPanel',
      code: `export function GeneratedPanel() {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-xl font-semibold">Generated UI</h2>
      <p className="mt-2 text-sm opacity-80">${prompt.replace(/`/g, "'").slice(0, 180)}</p>
    </section>
  );
}
`,
      why: 'UI generator produces accessible, token-driven React sections instead of one-off CSS.',
      nextStep: 'Drop into apps/web and wire real data.',
    };
  }

  generateDatabase(entities: string[]) {
    const models = entities.length ? entities : ['User', 'Project', 'Item'];
    return {
      kind: 'database',
      prisma: models
        .map(
          (name) => `model ${name} {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`,
        )
        .join('\n\n'),
      why: 'Prisma keeps schema as source of truth for TypeScript apps.',
      erd: `erDiagram\n  ${models.map((m) => `${m} {\n    string id\n  }`).join('\n  ')}`,
    };
  }

  generateApi(style: 'rest' | 'graphql' | 'trpc' = 'rest') {
    return {
      kind: 'api',
      style,
      openapi: {
        openapi: '3.1.0',
        info: { title: 'Generated API', version: '0.1.0' },
        paths: {
          '/items': {
            get: { summary: 'List items' },
            post: { summary: 'Create item' },
          },
        },
      },
      why:
        style === 'trpc'
          ? 'tRPC gives end-to-end types for TypeScript monorepos.'
          : style === 'graphql'
            ? 'GraphQL fits multi-client flexible queries.'
            : 'REST is universal and cache-friendly for CRUD.',
    };
  }

  generateDevops(appName: string) {
    return {
      kind: 'devops',
      files: [
        {
          path: 'Dockerfile',
          content: `FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
`,
        },
        {
          path: 'nginx.conf',
          content: `server {
  listen 80;
  location / {
    proxy_pass http://web:3000;
  }
}
`,
        },
        {
          path: '.github/workflows/deploy.yml',
          content: `name: deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "Deploy ${appName}"
`,
        },
      ],
      why: 'DevOps scaffolds encode the path to reproducible deploys early.',
    };
  }

  scanSecurity(files: Array<{ path: string; content: string }>) {
    return scanForVulnerabilities(files);
  }

  scanPerformance(files: Array<{ path: string; content: string }>) {
    return analyzePerformance(files);
  }
}
