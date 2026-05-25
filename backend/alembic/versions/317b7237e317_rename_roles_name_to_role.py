"""rename roles.name to roles.role

Revision ID: 317b7237e317
Revises: 94e14a6f3d95
Create Date: 2026-05-25 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op

revision: str = "317b7237e317"
down_revision: Union[str, None] = "94e14a6f3d95"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Column was already renamed manually in DB, only sync the index
    op.execute("DROP INDEX IF EXISTS auth.ix_auth_roles_name")
    op.create_index("ix_auth_roles_role", "roles", ["role"], unique=True, schema="auth")


def downgrade() -> None:
    op.drop_index("ix_auth_roles_role", table_name="roles", schema="auth")
    op.alter_column("roles", "role", new_column_name="name", schema="auth")
    op.create_index("ix_auth_roles_name", "roles", ["name"], unique=True, schema="auth")
