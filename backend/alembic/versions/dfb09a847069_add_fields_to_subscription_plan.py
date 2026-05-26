"""add fields to subscription_plan

Revision ID: dfb09a847069
Revises: a4775b0b9fc0
Create Date: 2026-05-25 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "dfb09a847069"
down_revision: Union[str, None] = "a4775b0b9fc0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "subscription_plans",
        sa.Column("is_calendar_month", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        schema="billing",
    )
    op.add_column(
        "subscription_plans",
        sa.Column("is_unlimited", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        schema="billing",
    )
    op.add_column(
        "subscription_plans",
        sa.Column("freeze_days_limit", sa.Integer(), nullable=True),
        schema="billing",
    )


def downgrade() -> None:
    op.drop_column("subscription_plans", "freeze_days_limit", schema="billing")
    op.drop_column("subscription_plans", "is_unlimited", schema="billing")
    op.drop_column("subscription_plans", "is_calendar_month", schema="billing")
