from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case
from typing import List
from uuid import UUID
from datetime import datetime, timedelta
from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.application import Application, ApplicationStatus
from app.models.scan import ResumeScan, AnalysisResult
from app.schemas.application import DashboardStats, HistoryItem

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Total applications
    total_apps_result = await db.execute(
        select(func.count(Application.id)).where(Application.user_id == current_user.id)
    )
    total_applications = total_apps_result.scalar() or 0
    
    # Applications by status
    status_results = await db.execute(
        select(Application.status, func.count(Application.id))
        .where(Application.user_id == current_user.id)
        .group_by(Application.status)
    )
    status_counts = dict(status_results.all())
    
    interviews = status_counts.get(ApplicationStatus.INTERVIEW, 0)
    offers = status_counts.get(ApplicationStatus.OFFER, 0)
    pending = status_counts.get(ApplicationStatus.APPLIED, 0) + status_counts.get(ApplicationStatus.SCREENING, 0)
    
    # Average ATS score
    avg_score_result = await db.execute(
        select(func.avg(ResumeScan.ats_score))
        .where(ResumeScan.user_id == current_user.id)
        .where(ResumeScan.ats_score.is_not(None))
    )
    average_ats_score = round(float(avg_score_result.scalar() or 0), 1)
    
    # Total resume scans
    total_scans_result = await db.execute(
        select(func.count(ResumeScan.id)).where(ResumeScan.user_id == current_user.id)
    )
    total_resume_scans = total_scans_result.scalar() or 0
    
    return DashboardStats(
        total_applications=total_applications,
        interviews=interviews,
        offers=offers,
        pending=pending,
        average_ats_score=average_ats_score,
        total_resume_scans=total_resume_scans,
    )

@router.get("/history", response_model=List[HistoryItem])
async def get_scan_history(
    page: int = 1,
    page_size: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    offset = (page - 1) * page_size
    result = await db.execute(
        select(ResumeScan)
        .where(ResumeScan.user_id == current_user.id)
        .order_by(ResumeScan.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    scans = result.scalars().all()
    
    return [
        HistoryItem(
            id=scan.id,
            target_job_title=scan.target_job_title,
            ats_score=scan.ats_score,
            status=scan.status.value,
            created_at=scan.created_at,
        )
        for scan in scans
    ]

@router.get("/score-history")
async def get_score_history(
    days: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    since = datetime.utcnow() - timedelta(days=days)
    result = await db.execute(
        select(ResumeScan.created_at, ResumeScan.ats_score)
        .where(ResumeScan.user_id == current_user.id)
        .where(ResumeScan.ats_score.is_not(None))
        .where(ResumeScan.created_at >= since)
        .order_by(ResumeScan.created_at.asc())
    )
    data = result.all()
    
    return [
        {"date": row.created_at.isoformat(), "score": row.ats_score}
        for row in data
    ]