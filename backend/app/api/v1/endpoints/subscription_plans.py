from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_role
from app.db.session import get_db
from app.models.subscription_plan import SubscriptionPlan
from app.models.user import User
from app.schemas.subscription_plan import SubscriptionPlanCreate, SubscriptionPlanResponse

router = APIRouter()


@router.post("/", response_model=SubscriptionPlanResponse, status_code=201)
async def create_subscription_plan(
    plan_in: SubscriptionPlanCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("superadmin")),
):
    result = await db.execute(select(SubscriptionPlan).where(SubscriptionPlan.code == plan_in.code))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail=f"Plan with code='{plan_in.code}' already exists")

    plan = SubscriptionPlan(**plan_in.model_dump())
    db.add(plan)
    await db.flush()
    await db.refresh(plan)

    return plan
