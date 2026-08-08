from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.models.payment import PaymentStatus
from app.schemas.common import ORMModel


class PaymentIntentCreate(BaseModel):
    order_id: int
    currency: str = Field(default="USD", min_length=3, max_length=3)


class PaymentStatusUpdate(BaseModel):
    status: PaymentStatus


class PaymentRead(ORMModel):
    id: int
    order_id: int
    amount: Decimal
    currency: str
    status: PaymentStatus
    provider: str
    provider_intent_id: str
    client_secret: str
    created_at: datetime
    updated_at: datetime
