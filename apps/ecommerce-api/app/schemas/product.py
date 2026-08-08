from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    slug: str | None = Field(default=None, min_length=1, max_length=220)
    description: str | None = None
    price: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    stock: int = Field(default=0, ge=0)
    is_active: bool = True
    category_id: int | None = None


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    slug: str | None = Field(default=None, min_length=1, max_length=220)
    description: str | None = None
    price: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    stock: int | None = Field(default=None, ge=0)
    is_active: bool | None = None
    category_id: int | None = None


class ProductRead(ORMModel):
    id: int
    name: str
    slug: str
    description: str | None
    price: Decimal
    stock: int
    is_active: bool
    category_id: int | None
    created_at: datetime
    updated_at: datetime


class ProductStockUpdate(BaseModel):
    stock: int = Field(ge=0)
