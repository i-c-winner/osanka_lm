from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.db.base import Base


class Session(Base):
    __tablename__ = "sessions"
    __table_args__ = {"schema": "offline"}

    id = Column(Integer, primary_key=True, index=True)
    day_id = Column(Integer, nullable=False, index=True)
    starts_at = Column(DateTime(timezone=True), nullable=False)
    ends_at = Column(DateTime(timezone=True), nullable=False)
    trainer_id = Column(Integer, nullable=True, index=True)
    capacity = Column(Integer, nullable=False)
    class_type_id = Column(Integer, nullable=True, index=True)
    status = Column(String(64), nullable=False)
