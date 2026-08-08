# Ecommerce API (FastAPI)

Production-oriented Python e-commerce backend for the Creator monorepo.

**Stack:** FastAPI · SQLAlchemy 2.x (async) · Alembic · PostgreSQL · Pydantic v2 · JWT · pytest

This app lives alongside the NestJS Creator API (`apps/api`) and does **not** replace it.

## Features

| Area | Endpoints |
|------|-----------|
| Health | `GET /health` |
| Auth | register, login, JWT access token, `GET /api/v1/auth/me` |
| Users | `GET/PATCH /api/v1/users/me` |
| Categories | list/get (public), CRUD (admin) |
| Products | list/filter, CRUD + stock (admin) |
| Cart | get/add/update/remove/clear |
| Orders | checkout from cart, list/get, status (admin) |
| Payments | stub intent + status (no Stripe keys) |

## Requirements

- Python **3.11 or 3.12** recommended (prebuilt wheels). Python 3.14 may lack wheels for some deps on Windows.
- PostgreSQL 14+ for local/production runtime (tests use SQLite in-memory).

## Quick start

### 1. Database

Use the existing monorepo Postgres (or any Postgres 14+):

```bash
# from repo root
docker compose -f docker/docker-compose.yml up -d postgres

# create dedicated database (once)
docker exec -it creator-postgres psql -U creator -c "CREATE DATABASE ecommerce;"
```

### 2. Configure

```bash
cd apps/ecommerce-api
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

### 3. Migrate (recommended for production)

```bash
alembic upgrade head
```

On startup in development the app also runs `create_all` + optional seed (`SEED_ON_STARTUP=true`).

### 4. Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- OpenAPI: http://localhost:8000/docs  
- Health: http://localhost:8000/health  

### 5. Seed (optional manual)

```bash
python -m scripts.seed
```

Demo users:

- `admin@example.com` / `adminpass123` (admin)
- `demo@example.com` / `demopass123`

## Async note

Runtime and Alembic both use **async** SQLAlchemy + `asyncpg` (`DATABASE_URL`).

`DATABASE_URL_SYNC` in `.env.example` is optional/documentation-only for tools that prefer a sync DSN; the included Alembic env runs async.

## CORS

`.env` `CORS_ORIGINS` defaults to local Next.js (`http://localhost:3000`).

## Tests

```bash
pytest
```

Tests use in-memory SQLite (`aiosqlite`) and do not require Postgres.

## Docker

From repo root (after `ecommerce` DB exists or via compose init):

```bash
docker compose -f docker/docker-compose.yml up -d ecommerce-api
```

Image: `docker/../apps/ecommerce-api/Dockerfile` (build context = monorepo root).

## Example flow

```bash
# register / login
curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"demo@example.com\",\"password\":\"demopass123\"}"

# list products
curl -s http://localhost:8000/api/v1/products

# add to cart (Bearer token required)
curl -s -X POST http://localhost:8000/api/v1/cart/items \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{\"product_id\":1,\"quantity\":1}"

# checkout
curl -s -X POST http://localhost:8000/api/v1/orders/checkout \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{\"shipping_address\":\"123 Main St\"}"

# payment intent stub
curl -s -X POST http://localhost:8000/api/v1/payments/intents \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{\"order_id\":1}"
```

## Layout

```
app/
  core/       config, DB, JWT, deps
  models/     SQLAlchemy models
  schemas/    Pydantic v2
  services/   business logic
  routers/    FastAPI routers
  seed.py
alembic/      migrations
tests/        pytest
scripts/      seed CLI
```
