from sqlalchemy import (
    Column,
    String,
    DateTime,
    Integer,
    ForeignKey,
    Enum as SQLEnum,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.database.session import Base


class ScanStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ResumeScan(Base):
    __tablename__ = "resume_scans"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    resume_id = Column(
        UUID(as_uuid=True),
        ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=False
    )

    job_description_id = Column(
        UUID(as_uuid=True),
        ForeignKey("job_descriptions.id", ondelete="SET NULL"),
        nullable=True
    )

    target_job_title = Column(
        String(255),
        nullable=False
    )

    ats_score = Column(
        Integer,
        nullable=True
    )

    status = Column(
        SQLEnum(ScanStatus),
        default=ScanStatus.PENDING,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    completed_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    user = relationship(
        "User",
        back_populates="scans"
    )

    resume = relationship(
        "Resume",
        back_populates="scans"
    )

    job_description = relationship(
        "JobDescription",
        back_populates="scans"
    )

    analysis = relationship(
        "AnalysisResult",
        back_populates="scan",
        uselist=False,
        cascade="all, delete-orphan"
    )


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    scan_id = Column(
        UUID(as_uuid=True),
        ForeignKey("resume_scans.id", ondelete="CASCADE"),
        nullable=False,
        unique=True
    )

    overall_score = Column(
        Integer,
        nullable=False
    )

    category_scores = Column(
        JSON,
        nullable=False
    )

    keyword_analysis = Column(
        JSON,
        nullable=False
    )

    skill_analysis = Column(
        JSON,
        nullable=False
    )

    wording_analysis = Column(
        JSON,
        nullable=False
    )

    action_verb_analysis = Column(
        JSON,
        nullable=False
    )

    metrics_analysis = Column(
        JSON,
        nullable=False
    )

    formatting_analysis = Column(
        JSON,
        nullable=False
    )

    section_analysis = Column(
        JSON,
        nullable=False
    )

    bullet_analysis = Column(
        JSON,
        nullable=False
    )

    job_match = Column(
        JSON,
        nullable=False
    )

    improvement_plan = Column(
        JSON,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    scan = relationship(
        "ResumeScan",
        back_populates="analysis"
    )