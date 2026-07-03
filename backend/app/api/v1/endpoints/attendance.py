from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.attendance import Attendance
from app.models.booking import Booking
from app.models.subscription import Subscription
from app.models.subscription_plan import SubscriptionPlan
from app.models.user import User
from app.schemas.attendance import AttendanceResponse

router = APIRouter()

# Статус посещения, при котором списывается занятие
ATTENDED_STATUS = "present"


@router.post("/bookings/{booking_id}/attendance", response_model=AttendanceResponse, status_code=201)
async def mark_attendance(
    booking_id: UUID,
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "trainer")),
):
    """
    Отметить посещение. Допустимые статусы: present, absent.
    При status=present инкрементируется sessions_used у активной подписки пользователя.
    """
    if status not in ("present", "absent"):
        raise HTTPException(status_code=400, detail="Status must be 'present' or 'absent'")

    # Проверяем бронь
    booking_result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = booking_result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status == "cancelled":
        raise HTTPException(status_code=400, detail="Cannot mark attendance for a cancelled booking")

    # Проверяем что attendance ещё не выставлялась
    existing_result = await db.execute(
        select(Attendance).where(Attendance.booking_id == booking_id)
    )
    existing = existing_result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Attendance already marked as '{existing.status}' for this booking",
        )

    # Создаём запись attendance
    attendance = Attendance(
        booking_id=booking_id,
        status=status,
        marked_by=current_user.id,
    )
    db.add(attendance)

    # Если пришёл — списываем занятие с подписки, к которой привязана бронь
    if status == ATTENDED_STATUS:
        subscription = None

        if booking.subscription_id:
            # Списываем с конкретной подписки из брони
            sub_result = await db.execute(
                select(Subscription).where(Subscription.id == booking.subscription_id)
            )
            subscription = sub_result.scalar_one_or_none()
        else:
            # Fallback для старых броней без subscription_id
            from datetime import datetime, timezone
            now = datetime.now(timezone.utc)
            sub_result = await db.execute(
                select(Subscription).where(
                    Subscription.user_id == booking.user_id,
                    Subscription.status == "active",
                    (Subscription.expires_at == None) | (Subscription.expires_at > now),
                ).order_by(Subscription.started_at.desc()).limit(1)
            )
            subscription = sub_result.scalar_one_or_none()

        if subscription:
            plan_result = await db.execute(
                select(SubscriptionPlan).where(SubscriptionPlan.id == subscription.plan_id)
            )
            plan = plan_result.scalar_one()

            if not plan.is_unlimited:
                subscription.sessions_used += 1

    # Обновляем статус брони
    booking.status = "attended" if status == ATTENDED_STATUS else "missed"

    await db.flush()
    await db.refresh(attendance)

    return attendance


@router.get("/bookings/{booking_id}/attendance", response_model=AttendanceResponse)
async def get_attendance(
    booking_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Получить запись посещения по брони."""
    # Проверяем доступ: своя бронь или admin
    booking_result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = booking_result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    from app.api.deps import get_user_roles
    roles = await get_user_roles(current_user, db)
    if booking.user_id != current_user.id and not any(r in roles for r in ("superadmin", "admin", "trainer")):
        raise HTTPException(status_code=403, detail="Access denied")

    result = await db.execute(
        select(Attendance).where(Attendance.booking_id == booking_id)
    )
    attendance = result.scalar_one_or_none()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not marked yet")

    return attendance
