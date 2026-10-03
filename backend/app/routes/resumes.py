import os
import magic
import uuid as uuid_lib
from io import BytesIO

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
from pypdf import PdfReader

from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import (
    ResumeResponse,
    ResumeUploadResponse,
)
from app.schemas.auth import MessageResponse
from app.config import settings


router = APIRouter(tags=["resumes"])


ALLOWED_MIME_TYPES = ["application/pdf"]
ALLOWED_EXTENSIONS = [".pdf"]
MAGIC_BYTES_PDF = b"%PDF"


async def validate_pdf_file(file: UploadFile) -> tuple[bool, str, bytes]:
    """Validate PDF file and return its content."""

    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()

    # Check extension
    if ext not in ALLOWED_EXTENSIONS:
        return False, "Invalid file extension. Only PDF files are allowed.", b""

    # Check browser-provided MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        return False, "Invalid MIME type. Only PDF files are allowed.", b""

    # Read file
    content = await file.read()

    # Check size
    if len(content) > settings.max_upload_size_bytes:
        return (
            False,
            f"File size exceeds {settings.max_upload_size_mb}MB limit.",
            b"",
        )

    # Check minimum size
    if len(content) < len(MAGIC_BYTES_PDF):
        return False, "Invalid PDF file.", b""

    # Check PDF magic bytes
    if not content.startswith(MAGIC_BYTES_PDF):
        return False, "Invalid PDF file. Magic bytes don't match.", b""

    # Check actual MIME type
    try:
        mime = magic.from_buffer(content, mime=True)
    except Exception:
        return False, "Unable to validate PDF file.", b""

    if mime != "application/pdf":
        return False, "File content is not a valid PDF.", b""

    return True, "", content


def generate_safe_filename(original_filename: str) -> str:
    """Generate a random safe filename."""

    ext = os.path.splitext(original_filename)[1].lower()
    random_name = uuid_lib.uuid4().hex

    return f"{random_name}{ext}"


def extract_pdf_text(content: bytes) -> str:
    """Extract text from PDF bytes."""

    try:
        reader = PdfReader(BytesIO(content))

        pages_text = []

        for page in reader.pages:
            try:
                text = page.extract_text() or ""

                if text.strip():
                    pages_text.append(text.strip())

            except Exception:
                continue

        return "\n\n".join(pages_text).strip()

    except Exception as exc:
        raise ValueError("Unable to read or parse the PDF file.") from exc


@router.post(
    "/upload",
    response_model=ResumeUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_resume(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate PDF
    is_valid, error_msg, content = await validate_pdf_file(file)

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg,
        )

    # Extract resume text
    try:
        extracted_text = extract_pdf_text(content)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    if not extracted_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "No readable text was found in this PDF. "
                "Please upload a text-based PDF instead of a scanned image PDF."
            ),
        )

    # Generate safe filename
    original_filename = file.filename or "resume.pdf"
    safe_filename = generate_safe_filename(original_filename)

    # User-specific upload directory
    user_upload_dir = os.path.join(
        settings.upload_dir,
        str(current_user.id),
    )

    os.makedirs(user_upload_dir, exist_ok=True)

    storage_path = os.path.join(
        user_upload_dir,
        safe_filename,
    )

    # Save PDF
    try:
        with open(storage_path, "wb") as f:
            f.write(content)
    except OSError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save resume file.",
        ) from exc

    # Create database record
    resume = Resume(
        user_id=current_user.id,
        filename=original_filename,
        file_size=len(content),
        content_type=file.content_type or "application/pdf",
        storage_path=storage_path,
        extracted_text=extracted_text,
    )

    try:
        db.add(resume)
        await db.commit()
        await db.refresh(resume)

    except Exception as exc:
        # Remove file if database operation fails
        try:
            if os.path.exists(storage_path):
                os.remove(storage_path)
        except OSError:
            pass

        await db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save resume information.",
        ) from exc

    return ResumeUploadResponse(
        id=resume.id,
        filename=resume.filename,
        file_size=resume.file_size,
        message="Resume uploaded successfully",
    )


@router.get("", response_model=List[ResumeResponse])
async def list_resumes(
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if page < 1:
        page = 1

    if page_size < 1:
        page_size = 20

    page_size = min(page_size, 100)

    offset = (page - 1) * page_size

    result = await db.execute(
        select(Resume)
        .where(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )

    return result.scalars().all()


@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Resume).where(
            Resume.id == resume_id,
            Resume.user_id == current_user.id,
        )
    )

    resume = result.scalar_one_or_none()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )

    return resume


@router.delete("/{resume_id}", response_model=MessageResponse)
async def delete_resume(
    resume_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Resume).where(
            Resume.id == resume_id,
            Resume.user_id == current_user.id,
        )
    )

    resume = result.scalar_one_or_none()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )

    # Delete physical file
    try:
        if os.path.exists(resume.storage_path):
            os.remove(resume.storage_path)
    except OSError:
        pass

    # Delete database record
    await db.delete(resume)
    await db.commit()

    return MessageResponse(
        message="Resume deleted successfully"
    )