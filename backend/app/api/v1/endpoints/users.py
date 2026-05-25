from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse

router = APIRouter()


@router.post("/", response_model=UserResponse, status_code=201)
async def create_user(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.telegram_id == user_in.telegram_id))
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(status_code=409, detail=f"User with telegram_id={user_in.telegram_id} already exists")

    user = User(**user_in.model_dump())
    db.add(user)
    await db.flush()
    await db.refresh(user)

    return user
