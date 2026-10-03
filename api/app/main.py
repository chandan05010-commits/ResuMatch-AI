from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import analyze

app = FastAPI(
    title="ResuMatch AI - Analysis API",
    description="AI/NLP service for resume analysis, keyword extraction, and ATS scoring",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/analyze", tags=["analysis"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "analysis-api"}


@app.get("/")
async def root():
    return {
        "service": "ResuMatch AI Analysis API",
        "version": "1.0.0",
        "endpoints": {
            "analyze/resume": "Parse resume text",
            "analyze/job": "Parse job description",
            "analyze/match": "Match resume to job",
            "analyze/bullets": "Analyze bullet points",
            "analyze/wording": "Analyze wording quality",
            "analyze/full": "Complete analysis"
        }
    }