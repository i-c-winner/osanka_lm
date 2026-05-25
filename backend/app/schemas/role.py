from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class RoleBase(BaseModel):
    role: str
    description: Optional[str] = None


class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseModel):
    role: Optional[str] = None
    description: Optional[str] = None


class RoleResponse(RoleBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
