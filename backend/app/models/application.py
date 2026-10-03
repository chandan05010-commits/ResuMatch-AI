from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.database.session import Base

class ApplicationStatus(str, enum.Enum):
    SAVED = "saved"
    APPLIED = "applied"
    SCREENING = "screening"
    INTERVIEW = "interview"
    REJECTED = "rejected"
    OFFER = "offer"

class Application(Base):
    __tablename__ = "applications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    company = Column(String(255), nullable=False)
    job_title = Column(String(255), nullable=False)
    application_date = Column(DateTime(timezone=True), nullable=False)
    job_url = Column(String(500), nullable=True)
    status = Column(SQLEnum(ApplicationStatus), default=ApplicationStatus.SAVED, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="applications")
    
    __table_args__ = (
        Index('ix_applications_user_id', 'user_id'),
        Index('ix_applications_status', 'status'),
    )