import secrets
import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order, OrderStatus
from app.models.payment import Payment, PaymentStatus
from app.models.user import User
from app.schemas.payment import PaymentIntentCreate


async def create_payment_intent(
    db: AsyncSession, user: User, payload: PaymentIntentCreate
) -> Payment:
    result = await db.execute(select(Order).where(Order.id == payload.order_id))
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.user_id != user.id and not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your order")
    if order.status == OrderStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot pay for a cancelled order",
        )

    existing = await db.execute(select(Payment).where(Payment.order_id == order.id))
    payment = existing.scalar_one_or_none()
    if payment:
        return payment

    intent_id = f"pi_stub_{uuid.uuid4().hex[:16]}"
    client_secret = f"{intent_id}_secret_{secrets.token_hex(8)}"
    payment = Payment(
        order_id=order.id,
        amount=order.total_amount,
        currency=payload.currency.upper(),
        status=PaymentStatus.REQUIRES_CONFIRMATION,
        provider="stub",
        provider_intent_id=intent_id,
        client_secret=client_secret,
    )
    db.add(payment)
    await db.flush()
    await db.refresh(payment)
    return payment


async def get_payment(db: AsyncSession, payment_id: int, user: User) -> Payment:
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalar_one_or_none()
    if payment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

    order_result = await db.execute(select(Order).where(Order.id == payment.order_id))
    order = order_result.scalar_one()
    if order.user_id != user.id and not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your payment")
    return payment


async def update_payment_status(
    db: AsyncSession, payment_id: int, new_status: PaymentStatus
) -> Payment:
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalar_one_or_none()
    if payment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

    payment.status = new_status
    if new_status == PaymentStatus.SUCCEEDED:
        order_result = await db.execute(select(Order).where(Order.id == payment.order_id))
        order = order_result.scalar_one()
        if order.status == OrderStatus.PENDING:
            order.status = OrderStatus.PAID
    await db.flush()
    await db.refresh(payment)
    return payment
