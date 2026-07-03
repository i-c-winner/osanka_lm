"""create online.content_plans many-to-many table

Revision ID: k6f7a8b9c0d1
Revises: j5e6f7a8b9c0
Create Date: 2026-07-03 10:00:00.000000

Создаёт таблицу online.content_plans для связи контента с планами подписки (many-to-many).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "k6f7a8b9c0d1"
down_revision: Union[str, None] = "j5e6f7a8b9c0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "content_plans",
        sa.Column("content_id", UUID(as_uuid=True), nullable=False),
        sa.Column("plan_id", UUID(as_uuid=True), nullable=False),
        sa.PrimaryKeyConstraint("content_id", "plan_id"),
        sa.ForeignKeyConstraint(
            ["content_id"], ["online.content.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["plan_id"], ["billing.subscription_plans.id"], ondelete="CASCADE"
        ),
        schema="online",
    )
    op.create_index("ix_online_content_plans_plan_id", "content_plans", ["plan_id"], schema="online")


def downgrade() -> None:
    op.drop_index("ix_online_content_plans_plan_id", table_name="content_plans", schema="online")
    op.drop_table("content_plans", schema="online")
