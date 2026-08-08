from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.cart import CartItem
from app.models.user import User
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartRead
from app.schemas.product import ProductRead
from app.services.products import get_product


async def get_cart(db: AsyncSession, user: User) -> CartRead:
    items = await _load_cart_items(db, user.id)
    subtotal = Decimal("0.00")
    item_count = 0
    for item in items:
        subtotal += Decimal(item.product.price) * item.quantity
        item_count += item.quantity
    return CartRead(
        items=[
            {
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "product": ProductRead.model_validate(item.product),
            }
            for item in items
        ],
        item_count=item_count,
        subtotal=subtotal,
    )


async def add_to_cart(db: AsyncSession, user: User, payload: CartItemCreate) -> CartRead:
    product = await get_product(db, payload.product_id)
    if not product.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Product is inactive")
    if product.stock < payload.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock for requested quantity",
        )

    result = await db.execute(
        select(CartItem).where(
            CartItem.user_id == user.id, CartItem.product_id == payload.product_id
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        new_qty = existing.quantity + payload.quantity
        if product.stock < new_qty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient stock for requested quantity",
            )
        existing.quantity = new_qty
    else:
        db.add(
            CartItem(
                user_id=user.id,
                product_id=payload.product_id,
                quantity=payload.quantity,
            )
        )
    await db.flush()
    return await get_cart(db, user)


async def update_cart_item(
    db: AsyncSession, user: User, item_id: int, payload: CartItemUpdate
) -> CartRead:
    item = await _get_user_cart_item(db, user.id, item_id)
    product = await get_product(db, item.product_id)
    if product.stock < payload.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock for requested quantity",
        )
    item.quantity = payload.quantity
    await db.flush()
    return await get_cart(db, user)


async def remove_cart_item(db: AsyncSession, user: User, item_id: int) -> CartRead:
    item = await _get_user_cart_item(db, user.id, item_id)
    await db.delete(item)
    await db.flush()
    return await get_cart(db, user)


async def clear_cart(db: AsyncSession, user: User) -> None:
    items = await _load_cart_items(db, user.id)
    for item in items:
        await db.delete(item)
    await db.flush()


async def _load_cart_items(db: AsyncSession, user_id: int) -> list[CartItem]:
    result = await db.execute(
        select(CartItem)
        .where(CartItem.user_id == user_id)
        .options(selectinload(CartItem.product))
        .order_by(CartItem.id)
    )
    return list(result.scalars().all())


async def _get_user_cart_item(db: AsyncSession, user_id: int, item_id: int) -> CartItem:
    result = await db.execute(
        select(CartItem).where(CartItem.id == item_id, CartItem.user_id == user_id)
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")
    return item
