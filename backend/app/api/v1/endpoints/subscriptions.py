from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.subscription import Subscription
from app.models.subscription_plan import SubscriptionPlan
from app.models.user import User
from app.schemas.subscription import SubscriptionCreate, SubscriptionResponse

router = APIRouter()


@router.post("/", response_model=SubscriptionResponse, status_code=201)
async def create_subscription(
    plan_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.api.deps import get_user_roles
    roles = await get_user_roles(current_user, db)
    if not any(r in roles for r in ("client", "superadmin")):
        raise HTTPException(status_code=403, detail="Access denied")

    plan_result = await db.execute(
        select(SubscriptionPlan).where(SubscriptionPlan.id == plan_id, SubscriptionPlan.is_active == True)
    )
    plan = plan_result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found or inactive")

    started_at = datetime.now(timezone.utc)

    if plan.is_calendar_month:
        expires_at = started_at + relativedelta(months=1)
    elif plan.duration_days:
        from datetime import timedelta
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
