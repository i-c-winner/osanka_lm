from fastapi import APIRouter

from app.api.v1.endpoints import auth, subscription_plans, users

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(subscription_plans.router, prefix="/subscription-plans", tags=["subscription-plans"])
