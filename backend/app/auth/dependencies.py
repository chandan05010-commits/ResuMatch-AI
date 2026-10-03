from datetime import datetime
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.security import decode_token
from app.database.session import get_db
from app.models.token import RefreshToken
from app.models.user import User


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/login"
)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_token(token)

    if payload is None or payload.get("type") != "access":
        raise credentials_exception

    user_id = payload.get("sub")

    if user_id is None:
        raise credentials_exception

    try:
        user_uuid = UUID(user_id)
    except (ValueError, TypeError):
        raise credentials_exception

    result = await db.execute(
        select(User).where(User.id == user_uuid)
    )

    user = result.scalar_one_or_none()

    if user is None or not user.is_active:
        raise credentials_exception

    return user


async def get_current_user_optional(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    try:
        return await get_current_user(token, db)
    except HTTPException:
        return None


async def verify_refresh_token(
    token: str,
    db: AsyncSession,
) -> RefreshToken | None:
    import hashlib

    token_hash = hashlib.sha256(
        token.encode()
    ).hexdigest()

    result = await db.execute(
        select(RefreshToken)
        .where(RefreshToken.token_hash == token_hash)
        .where(RefreshToken.revoked_at.is_(None))
        .where(RefreshToken.expires_at > datetime.utcnow())
        .order_by(RefreshToken.created_at.desc())
        .limit(1)
    )

    return result.scalars().first()