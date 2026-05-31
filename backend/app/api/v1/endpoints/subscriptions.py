import calendar
from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException  # HTTPException used for 404
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_user_roles, require_role
from app.db.session import get_db
from app.models.role import Role
from app.models.subscription import Subscription
from app.models.subscription_plan import SubscriptionPlan
from app.models.user import User
from app.models.user_role import UserRole
from app.schemas.subscription import SubscriptionResponse
from sqlalchemy import delete

router = APIRouter()


async def _upgrade_to_client(user: User, db: AsyncSession) -> None:
    """Меняет роль пользователя на client (удаляет все текущие роли)."""
    role_result = await db.execute(select(Role).where(Role.role == "client"))
    client_role = role_result.scalar_one_or_none()
    if not client_role:
        return
    await db.execute(delete(UserRole).where(UserRole.user_id == user.id))
    db.add(UserRole(user_id=user.id, role_id=client_role.id))
    await db.flush()


@router.post("/", response_model=SubscriptionResponse, status_code=201)
async def create_subscription(
    plan_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("guest", "client")),
):
    plan_result = await db.execute(
        select(SubscriptionPlan).where(SubscriptionPlan.id == plan_id, SubscriptionPlan.is_active == True)
    )
    plan = plan_result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found or inactive")

    now = datetime.now(timezone.utc)

    if plan.is_calendar_month:
        # До конца текущего месяца
        started_at = now
        last_day = calendar.monthrange(now.year, now.month)[1]
        expires_at = now.replace(day=last_day, hour=23, minute=59, second=59, microsecond=0)
    elif plan.duration_days:
        # Начало — первое число следующего месяца
        if now.month == 12:
            next_month_year, next_month = now.year + 1, 1
        else:
            next_month_year, next_month = now.year, now.month + 1
        started_at = now.replace(year=next_month_year, month=next_month, day=1, hour=0, minute=0, second=0, microsecond=0)

        # Конец — последний день N-го месяца от started_at
        # 30 дней → 1 месяц, 90 → 3, 180 → 6; остальное округляем
        months = max(1, round(plan.duration_days / 30))
        end_month = next_month + months - 1
        end_year  = next_month_year + (end_month - 1) // 12
        end_month = (end_month - 1) % 12 + 1
        last_day  = calendar.monthrange(end_year, end_month)[1]
        expires_at = started_at.replace(year=end_year, month=end_month, day=last_day, hour=23, minute=59, second=59)
    else:
        started_at = now
        expires_at = None

    # Проверяем пересечение с уже активными подписками на этот период
    overlap_query = select(Subscription).where(
        Subscription.user_id == current_user.id,
        Subscription.status == "active",
        Subscription.started_at < (expires_at if expires_at else started_at),
        (Subscription.expires_at == None) | (Subscription.expires_at > started_at),
    )
    overlap_result = await db.execute(overlap_query)
    if overlap_result.scalar_one_or_none():
        raise HTTPException(
            status_code=409,
            detail="У вас уже есть активная подписка на этот период",
        )

    subscription = Subscription(
        user_id=current_user.id,
        plan_id=plan.id,
        sessions_used=0,
        started_at=started_at,
        expires_at=expires_at,
        status="active",
    )
    db.add(subscription)

    # Если пользователь был guest — повышаем до client
    roles = await get_user_roles(current_user, db)
    if "client" not in roles:
        await _upgrade_to_client(current_user, db)

    await db.flush()
    await db.refresh(subscription)

    return subscription


@router.get("/", response_model=list[SubscriptionResponse])
async def list_subscriptions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """admin/superadmin видят все подписки, client — только свои."""
    roles = await get_user_roles(current_user, db)
    if any(r in roles for r in ("superadmin", "admin")):
        result = await db.execute(select(Subscription).order_by(Subscription.started_at.desc()))
    else:
        result = await db.execute(
            select(Subscription)
            .where(Subscription.user_id == current_user.id)
            .order_by(Subscription.started_at.desc())
        )
    return result.scalars().all()


@router.get("/{subscription_id}", response_model=SubscriptionResponse)
async def get_subscription(
    subscription_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Subscription).where(Subscription.id == subscription_id))
    subscription = result.scalar_one_or_none()
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")

    roles = await get_user_roles(current_user, db)
    if subscription.user_id != current_user.id and not any(r in roles for r in ("superadmin", "admin")):
        raise HTTPException(status_code=403, detail="Access denied")

    return subscription
