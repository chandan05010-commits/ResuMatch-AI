from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.analysis_service import (
    parse_resume, parse_job, analyze_match, analyze_bullets, analyze_wording,
    analyze_deterministic
)

router = APIRouter()


class ResumeParseRequest(BaseModel):
    text: str


class JobParseRequest(BaseModel):
    text: str


class MatchRequest(BaseModel):
    resume_text: str
    job_text: str


class BulletsRequest(BaseModel):
    bullets: List[str]


class WordingRequest(BaseModel):
    text: str


class FullAnalysisRequest(BaseModel):
    resume_text: str
    job_text: str
    target_job_title: str = ""


@router.post("/resume")
async def parse_resume_endpoint(request: ResumeParseRequest):
    """Parse resume text into structured data"""
    try:
        result = await parse_resume(request.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parse failed: {str(e)}")


@router.post("/job")
async def parse_job_endpoint(request: JobParseRequest):
    """Parse job description into structured data"""
    try:
        result = await parse_job(request.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parse failed: {str(e)}")


@router.post("/match")
async def match_endpoint(request: MatchRequest):
    """Analyze match between resume and job"""
    try:
        result = await analyze_match(request.resume_text, request.job_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Match analysis failed: {str(e)}")


@router.post("/bullets")
async def bullets_endpoint(request: BulletsRequest):
    """Analyze individual bullet points"""
    try:
        result = await analyze_bullets(request.bullets)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bullet analysis failed: {str(e)}")


@router.post("/wording")
async def wording_endpoint(request: WordingRequest):
    """Analyze wording quality"""
    try:
        result = await analyze_wording(request.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Wording analysis failed: {str(e)}")


@router.post("/full")
async def full_analysis_endpoint(request: FullAnalysisRequest):
    """Complete resume analysis against job description"""
    try:
        result = await analyze_deterministic(
            request.resume_text,
            request.job_text,
            request.target_job_title
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Full analysis failed: {str(e)}")