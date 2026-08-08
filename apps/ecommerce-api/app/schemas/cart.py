from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel
from app.schemas.product import ProductRead


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1, le=999)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1, le=999)


class CartItemRead(ORMModel):
    id: int
    product_id: int
    quantity: int
    product: ProductRead


class CartRead(BaseModel):
    items: list[CartItemRead]
    item_count: int
    subtotal: Decimal
