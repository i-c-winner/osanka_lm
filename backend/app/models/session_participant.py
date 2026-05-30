import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class SessionParticipant(Base):
    """Many-to-many: offline.sessions ↔ auth.users."""

    __tablename__ = "session_participants"
    __table_args__ = {"schema": "offline"}

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(
        UUID(as_uuid=True),
        ForeignKey("offline.sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id    = Column(
        UUID(as_uuid=True),
        ForeignKey("auth.users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role       = Column(String(64), nullable=False, default="participant")  # participant | trainer | observer
    joined_at  = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    session    = relationship("Session", back_populates="participants")
    user       = relationship("User", back_populates="session_participations")
