from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartRead
from app.schemas.common import Message
from app.services import cart as cart_service

router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("", response_model=CartRead)
async def get_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CartRead:
    return await cart_service.get_cart(db, current_user)


@router.post("/items", response_model=CartRead)
async def add_item(
    payload: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CartRead:
    return await cart_service.add_to_cart(db, current_user, payload)


@router.patch("/items/{item_id}", response_model=CartRead)
async def update_item(
    item_id: int,
    payload: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CartRead:
    return await cart_service.update_cart_item(db, current_user, item_id, payload)


@router.delete("/items/{item_id}", response_model=CartRead)
async def remove_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CartRead:
    return await cart_service.remove_cart_item(db, current_user, item_id)


@router.delete("", response_model=Message)
async def clear_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Message:
    await cart_service.clear_cart(db, current_user)
    return Message(detail="Cart cleared")
