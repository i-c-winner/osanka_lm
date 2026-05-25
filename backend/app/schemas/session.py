from datetime import datetime
from typing import Optional

from pydantic import BaseModel, model_validator


class SessionBase(BaseModel):
    day_id: int
    starts_at: datetime
    ends_at: datetime
    trainer_id: Optional[int] = None
    capacity: int
    class_type_id: Optional[int] = None
    status: str

    @model_validator(mode="after")
    def ends_after_starts(self) -> "SessionBase":
        if self.ends_at <= self.starts_at:
            raise ValueError("ends_at must be after starts_at")
        return self


class SessionCreate(SessionBase):
    pass


class SessionUpdate(BaseModel):
    day_id: Optional[int] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    trainer_id: Optional[int] = None
    capacity: Optional[int] = None
    class_type_id: Optional[int] = None
    status: Optional[str] = None


class SessionResponse(SessionBase):
    id: int

    class Config:
        from_attributes = True
