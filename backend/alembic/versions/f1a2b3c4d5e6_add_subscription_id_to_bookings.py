"""add subscription_id to bookings

Revision ID: f1a2b3c4d5e6
Revises: e3f2a1b9c8d7
Create Date: 2026-06-30 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision: str = "f1a2b3c4d5e6"
down_revision: Union[str, None] = "c3e7f2a1d4b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "bookings",
        sa.Column("subscription_id", UUID(as_uuid=True), nullable=True),
        schema="offline",
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_offline_bookings_subscription_id "
        "ON offline.bookings (subscription_id)"
    )


def downgrade() -> None:
    op.drop_index("ix_offline_bookings_subscription_id", table_name="bookings", schema="offline")
    op.drop_column("bookings", "subscription_id", schema="offline")
