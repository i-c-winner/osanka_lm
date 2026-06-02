from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_user_roles, require_role
from app.db.session import get_db
from app.models.role import Role
from app.models.user import User
from app.models.user_role import UserRole
from app.schemas.user import MeResponse, UserCreate, UserResponse
from sqlalchemy.orm import selectinload

router = APIRouter()

DEFAULT_ROLE = "client"


class ChangeRoleRequest(BaseModel):
    role: str


class ChangeActiveRequest(BaseModel):
    is_active: bool


@router.get("/", response_model=list[MeResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin", "superadmin")),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()

    out = []
    for user in users:
        roles = await get_user_roles(user, db)
        out.append(MeResponse.model_validate({**user.__dict__, "roles": roles}))

    return out


class TrainerPublicResponse(BaseModel):
    id:         str
    first_name: str | None = None
    last_name:  str | None = None


@router.get("/trainers", response_model=list[TrainerPublicResponse])
async def list_trainers(db: AsyncSession = Depends(get_db)):
    """Публичный список тренеров — только id и имя, авторизация не требуется."""
    trainer_role_result = await db.execute(
        select(Role).where(Role.role == "trainer")
    )
    trainer_role = trainer_role_result.scalar_one_or_none()
    if not trainer_role:
        return []
    result = await db.execute(
        select(User)
        .join(UserRole, UserRole.user_id == User.id)
        .where(UserRole.role_id == trainer_role.id, User.is_active == True)
    )
    users = result.scalars().all()
    return [
        TrainerPublicResponse(id=str(u.id), first_name=u.first_name, last_name=u.last_name)
        for u in users
    ]


@router.get("/me", response_model=MeResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    roles = await get_user_roles(current_user, db)
    return MeResponse.model_validate({**current_user.__dict__, "roles": roles})


@router.post("/", response_model=UserResponse, status_code=201)
async def create_user(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.telegram_id == user_in.telegram_id))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail=f"User with telegram_id={user_in.telegram_id} already exists")

    user = User(**user_in.model_dump())
    db.add(user)
    await db.flush()

    role_result = await db.execute(select(Role).where(Role.role == DEFAULT_ROLE))
    role = role_result.scalar_one_or_none()
    if role:
        db.add(UserRole(user_id=user.id, role_id=role.id))

    await db.flush()
    await db.refresh(user)

    return user


@router.patch("/{user_id}/active", response_model=UserResponse)
async def set_user_active(
    user_id: UUID,
    body: ChangeActiveRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "superadmin")),
):
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot change own active status")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = body.is_active
    await db.flush()
    await db.refresh(user)

    return user


@router.put("/{user_id}/role", response_model=UserResponse)
async def change_user_role(
    user_id: UUID,
    body: ChangeRoleRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("superadmin")),
):
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if body.role == "superadmin":
        raise HTTPException(status_code=403, detail="Cannot assign superadmin role")

    role_result = await db.execute(select(Role).where(Role.role == body.role))
    role = role_result.scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=404, detail=f"Role '{body.role}' not found")

    await db.execute(delete(UserRole).where(UserRole.user_id == user.id))
    db.add(UserRole(user_id=user.id, role_id=role.id))

    await db.flush()
    await db.refresh(user)

    return user
