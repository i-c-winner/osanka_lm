"""add user_roles

Revision ID: 94e14a6f3d95
Revises: 1858cc466a95
Create Date: 2026-05-25 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "94e14a6f3d95"
down_revision: Union[str, None] = "1858cc466a95"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "user_roles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("auth.users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "role_id",
            sa.Integer(),
            sa.ForeignKey("auth.roles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "assigned_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.UniqueConstraint("user_id", "role_id", name="uq_user_roles_user_role"),
        schema="auth",
    )
    op.create_index("ix_auth_user_roles_user_id", "user_roles", ["user_id"], schema="auth")
    op.create_index("ix_auth_user_roles_role_id", "user_roles", ["role_id"], schema="auth")


def downgrade() -> None:
    op.drop_table("user_roles", schema="auth")
