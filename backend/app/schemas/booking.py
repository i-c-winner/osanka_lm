from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class BookingBase(BaseModel):
    session_id: UUID
    user_id: UUID
    status: str


class BookingCreate(BookingBase):
    pass


class BookingUpdate(BaseModel):
    status: Optional[str] = None
    cancelled_at: Optional[datetime] = None


class BookingResponse(BookingBase):
    id: UUID
    subscription_id: Optional[UUID] = None
    booked_at: datetime
    cancelled_at: Optional[datetime] = None

    class Config:
        from_attributes = True
