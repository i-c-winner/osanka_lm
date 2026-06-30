"""unique booking per (user, session, subscription)

Revision ID: h3c4d5e6f7a8
Revises: g2b3c4d5e6f7
Create Date: 2026-06-30 22:00:00.000000

Меняем логику уникальности бронирований:
- Было: один пользователь не может записаться на одну сессию дважды (глобально)
- Стало: один пользователь не может записаться на одну сессию дважды ПО ОДНОЙ подписке
         (можно бронировать ту же сессию по разным подпискам)

Добавляем partial unique index на (user_id, session_id, subscription_id)
только для активных броней (status = 'booked').
"""
from typing import Sequence, Union

from alembic import op

revision: str = "h3c4d5e6f7a8"
down_revision: Union[str, None] = "g2b3c4d5e6f7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Удаляем старый глобальный уникальный индекс если он существует
    op.execute("""
        DROP INDEX IF EXISTS offline.ix_bookings_user_session_unique;
    """)

    # Добавляем partial unique index: уникально только среди активных броней
    # и только когда subscription_id задан (новые брони)
    op.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS
        ix_bookings_user_session_subscription_unique
        ON offline.bookings (user_id, session_id, subscription_id)
        WHERE status = 'booked' AND subscription_id IS NOT NULL;
    """)


def downgrade() -> None:
    op.execute("""
        DROP INDEX IF EXISTS offline.ix_bookings_user_session_subscription_unique;
    """)
