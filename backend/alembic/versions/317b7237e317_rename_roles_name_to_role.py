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
    # No-op: initial migration already creates roles.role with correct index
    pass


def downgrade() -> None:
    pass
