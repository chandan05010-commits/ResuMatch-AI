export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

export interface Resume {
  id: string;
  user_id: string;
  filename: string;
  file_size: number;
  content_type: string;
  extracted_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobDescription {
  id: string;
  user_id: string;
  title: string;
  company: string | null;
  description: string;
  url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResumeScan {
  id: string;
  user_id: string;
  resume_id: string;
  job_description_id: string | null;
  target_job_title: string;
  ats_score: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at: string | null;
}

export interface AnalysisResult {
  id: string;
  scan_id: string;
  overall_score: number;
  category_scores: CategoryScores;
  keyword_analysis: KeywordAnalysis;
  skill_analysis: SkillAnalysis;
  wording_analysis: WordingAnalysis;
  action_verb_analysis: ActionVerbAnalysis;
  metrics_analysis: MetricsAnalysis;
  formatting_analysis: FormattingAnalysis;
  section_analysis: SectionAnalysis[];
  bullet_analysis: BulletAnalysis[];
  job_match: JobMatchAnalysis;
  improvement_plan: ImprovementPlan;
  created_at: string;
}

export interface CategoryScores {
  keyword_match: number;
  skills_match: number;
  experience_relevance: number;
  ats_formatting: number;
  impact_metrics: number;
  wording: number;
  readability: number;
}

export interface KeywordAnalysis {
  matched_keywords: string[];
  missing_keywords: string[];
  important_keywords: string[];
  keyword_coverage: number;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface SkillAnalysis {
  resume_skills: SkillCategory[];
  required_skills: SkillCategory[];
  matched_skills: SkillCategory[];
  missing_skills: SkillCategory[];
  additional_skills: SkillCategory[];
}

export interface WordingIssue {
  original: string;
  problem: string;
  why_it_matters: string;
  suggested_improvement: string;
  severity: 'high' | 'medium' | 'low';
}

export interface WordingAnalysis {
  weak_wording: WordingIssue[];
  repeated_words: { word: string; count: number }[];
  generic_statements: string[];
  passive_voice: string[];
  filler_words: string[];
  unclear_statements: string[];
  long_sentences: string[];
  unprofessional_wording: string[];
}

export interface ActionVerbAnalysis {
  weak_verbs: { verb: string; count: number; contexts: string[] }[];
  strong_verbs: { verb: string; count: number }[];
  suggestions: { context: string; weak_verb: string; suggested_verbs: string[] }[];
}

export interface MetricsAnalysis {
  quantified_achievements: { bullet: string; metrics: string[] }[];
  non_quantified_achievements: string[];
  suggestions: string[];
}

export interface FormattingCheck {
  check: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
}

export interface FormattingAnalysis {
  checks: FormattingCheck[];
  overall_rating: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface SectionAnalysis {
  section: string;
  present: boolean;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'missing';
  suggestions: string[];
}

export interface BulletAnalysis {
  original: string;
  quality_score: number;
  problems: string[];
  suggested_improvement: string;
  priority: 'high' | 'medium' | 'low';
}

export interface JobMatchAnalysis {
  overall_match: number;
  skill_match: number;
  keyword_match: number;
  experience_match: number;
  education_match: number;
  explanation: string;
}

export interface ImprovementPlan {
  high_priority: ImprovementItem[];
  medium_priority: ImprovementItem[];
  low_priority: ImprovementItem[];
}

export interface ImprovementItem {
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}

export interface Application {
  id: string;
  user_id: string;
  company: string;
  job_title: string;
  application_date: string;
  job_url: string | null;
  status: 'saved' | 'applied' | 'screening' | 'interview' | 'rejected' | 'offer';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_applications: number;
  interviews: number;
  offers: number;
  pending: number;
  average_ats_score: number;
  total_resume_scans: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ApiError {
  detail: string;
  status_code: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}