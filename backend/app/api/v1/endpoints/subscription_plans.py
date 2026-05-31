from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_role
from app.db.session import get_db
from app.models.subscription_plan import SubscriptionPlan
from app.models.user import User
from app.schemas.subscription_plan import SubscriptionPlanCreate, SubscriptionPlanResponse, SubscriptionPlanUpdate

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


@router.get("/", response_model=list[SubscriptionPlanResponse])
async def list_subscription_plans(db: AsyncSession = Depends(get_db)):
    """Публичный список активных тарифов."""
    result = await db.execute(
        select(SubscriptionPlan).where(SubscriptionPlan.is_active == True).order_by(SubscriptionPlan.name)
    )
    return result.scalars().all()


@router.get("/all", response_model=list[SubscriptionPlanResponse])
async def list_all_subscription_plans(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("superadmin")),
):
    """Все тарифы (включая неактивные) — только для superadmin."""
    result = await db.execute(
        select(SubscriptionPlan).order_by(SubscriptionPlan.name)
    )
    return result.scalars().all()


@router.patch("/{plan_id}", response_model=SubscriptionPlanResponse)
async def update_subscription_plan(
    plan_id: UUID,
    plan_in: SubscriptionPlanUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("superadmin")),
):
    result = await db.execute(select(SubscriptionPlan).where(SubscriptionPlan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found")

    if plan_in.code and plan_in.code != plan.code:
        conflict = await db.execute(
            select(SubscriptionPlan).where(SubscriptionPlan.code == plan_in.code)
        )
        if conflict.scalar_one_or_none():
            raise HTTPException(status_code=409, detail=f"Plan with code='{plan_in.code}' already exists")

    for field, value in plan_in.model_dump(exclude_unset=True).items():
        setattr(plan, field, value)

    await db.flush()
    await db.refresh(plan)
    return plan


@router.get("/{plan_id}", response_model=SubscriptionPlanResponse)
async def get_subscription_plan(plan_id: UUID, db: AsyncSession = Depends(get_db)):
    """Публичный просмотр тарифа."""
    result = await db.execute(select(SubscriptionPlan).where(SubscriptionPlan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found")
    return plan
