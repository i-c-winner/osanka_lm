import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context
from app.db.base import Base
from app.core.config import settings

# Import all models so Base knows about them
import app.models.user  # noqa
import app.models.user_role  # noqa
import app.models.role_permission  # noqa
import app.models.role  # noqa
import app.models.permission  # noqa
import app.models.location  # noqa
import app.models.day  # noqa
import app.models.session  # noqa
import app.models.booking  # noqa
import app.models.attendance  # noqa
import app.models.subscription_plan  # noqa
import app.models.subscription  # noqa

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    context.run_migrations()


async def run_migrations_online() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    # engine.begin() opens a connection, starts a transaction,
    # commits on success and rolls back on exception
    async with connectable.begin() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
