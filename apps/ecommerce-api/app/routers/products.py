from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_active_admin
from app.models.user import User
from app.schemas.common import Message
from app.schemas.product import (
    ProductCreate,
    ProductRead,
    ProductStockUpdate,
    ProductUpdate,
)
from app.services import products as products_service

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductRead])
async def list_products(
    q: str | None = Query(default=None, description="Search by name"),
    category_id: int | None = None,
    in_stock: bool | None = None,
    is_active: bool | None = True,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await products_service.list_products(
        db,
        q=q,
        category_id=category_id,
        in_stock=in_stock,
        is_active=is_active,
        skip=skip,
        limit=limit,
    )


@router.get("/{product_id}", response_model=ProductRead)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    return await products_service.get_product(db, product_id)


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(
    payload: ProductCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),
):
    return await products_service.create_product(db, payload)


@router.patch("/{product_id}", response_model=ProductRead)
async def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),
):
    return await products_service.update_product(db, product_id, payload)


@router.patch("/{product_id}/stock", response_model=ProductRead)
async def update_stock(
    product_id: int,
    payload: ProductStockUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),
):
    return await products_service.update_stock(db, product_id, payload.stock)


@router.delete("/{product_id}", response_model=Message)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),
) -> Message:
    await products_service.delete_product(db, product_id)
    return Message(detail="Product deleted")
