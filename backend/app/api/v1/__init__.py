from fastapi import APIRouter

from app.api.v1.endpoints import auth, bookings, subscription_plans, subscriptions, users

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(subscription_plans.router, prefix="/subscription-plans", tags=["subscription-plans"])
router.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])
router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
