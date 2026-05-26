from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.day import Day
from app.models.user import User
from app.schemas.day import DayCreate, DayResponse, DayUpdate

router = APIRouter()


@router.post("/", response_model=DayResponse, status_code=201)
async def create_day(
    day_in: DayCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    day = Day(**day_in.model_dump())
    db.add(day)
    await db.flush()
    await db.refresh(day)
    return day


@router.get("/", response_model=list[DayResponse])
async def list_days(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Day).order_by(Day.date))
    return result.scalars().all()


@router.get("/{day_id}", response_model=DayResponse)
async def get_day(
    day_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Day).where(Day.id == day_id))
    day = result.scalar_one_or_none()
    if not day:
        raise HTTPException(status_code=404, detail="Day not found")
    return day


@router.patch("/{day_id}", response_model=DayResponse)
async def update_day(
    day_id: UUID,
    day_in: DayUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    result = await db.execute(select(Day).where(Day.id == day_id))
    day = result.scalar_one_or_none()
    if not day:
        raise HTTPException(status_code=404, detail="Day not found")

    for field, value in day_in.model_dump(exclude_unset=True).items():
        setattr(day, field, value)

    await db.flush()
    await db.refresh(day)
    return day


@router.delete("/{day_id}", status_code=204)
async def delete_day(
    day_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    result = await db.execute(select(Day).where(Day.id == day_id))
    day = result.scalar_one_or_none()
    if not day:
        raise HTTPException(status_code=404, detail="Day not found")

    await db.delete(day)
    await db.flush()
