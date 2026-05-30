from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class UserBase(BaseModel):
    telegram_id: str
    telegram_username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool = True
    avatar_url: Optional[str] = None
    language_code: Optional[str] = None
    timezone: Optional[str] = None
    birth_date: Optional[date] = None


class UserCreate(UserBase):
    pass


class UserCreateResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    telegram_id: str


class UserUpdate(BaseModel):
    telegram_username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    avatar_url: Optional[str] = None
    language_code: Optional[str] = None
    timezone: Optional[str] = None
    birth_date: Optional[date] = None
    last_login_at: Optional[datetime] = None


class UserResponse(UserBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MeResponse(UserResponse):
    roles: list[str] = []
