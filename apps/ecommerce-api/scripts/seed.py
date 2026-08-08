"""Run: python -m scripts.seed (from apps/ecommerce-api)."""

import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.core.database import AsyncSessionLocal, Base, engine
from app import models  # noqa: F401
from app.seed import seed_demo_data


async def main() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        await seed_demo_data(session)
        await session.commit()
    print("Seed complete.")
    print("  admin@example.com / adminpass123 (admin)")
    print("  demo@example.com  / demopass123")


if __name__ == "__main__":
    asyncio.run(main())
