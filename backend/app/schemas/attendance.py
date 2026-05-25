from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AttendanceBase(BaseModel):
    booking_id: int
    status: str
    marked_by: Optional[int] = None


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(BaseModel):
    status: Optional[str] = None
    marked_by: Optional[int] = None


class AttendanceResponse(AttendanceBase):
    id: int
    marked_at: datetime

    class Config:
        from_attributes = True
