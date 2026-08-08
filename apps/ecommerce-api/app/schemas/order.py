from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.models.order import OrderStatus
from app.schemas.common import ORMModel


class OrderCheckoutRequest(BaseModel):
    shipping_address: str = Field(min_length=5, max_length=500)


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderItemRead(ORMModel):
    id: int
    product_id: int
    product_name: str
    unit_price: Decimal
    quantity: int
    line_total: Decimal


class OrderRead(ORMModel):
    id: int
    user_id: int
    status: OrderStatus
    total_amount: Decimal
    shipping_address: str
    items: list[OrderItemRead]
    created_at: datetime
    updated_at: datetime
