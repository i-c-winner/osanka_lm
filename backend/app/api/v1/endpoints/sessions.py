from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.booking import Booking
from app.models.session import Session
from app.models.user import User
from app.schemas.session import SessionCreate, SessionResponse, SessionUpdate

router = APIRouter()


async def _check_conflict(db: AsyncSession, session_in: SessionCreate, exclude_id: UUID | None = None) -> None:
    """Проверяет пересечение по дате, времени и локации."""
    filters = [
        Session.day_id == session_in.day_id,
        Session.status != "cancelled",
        # Перекрытие интервалов: A.start < B.end AND A.end > B.start
        Session.starts_at < session_in.ends_at,
        Session.ends_at   > session_in.starts_at,
    ]

    # Конфликт по локации проверяем только если локация указана
    if session_in.location_id:
        filters.append(Session.location_id == session_in.location_id)

    if exclude_id:
        filters.append(Session.id != exclude_id)

    result = await db.execute(select(Session).where(and_(*filters)))
    conflict = result.scalar_one_or_none()

    if conflict:
        raise HTTPException(
            status_code=409,
            detail={
                "code": "session_conflict",
                "message": "В это время на данной локации уже есть сессия",
                "conflict_id": str(conflict.id),
                "starts_at": conflict.starts_at.isoformat(),
                "ends_at":   conflict.ends_at.isoformat(),
            },
        )


@router.post("/", response_model=SessionResponse, status_code=201)
async def create_session(
    session_in: SessionCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    await _check_conflict(db, session_in)

    session = Session(**session_in.model_dump())
    db.add(session)
    await db.flush()
    await db.refresh(session)
    return session


async def _with_booked_counts(sessions: list[Session], db: AsyncSession) -> list[dict]:
    """Добавляет booked_count к каждой сессии."""
    if not sessions:
        return []
    session_ids = [s.id for s in sessions]
    counts_result = await db.execute(
        select(Booking.session_id, func.count(Booking.id).label("cnt"))
        .where(Booking.session_id.in_(session_ids), Booking.status != "cancelled")
        .group_by(Booking.session_id)
    )
    counts = {row.session_id: row.cnt for row in counts_result}
    return [
        {**s.__dict__, "booked_count": counts.get(s.id, 0)}
        for s in sessions
    ]


@router.get("/", response_model=list[SessionResponse])
async def list_sessions(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Session).order_by(Session.starts_at))
    sessions = result.scalars().all()
    return await _with_booked_counts(sessions, db)


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.patch("/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: UUID,
    session_in: SessionUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Проверяем конфликт только если меняются время или локация
    time_or_location_changed = any(
        f in session_in.model_fields_set
        for f in ("starts_at", "ends_at", "day_id", "location_id")
    )
    if time_or_location_changed:
        merged = SessionCreate(
            day_id=      session_in.day_id      or session.day_id,
            starts_at=   session_in.starts_at   or session.starts_at,
            ends_at=     session_in.ends_at     or session.ends_at,
            capacity=    session_in.capacity    or session.capacity,
            status=      session_in.status      or session.status,
            location_id= session_in.location_id if "location_id" in session_in.model_fields_set else session.location_id,
        )
        await _check_conflict(db, merged, exclude_id=session_id)

    for field, value in session_in.model_dump(exclude_unset=True).items():
        setattr(session, field, value)

    await db.flush()
    await db.refresh(session)
    return session


@router.delete("/{session_id}", status_code=204)
async def delete_session(
    session_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    await db.delete(session)
    await db.flush()
