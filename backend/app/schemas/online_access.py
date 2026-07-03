from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class OnlineAccessResponse(BaseModel):
    id: UUID
    user_id: UUID
    subscription_id: UUID
    started_at: datetime
    expires_at: Optional[datetime] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class OnlineAccessStatus(BaseModel):
    """Ответ на запрос проверки доступа."""
    has_access: bool
    access: Optional[OnlineAccessResponse] = None
