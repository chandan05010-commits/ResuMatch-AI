# ResuMatch AI

A production-quality, secure, modern FREE AI Resume Analyzer platform. Analyze your resume against any job description and discover ATS issues, missing keywords, skill gaps, and opportunities to improve your resume.

## Features

- **ATS Analysis**: Comprehensive ATS scoring across 7 categories (Keywords, Skills, Experience, Formatting, Impact, Wording, Readability)
- **Job Matching**: Compare your resume against any job description with detailed match percentages
- **Keyword Optimization**: AI-powered keyword extraction, matched/missing/important keyword identification
- **Skill Gap Analysis**: Categorized skills analysis (Programming Languages, Frameworks, Databases, Cloud, DevOps, Tools, Soft Skills)
- **Resume Feedback**: Section-by-section analysis with actionable improvement suggestions
- **Bullet Review**: Per-bullet quality scoring with specific problems and suggested improvements
- **Action Verb Analysis**: Detects weak verbs and suggests stronger alternatives
- **Metrics Analysis**: Finds quantified achievements and flags bullets missing metrics
- **Formatting Check**: Validates single-column structure, standard headings, date formats, contact details
- **Improvement Plan**: Prioritized action items (High/Medium/Low priority)
- **Application Tracker**: Track company, role, date, status (Saved/Applied/Screening/Interview/Rejected/Offer), and notes
- **Scan History**: Complete history of all analyses with scores, dates, and resume versions
- **Dashboard**: Visualize ATS score history, applications over time, status distribution
- **ATS Guide**: Comprehensive guide covering ATS basics, formatting, keywords, action verbs, metrics

## Architecture

```
ResuMatch-AI/
├── frontend/          # React + Vite + TypeScript + Tailwind CSS
├── backend/           # FastAPI + SQLAlchemy + PostgreSQL/SQLite
├── api/               # FastAPI - AI/NLP Analysis Service
├── tests/             # Test suites
├── docs/              # Documentation
├── docker-compose.yml # Multi-service orchestration
├── .env.example       # Environment configuration template
└── README.md          # This file
```

### Service Responsibilities

| Service | Port | Responsibilities |
|---------|------|------------------|
| Frontend | 5173 | UI, routing, state management, API communication |
| Backend | 8000 | Auth, database, users, resumes, applications, history, dashboard |
| AI API | 8001 | Resume parsing, job parsing, keyword extraction, skill extraction, ATS analysis, scoring |

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite for build tooling
- React Router v6 for routing
- Tailwind CSS for styling
- Chart.js + react-chartjs-2 for visualizations
- React Hook Form + Zod for form validation
- Axios for API communication
- Lucide React for icons
- Framer Motion for animations

### Backend
- FastAPI (Python 3.12+)
- SQLAlchemy 2.0 (async)
- PostgreSQL (production) / SQLite (development)
- Alembic for migrations
- JWT authentication with refresh token rotation
- bcrypt for password hashing
- Pydantic v2 for validation

### AI Analysis API
- FastAPI
- Google Gemini (primary) with deterministic NLP fallback
- Optional Ollama/local model support
- Structured JSON output with Pydantic validation

## Quick Start

### Prerequisites
- Docker & Docker Compose (recommended)
- OR: Python 3.12+, Node.js 20+, PostgreSQL 16+

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd ResuMatch-AI

# Copy environment template
cp .env.example .env

# Edit .env with your configuration (at minimum set JWT_SECRET)
# For AI features, add GEMINI_API_KEY from https://aistudio.google.com/app/apikey

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000/docs
# AI API: http://localhost:8001/docs
```

### Local Development (Without Docker)

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your settings

# Run database migrations (if using PostgreSQL)
# alembic upgrade head

# Start backend
uvicorn app.main:app --reload --port 8000
```

#### AI Analysis API
```bash
cd api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Add GEMINI_API_KEY for AI features

uvicorn app.main:app --reload --port 8001
```

#### Frontend
```bash
cd frontend
npm install

# Create .env.local with:
# VITE_API_URL=http://localhost:8000
# VITE_AI_API_URL=http://localhost:8001

npm run dev
```

## Environment Variables

### Root (.env)
```env
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/resumatch
# Or for SQLite development:
# DATABASE_URL=sqlite+aiosqlite:///./resumatch.db

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
API_URL=http://localhost:8001

# File Upload
MAX_UPLOAD_SIZE_MB=10
UPLOAD_DIR=./uploads

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Rate Limiting
RATE_LIMIT_LOGIN=5
RATE_LIMIT_REGISTER=3
RATE_LIMIT_UPLOAD=10
RATE_LIMIT_ANALYZE=20

# AI Providers
GEMINI_API_KEY=your-gemini-api-key
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:8000
VITE_AI_API_URL=http://localhost:8001
```

## Security Features

- **Authentication**: JWT with short-lived access tokens (15min) + refresh token rotation (7 days)
- **Password Security**: bcrypt hashing, minimum 8 characters
- **Authorization**: Row-level security - users only access their own data
- **File Upload Security**: 
  - PDF-only validation (MIME + magic bytes + extension)
  - Size limits (10MB default)
  - Randomized server-side filenames
  - Path traversal prevention
  - Stored outside executable directories
- **Input Validation**: Pydantic schemas on all endpoints
- **Rate Limiting**: Login, register, upload, analyze endpoints
- **CORS**: Configured allowlist (no wildcard with credentials)
- **Security Headers**: CSP, X-Content-Type-Options, Referrer-Policy, etc.
- **XSS Protection**: No dangerouslySetInnerHTML, proper output encoding
- **SSRF Protection**: No blind fetching of user-provided URLs
- **AI Prompt Injection Protection**: Explicit boundaries, untrusted data treatment
- **SQL Injection Prevention**: SQLAlchemy ORM with parameterized queries
- **Secrets Management**: Environment variables, .env.example template, .gitignore

## AI Providers

The AI analysis supports multiple providers with automatic fallback:

1. **Google Gemini** (Primary) - Requires `GEMINI_API_KEY`
2. **Deterministic NLP** (Fallback) - Works offline, no API key needed
3. **Ollama** (Optional) - Local LLM support via `OLLAMA_BASE_URL`

The application **never completely breaks** if Gemini is unavailable.

## API Endpoints

### Authentication
```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - Login (returns access + refresh tokens)
POST   /api/auth/refresh      - Refresh access token
POST   /api/auth/logout       - Revoke refresh token
GET    /api/auth/me           - Get current user
```

### Resumes
```
POST   /api/resumes/upload    - Upload PDF resume
GET    /api/resumes           - List user's resumes
GET    /api/resumes/{id}      - Get resume details
DELETE /api/resumes/{id}      - Delete resume
```

### Job Descriptions
```
POST   /api/job-descriptions  - Create job description
GET    /api/job-descriptions  - List job descriptions
GET    /api/job-descriptions/{id} - Get job description
DELETE /api/job-descriptions/{id} - Delete job description
```

### Analysis
```
POST   /api/analyze           - Start resume analysis
GET    /api/analyze           - List analyses
GET    /api/analyze/{id}      - Get analysis status
GET    /api/analyze/{id}/result - Get full analysis result
DELETE /api/analyze/{id}      - Delete analysis
```

### Applications
```
POST   /api/applications      - Create application
GET    /api/applications      - List applications (with status filter)
GET    /api/applications/{id} - Get application
PUT    /api/applications/{id} - Update application
DELETE /api/applications/{id} - Delete application
```

### Dashboard
```
GET    /api/dashboard/stats   - Get dashboard statistics
GET    /api/dashboard/history - Get scan history
GET    /api/dashboard/score-history - Get score history for charts
```

### AI Analysis API
```
POST   /analyze/resume        - Parse resume
POST   /analyze/job           - Parse job description
POST   /analyze/match         - Match resume to job
POST   /analyze/bullets       - Analyze bullets
POST   /analyze/wording       - Analyze wording
POST   /analyze/full          - Complete analysis
```

## Database Schema

### Core Tables
- **users** - Authentication and profile
- **resumes** - Uploaded resume metadata and extracted text
- **job_descriptions** - Stored job descriptions
- **resume_scans** - Analysis requests with status and scores
- **analysis_results** - Detailed JSON analysis results
- **applications** - Job application tracking
- **refresh_tokens** - JWT refresh token storage

### Relationships
```
User
├── Resumes (1:N)
├── JobDescriptions (1:N)
├── ResumeScans (1:N)
│   └── AnalysisResult (1:1)
└── Applications (1:N)
```

All relationships enforce ownership via foreign keys with CASCADE deletes.

## Testing

```bash
# Backend tests
cd backend
pytest -v

# Frontend tests
cd frontend
npm test

# API tests
cd api
pytest -v
```

## Security Test Cases

The application handles these attack vectors safely:

- Path traversal: `../../secret.txt`
- XSS payloads: `<script>alert(1)</script>`
- JavaScript URLs: `javascript:alert(1)`
- SSRF attempts: `http://127.0.0.1`, `http://169.254.169.254`
- Prompt injection: "Ignore previous instructions..."
- Malformed PDFs, oversized files, corrupt files

## Deployment

### Production Checklist

- [ ] Set strong `JWT_SECRET` (32+ random characters)
- [ ] Configure `DATABASE_URL` for PostgreSQL
- [ ] Set `GEMINI_API_KEY` for AI features
- [ ] Configure `ALLOWED_ORIGINS` for your domain
- [ ] Enable HTTPS (set `SECURE_COOKIES=true`)
- [ ] Set up reverse proxy (nginx/Traefik) with SSL
- [ ] Configure proper logging and monitoring
- [ ] Set up database backups
- [ ] Run security audit: `npm audit` and `pip-audit`

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Project Structure Details

### Frontend (`frontend/src/`)
```
components/
  ui/           # Reusable UI components (Button, Input, Card, Modal, etc.)
  auth/         # Auth-related components (ProtectedRoute)
pages/          # Route-level components (HomePage, AnalyzerPage, DashboardPage, etc.)
layouts/        # Layout components (MainLayout, AuthLayout)
hooks/          # Custom React hooks
services/       # API clients (api.ts)
context/        # React context (AuthContext)
utils/          # Utility functions (helpers.ts)
types/          # TypeScript type definitions
assets/         # Static assets
```

### Backend (`backend/app/`)
```
models/         # SQLAlchemy models
schemas/        # Pydantic schemas (request/response)
routes/         # FastAPI route handlers
services/       # Business logic (ai_analysis.py)
auth/           # Authentication (security.py, dependencies.py)
database/       # Database session management
middleware/     # Custom middleware
security/       # Security utilities
config.py       # Configuration management
main.py         # FastAPI application entry point
```

### AI API (`api/app/`)
```
services/       # Analysis service (analysis_service.py)
routes/         # Analysis endpoints
config.py       # Configuration
main.py         # FastAPI application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and security checks
5. Submit a pull request

## License

MIT License - Free for personal and commercial use.

## Support

- GitHub Issues: Bug reports and feature requests
- Documentation: See `/docs` folder
- Security: Report vulnerabilities privately

## Acknowledgments

Built with modern web technologies and security best practices. Inspired by the need for a free, transparent, and powerful resume analysis tool.