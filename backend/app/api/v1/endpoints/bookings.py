from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.booking import Booking
from app.models.session import Session
from app.models.user import User
from app.schemas.booking import BookingResponse

router = APIRouter()


@router.post("/", response_model=BookingResponse, status_code=201)
async def create_booking(
    session_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("client")),
):
    # Проверяем что сессия существует
    session_result = await db.execute(
        select(Session).where(Session.id == session_id)
    )
    session = session_result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.status != "active":
        raise HTTPException(status_code=400, detail=f"Session is not available for booking (status: {session.status})")

    # Проверяем что пользователь не забронировал эту сессию ранее
    existing_result = await db.execute(
        select(Booking).where(
            Booking.session_id == session_id,
            Booking.user_id == current_user.id,
            Booking.status != "cancelled",
        )
    )
    if existing_result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="You already have an active booking for this session")

    # Проверяем вместимость
    count_result = await db.execute(
        select(func.count()).select_from(Booking).where(
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

    booking.status = "cancelled"
    booking.cancelled_at = datetime.now(timezone.utc)

    await db.flush()
    await db.refresh(booking)

    return booking
