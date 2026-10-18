from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel, Field
import hashlib
import secrets

from app.database.session import get_db
from app.auth.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
)
from app.auth.dependencies import get_current_user, verify_refresh_token
from app.models.user import User
from app.models.token import RefreshToken
from app.models.password_reset import PasswordResetOTP
from app.schemas.auth import (
    UserCreate,
    UserResponse,
    Token,
    RefreshTokenRequest,
    MessageResponse,
)
from app.config import settings
from app.services.email_service import send_password_reset_otp


router = APIRouter(tags=["authentication"])


class CurrentPasswordRequest(BaseModel):
    current_password: str = Field(min_length=1)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=8)


class PasswordResetRequest(BaseModel):
    email: str = Field(min_length=3)


class VerifyPasswordResetOTPRequest(BaseModel):
    email: str = Field(min_length=3)
    otp: str = Field(min_length=6, max_length=6)


class PasswordResetConfirmRequest(BaseModel):
    email: str = Field(min_length=3)
    otp: str = Field(min_length=6, max_length=6)
    password: str = Field(min_length=8)


def _hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode("utf-8")).hexdigest()


def _generate_otp() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


@router.post("/register", response_model=Token, status_code=201)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hash_password(user_data.password),
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(
        {"sub": str(user.id)}
    )

    refresh_token = create_refresh_token(
        {"sub": str(user.id)}
    )

    refresh_hash = hashlib.sha256(
        refresh_token.encode("utf-8")
    ).hexdigest()

    token_record = RefreshToken(
        user_id=user.id,
        token_hash=refresh_hash,
        expires_at=datetime.now(timezone.utc)
        + timedelta(days=settings.jwt_refresh_token_expire_days),
    )

    db.add(token_record)
    await db.commit()

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.email == form_data.username)
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(
        form_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    access_token = create_access_token(
        {"sub": str(user.id)}
    )

    refresh_token = create_refresh_token(
        {"sub": str(user.id)}
    )

    refresh_hash = hashlib.sha256(
        refresh_token.encode("utf-8")
    ).hexdigest()

    token_record = RefreshToken(
        user_id=user.id,
        token_hash=refresh_hash,
        expires_at=datetime.now(timezone.utc)
        + timedelta(days=settings.jwt_refresh_token_expire_days),
    )

    db.add(token_record)
    await db.commit()

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


@router.post(
    "/password-reset/request",
    response_model=MessageResponse,
)
async def request_password_reset(
    request: PasswordResetRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Request a password reset OTP.

    The response intentionally does not reveal whether
    the email exists.
    """

    generic_message = (
        "If an account exists for this email, "
        "a password reset OTP has been sent."
    )

    result = await db.execute(
        select(User).where(User.email == request.email)
    )
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        return MessageResponse(message=generic_message)

    now = datetime.now(timezone.utc)

    # Invalidate previous unused OTPs for this user.
    await db.execute(
        update(PasswordResetOTP)
        .where(
            PasswordResetOTP.user_id == user.id,
            PasswordResetOTP.used.is_(False),
        )
        .values(used=True)
    )

    otp = _generate_otp()
    otp_hash = _hash_otp(otp)

    reset_otp = PasswordResetOTP(
        user_id=user.id,
        otp_hash=otp_hash,
        expires_at=now + timedelta(
            minutes=settings.password_reset_otp_expire_minutes
        ),
        attempts=0,
        max_attempts=settings.password_reset_max_attempts,
        used=False,
        verified=False,
    )

    db.add(reset_otp)
    await db.commit()

    try:
        send_password_reset_otp(
            recipient_email=user.email,
            otp=otp,
        )
    except Exception:
        await db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to send password reset email.",
        )

    return MessageResponse(message=generic_message)


@router.post(
    "/password-reset/verify",
    response_model=MessageResponse,
)
async def verify_password_reset_otp(
    request: VerifyPasswordResetOTPRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.email == request.email)
    )
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP.",
        )

    otp_result = await db.execute(
        select(PasswordResetOTP)
        .where(
            PasswordResetOTP.user_id == user.id,
            PasswordResetOTP.used.is_(False),
        )
        .order_by(PasswordResetOTP.created_at.desc())
        .limit(1)
    )

    reset_otp = otp_result.scalars().first()

    if not reset_otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP.",
        )

    now = datetime.now(timezone.utc)

    expires_at = reset_otp.expires_at

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at <= now:
        reset_otp.used = True
        await db.commit()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired.",
        )

    if reset_otp.attempts >= reset_otp.max_attempts:
        reset_otp.used = True
        await db.commit()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum OTP attempts exceeded.",
        )

    reset_otp.attempts += 1

    if not secrets.compare_digest(
        reset_otp.otp_hash,
        _hash_otp(request.otp),
    ):
        if reset_otp.attempts >= reset_otp.max_attempts:
            reset_otp.used = True

        await db.commit()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP.",
        )

    reset_otp.verified = True
    reset_otp.verified_at = now

    await db.commit()

    return MessageResponse(
        message="OTP verified successfully.",
    )


@router.post(
    "/password-reset/confirm",
    response_model=MessageResponse,
)
async def confirm_password_reset(
    request: PasswordResetConfirmRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.email == request.email)
    )
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password reset request.",
        )

    otp_result = await db.execute(
        select(PasswordResetOTP)
        .where(
            PasswordResetOTP.user_id == user.id,
            PasswordResetOTP.used.is_(False),
            PasswordResetOTP.verified.is_(True),
        )
        .order_by(PasswordResetOTP.created_at.desc())
        .limit(1)
    )

    reset_otp = otp_result.scalars().first()

    if not reset_otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please verify your OTP first.",
        )

    now = datetime.now(timezone.utc)

    expires_at = reset_otp.expires_at

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at <= now:
        reset_otp.used = True
        await db.commit()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset request has expired.",
        )

    if not secrets.compare_digest(
        reset_otp.otp_hash,
        _hash_otp(request.otp),
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password reset request.",
        )

    user.hashed_password = hash_password(
        request.password
    )

    reset_otp.used = True

    # Invalidate all existing refresh tokens after password reset.
    await db.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user.id)
        .values(revoked=True)
    )

    await db.commit()

    return MessageResponse(
        message="Password reset successfully.",
    )


@router.post(
    "/password/change/verify",
    response_model=MessageResponse,
)
async def verify_current_password(
    request: CurrentPasswordRequest,
    current_user: User = Depends(get_current_user),
):
    if not verify_password(
        request.current_password,
        current_user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    return MessageResponse(
        message="Current password verified.",
    )


@router.post(
    "/password/change",
    response_model=MessageResponse,
)
async def change_password(
    request: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(
        request.current_password,
        current_user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    if verify_password(
        request.new_password,
        current_user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from the current password.",
        )

    current_user.hashed_password = hash_password(
        request.new_password
    )

    await db.commit()

    return MessageResponse(
        message="Password changed successfully.",
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    user = await verify_refresh_token(
        request.refresh_token,
        db,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token.",
        )

    token_hash = hashlib.sha256(
        request.refresh_token.encode("utf-8")
    ).hexdigest()

    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.user_id == user.id,
            RefreshToken.revoked.is_(False),
        )
    )

    old_token = result.scalar_one_or_none()

    if not old_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token.",
        )

    old_token.revoked = True

    access_token = create_access_token(
        {"sub": str(user.id)}
    )

    refresh_token_value = create_refresh_token(
        {"sub": str(user.id)}
    )

    new_hash = hashlib.sha256(
        refresh_token_value.encode("utf-8")
    ).hexdigest()

    new_token = RefreshToken(
        user_id=user.id,
        token_hash=new_hash,
        expires_at=datetime.now(timezone.utc)
        + timedelta(days=settings.jwt_refresh_token_expire_days),
    )

    db.add(new_token)
    await db.commit()

    return Token(
        access_token=access_token,
        refresh_token=refresh_token_value,
        token_type="bearer",
    )


@router.post(
    "/logout",
    response_model=MessageResponse,
)
async def logout(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    token_hash = hashlib.sha256(
        request.refresh_token.encode("utf-8")
    ).hexdigest()

    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.user_id == current_user.id,
            RefreshToken.revoked.is_(False),
        )
    )

    token_record = result.scalar_one_or_none()

    if token_record:
        token_record.revoked = True
        await db.commit()

    return MessageResponse(
        message="Logged out successfully.",
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    return current_user