from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, model_validator


class SessionBase(BaseModel):
    day_id:        UUID
    starts_at:     datetime
    ends_at:       datetime
    trainer_id:    Optional[UUID] = None
    capacity:      int
    class_type_id: Optional[UUID] = None
    status:        str
    location_id:   Optional[UUID] = None

    @model_validator(mode="after")
    def ends_after_starts(self) -> "SessionBase":
        if self.ends_at <= self.starts_at:
            raise ValueError("ends_at must be after starts_at")
        return self


class SessionCreate(SessionBase):
    pass


class SessionUpdate(BaseModel):
    day_id:        Optional[UUID] = None
    starts_at:     Optional[datetime] = None
    ends_at:       Optional[datetime] = None
    trainer_id:    Optional[UUID] = None
    capacity:      Optional[int] = None
    class_type_id: Optional[UUID] = None
    status:        Optional[str] = None
    location_id:   Optional[UUID] = None


class SessionResponse(SessionBase):
    id:          UUID
    booked_count: int = 0

    class Config:
        from_attributes = True


# ─── SessionParticipant ───────────────────────────────────────────────────────

class SessionParticipantBase(BaseModel):
    session_id: UUID
    user_id:    UUID
    role:       str = "participant"


class SessionParticipantCreate(SessionParticipantBase):
    pass


class SessionParticipantResponse(SessionParticipantBase):
    id:        UUID
    joined_at: datetime

    class Config:
        from_attributes = True
