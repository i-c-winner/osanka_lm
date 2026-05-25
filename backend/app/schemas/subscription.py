from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class SubscriptionBase(BaseModel):
    user_id: int
    plan_id: int
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
    id: int

    class Config:
        from_attributes = True
