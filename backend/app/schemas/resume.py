from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class ResumeBase(BaseModel):
    filename: str
    file_size: int
    content_type: str

class ResumeCreate(ResumeBase):
    storage_path: str
    extracted_text: Optional[str] = None

class ResumeResponse(ResumeBase):
    id: UUID
    user_id: UUID
    extracted_text: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ResumeUploadResponse(BaseModel):
    id: UUID
    filename: str
    file_size: int
    message: str

class JobDescriptionBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    company: Optional[str] = Field(None, max_length=255)
    description: str = Field(..., min_length=50)
    url: Optional[HttpUrl] = None

class JobDescriptionCreate(JobDescriptionBase):
    pass

class JobDescriptionResponse(JobDescriptionBase):
    id: UUID
    user_id: UUID
    url: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True