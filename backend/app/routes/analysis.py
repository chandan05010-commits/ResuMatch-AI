from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
from datetime import datetime
import traceback

from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.resume import Resume, JobDescription
from app.models.scan import ResumeScan, AnalysisResult, ScanStatus
from app.schemas.scan import (
    ResumeScanCreate,
    ResumeScanResponse,
    AnalysisResultResponse,
)
from app.schemas.auth import MessageResponse


router = APIRouter(tags=["analysis"])


# ============================================================
# CREATE ANALYSIS
# POST /api/analyze
# ============================================================

@router.post(
    "/analyze",
    response_model=ResumeScanResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_analysis(
    scan_data: ResumeScanCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # --------------------------------------------------------
    # Verify resume ownership
    # --------------------------------------------------------
    resume_result = await db.execute(
        select(Resume).where(
            Resume.id == scan_data.resume_id,
            Resume.user_id == current_user.id,
        )
    )

    resume = resume_result.scalar_one_or_none()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )

    # --------------------------------------------------------
    # Get job description
    # --------------------------------------------------------
    if scan_data.job_description_id:
        job_result = await db.execute(
            select(JobDescription).where(
                JobDescription.id == scan_data.job_description_id,
                JobDescription.user_id == current_user.id,
            )
        )

        job = job_result.scalar_one_or_none()

        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job description not found",
            )

        job_description_text = job.description

    else:
        job_description_text = scan_data.job_description

    # --------------------------------------------------------
    # Create scan record
    # --------------------------------------------------------
    scan = ResumeScan(
        user_id=current_user.id,
        resume_id=resume.id,
        job_description_id=scan_data.job_description_id,
        target_job_title=scan_data.target_job_title,
        status=ScanStatus.PENDING,
    )

    db.add(scan)

    await db.commit()
    await db.refresh(scan)

    scan_id = scan.id

    # --------------------------------------------------------
    # Start background analysis
    # --------------------------------------------------------
    background_tasks.add_task(
        process_analysis,
        scan_id=scan_id,
        resume_text=resume.extracted_text or "",
        job_description=job_description_text,
        target_job_title=scan_data.target_job_title,
    )

    return scan


# ============================================================
# BACKGROUND ANALYSIS
# ============================================================

async def process_analysis(
    scan_id: UUID,
    resume_text: str,
    job_description: str,
    target_job_title: str,
):
    from app.database.session import AsyncSessionLocal
    from app.services.ai_analysis import analyze_resume

    async with AsyncSessionLocal() as db:
        try:
            # ------------------------------------------------
            # Find scan
            # ------------------------------------------------
            result = await db.execute(
                select(ResumeScan).where(
                    ResumeScan.id == scan_id
                )
            )

            scan = result.scalar_one_or_none()

            if not scan:
                print(f"Analysis scan not found: {scan_id}")
                return

            # ------------------------------------------------
            # Mark as processing
            # ------------------------------------------------
            scan.status = ScanStatus.PROCESSING
            await db.commit()

            # ------------------------------------------------
            # Run AI / deterministic analysis
            # ------------------------------------------------
            print(f"Starting analysis for scan: {scan_id}")

            analysis_data = await analyze_resume(
                resume_text=resume_text,
                job_description=job_description,
                target_job_title=target_job_title,
            )

            print(f"Analysis generated successfully for scan: {scan_id}")

            # ------------------------------------------------
            # Validate basic result
            # ------------------------------------------------
            if not isinstance(analysis_data, dict):
                raise ValueError("Analysis service returned invalid data.")

            if "overall_score" not in analysis_data:
                raise ValueError(
                    "Analysis result does not contain overall_score."
                )

            # ------------------------------------------------
            # Update scan
            # ------------------------------------------------
            scan.status = ScanStatus.COMPLETED
            scan.ats_score = analysis_data["overall_score"]
            scan.completed_at = datetime.utcnow()

            # ------------------------------------------------
            # Save detailed result
            # ------------------------------------------------
            analysis = AnalysisResult(
                scan_id=scan_id,
                **analysis_data,
            )

            db.add(analysis)

            await db.commit()

            print(f"Analysis saved successfully for scan: {scan_id}")

        except Exception as exc:
            # ------------------------------------------------
            # IMPORTANT:
            # Print the real exception instead of hiding it.
            # ------------------------------------------------
            print("=" * 70)
            print(f"ANALYSIS FAILED FOR SCAN: {scan_id}")
            print(f"ERROR: {exc}")
            traceback.print_exc()
            print("=" * 70)

            # ------------------------------------------------
            # Rollback current failed transaction
            # ------------------------------------------------
            await db.rollback()

            try:
                # ------------------------------------------------
                # Find scan again
                # ------------------------------------------------
                result = await db.execute(
                    select(ResumeScan).where(
                        ResumeScan.id == scan_id
                    )
                )

                scan = result.scalar_one_or_none()

                if scan:
                    scan.status = ScanStatus.FAILED
                    await db.commit()

                    print(
                        f"Scan marked as FAILED: {scan_id}"
                    )

            except Exception as status_exc:
                print(
                    f"Could not mark scan as FAILED: "
                    f"{status_exc}"
                )
                await db.rollback()


# ============================================================
# LIST ANALYSES
# GET /api/analysis
# ============================================================

@router.get(
    "/analysis",
    response_model=List[ResumeScanResponse],
)
async def list_analyses(
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate pagination
    if page < 1:
        page = 1

    if page_size < 1:
        page_size = 20

    page_size = min(page_size, 100)

    offset = (page - 1) * page_size

    result = await db.execute(
        select(ResumeScan)
        .where(
            ResumeScan.user_id == current_user.id
        )
        .order_by(
            ResumeScan.created_at.desc()
        )
        .offset(offset)
        .limit(page_size)
    )

    return result.scalars().all()


# ============================================================
# GET SINGLE ANALYSIS
# GET /api/analysis/{scan_id}
# ============================================================

@router.get(
    "/analysis/{scan_id}",
    response_model=ResumeScanResponse,
)
async def get_analysis(
    scan_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ResumeScan).where(
            ResumeScan.id == scan_id,
            ResumeScan.user_id == current_user.id,
        )
    )

    scan = result.scalar_one_or_none()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found",
        )

    return scan


# ============================================================
# GET ANALYSIS RESULT
# GET /api/analysis/{scan_id}/result
# ============================================================

@router.get(
    "/analysis/{scan_id}/result",
    response_model=AnalysisResultResponse,
)
async def get_analysis_result(
    scan_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # --------------------------------------------------------
    # Verify scan ownership
    # --------------------------------------------------------
    scan_result = await db.execute(
        select(ResumeScan).where(
            ResumeScan.id == scan_id,
            ResumeScan.user_id == current_user.id,
        )
    )

    scan = scan_result.scalar_one_or_none()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found",
        )

    # --------------------------------------------------------
    # Get detailed analysis result
    # --------------------------------------------------------
    analysis_result = await db.execute(
        select(AnalysisResult).where(
            AnalysisResult.scan_id == scan_id
        )
    )

    analysis = analysis_result.scalar_one_or_none()

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis result not available yet",
        )

    return analysis


# ============================================================
# DELETE ANALYSIS
# DELETE /api/analysis/{scan_id}
# ============================================================

@router.delete(
    "/analysis/{scan_id}",
    response_model=MessageResponse,
)
async def delete_analysis(
    scan_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ResumeScan).where(
            ResumeScan.id == scan_id,
            ResumeScan.user_id == current_user.id,
        )
    )

    scan = result.scalar_one_or_none()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found",
        )

    await db.delete(scan)
    await db.commit()

    return MessageResponse(
        message="Analysis deleted successfully"
    )