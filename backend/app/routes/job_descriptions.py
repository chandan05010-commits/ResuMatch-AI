from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.resume import JobDescription
from app.schemas.resume import JobDescriptionCreate, JobDescriptionResponse
from app.schemas.auth import MessageResponse

router = APIRouter(tags=["job-descriptions"])

@router.post("", response_model=JobDescriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_job_description(
    job_data: JobDescriptionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = JobDescription(
        user_id=current_user.id,
        title=job_data.title,
        company=job_data.company,
        description=job_data.description,
        url=str(job_data.url) if job_data.url else None,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job

@router.get("", response_model=List[JobDescriptionResponse])
async def list_job_descriptions(
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    offset = (page - 1) * page_size
    result = await db.execute(
        select(JobDescription)
        .where(JobDescription.user_id == current_user.id)
        .order_by(JobDescription.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    return result.scalars().all()

@router.get("/{job_id}", response_model=JobDescriptionResponse)
async def get_job_description(
    job_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(JobDescription).where(JobDescription.id == job_id, JobDescription.user_id == current_user.id)
    )
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job description not found")
    
    return job

@router.delete("/{job_id}", response_model=MessageResponse)
async def delete_job_description(
    job_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(JobDescription).where(JobDescription.id == job_id, JobDescription.user_id == current_user.id)
    )
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job description not found")
    
    await db.delete(job)
    await db.commit()
    
    return MessageResponse(message="Job description deleted successfully")