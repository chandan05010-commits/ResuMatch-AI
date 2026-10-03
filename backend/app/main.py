from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database.session import init_db, close_db

from app.routes import (
    auth,
    resumes,
    job_descriptions,
    analysis,
    applications,
    dashboard,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title="ResuMatch AI - Backend API",
    description=(
        "Backend service for authentication, "
        "data management, and orchestration"
    ),
    version="1.0.0",
    lifespan=lifespan,
)


# ============================================================
# CORS
# ============================================================

allowed_origins = list(
    set(
        settings.allowed_origins_list
        + [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
        ]
    )
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS",
    ],
    allow_headers=["*"],
)


# ============================================================
# ROUTERS
# ============================================================

# Authentication
app.include_router(
    auth.router,
    prefix="/api",
    tags=["authentication"],
)


# Resumes
app.include_router(
    resumes.router,
    prefix="/api/resumes",
    tags=["resumes"],
)


# Job Descriptions
app.include_router(
    job_descriptions.router,
    prefix="/api/job-descriptions",
    tags=["job-descriptions"],
)


# Analysis
app.include_router(
    analysis.router,
    prefix="/api",
    tags=["analysis"],
)


# Applications
app.include_router(
    applications.router,
    prefix="/api/applications",
    tags=["applications"],
)


# Dashboard
app.include_router(
    dashboard.router,
    prefix="/api",
    tags=["dashboard"],
)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "backend-api",
    }


# ============================================================
# ROOT
# ============================================================

@app.get("/")
async def root():
    return {
        "service": "ResuMatch AI Backend API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "auth": "/api",
            "resumes": "/api/resumes",
            "job_descriptions": "/api/job-descriptions",
            "analysis": "/api/analyze",
            "applications": "/api/applications",
            "dashboard": "/api/dashboard",
        },
    }