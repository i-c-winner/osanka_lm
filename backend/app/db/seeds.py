from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


INITIAL_USERS = [
    {
        "telegram_id": "1",
        "telegram_username": "superAdmin",
        "first_name": "Admin",
        "last_name": None,
        "phone": None,
        "is_active": True,
        "avatar_url": None,
        "language_code": "ru",
        "timezone": None,
        "birth_date": None,
    }
]


async def seed_users(db: AsyncSession) -> None:
    for data in INITIAL_USERS:
        existing = await db.execute(
            select(User).where(User.telegram_id == data["telegram_id"])
        )
        if existing.scalar_one_or_none() is None:
            db.add(User(**data))
    await db.commit()


async def run_seeds(db: AsyncSession) -> None:
    await seed_users(db)
