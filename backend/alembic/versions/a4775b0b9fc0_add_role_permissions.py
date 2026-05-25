"""add role_permissions

Revision ID: a4775b0b9fc0
Revises: 4dfa064b9ec1
Create Date: 2026-05-25 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from alembic import op

revision: str = "a4775b0b9fc0"
down_revision: Union[str, None] = "317b7237e317"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "role_permissions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column(
            "role_id",
            UUID(as_uuid=True),
            sa.ForeignKey("auth.roles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "permission_id",
            UUID(as_uuid=True),
            sa.ForeignKey("auth.permissions.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("assigned_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("role_id", "permission_id", name="uq_role_permissions_role_permission"),
        schema="auth",
    )
    op.create_index("ix_auth_role_permissions_role_id", "role_permissions", ["role_id"], schema="auth")
    op.create_index("ix_auth_role_permissions_permission_id", "role_permissions", ["permission_id"], schema="auth")


def downgrade() -> None:
    op.drop_table("role_permissions", schema="auth")
