from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
from app.services.categories import get_category
from app.services.utils import slugify


async def list_products(
    db: AsyncSession,
    *,
    q: str | None = None,
    category_id: int | None = None,
    in_stock: bool | None = None,
    is_active: bool | None = True,
    skip: int = 0,
    limit: int = 50,
) -> list[Product]:
    query = select(Product)
    if q:
        pattern = f"%{q.strip()}%"
        query = query.where(Product.name.ilike(pattern))
    if category_id is not None:
        query = query.where(Product.category_id == category_id)
    if in_stock is True:
        query = query.where(Product.stock > 0)
    elif in_stock is False:
        query = query.where(Product.stock <= 0)
    if is_active is not None:
        query = query.where(Product.is_active.is_(is_active))
    query = query.order_by(Product.id.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_product(db: AsyncSession, product_id: int) -> Product:
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


async def create_product(db: AsyncSession, payload: ProductCreate) -> Product:
    if payload.category_id is not None:
        await get_category(db, payload.category_id)
    slug = payload.slug or slugify(payload.name)
    await _ensure_unique_slug(db, slug)
    product = Product(
        name=payload.name.strip(),
        slug=slug,
        description=payload.description,
        price=payload.price,
        stock=payload.stock,
        is_active=payload.is_active,
        category_id=payload.category_id,
    )
    db.add(product)
    await db.flush()
    await db.refresh(product)
    return product


async def update_product(
    db: AsyncSession, product_id: int, payload: ProductUpdate
) -> Product:
    product = await get_product(db, product_id)
    data = payload.model_dump(exclude_unset=True)
    if "category_id" in data and data["category_id"] is not None:
        await get_category(db, data["category_id"])
    if "name" in data and data["name"] is not None:
        data["name"] = data["name"].strip()
    if "slug" in data and data["slug"]:
        await _ensure_unique_slug(db, data["slug"], exclude_id=product.id)
    for key, value in data.items():
        setattr(product, key, value)
    await db.flush()
    await db.refresh(product)
    return product


async def update_stock(db: AsyncSession, product_id: int, stock: int) -> Product:
    product = await get_product(db, product_id)
    product.stock = stock
    await db.flush()
    await db.refresh(product)
    return product


async def delete_product(db: AsyncSession, product_id: int) -> None:
    product = await get_product(db, product_id)
    await db.delete(product)
    await db.flush()


async def _ensure_unique_slug(
    db: AsyncSession, slug: str, exclude_id: int | None = None
) -> None:
    query = select(Product).where(Product.slug == slug)
    if exclude_id is not None:
        query = query.where(Product.id != exclude_id)
    existing = await db.execute(query)
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Product slug already exists",
        )
