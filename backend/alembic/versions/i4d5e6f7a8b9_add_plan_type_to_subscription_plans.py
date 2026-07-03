"""add plan_type to subscription_plans

Revision ID: i4d5e6f7a8b9
Revises: h3c4d5e6f7a8
Create Date: 2026-07-01 10:00:00.000000

Добавляет поле plan_type в billing.subscription_plans.
Значения: 'offline' (по умолчанию) | 'online'
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "i4d5e6f7a8b9"
down_revision: Union[str, None] = "h3c4d5e6f7a8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "subscription_plans",
        sa.Column("plan_type", sa.String(32), nullable=False, server_default="offline"),
        schema="billing",
    )


def downgrade() -> None:
    op.drop_column("subscription_plans", "plan_type", schema="billing")
