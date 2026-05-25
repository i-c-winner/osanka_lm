from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class SubscriptionBase(BaseModel):
    user_id: UUID
    plan_id: UUID
    sessions_used: int = 0
    started_at: datetime
    expires_at: Optional[datetime] = None
    status: str


class SubscriptionCreate(SubscriptionBase):
    pass


class SubscriptionUpdate(BaseModel):
    sessions_used: Optional[int] = None
    expires_at: Optional[datetime] = None
    status: Optional[str] = None


class SubscriptionResponse(SubscriptionBase):
    id: UUID

    class Config:
        from_attributes = True
