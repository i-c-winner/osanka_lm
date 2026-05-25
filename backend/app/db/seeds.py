from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.role import Role
from app.models.user import User
from app.models.user_role import UserRole


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

INITIAL_ROLES = [
    {"role": "superadmin", "description": "Full access to all resources"},
    {"role": "admin", "description": "Administrative access"},
    {"role": "trainer", "description": "Trainer access"},
    {"role": "client", "description": "Regular client"},
    {"role": "user", "description": "Default role for all registered users"},
]


async def seed_users(db: AsyncSession) -> None:
    for data in INITIAL_USERS:
        result = await db.execute(select(User).where(User.telegram_id == data["telegram_id"]))
        if result.scalar_one_or_none() is None:
            db.add(User(**data))
    await db.commit()


async def seed_roles(db: AsyncSession) -> None:
    for data in INITIAL_ROLES:
        result = await db.execute(select(Role).where(Role.role == data["role"]))
        if result.scalar_one_or_none() is None:
            db.add(Role(**data))
    await db.commit()


async def seed_user_roles(db: AsyncSession) -> None:
    user_result = await db.execute(select(User).where(User.telegram_id == "1"))
    user = user_result.scalar_one_or_none()

    role_result = await db.execute(select(Role).where(Role.role == "superadmin"))
    role = role_result.scalar_one_or_none()

    if user and role:
        existing = await db.execute(
            select(UserRole).where(UserRole.user_id == user.id, UserRole.role_id == role.id)
        )
        if existing.scalar_one_or_none() is None:
            db.add(UserRole(user_id=user.id, role_id=role.id))
        await db.commit()


async def run_seeds(db: AsyncSession) -> None:
    await seed_users(db)
    await seed_roles(db)
    await seed_user_roles(db)
