"""
Таблица-связка many-to-many: online.content ↔ billing.subscription_plans
"""
from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class ContentPlan(Base):
    __tablename__ = "content_plans"
    __table_args__ = {"schema": "online"}

    content_id = Column(
        UUID(as_uuid=True),
        ForeignKey("online.content.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )
    plan_id = Column(
        UUID(as_uuid=True),
        ForeignKey("billing.subscription_plans.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
        index=True,
    )
