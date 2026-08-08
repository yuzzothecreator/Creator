import os
from collections.abc import AsyncGenerator
from decimal import Decimal

# Configure test env before app modules bind settings/engine.
os.environ["DATABASE_URL"] = "sqlite+aiosqlite://"
os.environ["DATABASE_URL_SYNC"] = "sqlite://"
os.environ["JWT_SECRET"] = "test-secret-key-at-least-32-characters-long"
os.environ["SEED_ON_STARTUP"] = "false"
os.environ["DEBUG"] = "false"

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.core.config import get_settings
from app.core.database import Base, get_db
from app.core.security import hash_password
from app.models.category import Category
from app.models.product import Product
from app.models.user import User

get_settings.cache_clear()

engine = create_async_engine(
    "sqlite+aiosqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


@pytest_asyncio.fixture(autouse=True)
async def prepare_db() -> AsyncGenerator[None, None]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        session.add(
            User(
                email="admin@example.com",
                full_name="Admin",
                hashed_password=hash_password("adminpass123"),
                is_admin=True,
            )
        )
        session.add(
            User(
                email="demo@example.com",
                full_name="Demo",
                hashed_password=hash_password("demopass123"),
            )
        )
        category = Category(name="Apparel", slug="apparel", description="Clothes")
        session.add(category)
        await session.flush()
        session.add(
            Product(
                name="Creator Tee",
                slug="creator-tee",
                description="Soft cotton tee",
                price=Decimal("29.00"),
                stock=10,
                category_id=category.id,
            )
        )
        await session.commit()

    yield

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    from app.main import app

    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
