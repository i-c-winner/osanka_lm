import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Session(Base):
    __tablename__ = "sessions"
    __table_args__ = {"schema": "offline"}

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    day_id        = Column(
        UUID(as_uuid=True),
        ForeignKey("offline.days.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    starts_at     = Column(DateTime(timezone=True), nullable=False)
    ends_at       = Column(DateTime(timezone=True), nullable=False)
    trainer_id    = Column(UUID(as_uuid=True), nullable=True, index=True)
    capacity      = Column(Integer, nullable=False)
    class_type_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    status        = Column(String(64), nullable=False)
    location_id   = Column(
        UUID(as_uuid=True),
        ForeignKey("public.locations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    day          = relationship("Day", foreign_keys=[day_id], viewonly=True)
    location     = relationship(
        "Location",
        primaryjoin="Session.location_id == foreign(Location.id)",
        viewonly=True,
    )
    participants = relationship(
        "SessionParticipant",
        back_populates="session",
        cascade="all, delete-orphan",
    )
