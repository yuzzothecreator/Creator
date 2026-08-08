from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_active_admin, get_current_user
from app.models.user import User
from app.schemas.payment import PaymentIntentCreate, PaymentRead, PaymentStatusUpdate
from app.services import payments as payments_service

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/intents", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
async def create_intent(
    payload: PaymentIntentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await payments_service.create_payment_intent(db, current_user, payload)


@router.get("/{payment_id}", response_model=PaymentRead)
async def get_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await payments_service.get_payment(db, payment_id, current_user)


@router.patch("/{payment_id}/status", response_model=PaymentRead)
async def update_status(
    payment_id: int,
    payload: PaymentStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),
):
    """Stub status transition (simulates webhook / confirm). No Stripe keys required."""
    return await payments_service.update_payment_status(db, payment_id, payload.status)
