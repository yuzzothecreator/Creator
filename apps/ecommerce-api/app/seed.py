"""Idempotent demo seed for local development."""

from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.category import Category
from app.models.product import Product
from app.models.user import User


async def seed_demo_data(db: AsyncSession) -> None:
    admin_email = "admin@example.com"
    demo_email = "demo@example.com"

    admin = (
        await db.execute(select(User).where(User.email == admin_email))
    ).scalar_one_or_none()
    if admin is None:
        db.add(
            User(
                email=admin_email,
                full_name="Demo Admin",
                hashed_password=hash_password("adminpass123"),
                is_admin=True,
            )
        )

    demo = (
        await db.execute(select(User).where(User.email == demo_email))
    ).scalar_one_or_none()
    if demo is None:
        db.add(
            User(
                email=demo_email,
                full_name="Demo Shopper",
                hashed_password=hash_password("demopass123"),
            )
        )

    categories_spec = [
        ("Apparel", "apparel", "Clothing and accessories"),
        ("Electronics", "electronics", "Gadgets and devices"),
        ("Home", "home", "Home and living"),
    ]
    category_ids: dict[str, int] = {}
    for name, slug, description in categories_spec:
        existing = (
            await db.execute(select(Category).where(Category.slug == slug))
        ).scalar_one_or_none()
        if existing is None:
            category = Category(name=name, slug=slug, description=description)
            db.add(category)
            await db.flush()
            category_ids[slug] = category.id
        else:
            category_ids[slug] = existing.id

    products_spec = [
        ("Creator Tee", "creator-tee", "Soft cotton tee", Decimal("29.00"), 100, "apparel"),
        ("Studio Hoodie", "studio-hoodie", "Warm fleece hoodie", Decimal("69.00"), 40, "apparel"),
        ("USB-C Hub", "usb-c-hub", "7-in-1 hub", Decimal("49.00"), 75, "electronics"),
        ("Desk Lamp", "desk-lamp", "Adjustable LED lamp", Decimal("39.00"), 60, "home"),
        ("Mechanical Keyboard", "mech-keyboard", "Tactile switches", Decimal("119.00"), 25, "electronics"),
    ]
    for name, slug, description, price, stock, cat_slug in products_spec:
        existing = (
            await db.execute(select(Product).where(Product.slug == slug))
        ).scalar_one_or_none()
        if existing is None:
            db.add(
                Product(
                    name=name,
                    slug=slug,
                    description=description,
                    price=price,
                    stock=stock,
                    category_id=category_ids[cat_slug],
                    is_active=True,
                )
            )

    await db.flush()
