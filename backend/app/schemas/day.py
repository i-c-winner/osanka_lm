from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class DayBase(BaseModel):
    date: date
    location_id: Optional[UUID] = None
    status: str
    notes: Optional[str] = None


class DayCreate(DayBase):
    pass


class DayUpdate(BaseModel):
    date: Optional[date] = None
    location_id: Optional[UUID] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class DayResponse(DayBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
