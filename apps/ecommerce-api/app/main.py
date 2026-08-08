from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import AsyncSessionLocal, Base, engine
from app.routers import auth, cart, categories, health, orders, payments, products, users
from app.seed import seed_demo_data

# Ensure models are registered on Base.metadata
from app import models  # noqa: F401

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Dev-friendly bootstrap: create tables if missing.
    # Prefer Alembic for production schema changes: `alembic upgrade head`
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    if settings.seed_on_startup:
        async with AsyncSessionLocal() as session:
            await seed_demo_data(session)
            await session.commit()
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = settings.api_prefix
app.include_router(health.router)
app.include_router(auth.router, prefix=api)
app.include_router(users.router, prefix=api)
app.include_router(categories.router, prefix=api)
app.include_router(products.router, prefix=api)
app.include_router(cart.router, prefix=api)
app.include_router(orders.router, prefix=api)
app.include_router(payments.router, prefix=api)


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "service": "ecommerce-api",
        "docs": "/docs",
        "health": "/health",
        "api": api,
    }
