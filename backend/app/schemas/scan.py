from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from enum import Enum

class ScanStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class ResumeScanBase(BaseModel):
    target_job_title: str = Field(..., min_length=2, max_length=255)
    job_description: str = Field(..., min_length=50)
    job_description_id: Optional[UUID] = None

class ResumeScanCreate(ResumeScanBase):
    resume_id: UUID

class ResumeScanResponse(BaseModel):
    id: UUID
    user_id: UUID
    resume_id: UUID
    job_description_id: Optional[UUID]
    target_job_title: str
    ats_score: Optional[int]
    status: ScanStatus
    created_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class CategoryScores(BaseModel):
    keyword_match: int
    skills_match: int
    experience_relevance: int
    ats_formatting: int
    impact_metrics: int
    wording: int
    readability: int

class KeywordAnalysis(BaseModel):
    matched_keywords: List[str]
    missing_keywords: List[str]
    important_keywords: List[str]
    keyword_coverage: float

class SkillCategory(BaseModel):
    category: str
    skills: List[str]

class SkillAnalysis(BaseModel):
    resume_skills: List[SkillCategory]
    required_skills: List[SkillCategory]
    matched_skills: List[SkillCategory]
    missing_skills: List[SkillCategory]
    additional_skills: List[SkillCategory]

class WordingIssue(BaseModel):
    original: str
    problem: str
    why_it_matters: str
    suggested_improvement: str
    severity: str

class WordingAnalysis(BaseModel):
    weak_wording: List[WordingIssue]
    repeated_words: List[Dict[str, Any]]
    generic_statements: List[str]
    passive_voice: List[str]
    filler_words: List[str]
    unclear_statements: List[str]
    long_sentences: List[str]
    unprofessional_wording: List[str]

class ActionVerbAnalysis(BaseModel):
    weak_verbs: List[Dict[str, Any]]
    strong_verbs: List[Dict[str, Any]]
    suggestions: List[Dict[str, Any]]

class MetricsAnalysis(BaseModel):
    quantified_achievements: List[Dict[str, Any]]
    non_quantified_achievements: List[str]
    suggestions: List[str]

class FormattingCheck(BaseModel):
    check: str
    status: str
    message: str

class FormattingAnalysis(BaseModel):
    checks: List[FormattingCheck]
    overall_rating: str

class SectionAnalysis(BaseModel):
    section: str
    present: bool
    quality: str
    suggestions: List[str]

class BulletAnalysis(BaseModel):
    original: str
    quality_score: int
    problems: List[str]
    suggested_improvement: str
    priority: str

class JobMatchAnalysis(BaseModel):
    overall_match: int
    skill_match: int
    keyword_match: int
    experience_match: int
    education_match: int
    explanation: str

class ImprovementItem(BaseModel):
    title: str
    description: str
    impact: str
    effort: str

class ImprovementPlan(BaseModel):
    high_priority: List[ImprovementItem]
    medium_priority: List[ImprovementItem]
    low_priority: List[ImprovementItem]

class AnalysisResultResponse(BaseModel):
    id: UUID
    scan_id: UUID
    overall_score: int
    category_scores: CategoryScores
    keyword_analysis: KeywordAnalysis
    skill_analysis: SkillAnalysis
    wording_analysis: WordingAnalysis
    action_verb_analysis: ActionVerbAnalysis
    metrics_analysis: MetricsAnalysis
    formatting_analysis: FormattingAnalysis
    section_analysis: List[SectionAnalysis]
    bullet_analysis: List[BulletAnalysis]
    job_match: JobMatchAnalysis
    improvement_plan: ImprovementPlan
    created_at: datetime
    
    class Config:
        from_attributes = True