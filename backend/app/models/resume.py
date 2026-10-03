from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database.session import Base


class Resume(Base):
    __tablename__ = "resumes"

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

    filename = Column(
        String(255),
        nullable=False
    )

    file_size = Column(
        Integer,
        nullable=False
    )

    content_type = Column(
        String(100),
        nullable=False
    )

    storage_path = Column(
        String(500),
        nullable=False
    )

    extracted_text = Column(
        Text,
        nullable=True
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

    user = relationship(
        "User",
        back_populates="resumes"
    )

    scans = relationship(
        "ResumeScan",
        back_populates="resume",
        cascade="all, delete-orphan"
    )


class JobDescription(Base):
    __tablename__ = "job_descriptions"

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

    title = Column(
        String(255),
        nullable=False
    )

    company = Column(
        String(255),
        nullable=True
    )

    description = Column(
        Text,
        nullable=False
    )

    url = Column(
        String(500),
        nullable=True
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

    user = relationship(
        "User",
        back_populates="job_descriptions"
    )

    scans = relationship(
        "ResumeScan",
        back_populates="job_description"
    )