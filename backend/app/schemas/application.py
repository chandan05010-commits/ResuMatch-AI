from pydantic import BaseModel, Field, HttpUrl, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID
from enum import Enum


class ApplicationStatus(str, Enum):
    SAVED = "saved"
    APPLIED = "applied"
    SCREENING = "screening"
    INTERVIEW = "interview"
    REJECTED = "rejected"
    OFFER = "offer"


class ApplicationBase(BaseModel):
    company: str = Field(..., min_length=1, max_length=255)
    job_title: str = Field(..., min_length=1, max_length=255)
    application_date: datetime
    job_url: Optional[HttpUrl] = None
    status: ApplicationStatus = ApplicationStatus.SAVED
    notes: Optional[str] = None

    @field_validator("job_url", mode="before")
    @classmethod
    def empty_url_to_none(cls, value):
        if value == "":
            return None
        return value


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    company: Optional[str] = Field(None, min_length=1, max_length=255)
    job_title: Optional[str] = Field(None, min_length=1, max_length=255)
    application_date: Optional[datetime] = None
    job_url: Optional[HttpUrl] = None
    status: Optional[ApplicationStatus] = None
    notes: Optional[str] = None

    @field_validator("job_url", mode="before")
    @classmethod
    def empty_url_to_none(cls, value):
        if value == "":
            return None
        return value


class ApplicationResponse(ApplicationBase):
    id: UUID
    user_id: UUID
    job_url: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_applications: int
    interviews: int
    offers: int
    pending: int
    average_ats_score: float
    total_resume_scans: int


class HistoryItem(BaseModel):
    id: UUID
    target_job_title: str
    ats_score: Optional[int]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True