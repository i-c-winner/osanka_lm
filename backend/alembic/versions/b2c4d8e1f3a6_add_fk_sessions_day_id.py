"""add fk sessions day_id

Revision ID: b2c4d8e1f3a6
Revises: e3f2a1b9c8d7
Create Date: 2026-05-30

"""
from alembic import op

revision = "b2c4d8e1f3a6"
down_revision = "e3f2a1b9c8d7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_foreign_key(
        "fk_sessions_day_id",
        "sessions",
        "days",
        ["day_id"],
        ["id"],
        source_schema="offline",
        referent_schema="offline",
        ondelete="RESTRICT",
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_sessions_day_id",
        "sessions",
        schema="offline",
        type_="foreignkey",
    )
