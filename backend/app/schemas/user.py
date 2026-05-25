from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class UserBase(BaseModel):
    telegram_id: int
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


class UserResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    id: int
    telegram_id: int
    telegram_username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None
    avatar_url: Optional[str] = None
    language_code: Optional[str] = None
    timezone: Optional[str] = None
    birth_date: Optional[date] = None

    class Config:
        from_attributes = True
