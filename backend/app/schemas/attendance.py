from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class AttendanceBase(BaseModel):
    booking_id: UUID
    status: str
    marked_by: Optional[UUID] = None


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(BaseModel):
    status: Optional[str] = None
    marked_by: Optional[UUID] = None


class AttendanceResponse(AttendanceBase):
    id: UUID
    marked_at: datetime

    class Config:
        from_attributes = True
