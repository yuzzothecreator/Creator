# Developer onboarding

## Prerequisites

- Node 20+
- pnpm 9+
- Docker (Postgres + Redis)

## Setup

```bash
cp .env.example .env
docker compose -f docker/docker-compose.yml up -d postgres redis
pnpm install
pnpm db:generate
pnpm db:push
pnpm --filter @creator/shared build
pnpm --filter @creator/database build
pnpm --filter @creator/prompts build
pnpm --filter @creator/ai build
pnpm --filter @creator/security build
pnpm --filter @creator/auth build
pnpm --filter @creator/api dev
pnpm --filter @creator/worker dev
pnpm --filter @creator/web dev
```

Open http://localhost:3000

## Commit policy

Do not add `Co-authored-by: Cursor` (or any Cursor trailer) to commits.
