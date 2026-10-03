from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta
from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.application import Application, ApplicationStatus
from app.schemas.application import (
    ApplicationCreate, 
    ApplicationUpdate, 
    ApplicationResponse, 
    DashboardStats,
    HistoryItem,
)
from app.schemas.auth import MessageResponse

router = APIRouter(tags=["applications"])

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    app_data: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    application = Application(
        user_id=current_user.id,
        **app_data.model_dump()
    )
    db.add(application)
    await db.commit()
    await db.refresh(application)
    return application

@router.get("", response_model=List[ApplicationResponse])
async def list_applications(
    page: int = 1,
    page_size: int = 20,
    status: Optional[ApplicationStatus] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    offset = (page - 1) * page_size
    query = select(Application).where(Application.user_id == current_user.id)
    
    if status:
        query = query.where(Application.status == status)
    
    query = query.order_by(Application.created_at.desc()).offset(offset).limit(page_size)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{app_id}", response_model=ApplicationResponse)
async def get_application(
    app_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Application).where(Application.id == app_id, Application.user_id == current_user.id)
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    
    return application

@router.put("/{app_id}", response_model=ApplicationResponse)
async def update_application(
    app_id: UUID,
    app_data: ApplicationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Application).where(Application.id == app_id, Application.user_id == current_user.id)
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    
    update_data = app_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(application, field, value)
    
    application.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(application)
    
    return application

@router.delete("/{app_id}", response_model=MessageResponse)
async def delete_application(
    app_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Application).where(Application.id == app_id, Application.user_id == current_user.id)
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    
    await db.delete(application)
    await db.commit()
    
    return MessageResponse(message="Application deleted successfully")