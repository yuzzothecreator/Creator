from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_active_admin, get_current_user
from app.models.user import User
from app.schemas.order import OrderCheckoutRequest, OrderRead, OrderStatusUpdate
from app.services import orders as orders_service

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/checkout", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
async def checkout(
    payload: OrderCheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await orders_service.checkout(db, current_user, payload)


@router.get("", response_model=list[OrderRead])
async def list_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await orders_service.list_orders(db, current_user, admin=current_user.is_admin)


@router.get("/{order_id}", response_model=OrderRead)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await orders_service.get_order(
        db, order_id, current_user, admin=current_user.is_admin
    )


@router.patch("/{order_id}/status", response_model=OrderRead)
async def update_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),
):
    return await orders_service.update_order_status(db, order_id, payload.status)
