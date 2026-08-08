# Creator

**Build Software Like a Senior Engineer.**

Creator is an AI software engineering platform that takes you from idea to production-ready architecture while mentoring every decision.

## What makes Creator different

- Mandatory 13-step approve-before-code workflow
- Beginner / Intermediate / Senior mentoring modes
- Why, tradeoffs, security, performance, and next steps on every artifact
- Multi-axis review scorecards after codegen

## Monorepo

```
apps/web             Next.js studio + landing
apps/api             NestJS Creator platform API
apps/ecommerce-api   FastAPI e-commerce backend (Python)
apps/worker          BullMQ codegen/review worker
packages/*           shared domain, AI, auth, UI, editor, security
```

Python storefront API: [`apps/ecommerce-api/README.md`](apps/ecommerce-api/README.md) · [docs/ECOMMERCE_API.md](docs/ECOMMERCE_API.md)

## Quick start

See [docs/ONBOARDING.md](docs/ONBOARDING.md).

```bash
cp .env.example .env
docker compose -f docker/docker-compose.yml up -d postgres redis
pnpm install
pnpm db:generate && pnpm db:push
pnpm dev
```

## License

Private / proprietary unless otherwise stated.
