from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.db.base import Base


class Attendance(Base):
    __tablename__ = "attendance"
    __table_args__ = {"schema": "offline"}

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, nullable=False, index=True)
    status = Column(String(64), nullable=False)
    marked_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    marked_by = Column(Integer, nullable=True)
