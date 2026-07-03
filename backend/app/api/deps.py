from datetime import datetime, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db
from app.models.online_access import OnlineAccess
from app.models.permission import Permission
from app.models.role import Role
from app.models.role_permission import RolePermission
from app.models.user import User
from app.models.user_role import UserRole

bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        telegram_id: str = payload.get("sub")
        if not telegram_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    result = await db.execute(select(User).where(User.telegram_id == telegram_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is inactive")

    return user


async def get_user_roles(user: User, db: AsyncSession) -> list[str]:
    result = await db.execute(
        select(Role.role)
        .join(UserRole, UserRole.role_id == Role.id)
        .where(UserRole.user_id == user.id)
    )
    return [row[0] for row in result.fetchall()]


async def get_user_permissions(user: User, db: AsyncSession) -> list[str]:
    result = await db.execute(
        select(Permission.code)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .join(UserRole, UserRole.role_id == RolePermission.role_id)
        .where(UserRole.user_id == user.id)
    )
    return [row[0] for row in result.fetchall()]


def require_role(*role_names: str):
    async def dependency(
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> User:
        roles = await get_user_roles(current_user, db)
        if "superadmin" in roles:
            return current_user
        if not any(r in roles for r in role_names):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Required role: {', '.join(role_names)}",
            )
        return current_user
    return dependency


def require_online_access():
    """Dependency: проверяет наличие активного онлайн-доступа у пользователя."""
    async def dependency(
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> User:
        roles = await get_user_roles(current_user, db)
        # Admins bypasses access check
        if any(r in roles for r in ("superadmin", "admin")):
            return current_user

        now = datetime.now(timezone.utc)
        result = await db.execute(
            select(OnlineAccess).where(
                OnlineAccess.user_id == current_user.id,
                OnlineAccess.status == "active",
                OnlineAccess.started_at <= now,
                (OnlineAccess.expires_at == None) | (OnlineAccess.expires_at >= now),
            )
        )
        if not result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No active online access",
            )
        return current_user
    return dependency


def require_permission(*permission_codes: str):
    async def dependency(
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> User:
        roles = await get_user_roles(current_user, db)
        if "superadmin" in roles:
            return current_user
        permissions = await get_user_permissions(current_user, db)
        if not any(p in permissions for p in permission_codes):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Required permission: {', '.join(permission_codes)}",
            )
        return current_user
    return dependency
