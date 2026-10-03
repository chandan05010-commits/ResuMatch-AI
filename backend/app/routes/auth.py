from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from uuid import UUID
import hashlib

from app.database.session import get_db
from app.auth.security import (
    hash_password, 
    verify_password, 
    create_access_token, 
    create_refresh_token,
    generate_token_hash
)
from app.auth.dependencies import get_current_user, verify_refresh_token
from app.models.user import User
from app.models.token import RefreshToken
from app.schemas.auth import (
    UserCreate, 
    UserLogin, 
    UserResponse, 
    Token, 
    RefreshTokenRequest,
    MessageResponse
)
from app.config import settings

router = APIRouter(tags=["authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Create tokens
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    
    # Store refresh token hash
    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    refresh_token_obj = RefreshToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=datetime.utcnow() + timedelta(days=settings.jwt_refresh_token_expire_days),
    )
    db.add(refresh_token_obj)
    await db.commit()
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    
    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    refresh_token_obj = RefreshToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=datetime.utcnow() + timedelta(days=settings.jwt_refresh_token_expire_days),
    )
    db.add(refresh_token_obj)
    await db.commit()
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )

@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    refresh_token_obj = await verify_refresh_token(request.refresh_token, db)
    
    if not refresh_token_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    # Revoke old refresh token
    refresh_token_obj.revoked_at = datetime.utcnow()
    
    # Create new tokens
    user_id = str(refresh_token_obj.user_id)
    access_token = create_access_token({"sub": user_id})
    new_refresh_token = create_refresh_token({"sub": user_id})
    
    # Store new refresh token
    token_hash = hashlib.sha256(new_refresh_token.encode()).hexdigest()
    new_refresh_token_obj = RefreshToken(
        user_id=refresh_token_obj.user_id,
        token_hash=token_hash,
        expires_at=datetime.utcnow() + timedelta(days=settings.jwt_refresh_token_expire_days),
    )
    db.add(new_refresh_token_obj)
    await db.commit()
    
    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer"
    )

@router.post("/logout", response_model=MessageResponse)
async def logout(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    refresh_token_obj = await verify_refresh_token(request.refresh_token, db)
    
    if refresh_token_obj and refresh_token_obj.user_id == current_user.id:
        refresh_token_obj.revoked_at = datetime.utcnow()
        await db.commit()
    
    return MessageResponse(message="Successfully logged out")

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user