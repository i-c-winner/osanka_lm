from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.core.config import settings
from app.db.session import get_db
from app.models.role import Role
from app.models.user import User
from app.models.user_role import UserRole
from app.schemas.user import UserCreateResponse

router = APIRouter()

CLIENT_ROLE = "client"


class TelegramLoginRequest(BaseModel):
    telegram_id: str
    telegram_username: str | None = None
    first_name: str | None = None
    last_name: str | None = None


@router.post("/login", response_model=UserCreateResponse)
async def login(payload: TelegramLoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.telegram_id == payload.telegram_id))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            telegram_id=payload.telegram_id,
            telegram_username=payload.telegram_username,
            first_name=payload.first_name,
            last_name=payload.last_name,
        )
        db.add(user)
        await db.flush()

        role_result = await db.execute(select(Role).where(Role.role == CLIENT_ROLE))
        role = role_result.scalar_one_or_none()
        if role:
            db.add(UserRole(user_id=user.id, role_id=role.id))

        await db.flush()
        await db.refresh(user)

    if not user.is_active:
        raise HTTPException(status_code=403, detail="User is inactive")

    user.last_login_at = datetime.now(timezone.utc)

    access_token = create_access_token(
        subject=user.telegram_id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return UserCreateResponse(
        access_token=access_token,
        telegram_id=user.telegram_id,
    )
