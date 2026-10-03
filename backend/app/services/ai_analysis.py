import json
import re
import os
from typing import Dict, List, Any, Optional
from collections import Counter
import httpx

# Try to import Google Generative AI
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

from app.config import settings

# Common skill keywords for deterministic extraction
TECH_SKILLS = {
    "programming_languages": [
        "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "ruby", "php",
        "swift", "kotlin", "scala", "r", "matlab", "sql", "html", "css", "bash", "powershell"
    ],
    "frameworks": [
        "react", "vue", "angular", "svelte", "next.js", "nuxt", "django", "flask", "fastapi",
        "spring", "express", "nest.js", "laravel", "rails", "asp.net", "gin", "echo", "fiber"
    ],
    "databases": [
        "postgresql", "mysql", "mongodb", "redis", "sqlite", "oracle", "sql server", "dynamodb",
        "cassandra", "elasticsearch", "neo4j", "mariadb", "cockroachdb", "timescaledb"
    ],
    "cloud": [
        "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "terraform", "ansible",
        "jenkins", "github actions", "gitlab ci", "circleci", "argo", "helm", "prometheus", "grafana"
    ],
    "devops": [
        "ci/cd", "linux", "nginx", "apache", "haproxy", "vagrant", "packer", "vault", "consul"
    ],
    "tools": [
        "git", "jira", "confluence", "slack", "notion", "figma", "postman", "swagger", "sonarqube",
        "eslint", "prettier", "jest", "pytest", "cypress", "playwright", "selenium"
    ],
    "soft_skills": [
        "leadership", "communication", "teamwork", "problem solving", "critical thinking",
        "adaptability", "time management", "mentoring", "agile", "scrum", "kanban"
    ]
}

FLATTENED_SKILLS = []
for category, skills in TECH_SKILLS.items():
    FLATTENED_SKILLS.extend([(skill, category) for skill in skills])

# Common action verbs
WEAK_VERBS = {
    "worked on", "helped", "assisted", "made", "did", "responsible for", "involved in",
    "participated in", "contributed to", "supported", "handled", "managed", "dealt with"
}

STRONG_VERBS = {
    "developed", "built", "engineered", "created", "implemented", "designed", "architected",
    "optimized", "automated", "improved", "enhanced", "refactored", "delivered", "launched",
    "spearheaded", "led", "directed", "orchestrated", "coordinated", "established", "founded",
    "initiated", "pioneered", "transformed", "modernized", "scaled", "reduced", "increased",
    "achieved", "exceeded", "surpassed", "accelerated", "streamlined", "standardized"
}

# Filler words
FILLER_WORDS = {
    "basically", "actually", "literally", "really", "very", "quite", "rather", "somewhat",
    "pretty much", "kind of", "sort of", "i think", "i believe", "in my opinion", "just",
    "simply", "obviously", "clearly", "of course", "needless to say"
}

# Passive voice patterns
PASSIVE_PATTERNS = [
    r"\bwas\s+\w+ed\b", r"\bwere\s+\w+ed\b", r"\bis\s+\w+ed\b", r"\bare\s+\w+ed\b",
    r"\bbeen\s+\w+ed\b", r"\bbeing\s+\w+ed\b"
]

async def analyze_resume(
    resume_text: str,
    job_description: str,
    target_job_title: str
) -> Dict[str, Any]:
    """
    Main analysis function - tries Gemini first, falls back to deterministic NLP
    """
    # Try AI analysis first
    if settings.gemini_api_key and GEMINI_AVAILABLE:
        try:
            return await analyze_with_gemini(resume_text, job_description, target_job_title)
        except Exception as e:
            print(f"Gemini analysis failed, falling back to deterministic: {e}")
    
    # Fallback to deterministic analysis
    return await analyze_deterministic(resume_text, job_description, target_job_title)


async def analyze_with_gemini(
    resume_text: str,
    job_description: str,
    target_job_title: str
) -> Dict[str, Any]:
    """Analyze using Google Gemini"""
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""You are an expert ATS resume analyzer. Analyze the resume against the job description.

<RESUME>
{resume_text[:8000]}
</RESUME>

<JOB_DESCRIPTION>
{job_description[:8000]}
</JOB_DESCRIPTION>

<TARGET_JOB_TITLE>
{target_job_title}
</TARGET_JOB_TITLE>

Return ONLY valid JSON with this exact structure:
{{
  "overall_score": 85,
  "category_scores": {{
    "keyword_match": 90,
    "skills_match": 85,
    "experience_relevance": 80,
    "ats_formatting": 85,
    "impact_metrics": 75,
    "wording": 80,
    "readability": 85
  }},
  "keyword_analysis": {{
    "matched_keywords": ["python", "react", "aws"],
    "missing_keywords": ["kubernetes", "terraform"],
    "important_keywords": ["python", "react", "aws", "kubernetes"],
    "keyword_coverage": 0.75
  }},
  "skill_analysis": {{
    "resume_skills": [{{"category": "Programming Languages", "skills": ["Python", "JavaScript"]}}],
    "required_skills": [{{"category": "Programming Languages", "skills": ["Python", "Go"]}}],
    "matched_skills": [{{"category": "Programming Languages", "skills": ["Python"]}}],
    "missing_skills": [{{"category": "Programming Languages", "skills": ["Go"]}}],
    "additional_skills": [{{"category": "Frameworks", "skills": ["React"]}}]
  }},
  "wording_analysis": {{
    "weak_wording": [{{"original": "worked on", "problem": "Weak verb", "why_it_matters": "Doesn't show ownership", "suggested_improvement": "developed", "severity": "medium"}}],
    "repeated_words": [{{"word": "and", "count": 15}}],
    "generic_statements": [],
    "passive_voice": [],
    "filler_words": [],
    "unclear_statements": [],
    "long_sentences": [],
    "unprofessional_wording": []
  }},
  "action_verb_analysis": {{
    "weak_verbs": [{{"verb": "worked on", "count": 3, "contexts": ["worked on project"]}}],
    "strong_verbs": [{{"verb": "developed", "count": 5}}],
    "suggestions": [{{"context": "worked on project", "weak_verb": "worked on", "suggested_verbs": ["developed", "built"]}}]
  }},
  "metrics_analysis": {{
    "quantified_achievements": [{{"bullet": "increased performance by 50%", "metrics": ["50%"]}}],
    "non_quantified_achievements": ["improved code quality"],
    "suggestions": ["Add metrics to 'improved code quality'"]
  }},
  "formatting_analysis": {{
    "checks": [{{"check": "Single column layout", "status": "pass", "message": "Resume uses single column layout"}}],
    "overall_rating": "good"
  }},
  "section_analysis": [
    {{"section": "Contact", "present": true, "quality": "good", "suggestions": []}},
    {{"section": "Experience", "present": true, "quality": "excellent", "suggestions": []}}
  ],
  "bullet_analysis": [
    {{"original": "developed api", "quality_score": 80, "problems": [], "suggested_improvement": "developed REST API serving 10k req/s", "priority": "low"}}
  ],
  "job_match": {{
    "overall_match": 82,
    "skill_match": 85,
    "keyword_match": 80,
    "experience_match": 78,
    "education_match": 85,
    "explanation": "Strong match for senior frontend role"
  }},
  "improvement_plan": {{
    "high_priority": [{{"title": "Add Kubernetes", "description": "Job requires Kubernetes", "impact": "High", "effort": "medium"}}],
    "medium_priority": [],
    "low_priority": []
  }}
}}"""

    response = await model.generate_content_async(prompt)
    text = response.text
    
    # Extract JSON from response
    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if json_match:
        return json.loads(json_match.group())
    
    raise ValueError("No valid JSON in Gemini response")


async def analyze_deterministic(
    resume_text: str,
    job_description: str,
    target_job_title: str
) -> Dict[str, Any]:
    """Deterministic NLP analysis without external AI"""
    
    # Extract keywords from job description
    jd_keywords = extract_keywords(job_description)
    resume_keywords = extract_keywords(resume_text)
    
    # Keyword analysis
    matched = list(set(jd_keywords) & set(resume_keywords))
    missing = list(set(jd_keywords) - set(resume_keywords))
    important = jd_keywords[:20]  # Top 20 from JD
    coverage = len(matched) / max(len(jd_keywords), 1)
    
    # Skill analysis
    resume_skills = extract_skills(resume_text)
    jd_skills = extract_skills(job_description)
    
    skill_analysis = categorize_skills(resume_skills, jd_skills)
    
    # Formatting analysis
    formatting = analyze_formatting(resume_text)
    
    # Section analysis
    sections = analyze_sections(resume_text)
    
    # Bullet analysis
    bullets = extract_bullets(resume_text)
    bullet_analysis = analyze_bullets(bullets)
    
    # Wording analysis
    wording = analyze_wording(resume_text)
    
    # Action verb analysis
    action_verbs = analyze_action_verbs(resume_text)
    
    # Metrics analysis
    metrics = analyze_metrics(bullets)
    
    # Job match
    job_match = calculate_job_match(
        resume_text, job_description, target_job_title,
        matched, missing, skill_analysis
    )
    
    # Calculate category scores
    category_scores = calculate_category_scores(
        keyword_coverage=coverage,
        skill_analysis=skill_analysis,
        formatting=formatting,
        wording=wording,
        action_verbs=action_verbs,
        metrics=metrics,
        job_match=job_match
    )
    
    overall_score = calculate_overall_score(category_scores)
    
    # Improvement plan
    improvement_plan = generate_improvement_plan(
    missing_keywords=missing,
    skill_analysis=skill_analysis,
    formatting=formatting,
    wording=wording,
    action_verbs=action_verbs,
    metrics=metrics,
    bullet_analysis=bullet_analysis
)
    
    return {
        "overall_score": overall_score,
        "category_scores": category_scores,
        "keyword_analysis": {
            "matched_keywords": matched,
            "missing_keywords": missing,
            "important_keywords": important,
            "keyword_coverage": round(coverage * 100, 1)
        },
        "skill_analysis": skill_analysis,
        "wording_analysis": wording,
        "action_verb_analysis": action_verbs,
        "metrics_analysis": metrics,
        "formatting_analysis": formatting,
        "section_analysis": sections,
        "bullet_analysis": bullet_analysis,
        "job_match": job_match,
        "improvement_plan": improvement_plan
    }


def extract_keywords(text: str) -> List[str]:
    """Extract meaningful keywords from text"""
    # Normalize
    text = text.lower()
    
    # Extract words (alphanumeric + some special chars)
    words = re.findall(r'\b[a-z][a-z0-9\+\#\-\.]{1,}\b', text)
    
    # Filter common stop words
    stop_words = {
        'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
        'by', 'from', 'as', 'is', 'was', 'were', 'been', 'be', 'are', 'have',
        'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
        'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'a',
        'an', 'we', 'you', 'your', 'our', 'their', 'his', 'her', 'its', 'my',
        'i', 'he', 'she', 'it', 'they', 'them', 'me', 'us', 'him', 'her',
        'experience', 'years', 'year', 'skills', 'skill', 'knowledge', 'ability',
        'strong', 'good', 'excellent', 'proficient', 'familiar', 'understanding'
    }
    
    keywords = [w for w in words if w not in stop_words and len(w) > 2]
    
    # Count frequency and return most common
    freq = Counter(keywords)
    return [word for word, _ in freq.most_common(50)]


def extract_skills(text: str) -> List[str]:
    """Extract technical skills from text"""
    text_lower = text.lower()
    found_skills = []
    
    for skill, category in FLATTENED_SKILLS:
        # Use word boundaries for better matching
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.append(skill)
    
    return list(set(found_skills))


def categorize_skills(resume_skills: List[str], jd_skills: List[str]) -> Dict[str, Any]:
    """Categorize skills into matched, missing, additional"""
    
    def group_by_category(skills: List[str]) -> List[Dict]:
        categories = {}
        for skill in skills:
            for cat, cat_skills in TECH_SKILLS.items():
                if skill in cat_skills:
                    if cat not in categories:
                        categories[cat] = []
                    categories[cat].append(skill)
                    break
            else:
                if 'Other' not in categories:
                    categories['Other'] = []
                categories['Other'].append(skill)
        
        return [
            {"category": cat.replace('_', ' ').title(), "skills": sorted(skills)}
            for cat, skills in categories.items()
        ]
    
    resume_set = set(resume_skills)
    jd_set = set(jd_skills)
    
    matched = list(resume_set & jd_set)
    missing = list(jd_set - resume_set)
    additional = list(resume_set - jd_set)
    
    return {
        "resume_skills": group_by_category(resume_skills),
        "required_skills": group_by_category(jd_skills),
        "matched_skills": group_by_category(matched),
        "missing_skills": group_by_category(missing),
        "additional_skills": group_by_category(additional)
    }


def analyze_formatting(text: str) -> Dict[str, Any]:
    """Analyze resume formatting for ATS compatibility"""
    checks = []
    
    # Check for contact info
    has_email = bool(re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text))
    has_phone = bool(re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text))
    has_linkedin = 'linkedin' in text.lower()
    
    checks.append({
        "check": "Contact information",
        "status": "pass" if (has_email and has_phone) else "warning",
        "message": f"Email: {'✓' if has_email else '✗'}, Phone: {'✓' if has_phone else '✗'}, LinkedIn: {'✓' if has_linkedin else '✗'}"
    })
    
    # Check for standard sections
    standard_sections = ['experience', 'education', 'skills', 'summary', 'objective', 'projects', 'certifications']
    found_sections = []
    for section in standard_sections:
        if re.search(rf'\b{section}\b', text, re.IGNORECASE):
            found_sections.append(section)
    
    checks.append({
        "check": "Standard section headings",
        "status": "pass" if len(found_sections) >= 3 else "warning",
        "message": f"Found: {', '.join(found_sections) if found_sections else 'None'}"
    })
    
    # Check for dates
    date_patterns = [
        r'\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}\b',
        r'\b\d{1,2}/\d{4}\b',
        r'\b\d{4}\s*[-–]\s*\d{4}\b',
        r'\b\d{4}\s*[-–]\s*(?:present|current)\b',
    ]
    has_dates = any(re.search(p, text, re.IGNORECASE) for p in date_patterns)
    
    checks.append({
        "check": "Consistent date formatting",
        "status": "pass" if has_dates else "warning",
        "message": "Dates detected in standard format" if has_dates else "No standard date formats found"
    })
    
    # Check for bullet points
    bullet_count = len(re.findall(r'^\s*[•\-\*]\s+', text, re.MULTILINE))
    checks.append({
        "check": "Bullet points",
        "status": "pass" if bullet_count >= 3 else "warning",
        "message": f"Found {bullet_count} bullet points"
    })
    
    # Check for quantified achievements
    metric_patterns = [
        r'\d+%', r'\$\d+', r'\d+\s*(?:million|billion|thousand|k\b)', 
        r'\d+\s*(?:users?|customers?|clients?)', r'\d+\s*(?:hours?|days?|weeks?|months?)',
        r'\d+x', r'\d+\.\d+', r'reduced.*\d+', r'increased.*\d+', r'improved.*\d+'
    ]
    has_metrics = any(re.search(p, text, re.IGNORECASE) for p in metric_patterns)
    
    checks.append({
        "check": "Quantified achievements",
        "status": "pass" if has_metrics else "warning",
        "message": "Metrics found in resume" if has_metrics else "No quantified achievements detected"
    })
    
    # Check for single column (heuristic: no tabular data markers)
    has_tables = bool(re.search(r'\t{2,}|\|.*\|', text))
    checks.append({
        "check": "Single column layout",
        "status": "pass" if not has_tables else "warning",
        "message": "No table structures detected" if not has_tables else "Possible table/column layout detected"
    })
    
    # Overall rating
    passed = sum(1 for c in checks if c['status'] == 'pass')
    if passed >= 5:
        overall = "excellent"
    elif passed >= 4:
        overall = "good"
    elif passed >= 3:
        overall = "fair"
    else:
        overall = "poor"
    
    return {"checks": checks, "overall_rating": overall}


def analyze_sections(text: str) -> List[Dict[str, Any]]:
    """Analyze resume sections"""
    sections_to_check = [
        ("Contact", ['email', 'phone', 'linkedin', 'address']),
        ("Summary/Objective", ['summary', 'objective', 'profile', 'about']),
        ("Experience", ['experience', 'work history', 'employment', 'career']),
        ("Education", ['education', 'degree', 'university', 'college', 'bachelor', 'master', 'phd']),
        ("Skills", ['skills', 'technologies', 'tech stack', 'competencies', 'expertise']),
        ("Projects", ['projects', 'portfolio', 'github', 'personal projects']),
        ("Certifications", ['certifications', 'certificates', 'licenses', 'credentials']),
        ("Achievements", ['achievements', 'awards', 'honors', 'recognitions']),
        ("Leadership", ['leadership', 'management', 'led', 'managed', 'supervised']),
        ("Languages", ['languages', 'fluent', 'proficient', 'native']),
    ]
    
    results = []
    text_lower = text.lower()
    
    for section_name, keywords in sections_to_check:
        present = any(kw in text_lower for kw in keywords)
        
        if present:
            # Simple quality check: section has substantial content after heading
            quality = "good"
            if section_name in ["Experience", "Skills"] and len(text) > 1000:
                quality = "excellent"
        else:
            quality = "missing"
        
        suggestions = []
        if not present and section_name in ["Contact", "Experience", "Education", "Skills"]:
            suggestions.append(f"Add {section_name} section - it's essential for ATS")
        
        results.append({
            "section": section_name,
            "present": present,
            "quality": quality,
            "suggestions": suggestions
        })
    
    return results


def extract_bullets(text: str) -> List[str]:
    """Extract bullet points from resume"""
    bullets = re.findall(r'^\s*[•\-\*]\s+(.+)$', text, re.MULTILINE)
    # Also try numbered lists
    numbered = re.findall(r'^\s*\d+[\.\)]\s+(.+)$', text, re.MULTILINE)
    return bullets + numbered


def analyze_bullets(bullets: List[str]) -> List[Dict[str, Any]]:
    """Analyze individual bullet points"""
    results = []
    
    for bullet in bullets[:20]:  # Limit to first 20 bullets
        problems = []
        score = 70  # Base score
        
        # Check for action verb start
        first_word = bullet.split()[0].lower() if bullet.split() else ""
        if first_word in WEAK_VERBS:
            problems.append("Starts with weak verb")
            score -= 15
        elif first_word in STRONG_VERBS:
            score += 10
        
        # Check for metrics
        has_metric = bool(re.search(r'\d+%|\$\d+|\d+\s*(?:users?|customers?|hours?|days?)', bullet, re.IGNORECASE))
        if not has_metric:
            problems.append("No quantified metrics")
            score -= 10
        else:
            score += 10
        
        # Check length
        word_count = len(bullet.split())
        if word_count > 30:
            problems.append("Bullet too long (>30 words)")
            score -= 5
        elif word_count < 5:
            problems.append("Bullet too short (<5 words)")
            score -= 5
        
        # Check for passive voice
        if re.search(r'\b(was|were|is|are|been|being)\s+\w+ed\b', bullet, re.IGNORECASE):
            problems.append("Passive voice detected")
            score -= 5
        
        # Generate suggestion
        suggestion = bullet
        if first_word in WEAK_VERBS:
            suggestion = bullet.replace(first_word, "developed", 1)
        if not has_metric:
            suggestion += " [Add specific metric if available]"
        
        priority = "high" if score < 50 else "medium" if score < 70 else "low"
        
        results.append({
            "original": bullet,
            "quality_score": max(0, min(100, score)),
            "problems": problems,
            "suggested_improvement": suggestion,
            "priority": priority
        })
    
    return results


def analyze_wording(text: str) -> Dict[str, Any]:
    """Analyze wording quality"""
    weak_wording = []
    text_lower = text.lower()
    
    # Check for weak phrases
    weak_phrases = {
        "responsible for": "Passive - use active verbs like 'led', 'managed', 'directed'",
        "worked on": "Vague - specify what you built/created/developed",
        "helped with": "Minimizes contribution - use 'supported', 'enabled', 'facilitated'",
        "assisted in": "Weak - use 'contributed to', 'collaborated on'",
        "duties included": "Job description language - focus on achievements",
        "successfully": "Unnecessary filler - show results instead",
        "effectively": "Vague adverb - quantify the effectiveness",
        "efficiently": "Vague adverb - quantify the efficiency",
    }
    
    for phrase, problem in weak_phrases.items():
        if phrase in text_lower:
            weak_wording.append({
                "original": phrase,
                "problem": problem.split(" - ")[0],
                "why_it_matters": "Weak phrasing reduces impact and may not match ATS keywords",
                "suggested_improvement": problem.split(" - ")[1] if " - " in problem else "Use stronger action verb",
                "severity": "medium"
            })
    
    # Repeated words
    words = re.findall(r'\b\w+\b', text_lower)
    word_freq = Counter(words)
    repeated = [{"word": w, "count": c} for w, c in word_freq.most_common(10) if c > 5 and len(w) > 3]
    
    # Passive voice
    passive = []
    for pattern in PASSIVE_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        passive.extend(matches[:5])
    
    # Filler words
    filler = [w for w in FILLER_WORDS if w in text_lower]
    
    # Long sentences (split by period, check word count)
    sentences = re.split(r'[.!?]+', text)
    long_sentences = [s.strip() for s in sentences if len(s.split()) > 25][:5]
    
    return {
        "weak_wording": weak_wording,
        "repeated_words": repeated,
        "generic_statements": [],  # Would need more sophisticated NLP
        "passive_voice": list(set(passive))[:5],
        "filler_words": filler[:10],
        "unclear_statements": [],
        "long_sentences": long_sentences,
        "unprofessional_wording": []
    }


def analyze_action_verbs(text: str) -> Dict[str, Any]:
    """Analyze action verbs in resume"""
    text_lower = text.lower()
    words = re.findall(r'\b\w+\b', text_lower)
    
    weak_found = []
    strong_found = []
    suggestions = []
    
    for word in words:
        if word in WEAK_VERBS:
            weak_found.append(word)
        elif word in STRONG_VERBS:
            strong_found.append(word)
    
    weak_counts = Counter(weak_found)
    strong_counts = Counter(strong_found)
    
    # Generate suggestions for weak verbs found
    for weak_verb, count in weak_counts.most_common(5):
        # Find context
        pattern = rf'\b{re.escape(weak_verb)}\b\s+\w+'
        contexts = re.findall(pattern, text_lower)[:3]
        suggestions.append({
            "context": contexts[0] if contexts else weak_verb,
            "weak_verb": weak_verb,
            "suggested_verbs": ["developed", "implemented", "designed", "optimized", "engineered"][:3]
        })
    
    return {
        "weak_verbs": [{"verb": v, "count": c, "contexts": []} for v, c in weak_counts.most_common()],
        "strong_verbs": [{"verb": v, "count": c} for v, c in strong_counts.most_common()],
        "suggestions": suggestions
    }


def analyze_metrics(bullets: List[str]) -> Dict[str, Any]:
    """Analyze quantified achievements"""
    quantified = []
    non_quantified = []
    
    metric_pattern = re.compile(r'\d+%|\$\d+|\d+\s*(?:million|billion|thousand|k\b|users?|customers?|clients?|hours?|days?|weeks?|months?|years?)|\d+x|\d+\.\d+', re.IGNORECASE)
    
    for bullet in bullets:
        metrics = metric_pattern.findall(bullet)
        if metrics:
            quantified.append({"bullet": bullet, "metrics": metrics})
        else:
            non_quantified.append(bullet)
    
    suggestions = []
    if non_quantified:
        suggestions.append(f"{len(non_quantified)} bullets lack quantified metrics. Add real numbers where possible.")
    
    return {
        "quantified_achievements": quantified,
        "non_quantified_achievements": non_quantified[:10],
        "suggestions": suggestions
    }


def calculate_job_match(
    resume_text: str,
    job_description: str,
    target_job_title: str,
    matched_keywords: List[str],
    missing_keywords: List[str],
    skill_analysis: Dict
) -> Dict[str, Any]:
    """Calculate job match percentages"""
    
    jd_keywords = extract_keywords(job_description)
    resume_keywords = extract_keywords(resume_text)
    
    # Keyword match
    keyword_match = round(len(matched_keywords) / max(len(jd_keywords), 1) * 100)
    
    # Skill match
    matched_skills = sum(len(cat['skills']) for cat in skill_analysis['matched_skills'])
    required_skills = sum(len(cat['skills']) for cat in skill_analysis['required_skills'])
    skill_match = round(matched_skills / max(required_skills, 1) * 100) if required_skills > 0 else 50
    
    # Experience match (heuristic)
    exp_keywords = ['year', 'experience', 'senior', 'lead', 'principal', 'manager', 'director']
    jd_exp = sum(1 for kw in exp_keywords if kw in job_description.lower())
    resume_exp = sum(1 for kw in exp_keywords if kw in resume_text.lower())
    experience_match = min(100, round(resume_exp / max(jd_exp, 1) * 100)) if jd_exp > 0 else 70
    
    # Education match (simplified)
    edu_keywords = ['bachelor', 'master', 'phd', 'degree', 'university', 'college']
    jd_edu = sum(1 for kw in edu_keywords if kw in job_description.lower())
    resume_edu = sum(1 for kw in edu_keywords if kw in resume_text.lower())
    education_match = min(100, round(resume_edu / max(jd_edu, 1) * 100)) if jd_edu > 0 else 80
    
    overall = round((keyword_match * 0.3 + skill_match * 0.3 + experience_match * 0.25 + education_match * 0.15))
    
    explanation = f"Overall match: {overall}%. "
    if keyword_match >= 70:
        explanation += "Good keyword alignment. "
    else:
        explanation += f"Missing {len(missing_keywords)} key keywords. "
    
    if skill_match >= 70:
        explanation += "Skills well aligned. "
    else:
        explanation += "Skill gaps detected. "
    
    return {
        "overall_match": overall,
        "skill_match": skill_match,
        "keyword_match": keyword_match,
        "experience_match": experience_match,
        "education_match": education_match,
        "explanation": explanation
    }


def calculate_category_scores(
    keyword_coverage: float,
    skill_analysis: Dict,
    formatting: Dict,
    wording: Dict,
    action_verbs: Dict,
    metrics: Dict,
    job_match: Dict
) -> Dict[str, int]:
    """Calculate category scores"""
    
    # Keyword match (0-100)
    keyword_score = round(keyword_coverage * 100)
    
    # Skills match
    matched_skills = sum(len(cat['skills']) for cat in skill_analysis['matched_skills'])
    required_skills = sum(len(cat['skills']) for cat in skill_analysis['required_skills'])
    skills_score = round(matched_skills / max(required_skills, 1) * 100) if required_skills > 0 else 60
    
    # Experience relevance (based on job match)
    experience_score = job_match.get('experience_match', 70)
    
    # ATS formatting
    passed = sum(1 for c in formatting['checks'] if c['status'] == 'pass')
    formatting_score = min(100, passed * 15 + 20)
    
    # Impact metrics
    quantified = len(metrics['quantified_achievements'])
    total_bullets = len(metrics['quantified_achievements']) + len(metrics['non_quantified_achievements'])
    metrics_score = round(quantified / max(total_bullets, 1) * 100) if total_bullets > 0 else 30
    
    # Wording
    weak_count = len(wording['weak_wording'])
    passive_count = len(wording['passive_voice'])
    wording_score = max(0, 100 - weak_count * 10 - passive_count * 5)
    
    # Readability (simplified)
    readability_score = 75  # Default
    
    return {
        "keyword_match": keyword_score,
        "skills_match": skills_score,
        "experience_relevance": experience_score,
        "ats_formatting": formatting_score,
        "impact_metrics": metrics_score,
        "wording": wording_score,
        "readability": readability_score
    }


def calculate_overall_score(category_scores: Dict[str, int]) -> int:
    """Calculate weighted overall score"""
    weights = {
        "keyword_match": 0.25,
        "skills_match": 0.20,
        "experience_relevance": 0.20,
        "ats_formatting": 0.15,
        "impact_metrics": 0.10,
        "wording": 0.05,
        "readability": 0.05,
    }
    
    score = sum(category_scores[k] * w for k, w in weights.items())
    return round(score)


def generate_improvement_plan(
    missing_keywords: List[str],
    skill_analysis: Dict,
    formatting: Dict,
    wording: Dict,
    action_verbs: Dict,
    metrics: Dict,
    bullet_analysis: List[Dict[str, Any]]
) -> Dict[str, List[Dict]]:
    """Generate prioritized improvement plan"""
    
    high = []
    medium = []
    low = []
    
    # High priority: missing critical keywords/skills
    if missing_keywords:
        high.append({
            "title": "Add missing critical keywords",
            "description": f"Job description requires: {', '.join(missing_keywords[:10])}",
            "impact": "High - directly affects ATS keyword matching score",
            "effort": "medium"
        })
    
    missing_skills = sum(len(cat['skills']) for cat in skill_analysis['missing_skills'])
    if missing_skills > 0:
        high.append({
            "title": "Add missing required skills",
            "description": f"{missing_skills} required skills not found in resume",
            "impact": "High - skill match heavily weighted in ATS scoring",
            "effort": "medium"
        })
    
    # Weak bullets
    weak_bullets = [
    b for b in bullet_analysis
    if b.get("quality_score", 70) < 50
]
    if weak_bullets:
        high.append({
            "title": "Improve weak experience bullets",
            "description": f"{len(weak_bullets)} bullets score below 50 - need stronger verbs and metrics",
            "impact": "High - bullet quality affects multiple scoring categories",
            "effort": "high"
        })
    
    # Medium priority: formatting issues
    formatting_warnings = [c for c in formatting['checks'] if c['status'] == 'warning']
    if formatting_warnings:
        medium.append({
            "title": "Fix ATS formatting issues",
            "description": f"{len(formatting_warnings)} formatting checks failed: {', '.join([c['check'] for c in formatting_warnings])}",
            "impact": "Medium - formatting affects parsing accuracy",
            "effort": "low"
        })
    
    # Action verbs
    if action_verbs['weak_verbs']:
        medium.append({
            "title": "Replace weak action verbs",
            "description": f"Found {len(action_verbs['weak_verbs'])} weak verbs - replace with stronger alternatives",
            "impact": "Medium - improves wording score and human readability",
            "effort": "low"
        })
    
    # Standardize dates
    date_check = next((c for c in formatting['checks'] if 'date' in c['check'].lower()), None)
    if date_check and date_check['status'] == 'warning':
        medium.append({
            "title": "Standardize date formats",
            "description": "Use consistent MM/YYYY format throughout",
            "impact": "Medium - ATS may miscalculate tenure",
            "effort": "low"
        })
    
    # Low priority: wording improvements
    if wording['weak_wording']:
        low.append({
            "title": "Improve summary/objective wording",
            "description": f"Found {len(wording['weak_wording'])} weak phrases",
            "impact": "Low - minor impact on wording score",
            "effort": "low"
        })
    
    if wording['repeated_words']:
        low.append({
            "title": "Reduce word repetition",
            "description": f"Words repeated frequently: {', '.join([w['word'] for w in wording['repeated_words'][:5]])}",
            "impact": "Low - improves readability",
            "effort": "low"
        })
    
    if metrics['non_quantified_achievements']:
        low.append({
            "title": "Add metrics to achievements",
            "description": f"{len(metrics['non_quantified_achievements'])} bullets lack quantified results",
            "impact": "Low - improves impact score if real metrics available",
            "effort": "medium"
        })
    
    return {
        "high_priority": high,
        "medium_priority": medium,
        "low_priority": low
    }