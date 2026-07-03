"""backfill subscription_id in existing bookings

Revision ID: g2b3c4d5e6f7
Revises: f1a2b3c4d5e6
Create Date: 2026-06-30 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op

revision: str = "g2b3c4d5e6f7"
down_revision: Union[str, None] = "f1a2b3c4d5e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Проставляем subscription_id для старых броней без него.
    # Берём подписку, которая была активна на момент создания брони:
    # статус active и expires_at либо null, либо позже booked_at.
    # При нескольких подходящих — последняя по started_at.
    op.execute("""
        UPDATE offline.bookings b
        SET subscription_id = (
            SELECT s.id
            FROM billing.subscriptions s
            WHERE s.user_id = b.user_id
              AND s.status = 'active'
              AND (s.expires_at IS NULL OR s.expires_at > b.booked_at)
            ORDER BY s.started_at DESC
            LIMIT 1
        )
        WHERE b.subscription_id IS NULL
    """)


def downgrade() -> None:
    pass
