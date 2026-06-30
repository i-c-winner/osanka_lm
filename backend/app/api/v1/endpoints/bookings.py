from datetime import datetime, timezone
from uuid import UUID

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.booking import Booking
from app.models.session import Session
from app.models.subscription import Subscription
from app.models.subscription_plan import SubscriptionPlan
from app.models.user import User
from app.schemas.booking import BookingResponse

router = APIRouter()


async def _get_active_subscription(user_id, db: AsyncSession):
    """Возвращает активную подписку пользователя или None.
    При нескольких активных подписках возвращает ту, что началась последней.
    """
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(Subscription).where(
            Subscription.user_id == user_id,
            Subscription.status == "active",
            (Subscription.expires_at == None) | (Subscription.expires_at > now),
        ).order_by(Subscription.started_at.desc()).limit(1)
    )
    return result.scalar_one_or_none()


@router.post("/", response_model=BookingResponse, status_code=201)
async def create_booking(
    session_id: UUID,
    subscription_id: Optional[UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("client")),
):
    # Определяем подписку: используем переданную или находим активную автоматически
    if subscription_id is not None:
        now = datetime.now(timezone.utc)
        sub_result = await db.execute(
            select(Subscription).where(
                Subscription.id == subscription_id,
                Subscription.user_id == current_user.id,
                Subscription.status == "active",
                (Subscription.expires_at == None) | (Subscription.expires_at > now),
            )
        )
        subscription = sub_result.scalar_one_or_none()
        if not subscription:
            raise HTTPException(status_code=403, detail="Subscription not found or expired")
    else:
        subscription = await _get_active_subscription(current_user.id, db)
        if not subscription:
            raise HTTPException(status_code=403, detail="No active subscription")

    # Проверяем лимит занятий (если план не безлимитный)
    plan_result = await db.execute(
        select(SubscriptionPlan).where(SubscriptionPlan.id == subscription.plan_id)
    )
    plan = plan_result.scalar_one()
    if not plan.is_unlimited and plan.sessions_limit is not None:
        # Считаем активные брони текущей подписки.
        # Брони без subscription_id (созданные до миграции) тоже учитываем.
        active_bookings_result = await db.execute(
            select(func.count()).select_from(Booking).where(
                Booking.user_id == current_user.id,
                Booking.status == "booked",
                (Booking.subscription_id == subscription.id) | (Booking.subscription_id == None),
            )
        )
        active_bookings_count = active_bookings_result.scalar()

        if subscription.sessions_used + active_bookings_count >= plan.sessions_limit:
            raise HTTPException(
                status_code=403,
                detail=f"Session limit reached: {subscription.sessions_used} attended + {active_bookings_count} booked = {plan.sessions_limit} limit",
            )

    # Проверяем что сессия существует
    session_result = await db.execute(
        select(Session).where(Session.id == session_id)
    )
    session = session_result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.status != "active":
        raise HTTPException(status_code=400, detail=f"Session is not available for booking (status: {session.status})")

    now = datetime.now(timezone.utc)
    starts_at = session.starts_at if session.starts_at.tzinfo else session.starts_at.replace(tzinfo=timezone.utc)
    if starts_at <= now:
        raise HTTPException(status_code=400, detail="Session has already started")

    # Проверяем что пользователь не забронировал эту сессию по ТЕКУЩЕЙ подписке
    # (одна сессия может быть забронирована по разным подпискам)
    existing_result = await db.execute(
        select(Booking).where(
            Booking.session_id == session_id,
            Booking.user_id == current_user.id,
            Booking.subscription_id == subscription.id,
            Booking.status != "cancelled",
        )
    )
    if existing_result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="You already have an active booking for this session under this subscription")

    # Проверяем вместимость: считаем уникальных пользователей
    # (один пользователь с двумя подписками занимает одно место)
    count_result = await db.execute(
        select(func.count(func.distinct(Booking.user_id))).select_from(Booking).where(
            Booking.session_id == session_id,
            Booking.status != "cancelled",
        )
    )
    booked_count = count_result.scalar()
    if booked_count >= session.capacity:
        raise HTTPException(status_code=409, detail="Session is fully booked")

    booking = Booking(
        session_id=session_id,
        user_id=current_user.id,
        subscription_id=subscription.id,
        status="booked",
    )
    db.add(booking)
    await db.flush()
    await db.refresh(booking)

    return booking


@router.get("/", response_model=list[BookingResponse])
async def list_bookings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Superadmin/admin видят все брони.
    Client видит только свои.
    """
    from app.api.deps import get_user_roles
    roles = await get_user_roles(current_user, db)

    if any(r in roles for r in ("superadmin", "admin")):
        result = await db.execute(select(Booking).order_by(Booking.booked_at.desc()))
    else:
        result = await db.execute(
            select(Booking)
            .where(Booking.user_id == current_user.id)
            .order_by(Booking.booked_at.desc())
        )

    return result.scalars().all()


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    from app.api.deps import get_user_roles
    roles = await get_user_roles(current_user, db)
    if booking.user_id != current_user.id and not any(r in roles for r in ("superadmin", "admin")):
        raise HTTPException(status_code=403, detail="Access denied")

    return booking


@router.post("/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking(
    booking_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    from app.api.deps import get_user_roles
    roles = await get_user_roles(current_user, db)
    if booking.user_id != current_user.id and not any(r in roles for r in ("superadmin", "admin")):
        raise HTTPException(status_code=403, detail="Access denied")

    if booking.status == "cancelled":
        raise HTTPException(status_code=400, detail="Booking is already cancelled")

    # Нельзя отменить после начала сессии
    session_result = await db.execute(select(Session).where(Session.id == booking.session_id))
    session = session_result.scalar_one_or_none()
    if session:
        now = datetime.now(timezone.utc)
        starts_at = session.starts_at if session.starts_at.tzinfo else session.starts_at.replace(tzinfo=timezone.utc)
        if starts_at <= now:
            raise HTTPException(status_code=400, detail="Cannot cancel booking after session has started")

    booking.status = "cancelled"
    booking.cancelled_at = datetime.now(timezone.utc)

    await db.flush()
    await db.refresh(booking)

    return booking
