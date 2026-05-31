from sqlalchemy import Column, Integer, String

from app.db.base import Base


class Currency(Base):
    __tablename__ = "currency"
    __table_args__ = {"schema": "billing"}

    k        = Column(Integer, primary_key=True)
    currency = Column(String, nullable=False)
