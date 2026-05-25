from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreateResponse

router = APIRouter()


@router.post("/dev-login", response_model=UserCreateResponse)
async def dev_login(telegram_id: str, db: AsyncSession = Depends(get_db)):
    if not settings.DEBUG:
        raise HTTPException(status_code=403, detail="Not available in production")

    result = await db.execute(select(User).where(User.telegram_id == telegram_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail=f"User with telegram_id={telegram_id} not found")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="User is inactive")

    access_token = create_access_token(
        subject=user.telegram_id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return UserCreateResponse(
        access_token=access_token,
        telegram_id=user.telegram_id,
    )
