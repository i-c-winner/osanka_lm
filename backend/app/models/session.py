import uuid

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.base import Base


class Session(Base):
    __tablename__ = "sessions"
    __table_args__ = {"schema": "offline"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    day_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    starts_at = Column(DateTime(timezone=True), nullable=False)
    ends_at = Column(DateTime(timezone=True), nullable=False)
    trainer_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    capacity = Column(Integer, nullable=False)
    class_type_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    status = Column(String(64), nullable=False)
