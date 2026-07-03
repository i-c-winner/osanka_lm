from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_user_roles, require_role
from app.db.session import get_db
from app.models.content_plan import ContentPlan
from app.models.online_access import OnlineAccess
from app.models.online_content import OnlineContent
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.online_access import OnlineAccessResponse, OnlineAccessStatus
from app.schemas.online_content import (
    OnlineContentCreate,
    OnlineContentResponse,
    OnlineContentUpdate,
)

router = APIRouter()


# ─── Вспомогательные функции ──────────────────────────────────────────────────

def _to_response(content: OnlineContent) -> OnlineContentResponse:
    """Конвертирует модель в схему, вытаскивая plan_ids из relationship."""
    data = OnlineContentResponse.model_validate(content)
    data.plan_ids = [p.id for p in (content.plans or [])]
    return data


async def _sync_plans(
    content: OnlineContent,
    plan_ids: list[UUID],
    db: AsyncSession,
) -> None:
    """Заменяет набор планов для контента."""
    await db.execute(
        delete(ContentPlan).where(ContentPlan.content_id == content.id)
    )
    for plan_id in plan_ids:
        db.add(ContentPlan(content_id=content.id, plan_id=plan_id))


async def _get_user_plan_ids(user: User, db: AsyncSession) -> set[UUID]:
    """Возвращает set plan_id всех активных онлайн-подписок пользователя."""
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(Subscription.plan_id)
        .join(OnlineAccess, OnlineAccess.subscription_id == Subscription.id)
        .where(
            Subscription.user_id == user.id,
            OnlineAccess.status == "active",
            OnlineAccess.started_at <= now,
            (OnlineAccess.expires_at == None) | (OnlineAccess.expires_at >= now),
        )
    )
    return {row[0] for row in result.fetchall()}


async def _content_plan_ids(content_id: UUID, db: AsyncSession) -> set[UUID]:
    """Возвращает set plan_id привязанных к контенту."""
    result = await db.execute(
        select(ContentPlan.plan_id).where(ContentPlan.content_id == content_id)
    )
    return {row[0] for row in result.fetchall()}


async def _user_has_access(user: User, content: OnlineContent, db: AsyncSession) -> bool:
    """
    Проверяет доступ пользователя к конкретному контенту:
    - is_free → доступно всем авторизованным
    - нет привязанных планов → доступно всем с любым активным онлайн-доступом
    - есть планы → нужна активная подписка на один из этих планов
    """
    if content.is_free:
        return True

    content_plans = await _content_plan_ids(content.id, db)

    if not content_plans:
        # контент без привязки — достаточно любого онлайн-доступа
        now = datetime.now(timezone.utc)
        result = await db.execute(
            select(OnlineAccess).where(
                OnlineAccess.user_id == user.id,
                OnlineAccess.status == "active",
                OnlineAccess.started_at <= now,
                (OnlineAccess.expires_at == None) | (OnlineAccess.expires_at >= now),
            )
        )
        return result.scalar_one_or_none() is not None

    user_plan_ids = await _get_user_plan_ids(user, db)
    return bool(content_plans & user_plan_ids)


# ─── Контент ──────────────────────────────────────────────────────────────────

@router.post("/", response_model=OnlineContentResponse, status_code=201)
async def create_content(
    content_in: OnlineContentCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    data = content_in.model_dump(exclude={"plan_ids"})
    content = OnlineContent(**data)
    db.add(content)
    await db.flush()

    if content_in.plan_ids:
        await _sync_plans(content, content_in.plan_ids, db)

    await db.flush()
    await db.refresh(content)
    return _to_response(content)


@router.get("/", response_model=list[OnlineContentResponse])
async def list_content(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Admin/superadmin — видят всё.
    Обычный пользователь — видит is_free контент + контент своих онлайн-планов.
    """
    roles = await get_user_roles(current_user, db)
    is_admin = any(r in roles for r in ("admin", "superadmin"))

    result = await db.execute(
        select(OnlineContent).order_by(OnlineContent.created_at.desc())
    )
    all_content = result.scalars().all()

    if is_admin:
        return [_to_response(c) for c in all_content]

    user_plan_ids = await _get_user_plan_ids(current_user, db)

    visible = []
    for c in all_content:
        if c.status != "active":
            continue
        if c.is_free:
            visible.append(c)
            continue
        content_plans = {cp.plan_id for cp in (c.plans or [])}
        if not content_plans:
            if user_plan_ids:
                visible.append(c)
        elif content_plans & user_plan_ids:
            visible.append(c)

    return [_to_response(c) for c in visible]


@router.get("/{content_id}", response_model=OnlineContentResponse)
async def get_content(
    content_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(OnlineContent).where(OnlineContent.id == content_id))
    content = result.scalar_one_or_none()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    roles = await get_user_roles(current_user, db)
    if any(r in roles for r in ("admin", "superadmin")):
        return _to_response(content)

    if not await _user_has_access(current_user, content, db):
        raise HTTPException(status_code=403, detail="No access to this content")

    return _to_response(content)


@router.patch("/{content_id}", response_model=OnlineContentResponse)
async def update_content(
    content_id: UUID,
    content_in: OnlineContentUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    result = await db.execute(select(OnlineContent).where(OnlineContent.id == content_id))
    content = result.scalar_one_or_none()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    update_data = content_in.model_dump(exclude_unset=True, exclude={"plan_ids"})
    for field, value in update_data.items():
        setattr(content, field, value)

    if content_in.plan_ids is not None:
        await _sync_plans(content, content_in.plan_ids, db)

    await db.flush()
    await db.refresh(content)
    return _to_response(content)


@router.delete("/{content_id}", status_code=204)
async def delete_content(
    content_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    result = await db.execute(select(OnlineContent).where(OnlineContent.id == content_id))
    content = result.scalar_one_or_none()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    await db.delete(content)
    await db.flush()


# ─── Доступ ───────────────────────────────────────────────────────────────────

@router.get("/access/me", response_model=OnlineAccessStatus)
async def my_access(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Возвращает текущий онлайн-доступ пользователя."""
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(OnlineAccess).where(
            OnlineAccess.user_id == current_user.id,
            OnlineAccess.status == "active",
            OnlineAccess.started_at <= now,
            (OnlineAccess.expires_at == None) | (OnlineAccess.expires_at >= now),
        ).order_by(OnlineAccess.expires_at.desc())
    )
    access = result.scalar_one_or_none()
    return OnlineAccessStatus(
        has_access=access is not None,
        access=OnlineAccessResponse.model_validate(access) if access else None,
    )
