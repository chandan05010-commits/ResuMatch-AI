from sqlalchemy import Column, String, DateTime, Boolean, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False
    )

    hashed_password = Column(
        String(255),
        nullable=False
    )

    full_name = Column(
        String(255),
        nullable=False
    )

    is_active = Column(
        Boolean,
        default=True
    )

    is_verified = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationships
    resumes = relationship(
        "Resume",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    job_descriptions = relationship(
        "JobDescription",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    scans = relationship(
        "ResumeScan",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    applications = relationship(
        "Application",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    refresh_tokens = relationship(
        "RefreshToken",
        back_populates="user",
        cascade="all, delete-orphan"
    )