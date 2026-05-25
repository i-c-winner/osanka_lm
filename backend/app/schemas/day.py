from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class DayBase(BaseModel):
    date: date
    location_id: Optional[int] = None
    status: str
    notes: Optional[str] = None


class DayCreate(DayBase):
    pass


class DayUpdate(BaseModel):
    date: Optional[date] = None
    location_id: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class DayResponse(DayBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
