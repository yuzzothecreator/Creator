from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    slug: str | None = Field(default=None, min_length=1, max_length=140)
    description: str | None = None


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    slug: str | None = Field(default=None, min_length=1, max_length=140)
    description: str | None = None


class CategoryRead(ORMModel):
    id: int
    name: str
    slug: str
    description: str | None
    created_at: datetime
