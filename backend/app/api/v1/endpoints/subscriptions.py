import calendar
from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException  # HTTPException used for 404
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_user_roles, require_role
from app.db.session import get_db
from app.models.subscription import Subscription
from app.models.subscription_plan import SubscriptionPlan
from app.models.user import User
from app.schemas.subscription import SubscriptionResponse

router = APIRouter()


@router.post("/", response_model=SubscriptionResponse, status_code=201)
async def create_subscription(
    plan_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("client")),
):
    plan_result = await db.execute(
        select(SubscriptionPlan).where(SubscriptionPlan.id == plan_id, SubscriptionPlan.is_active == True)
    )
    plan = plan_result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found or inactive")

    started_at = datetime.now(timezone.utc)

    if plan.is_calendar_month:
        month = started_at.month % 12 + 1
        year = started_at.year + (1 if started_at.month == 12 else 0)
        day = min(started_at.day, calendar.monthrange(year, month)[1])
        expires_at = started_at.replace(year=year, month=month, day=day)
    elif plan.duration_days:
        expires_at = started_at + timedelta(days=plan.duration_days)
    else:
        expires_at = None

    subscription = Subscription(
        user_id=current_user.id,
        plan_id=plan.id,
        sessions_used=0,
        started_at=started_at,
        expires_at=expires_at,
        status="active",
    )
    db.add(subscription)
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
