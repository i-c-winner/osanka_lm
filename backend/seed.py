"""
Запуск: python3 seed.py
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.seeds import run_seeds


async def main() -> None:
    engine = create_async_engine(settings.async_database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        await run_seeds(session)
    await engine.dispose()
    print("Seeds applied successfully.")


if __name__ == "__main__":
    asyncio.run(main())
