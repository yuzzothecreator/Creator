from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.services.utils import slugify


async def list_categories(db: AsyncSession) -> list[Category]:
    result = await db.execute(select(Category).order_by(Category.name))
    return list(result.scalars().all())


async def get_category(db: AsyncSession, category_id: int) -> Category:
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


async def create_category(db: AsyncSession, payload: CategoryCreate) -> Category:
    slug = payload.slug or slugify(payload.name)
    await _ensure_unique_slug(db, slug)
    category = Category(
        name=payload.name.strip(),
        slug=slug,
        description=payload.description,
    )
    db.add(category)
    await db.flush()
    await db.refresh(category)
    return category


async def update_category(
    db: AsyncSession, category_id: int, payload: CategoryUpdate
) -> Category:
    category = await get_category(db, category_id)
    data = payload.model_dump(exclude_unset=True)
    if "name" in data and data["name"] is not None:
        data["name"] = data["name"].strip()
    if "slug" in data and data["slug"]:
        await _ensure_unique_slug(db, data["slug"], exclude_id=category.id)
    for key, value in data.items():
        setattr(category, key, value)
    await db.flush()
    await db.refresh(category)
    return category


async def delete_category(db: AsyncSession, category_id: int) -> None:
    category = await get_category(db, category_id)
    await db.delete(category)
    await db.flush()


async def _ensure_unique_slug(
    db: AsyncSession, slug: str, exclude_id: int | None = None
) -> None:
    query = select(Category).where(Category.slug == slug)
    if exclude_id is not None:
        query = query.where(Category.id != exclude_id)
    existing = await db.execute(query)
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category slug already exists",
        )
