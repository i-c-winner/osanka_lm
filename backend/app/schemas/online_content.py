from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class OnlineContentBase(BaseModel):
    title: str
    description: Optional[str] = None
    type: str = "recorded"          # "live" | "recorded"
    stream_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration_minutes: Optional[int] = None
    trainer_id: Optional[UUID] = None
    status: str = "active"          # "active" | "archived"
    is_free: bool = False


class OnlineContentCreate(OnlineContentBase):
    plan_ids: List[UUID] = []       # планы, к которым привязан контент


class OnlineContentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    stream_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration_minutes: Optional[int] = None
    trainer_id: Optional[UUID] = None
    status: Optional[str] = None
    is_free: Optional[bool] = None
    plan_ids: Optional[List[UUID]] = None  # None = не менять, [] = убрать все


class OnlineContentResponse(OnlineContentBase):
    id: UUID
    plan_ids: List[UUID] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
