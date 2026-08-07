$ErrorActionPreference = "Stop"
Write-Host "Starting Creator infra + apps..."
docker compose -f docker/docker-compose.yml up -d postgres redis
pnpm db:generate
pnpm db:push
pnpm dev
