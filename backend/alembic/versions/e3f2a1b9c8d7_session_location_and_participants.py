"""session location_id and session_participants table

Revision ID: e3f2a1b9c8d7
Revises: dfb09a847069
Create Date: 2026-05-30 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "e3f2a1b9c8d7"
down_revision: Union[str, None] = "dfb09a847069"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Добавляем location_id в offline.sessions
    op.add_column(
        "sessions",
        sa.Column("location_id", sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        schema="offline",
    )
    op.create_foreign_key(
        "fk_sessions_location_id",
        "sessions",
        "locations",
        ["location_id"],
        ["id"],
        source_schema="offline",
        referent_schema="public",
        ondelete="SET NULL",
    )
    op.create_index(
        "ix_offline_sessions_location_id",
        "sessions",
        ["location_id"],
        schema="offline",
    )

    # 2. Создаём таблицу offline.session_participants
    op.create_table(
        "session_participants",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "session_id",
            sa.dialects.postgresql.UUID(as_uuid=True),
            sa.ForeignKey("offline.sessions.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "user_id",
            sa.dialects.postgresql.UUID(as_uuid=True),
            sa.ForeignKey("auth.users.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("role", sa.String(64), nullable=False, server_default="participant"),
        sa.Column(
            "joined_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.UniqueConstraint("session_id", "user_id", name="uq_session_participant"),
        schema="offline",
    )


def downgrade() -> None:
    op.drop_table("session_participants", schema="offline")
    op.drop_index("ix_offline_sessions_location_id", table_name="sessions", schema="offline")
    op.drop_constraint("fk_sessions_location_id", "sessions", schema="offline", type_="foreignkey")
    op.drop_column("sessions", "location_id", schema="offline")
