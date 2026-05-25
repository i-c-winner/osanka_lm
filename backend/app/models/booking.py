from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.db.base import Base


class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = {"schema": "offline"}

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, nullable=False, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    status = Column(String(64), nullable=False)
    booked_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
