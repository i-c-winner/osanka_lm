from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreateResponse

router = APIRouter()


class TelegramLoginRequest(BaseModel):
    telegram_id: str
    telegram_username: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    # В проде здесь будут поля для проверки подписи Telegram:
    # hash: str
    # auth_date: int
    # ... остальные поля от Telegram Widget


@router.post("/login", response_model=UserCreateResponse)
async def login(payload: TelegramLoginRequest, db: AsyncSession = Depends(get_db)):
    if not settings.DEBUG:
        # TODO: проверить подпись Telegram
        # verify_telegram_hash(payload, settings.TELEGRAM_BOT_TOKEN)
        raise HTTPException(status_code=501, detail="Telegram auth not implemented yet")

    result = await db.execute(select(User).where(User.telegram_id == payload.telegram_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail=f"User with telegram_id={payload.telegram_id} not found")

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
