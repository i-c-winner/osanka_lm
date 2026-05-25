from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.db.base import Base


class Subscription(Base):
    __tablename__ = "subscriptions"
    __table_args__ = {"schema": "billing"}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    plan_id = Column(Integer, nullable=False, index=True)
    sessions_used = Column(Integer, default=0, nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(64), nullable=False)
