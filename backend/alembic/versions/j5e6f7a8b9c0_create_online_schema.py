"""create online schema with content and access tables

Revision ID: j5e6f7a8b9c0
Revises: i4d5e6f7a8b9
Create Date: 2026-07-01 10:05:00.000000

Создаёт схему online и таблицы:
  - online.content  — каталог онлайн-занятий
  - online.access   — записи о доступе пользователей (привязаны к подписке)
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "j5e6f7a8b9c0"
down_revision: Union[str, None] = "i4d5e6f7a8b9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Создаём схему
    op.execute("CREATE SCHEMA IF NOT EXISTS online")

    # Таблица контента
    op.create_table(
        "content",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.String, nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("type", sa.String(32), nullable=False, server_default="recorded"),
        sa.Column("stream_url", sa.String, nullable=True),
        sa.Column("thumbnail_url", sa.String, nullable=True),
        sa.Column("duration_minutes", sa.Integer, nullable=True),
        sa.Column("trainer_id", UUID(as_uuid=True), nullable=True),
        sa.Column("status", sa.String(32), nullable=False, server_default="active"),
        sa.Column("is_free", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        schema="online",
    )
    op.create_index("ix_online_content_status", "content", ["status"], schema="online")
    op.create_index("ix_online_content_trainer_id", "content", ["trainer_id"], schema="online")

    # Таблица доступа
    op.create_table(
        "access",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), nullable=False),
        sa.Column("subscription_id", UUID(as_uuid=True), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(32), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        schema="online",
    )
    op.create_index("ix_online_access_user_id", "access", ["user_id"], schema="online")
    op.create_unique_constraint(
        "uq_online_access_subscription_id", "access", ["subscription_id"], schema="online"
    )


def downgrade() -> None:
    op.drop_table("access", schema="online")
    op.drop_table("content", schema="online")
    op.execute("DROP SCHEMA IF EXISTS online CASCADE")
