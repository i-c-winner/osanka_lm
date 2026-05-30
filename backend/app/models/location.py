import uuid

from sqlalchemy import Boolean, Column, DateTime, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.base import Base


class Location(Base):
    __tablename__ = "locations"
    # ВАЖНО: schema="public" обязателен — FK из offline.sessions.location_id ссылается на public.locations.id
    __table_args__ = {"schema": "public"}

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name       = Column(String, nullable=False)
    address    = Column(String, nullable=True)
    latitude   = Column(Numeric(9, 6), nullable=True)
    longitude  = Column(Numeric(9, 6), nullable=True)
    timezone   = Column(String(64), nullable=True)
    phone      = Column(String, nullable=True)
    is_active  = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
