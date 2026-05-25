from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class BookingBase(BaseModel):
    session_id: int
    user_id: int
    status: str


class BookingCreate(BookingBase):
    pass


class BookingUpdate(BaseModel):
    status: Optional[str] = None
    cancelled_at: Optional[datetime] = None


class BookingResponse(BookingBase):
    id: int
    booked_at: datetime
    cancelled_at: Optional[datetime] = None

    class Config:
        from_attributes = True
