from fastapi import APIRouter

from app.api.v1.endpoints import attendance, auth, bookings, currency, days, locations, sessions, subscription_plans, subscriptions, users

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(subscription_plans.router, prefix="/subscription-plans", tags=["subscription-plans"])
router.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])
router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
router.include_router(attendance.router, prefix="", tags=["attendance"])
router.include_router(days.router, prefix="/days", tags=["days"])
router.include_router(locations.router, prefix="/locations", tags=["locations"])
router.include_router(currency.router, prefix="/currency", tags=["currency"])
