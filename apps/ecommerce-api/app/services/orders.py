from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.order import Order, OrderItem, OrderStatus
from app.models.user import User
from app.schemas.order import OrderCheckoutRequest
from app.services.cart import clear_cart, _load_cart_items
from app.services.products import get_product


async def checkout(db: AsyncSession, user: User, payload: OrderCheckoutRequest) -> Order:
    cart_items = await _load_cart_items(db, user.id)
    if not cart_items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")

    order = Order(
        user_id=user.id,
        status=OrderStatus.PENDING,
        total_amount=Decimal("0.00"),
        shipping_address=payload.shipping_address.strip(),
    )
    db.add(order)
    await db.flush()

    total = Decimal("0.00")
    for cart_item in cart_items:
        product = await get_product(db, cart_item.product_id)
        if not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product '{product.name}' is inactive",
            )
        if product.stock < cart_item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}'",
            )
        line_total = Decimal(product.price) * cart_item.quantity
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                product_name=product.name,
                unit_price=product.price,
                quantity=cart_item.quantity,
                line_total=line_total,
            )
        )
        product.stock -= cart_item.quantity
        total += line_total

    order.total_amount = total
    await clear_cart(db, user)
    await db.flush()
    return await get_order(db, order.id, user)


async def list_orders(db: AsyncSession, user: User, *, admin: bool = False) -> list[Order]:
    query = select(Order).options(selectinload(Order.items)).order_by(Order.id.desc())
    if not admin:
        query = query.where(Order.user_id == user.id)
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_order(db: AsyncSession, order_id: int, user: User, *, admin: bool = False) -> Order:
    result = await db.execute(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if not admin and order.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your order")
    return order


async def update_order_status(
    db: AsyncSession, order_id: int, new_status: OrderStatus
) -> Order:
    result = await db.execute(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    order.status = new_status
    await db.flush()
    await db.refresh(order)
    return order
