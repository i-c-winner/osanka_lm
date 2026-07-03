import uuid

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class OnlineContent(Base):
    __tablename__ = "content"
    __table_args__ = {"schema": "online"}

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title            = Column(String, nullable=False)
    description      = Column(Text, nullable=True)
    # "live" — живая трансляция, "recorded" — записанное занятие
    type             = Column(String(32), nullable=False, default="recorded")
    stream_url       = Column(String, nullable=True)
    thumbnail_url    = Column(String, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    trainer_id       = Column(UUID(as_uuid=True), nullable=True, index=True)
    # "active" | "archived"
    status           = Column(String(32), nullable=False, default="active")
    is_free          = Column(Boolean, nullable=False, default=False)
    created_at       = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at       = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # many-to-many к планам подписки через online.content_plans
    plans = relationship(
        "SubscriptionPlan",
        secondary="online.content_plans",
        lazy="selectin",
    )
