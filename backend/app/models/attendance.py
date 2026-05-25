import uuid

from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.base import Base


class Attendance(Base):
    __tablename__ = "attendance"
    __table_args__ = {"schema": "offline"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    status = Column(String(64), nullable=False)
    marked_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    marked_by = Column(UUID(as_uuid=True), nullable=True)
