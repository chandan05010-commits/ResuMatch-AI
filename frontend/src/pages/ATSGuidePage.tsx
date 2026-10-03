import React, { useState } from 'react'
import {
  Search,
  Shield,
  FileText,
  Zap,
  Target,
  Brain,
  BarChart,
  Lightbulb,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Info,
  ArrowRight,
} from 'lucide-react'

import {
  Card,
  CardHeader,
  CardContent,
} from '../components/ui/Card'

import { Badge } from '../components/ui/Badge'
import { cn } from '../utils/helpers'

const guideSections = [
  {
    id: 'what-is-ats',
    title: 'What is ATS?',
    icon: Search,
    content: `
      <p class="mb-4">An Applicant Tracking System (ATS) is software used by employers to collect, sort, scan, and rank job applications. Over 98% of Fortune 500 companies and a growing number of small-to-medium businesses use ATS to filter resumes before a human ever sees them.</p>

      <p class="mb-4">Think of ATS as a digital gatekeeper. When you submit your resume online, it doesn't go straight to a recruiter's inbox. First, it passes through the ATS, which parses your resume, extracts key information, and scores it against the job requirements.</p>

      <div class="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
        <h4 class="font-semibold text-primary-900 mb-2">Key Statistics:</h4>

        <ul class="list-disc list-inside text-primary-800 space-y-1">
          <li>75% of resumes are rejected by ATS before a human sees them</li>
          <li>Average recruiter spends only 6-7 seconds scanning a resume</li>
          <li>ATS adoption has grown 500% in the last decade</li>
        </ul>
      </div>
    `,
  },

  {
    id: 'how-ats-works',
    title: 'How ATS Works',
    icon: Shield,
    content: `
      <p class="mb-4">Understanding the ATS pipeline helps you optimize your resume for both machines and humans:</p>

      <ol class="list-decimal list-inside space-y-4 mb-6">
        <li>
          <strong>Parsing:</strong> The ATS extracts text from your PDF/Word document, attempting to identify sections like Contact Info, Experience, Education, and Skills.
        </li>

        <li>
          <strong>Keyword Extraction:</strong> It identifies keywords from the job description (skills, technologies, certifications, action verbs) and searches for them in your resume.
        </li>

        <li>
          <strong>Scoring:</strong> Each resume receives a match score based on keyword frequency, skill alignment, experience relevance, and formatting compliance.
        </li>

        <li>
          <strong>Ranking:</strong> Candidates are ranked by score. Only top-ranked resumes (typically top 10-20%) are forwarded to human recruiters.
        </li>
      </ol>

      <div class="bg-warning-50 border border-warning-200 rounded-lg p-4">
        <h4 class="font-semibold text-warning-900 mb-2">
          ⚠️ Common Parsing Failures:
        </h4>

        <ul class="list-disc list-inside text-warning-800 space-y-1">
          <li>Multi-column layouts confuse section detection</li>
          <li>Tables, text boxes, and graphics often break parsing</li>
          <li>Non-standard fonts or special characters may render as gibberish</li>
          <li>Headers/footers may be ignored or duplicated</li>
        </ul>
      </div>
    `,
  },

  {
    id: 'keyword-optimization',
    title: 'Keyword Optimization',
    icon: Target,
    content: `
      <p class="mb-4">Keywords are the single most important factor in ATS scoring. Here's how to optimize:</p>

      <h4 class="font-semibold text-secondary-900 mb-3">
        1. Extract Keywords from Job Descriptions
      </h4>

      <ul class="list-disc list-inside text-secondary-600 space-y-2 mb-4">
        <li>Copy the job description into a word cloud tool or manually highlight repeated terms</li>
        <li>Focus on: hard skills (Python, AWS, React), certifications (PMP, AWS Certified), methodologies (Agile, Scrum)</li>
        <li>Include both acronyms and full forms (e.g., "CI/CD" and "Continuous Integration/Continuous Deployment")</li>
      </ul>

      <h4 class="font-semibold text-secondary-900 mb-3">
        2. Natural Integration
      </h4>

      <ul class="list-disc list-inside text-secondary-600 space-y-2 mb-4">
        <li>Don't keyword stuff — ATS detects unnatural repetition</li>
        <li>Weave keywords into accomplishment bullets: "Developed <strong>React</strong> components using <strong>TypeScript</strong> and <strong>Redux</strong>"</li>
        <li>Use a dedicated Skills section for clean keyword listing</li>
      </ul>

      <h4 class="font-semibold text-secondary-900 mb-3">
        3. Keyword Categories to Cover
      </h4>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        <Badge variant="primary">Technical Skills</Badge>
        <Badge variant="secondary">Soft Skills</Badge>
        <Badge variant="success">Certifications</Badge>
        <Badge variant="warning">Methodologies</Badge>
        <Badge variant="danger">Tools</Badge>
        <Badge variant="outline">Languages</Badge>
      </div>
    `,
  },

  {
    id: 'formatting',
    title: 'ATS-Friendly Formatting',
    icon: FileText,
    content: `
      <p class="mb-4">
        Formatting issues are the #1 reason qualified candidates get rejected by ATS. Follow these rules:
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        <div class="bg-success-50 border border-success-200 rounded-lg p-4">
          <h4 class="font-semibold text-success-900 mb-3">
            ✓ DO
          </h4>

          <ul class="list-disc list-inside text-success-800 space-y-1 text-sm">
            <li>Single-column layout</li>
            <li>Standard section headings (Experience, Education, Skills)</li>
            <li>Standard fonts (Arial, Calibri, Helvetica, Times New Roman)</li>
            <li>Consistent date format (MM/YYYY or Month YYYY)</li>
            <li>Simple bullet points (• or -)</li>
            <li>Clear contact info at top</li>
            <li>Save as PDF (unless .docx requested)</li>
          </ul>
        </div>

        <div class="bg-danger-50 border border-danger-200 rounded-lg p-4">
          <h4 class="font-semibold text-danger-900 mb-3">
            DON'T
          </h4>

          <ul class="list-disc list-inside text-danger-800 space-y-1 text-sm">
            <li>Multi-column layouts</li>
            <li>Tables, text boxes, or columns</li>
            <li>Graphics, icons, or images</li>
            <li>Headers/footers with content</li>
            <li>Fancy fonts or font variations</li>
            <li>Special characters (★, ◆, →)</li>
            <li>White text on dark backgrounds</li>
            <li>Password-protected PDFs</li>
          </ul>
        </div>

      </div>

      <h4 class="font-semibold text-secondary-900 mb-3">
        Section Heading Standards
      </h4>

      <p class="text-secondary-600 mb-4">
        Use these exact headings for best ATS recognition:
      </p>

      <div class="flex flex-wrap gap-2 mb-4">
        ${[
          'Contact Information',
          'Professional Summary',
          'Experience',
          'Education',
          'Skills',
          'Certifications',
          'Projects',
          'Publications',
          'Awards',
        ]
          .map(
            (h) =>
              `<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-secondary-700">${h}</span>`
          )
          .join('')}
      </div>
    `,
  },

  {
    id: 'action-verbs',
    title: 'Action Verbs & Impact',
    icon: Zap,
    content: `
      <p class="mb-4">
        Strong action verbs and quantified achievements dramatically improve both ATS scores and human reviewer impression.
      </p>

      <h4 class="font-semibold text-secondary-900 mb-3">
        Weak → Strong Verb Replacements
      </h4>

      <div class="overflow-x-auto mb-6">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-secondary-200 text-left">
              <th class="pb-2 font-medium">Weak Verb</th>
              <th class="pb-2 font-medium">Strong Alternatives</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-secondary-100">
            <tr>
              <td class="py-2 text-secondary-600">Worked on</td>
              <td class="py-2 text-success-700">Developed, Built, Engineered, Created, Implemented</td>
            </tr>

            <tr>
              <td class="py-2 text-secondary-600">Helped</td>
              <td class="py-2 text-success-700">Supported, Assisted, Enabled, Facilitated, Contributed to</td>
            </tr>

            <tr>
              <td class="py-2 text-secondary-600">Made</td>
              <td class="py-2 text-success-700">Produced, Generated, Constructed, Designed, Formulated</td>
            </tr>

            <tr>
              <td class="py-2 text-secondary-600">Responsible for</td>
              <td class="py-2 text-success-700">Led, Managed, Directed, Oversaw, Owned, Spearheaded</td>
            </tr>

            <tr>
              <td class="py-2 text-secondary-600">Did</td>
              <td class="py-2 text-success-700">Executed, Performed, Completed, Achieved, Delivered</td>
            </tr>

            <tr>
              <td class="py-2 text-secondary-600">Improved</td>
              <td class="py-2 text-success-700">Optimized, Enhanced, Refined, Upgraded, Transformed</td>
            </tr>

            <tr>
              <td class="py-2 text-secondary-600">Managed</td>
              <td class="py-2 text-success-700">Directed, Supervised, Orchestrated, Coordinated, Governed</td>
            </tr>

            <tr>
              <td class="py-2 text-secondary-600">Analyzed</td>
              <td class="py-2 text-success-700">Evaluated, Assessed, Investigated, Diagnosed, Examined</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4 class="font-semibold text-secondary-900 mb-3">
        The STAR Method for Bullets
      </h4>

      <p class="text-secondary-600 mb-4">
        Structure every bullet:
        <strong>S</strong>ituation +
        <strong>T</strong>ask +
        <strong>A</strong>ction +
        <strong>R</strong>esult
      </p>

      <div class="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <p class="text-primary-800">
          <strong>Before:</strong> "Worked on website redesign project"
        </p>

        <p class="text-success-800 mt-1">
          <strong>After:</strong> "Led complete redesign of company website using React/Next.js, improving page load speed by 60% and increasing conversion rate 25%"
        </p>
      </div>
    `,
  },

  {
    id: 'metrics',
    title: 'Quantifying Achievements',
    icon: BarChart,
    content: `
      <p class="mb-4">
        Numbers catch both ATS algorithms and human attention. Every bullet should answer: "How much? How many? How often?"
      </p>

      <h4 class="font-semibold text-secondary-900 mb-3">
        Metrics Categories to Track
      </h4>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

        <div class="bg-white border border-secondary-200 rounded-lg p-4">
          <h4 class="font-semibold text-secondary-900 mb-2">Performance</h4>

          <ul class="list-disc list-inside text-secondary-600 text-sm space-y-1">
            <li>Latency reduction (ms, %)</li>
            <li>Throughput increase (req/sec)</li>
            <li>Error rate reduction (%)</li>
            <li>Uptime improvement (%)</li>
          </ul>
        </div>

        <div class="bg-white border border-secondary-200 rounded-lg p-4">
          <h4 class="font-semibold text-secondary-900 mb-2">Scale</h4>

          <ul class="list-disc list-inside text-secondary-600 text-sm space-y-1">
            <li>Users served (MAU, DAU)</li>
            <li>Data processed (TB, PB)</li>
            <li>Concurrent connections</li>
            <li>Geographic regions</li>
          </ul>
        </div>

        <div class="bg-white border border-secondary-200 rounded-lg p-4">
          <h4 class="font-semibold text-secondary-900 mb-2">Business Impact</h4>

          <ul class="list-disc list-inside text-secondary-600 text-sm space-y-1">
            <li>Revenue generated ($)</li>
            <li>Cost savings ($, %)</li>
            <li>Conversion rate (%)</li>
            <li>Retention improvement (%)</li>
          </ul>
        </div>

        <div class="bg-white border border-secondary-200 rounded-lg p-4">
          <h4 class="font-semibold text-secondary-900 mb-2">Efficiency</h4>

          <ul class="list-disc list-inside text-secondary-600 text-sm space-y-1">
            <li>Time saved (hours/week)</li>
            <li>Process automation (%)</li>
            <li>Manual effort reduction</li>
            <li>Deployment frequency</li>
          </ul>
        </div>

      </div>

      <div class="bg-warning-50 border border-warning-200 rounded-lg p-4">
        <h4 class="font-semibold text-warning-900 mb-2">
          ⚠️ Never Invent Metrics
        </h4>

        <p class="text-warning-800">
          If you don't have exact numbers, use ranges ("reduced latency by 40-50%") or qualitative descriptions ("significantly improved performance"). Never fabricate specific numbers — background checks will catch this.
        </p>
      </div>
    `,
  },

  {
    id: 'common-mistakes',
    title: 'Common Mistakes to Avoid',
    icon: AlertCircle,
    content: `
      <div class="space-y-6">

        <div class="bg-danger-50 border border-danger-200 rounded-lg p-4">
          <h4 class="font-semibold text-danger-900 mb-3">
            ⚠ 1. Keyword Stuffing
          </h4>

          <p class="text-danger-800">
            Repeating "Python Python Python" or hiding white-text keywords gets you flagged as spam. Use keywords naturally in context.
          </p>
        </div>

        <div class="bg-danger-50 border border-danger-200 rounded-lg p-4">
          <h4 class="font-semibold text-danger-900 mb-3">
            ⚠ 2. Creative Section Headings
          </h4>

          <p class="text-danger-800">
            "My Journey" instead of "Experience" or "What I Know" instead of "Skills" confuses ATS parsers. Stick to standard headings.
          </p>
        </div>

        <div class="bg-danger-50 border border-danger-200 rounded-lg p-4">
          <h4 class="font-semibold text-danger-900 mb-3">
            ⚠ 3. Multi-Column Layouts
          </h4>

          <p class="text-danger-800">
            Two-column designs look modern but can be harder for some parsers to interpret. Use a simple single-column layout when ATS compatibility is the priority.
          </p>
        </div>

        <div class="bg-danger-50 border border-danger-200 rounded-lg p-4">
          <h4 class="font-semibold text-danger-900 mb-3">
            ⚠ 4. Graphics & Icons
          </h4>

          <p class="text-danger-800">
            Skill bars, star ratings, and company logos can interfere with text extraction. Keep important information in text.
          </p>
        </div>

        <div class="bg-danger-50 border border-danger-200 rounded-lg p-4">
          <h4 class="font-semibold text-danger-900 mb-3">
            ⚠ 5. Inconsistent Dates
          </h4>

          <p class="text-danger-800">
            Mixing "Jan 2023", "01/2023", and "2023" can make dates harder to interpret. Pick one format and use it consistently.
          </p>
        </div>

        <div class="bg-danger-50 border border-danger-200 rounded-lg p-4">
          <h4 class="font-semibold text-danger-900 mb-3">
            ⚠ 6. Missing Contact Info
          </h4>

          <p class="text-danger-800">
            Keep your name, phone, email, location, and relevant professional links in a clear text-based contact section.
          </p>
        </div>

        <div class="bg-danger-50 border border-danger-200 rounded-lg p-4">
          <h4 class="font-semibold text-danger-900 mb-3">
            ⚠ 7. Passive Language
          </h4>

          <p class="text-danger-800">
            "Was responsible for managing..." → "Managed..." Strong action-oriented wording is clearer and more impactful.
          </p>
        </div>

        <div class="bg-danger-50 border border-danger-200 rounded-lg p-4">
          <h4 class="font-semibold text-danger-900 mb-3">
            ⚠ 8. No Quantified Results
          </h4>

          <p class="text-danger-800">
            Bullets without measurable outcomes can be less informative. Add real metrics when you have them.
          </p>
        </div>

      </div>
    `,
  },

  {
    id: 'checklist',
    title: 'Pre-Submission Checklist',
    icon: CheckCircle,
    content: `
      <p class="mb-4">
        Run through this checklist before every application:
      </p>

      <div class="space-y-3">

        <label class="flex items-start gap-3">
          <input type="checkbox" class="mt-1 w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
          <span class="text-secondary-700">Single-column layout only</span>
        </label>

        <label class="flex items-start gap-3">
          <input type="checkbox" class="mt-1 w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
          <span class="text-secondary-700">Standard section headings (Experience, Education, Skills)</span>
        </label>

        <label class="flex items-start gap-3">
          <input type="checkbox" class="mt-1 w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
          <span class="text-secondary-700">Contact info at top: Name, Phone, Email, Location, LinkedIn</span>
        </label>

        <label class="flex items-start gap-3">
          <input type="checkbox" class="mt-1 w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
          <span class="text-secondary-700">Professional summary tailored to target role</span>
        </label>

        <label class="flex items-start gap-3">
          <input type="checkbox" class="mt-1 w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
          <span class="text-secondary-700">Keywords from job description integrated naturally</span>
        </label>

        <label class="flex items-start gap-3">
          <input type="checkbox" class="mt-1 w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
          <span class="text-secondary-700">Dedicated Skills section with categorized skills</span>
        </label>

        <label class="flex items-start gap-3">
          <input type="checkbox" class="mt-1 w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
          <span class="text-secondary-700">All bullets start with strong action verbs</span>
        </label>

        <label class="flex items-start gap-3">
          <input type="checkbox" class="mt-1 w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
          <span class="text-secondary-700">At least 3-5 quantified achievements with metrics</span>
        </label>

        <label class="flex items-start gap-3">
          <input type="checkbox" class="mt-1 w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
          <span class="text-secondary-700">Consistent date format (MM/YYYY) throughout</span>
        </label>

        <label class="flex items-start gap-3">
          <input type="checkbox" class="mt-1 w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
          <span class="text-secondary-700">No tables, columns, graphics, or text boxes</span>
        </label>

        <label class="flex items-start gap-3">
          <input type="checkbox" class="mt-1 w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
          <span class="text-secondary-700">Standard font (Arial, Calibri, Helvetica) 10-12pt</span>
        </label>

        <label class="flex items-start gap-3">
          <input type="checkbox" class="mt-1 w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
          <span class="text-secondary-700">No special characters, icons, or skill bars</span>
        </label>

        <label class="flex items-start gap-3">
          <input type="checkbox" class="mt-1 w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
          <span class="text-secondary-700">Saved as PDF (not .docx unless requested)</span>
        </label>

        <label class="flex items-start gap-3">
          <input type="checkbox" class="mt-1 w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
          <span class="text-secondary-700">File name: FirstName_LastName_Resume.pdf</span>
        </label>

        <label class="flex items-start gap-3">
          <input type="checkbox" class="mt-1 w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
          <span class="text-secondary-700">Tested with free ATS scanner (optional but recommended)</span>
        </label>

      </div>
    `,
  },

  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    icon: Info,
    content: `
      <dl class="space-y-6">

        <div>
          <dt class="font-semibold text-secondary-900">
            Should I tailor my resume for every application?
          </dt>
          <dd class="text-secondary-600 mt-1">
            Yes. Customizing keywords and highlighting relevant experience for each role can improve relevance to the target job.
          </dd>
        </div>

        <div>
          <dt class="font-semibold text-secondary-900">
            Is a two-page resume okay?
          </dt>
          <dd class="text-secondary-600 mt-1">
            For experienced professionals, two pages can be appropriate. Entry-level candidates often benefit from keeping the resume concise.
          </dd>
        </div>

        <div>
          <dt class="font-semibold text-secondary-900">
            Should I include a photo?
          </dt>
          <dd class="text-secondary-600 mt-1">
            Follow the conventions and requirements of the country and employer. For many ATS-driven applications, a photo is unnecessary.
          </dd>
        </div>

        <div>
          <dt class="font-semibold text-secondary-900">
            What file format is best?
          </dt>
          <dd class="text-secondary-600 mt-1">
            PDF is commonly used for preserving formatting. If an employer specifically requests another format, follow the application instructions.
          </dd>
        </div>

        <div>
          <dt class="font-semibold text-secondary-900">
            How many keywords should I include?
          </dt>
          <dd class="text-secondary-600 mt-1">
            Focus on relevant keywords from the job description and use them naturally rather than repeating them excessively.
          </dd>
        </div>

        <div>
          <dt class="font-semibold text-secondary-900">
            Do cover letters go through ATS?
          </dt>
          <dd class="text-secondary-600 mt-1">
            Some application systems process cover letters as well. If one is requested, keep it relevant to the role.
          </dd>
        </div>

        <div>
          <dt class="font-semibold text-secondary-900">
            Can I use a creative resume for design roles?
          </dt>
          <dd class="text-secondary-600 mt-1">
            Consider keeping an ATS-friendly version for application portals and a portfolio or creative version when appropriate.
          </dd>
        </div>

      </dl>
    `,
  },
]

export default function ATSGuidePage() {
  const [expandedSection, setExpandedSection] =
    useState<string | null>('what-is-ats')

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-secondary-900 mb-4">
          Complete ATS Optimization Guide
        </h1>

        <p className="text-lg text-secondary-600">
          Everything you need to know to improve your resume's ATS compatibility and make your application easier to parse.
        </p>
      </div>

      <div className="space-y-4">

        {guideSections.map((section) => {
          const isExpanded =
            expandedSection === section.id

          return (
            <Card
              key={section.id}
              className={cn(
                isExpanded &&
                  'ring-2 ring-primary-200'
              )}
            >

              <CardHeader
                className="cursor-pointer py-4"
                onClick={() =>
                  setExpandedSection(
                    isExpanded
                      ? null
                      : section.id
                  )
                }
              >

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">

                      <section.icon className="w-5 h-5 text-primary-600" />

                    </div>

                    <h3 className="text-lg font-semibold text-secondary-900">
                      {section.title}
                    </h3>

                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-secondary-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-secondary-400" />
                  )}

                </div>

              </CardHeader>

              {isExpanded && (
                <CardContent className="prose prose-secondary max-w-none">

                  <div
                    dangerouslySetInnerHTML={{
                      __html: section.content,
                    }}
                  />

                </CardContent>
              )}

            </Card>
          )
        })}

      </div>

      <Card className="bg-primary-50 border-primary-100">

        <CardContent className="p-6 text-center">

          <h3 className="text-xl font-semibold text-secondary-900 mb-2">
            Ready to Optimize Your Resume?
          </h3>

          <p className="text-secondary-600 mb-4">
            Put this knowledge into practice with our free AI-powered analyzer.
          </p>

          <a
            href="/analyzer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Analyze My Resume
            <ArrowRight className="w-5 h-5" />
          </a>

        </CardContent>

      </Card>

    </div>
  )
}