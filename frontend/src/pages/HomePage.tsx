import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../utils/helpers'
import { 
  ArrowRight, 
  CheckCircle, 
  Target, 
  Zap, 
  Shield, 
  Brain, 
  BarChart, 
  FileText, 
  Search, 
  Lightbulb,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Briefcase,
  Github,
  Linkedin,
  Twitter
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { ScoreCircle } from '../components/ui/ScoreCircle'
import { Card, CardContent } from '../components/ui/Card'

const features = [
  { icon: Target, title: 'ATS Analysis', description: 'Deep ATS compatibility scoring with detailed breakdown across 7 categories' },
  { icon: Search, title: 'Job Matching', description: 'Compare your resume against any job description for precise keyword matching' },
  { icon: Brain, title: 'Keyword Optimization', description: 'AI-powered keyword extraction and missing keyword identification' },
  { icon: FileText, title: 'Resume Feedback', description: 'Section-by-section analysis with actionable improvement suggestions' },
  { icon: BarChart, title: 'Application Tracking', description: 'Track applications, interviews, and offers in one organized dashboard' },
  { icon: Lightbulb, title: 'AI Suggestions', description: 'Personalized improvement plans with priority-based recommendations' },
]

const steps = [
  { number: '01', title: 'Upload Resume', description: 'Drag and drop your PDF resume. We extract and parse the content securely.' },
  { number: '02', title: 'Add Job Description', description: 'Paste the target job description or enter the job title and company.' },
  { number: '03', title: 'Analyze', description: 'Our AI analyzes keywords, skills, formatting, and ATS compatibility.' },
  { number: '04', title: 'Improve', description: 'Get detailed feedback, missing keywords, and a prioritized improvement plan.' },
  { number: '05', title: 'Apply', description: 'Track your application and iterate based on real results.' },
]

const featureDetails = [
  { icon: Target, title: 'ATS Score', description: 'Overall score (0-100) with category breakdown: keywords, skills, experience, formatting, impact, wording, readability.' },
  { icon: Search, title: 'Keyword Match', description: 'See matched, missing, and important keywords with coverage percentage and filtering options.' },
  { icon: Brain, title: 'Skill Match', description: 'Categorized skills analysis: programming languages, frameworks, databases, cloud, DevOps, tools, soft skills.' },
  { icon: Shield, title: 'Formatting Check', description: 'Validates single-column structure, standard headings, font consistency, date formats, and contact details.' },
  { icon: FileText, title: 'Wording Analysis', description: 'Detects weak wording, passive voice, filler words, repeated words, and unprofessional language.' },
  { icon: Zap, title: 'Action Verbs', description: 'Identifies weak verbs (worked, helped, made) and suggests stronger alternatives (developed, implemented, engineered).' },
  { icon: TrendingUp, title: 'Impact & Metrics', description: 'Finds quantified achievements and flags bullets missing metrics with suggestions to add real numbers.' },
  { icon: Lightbulb, title: 'Bullet Review', description: 'Per-bullet quality scoring with specific problems and suggested improvements.' },
  { icon: BarChart, title: 'Job Match', description: 'Overall match percentage with skill, keyword, experience, and education match breakdowns.' },
  { icon: Target, title: 'Improvement Plan', description: 'Prioritized action items: High (missing skills, weak bullets), Medium (verbs, dates), Low (summary wording).' },
  { icon: Clock, title: 'Scan History', description: 'Complete history of all analyses with scores, dates, and resume versions for comparison.' },
  { icon: Briefcase, title: 'Application Tracker', description: 'Track company, role, date, status (saved/applied/screening/interview/rejected/offer), and notes.' },
]

const atsTips = [
  'Use standard section headings (Experience, Education, Skills) — ATS may not recognize creative alternatives.',
  'Stick to a single-column layout. Multi-column designs often confuse parsing algorithms.',
  'Include relevant keywords from the job description naturally throughout your resume.',
  'Use standard date formats (MM/YYYY or Month YYYY) consistently across all positions.',
  'Quantify achievements with numbers, percentages, and metrics wherever possible.',
  'Start bullets with strong action verbs (Developed, Implemented, Led, Optimized, Designed).',
  'Avoid tables, text boxes, graphics, and special characters that can break ATS parsing.',
  'Include a Skills section with both technical and soft skills relevant to the target role.',
  'Keep formatting clean: consistent fonts, bullet styles, and spacing throughout.',
  'Place contact information at the top in a clear, parsable format (name, phone, email, LinkedIn, location).',
]

const beforeAfter = [
  {
    before: 'Worked on various projects using Python and databases.',
    after: 'Developed 5+ scalable web applications using Python/Django and PostgreSQL, reducing API response time by 40%.',
    improvements: ['Added specific technology stack', 'Quantified number of projects', 'Included measurable performance improvement'],
  },
  {
    before: 'Helped team with code reviews and testing.',
    after: 'Led code review process for 8-person team, established testing standards that reduced production bugs by 60%.',
    improvements: ['Changed "helped" to "led"', 'Added team size context', 'Quantified bug reduction impact'],
  },
  {
    before: 'Responsible for managing cloud infrastructure.',
    after: 'Architected and managed AWS infrastructure (EC2, RDS, S3) serving 1M+ daily requests with 99.9% uptime.',
    improvements: ['Replaced passive "responsible for"', 'Specified AWS services', 'Added scale and reliability metrics'],
  },
  {
    before: 'Made improvements to the CI/CD pipeline.',
    after: 'Redesigned CI/CD pipeline using GitHub Actions, cutting deployment time from 45min to 8min and enabling zero-downtime deployments.',
    improvements: ['Replaced vague "made improvements"', 'Named specific tool', 'Quantified time savings and capability'],
  },
]

function Hero() {
  const [animated, setAnimated] = useState(false)

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary-50 to-white py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-8 animate-in', animated && 'slide-up')}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
            </span>
            <span>New: AI-Powered Bullet Analysis & Improvement Plans</span>
          </div>

          <h1 className={cn('text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-secondary-900 mb-6 animate-in', animated && 'slide-up')}>
            Build a Resume That{' '}
            <span className="gradient-text">Gets Noticed</span>
          </h1>

          <p className={cn('text-lg sm:text-xl text-secondary-600 mb-10 max-w-2xl mx-auto animate-in', animated && 'slide-up')}>
            Analyze your resume against any job description and discover ATS issues, missing keywords, skill gaps, 
            and opportunities to improve your resume — all for free.
          </p>

          <div className={cn('flex flex-col sm:flex-row items-center justify-center gap-4 animate-in', animated && 'slide-up')}>
            <Button size="lg" asChild>
              <Link to="/analyzer">Analyze My Resume <ArrowRight className="w-5 h-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="#features">Explore Features</Link>
            </Button>
          </div>

          <div className={cn('mt-16 relative animate-in', animated && 'fade-in')}>
            <div className="relative max-w-md mx-auto">
              <ScoreCircle score={87} size="xl" label="Sample ATS Score" />
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-4 shadow-lg border border-secondary-200">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span className="font-medium text-secondary-700">Keyword Match: 92%</span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span className="font-medium text-secondary-700">Skills Match: 85%</span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <CheckCircle className="w-4 h-4 text-warning-500" />
                  <span className="font-medium text-secondary-700">Formatting: 78%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl" />
      </div>
    </section>
  )
}

function TrustFeatures() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
            Everything You Need to{' '}
            <span className="gradient-text">Optimize Your Resume</span>
          </h2>
          <p className="text-lg text-secondary-600">
            Comprehensive ATS analysis powered by AI, designed to help you pass automated screening and land interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={feature.title} hover className="group">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">{feature.title}</h3>
                <p className="text-secondary-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="py-20 lg:py-28 bg-secondary-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
            How It Works in <span className="gradient-text">5 Simple Steps</span>
          </h2>
          <p className="text-lg text-secondary-600">
            From upload to application tracking, we guide you through the entire resume optimization journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((step, index) => (
            <div key={step.title} className="relative text-center">
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-700">{step.number}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-secondary-200 -z-10" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">{step.title}</h3>
              <p className="text-secondary-600 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureSection() {
  return (
    <section id="feature-details" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
            Powerful <span className="gradient-text">Analysis Features</span>
          </h2>
          <p className="text-lg text-secondary-600">
            Every analysis provides deep insights across multiple dimensions of your resume.
          </p>
        </div>

        <div className="space-y-12">
          {featureDetails.slice(0, 6).map((feature, index) => (
            <div key={feature.title} className={cn('flex flex-col lg:flex-row gap-8 items-center', index % 2 === 1 && 'lg:flex-row-reverse')}>
              <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-8 h-8 text-primary-600" />
              </div>
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">{feature.title}</h3>
                <p className="text-secondary-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureDetails.slice(6).map((feature) => (
            <Card key={feature.title} hover>
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center mb-3">
                  <feature.icon className="w-5 h-5 text-primary-600" />
                </div>
                <h3 className="font-semibold text-secondary-900 mb-2">{feature.title}</h3>
                <p className="text-secondary-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function ATSExplanation() {
  return (
    <section className="py-20 lg:py-28 bg-secondary-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
            Understanding <span className="gradient-text">ATS Scoring</span>
          </h2>
          <p className="text-lg text-secondary-600">
            Learn how Applicant Tracking Systems evaluate your resume and what factors matter most.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary-600" />
                What is ATS?
              </h3>
              <p className="text-secondary-600 mb-4">
                An Applicant Tracking System (ATS) is software used by employers to collect, sort, scan, and rank job applications. 
                Over 98% of Fortune 500 companies use ATS to filter resumes before a human ever sees them.
              </p>
              <h4 className="font-medium text-secondary-900 mb-2">How ATS Reads Your Resume:</h4>
              <ul className="space-y-2 text-secondary-600 text-sm">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success-500" /> Parses text content from your PDF</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success-500" /> Extracts sections (Experience, Education, Skills)</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success-500" /> Identifies keywords and skills</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success-500" /> Scores against job requirements</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success-500" /> Ranks candidates automatically</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-primary-600" />
                What Affects Your Score
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Keyword Match (25%)', desc: 'Job-relevant keywords found in your resume' },
                  { name: 'Skills Match (20%)', desc: 'Technical and soft skills alignment' },
                  { name: 'Experience Relevance (20%)', desc: 'Role and industry experience match' },
                  { name: 'ATS Formatting (15%)', desc: 'Parsable structure and standard headings' },
                  { name: 'Impact & Metrics (10%)', desc: 'Quantified achievements and results' },
                  { name: 'Wording (5%)', desc: 'Action verbs, clarity, professional tone' },
                  { name: 'Readability (5%)', desc: 'Sentence length, structure, flow' },
                ].map((item) => (
                  <div key={item.name} className="flex justify-between items-center p-3 bg-secondary-50 rounded-lg">
                    <span className="text-sm font-medium text-secondary-700">{item.name}</span>
                    <span className="text-sm text-secondary-500">{item.desc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

function BeforeAfter() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
            Real <span className="gradient-text">Before & After</span> Examples
          </h2>
          <p className="text-lg text-secondary-600">
            See how weak resume bullets transform into strong, quantified achievements.
          </p>
        </div>

        <div className="space-y-8 max-w-4xl mx-auto">
          {beforeAfter.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="bg-danger-50 border-r border-danger-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-1 bg-danger-100 text-danger-700 text-xs font-medium rounded">Before</span>
                    <ArrowUpRight className="w-4 h-4 text-danger-500" />
                    <span className="px-2 py-1 bg-success-100 text-success-700 text-xs font-medium rounded">After</span>
                  </div>
                  <p className="text-secondary-700 italic">"{item.before}"</p>
                </div>
                <div className="bg-success-50 p-6">
                  <p className="text-secondary-700 font-medium">"{item.after}"</p>
                  <div className="mt-4 pt-4 border-t border-success-200">
                    <h4 className="font-medium text-secondary-900 mb-2">Key Improvements:</h4>
                    <ul className="space-y-1 text-sm text-secondary-600">
                      {item.improvements.map((imp, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-success-500" />
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-secondary-600 mb-4">
            <strong>Note:</strong> These examples show structural improvements only. 
            Never fabricate achievements or metrics — only add real numbers from your actual experience.
          </p>
        </div>
      </div>
    </section>
  )
}

function DashboardPreview() {
  return (
    <section className="py-20 lg:py-28 bg-secondary-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
            Your <span className="gradient-text">Candidate Dashboard</span>
          </h2>
          <p className="text-lg text-secondary-600">
            Track your progress, monitor applications, and visualize your resume performance over time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-secondary-900">Average ATS Score</h3>
                <TrendingUp className="w-5 h-5 text-success-500" />
              </div>
              <ScoreCircle score={82} size="lg" label="Average Score" />
              <p className="text-sm text-secondary-500 mt-4 text-center">+5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-secondary-900">Applications</h3>
                <Briefcase className="w-5 h-5 text-primary-500" />
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary-900">24</div>
                <div className="text-sm text-secondary-500">Total Tracked</div>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                <div><div className="font-semibold text-primary-600">3</div><div>Interviews</div></div>
                <div><div className="font-semibold text-success-600">2</div><div>Offers</div></div>
                <div><div className="font-semibold text-warning-600">5</div><div>Screening</div></div>
                <div><div className="font-semibold text-secondary-600">14</div><div>Applied</div></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-secondary-900">Resume Scans</h3>
                <FileText className="w-5 h-5 text-primary-500" />
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary-900">18</div>
                <div className="text-sm text-secondary-500">Total Analyses</div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Highest Score</span><span className="font-semibold text-success-600">94</span></div>
                <div className="flex justify-between"><span>Latest Score</span><span className="font-semibold text-primary-600">87</span></div>
                <div className="flex justify-between"><span>Improvement</span><span className="font-semibold text-success-600">+12 pts</span></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-secondary-900 mb-6">Recent Scan History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-secondary-200 text-left text-secondary-500">
                    <th className="pb-3 font-medium">Job Title</th>
                    <th className="pb-3 font-medium text-center">ATS Score</th>
                    <th className="pb-3 font-medium text-center">Match</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {[
                    { title: 'Senior Frontend Engineer', company: 'TechCorp', score: 94, match: 88, date: '2024-01-15' },
                    { title: 'Full Stack Developer', company: 'StartupXYZ', score: 87, match: 82, date: '2024-01-10' },
                    { title: 'React Developer', company: 'Digital Agency', score: 79, match: 75, date: '2024-01-05' },
                    { title: 'Frontend Engineer', company: 'FinTech Inc', score: 91, match: 85, date: '2024-01-02' },
                  ].map((scan, i) => (
                    <tr key={i} className="hover:bg-secondary-50">
                      <td className="py-4">
                        <div className="font-medium text-secondary-900">{scan.title}</div>
                        <div className="text-secondary-500 text-sm">{scan.company}</div>
                      </td>
                      <td className="py-4 text-center">
                        <span className={cn('font-semibold px-3 py-1 rounded-full text-xs', scan.score >= 80 ? 'bg-success-100 text-success-700' : scan.score >= 60 ? 'bg-warning-100 text-warning-700' : 'bg-danger-100 text-danger-700')}>
                          {scan.score}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <span className="font-medium text-primary-600">{scan.match}%</span>
                      </td>
                      <td className="py-4 text-secondary-500">{scan.date}</td>
                      <td className="py-4 text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function ATSGuideSection() {
  return (
    <section id="ats-guide" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
            Essential <span className="gradient-text">ATS Optimization Tips</span>
          </h2>
          <p className="text-lg text-secondary-600">
            Quick wins to improve your resume ATS compatibility immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {atsTips.map((tip, index) => (
            <Card key={index} hover>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-sm">{index + 1}</span>
                  </div>
                  <p className="text-secondary-700 text-sm leading-relaxed">{tip}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" asChild size="lg">
            <Link to="/ats-guide">Read Full ATS Guide <ArrowRight className="w-5 h-5" /></Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="py-20 lg:py-28 bg-secondary-900 relative overflow-hidden">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/20 rounded-full blur-3xl" />
      </div>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Ready to <span className="gradient-text">Transform Your Resume</span>?
        </h2>
        <p className="text-lg text-secondary-300 mb-10 max-w-2xl mx-auto">
          Join thousands of job seekers who use ResuMatch AI to optimize their resumes, 
          track applications, and land more interviews — completely free.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild className="bg-white text-secondary-900 hover:bg-secondary-100">
            <Link to="/analyzer">Analyze Your Resume Free <ArrowRight className="w-5 h-5" /></Link>
          </Button>
          <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 border-white/20" asChild>
            <Link to="/register">Create Free Account</Link>
          </Button>
        </div>
        <p className="mt-6 text-sm text-secondary-500">
          No credit card required · Unlimited scans · Free forever
        </p>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <TrustFeatures />
      <HowItWorks />
      <FeatureSection />
      <ATSExplanation />
      <BeforeAfter />
      <DashboardPreview />
      <ATSGuideSection />
      <FinalCTA />
    </div>
  )
}