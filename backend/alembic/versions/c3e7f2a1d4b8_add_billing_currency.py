"""add billing.currency

Revision ID: c3e7f2a1d4b8
Revises: b2c4d8e1f3a6
Create Date: 2026-05-31

"""
import sqlalchemy as sa
from alembic import op

revision = "c3e7f2a1d4b8"
down_revision = "b2c4d8e1f3a6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "currency",
        sa.Column("k",        sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(),  nullable=False),
        sa.PrimaryKeyConstraint("k"),
        schema="billing",
    )


def downgrade() -> None:
    op.drop_table("currency", schema="billing")
