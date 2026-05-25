from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from app.db.base import Base


class Day(Base):
    __tablename__ = "days"
    __table_args__ = {"schema": "offline"}

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    location_id = Column(Integer, nullable=True)
    status = Column(String(64), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
