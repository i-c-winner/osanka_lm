from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class SubscriptionPlanBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    sessions_limit: Optional[int] = None
    duration_days: int
    price: Decimal
    is_active: bool = True
    is_calendar_month: bool = False
    is_unlimited: bool = False
    freeze_days_limit: Optional[int] = None


class SubscriptionPlanCreate(SubscriptionPlanBase):
    pass


class SubscriptionPlanUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    sessions_limit: Optional[int] = None
    duration_days: Optional[int] = None
    price: Optional[Decimal] = None
    is_active: Optional[bool] = None
    is_calendar_month: Optional[bool] = None
    is_unlimited: Optional[bool] = None
    freeze_days_limit: Optional[int] = None


class SubscriptionPlanResponse(SubscriptionPlanBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
