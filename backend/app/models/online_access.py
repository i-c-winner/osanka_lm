import uuid

from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.base import Base


class OnlineAccess(Base):
    __tablename__ = "access"
    __table_args__ = {"schema": "online"}

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id         = Column(UUID(as_uuid=True), nullable=False, index=True)
    # Привязан к конкретной подписке — при отмене подписки доступ аннулируется
    subscription_id = Column(UUID(as_uuid=True), nullable=False, unique=True, index=True)
    started_at      = Column(DateTime(timezone=True), nullable=False)
    expires_at      = Column(DateTime(timezone=True), nullable=True)
    # "active" | "revoked"
    status          = Column(String(32), nullable=False, default="active")
    created_at      = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
