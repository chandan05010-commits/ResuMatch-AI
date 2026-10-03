import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  Download,
  Share2,
  Trash2,
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  Target,
  Search,
  Brain,
  Shield,
  Zap,
  FileText,
  BarChart,
  CheckCircle,
  AlertCircle,
  Info,
  X,
} from 'lucide-react'

import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../components/ui/Card'
import { Tabs, TabPanel } from '../components/ui/Tabs'
import { ScoreCircle, ScoreBar } from '../components/ui/ScoreCircle'
import { Modal } from '../components/ui/Modal'
import { Dropdown } from '../components/ui/Dropdown'
import { api, analysisApi } from '../services/api'

import type {
  AnalysisResult,
  CategoryScores,
} from '../types'

import { cn } from '../utils/helpers'


const categoryLabels: Record<keyof CategoryScores, string> = {
  keyword_match: 'Keyword Match',
  skills_match: 'Skills Match',
  experience_relevance: 'Experience Relevance',
  ats_formatting: 'ATS Formatting',
  impact_metrics: 'Impact & Metrics',
  wording: 'Wording',
  readability: 'Readability',
}


const categoryIcons: Record<
  keyof CategoryScores,
  React.ComponentType<{ className?: string }>
> = {
  keyword_match: Target,
  skills_match: Brain,
  experience_relevance: Briefcase,
  ats_formatting: Shield,
  impact_metrics: BarChart,
  wording: FileText,
  readability: Search,
}


const tabConfig = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Target,
  },
  {
    id: 'keywords',
    label: 'Keywords',
    icon: Search,
  },
  {
    id: 'skills',
    label: 'Skills',
    icon: Brain,
  },
  {
    id: 'formatting',
    label: 'Formatting',
    icon: Shield,
  },
  {
    id: 'wording',
    label: 'Wording',
    icon: FileText,
  },
  {
    id: 'bullets',
    label: 'Bullets',
    icon: Zap,
  },
  {
    id: 'match',
    label: 'Job Match',
    icon: Target,
  },
  {
    id: 'plan',
    label: 'Improvement Plan',
    icon: ArrowUpRight,
  },
] as const


export default function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [
    keywordFilter,
    setKeywordFilter,
  ] = useState<
    'all' | 'matched' | 'missing' | 'important'
  >('all')


  useEffect(() => {
    if (id) {
      fetchAnalysis()
    }
  }, [id])


  const fetchAnalysis = async () => {
    try {
      let lastError: unknown = null

      for (let attempt = 0; attempt < 20; attempt += 1) {
        try {
          const response = await api.get(`/api/analysis/${id}/result`)
          setAnalysis(response.data)
          return
        } catch (error: unknown) {
          lastError = error

          const status = (
            error as { response?: { status?: number } }
          ).response?.status

          if (status !== 404 || attempt === 19) {
            throw error
          }

          await new Promise((resolve) => setTimeout(resolve, 1500))
        }
      }

      throw lastError
    } catch (error: unknown) {
      const axiosError = error as {
        response?: {
          data?: {
            detail?: string
          }
        }
      }

      const message =
        axiosError.response?.data?.detail ||
        'Failed to load analysis'

      toast.error(message)
      navigate('/analyzer')
    } finally {
      setIsLoading(false)
    }
  }


  const handleDelete = async () => {
    try {
      await analysisApi.delete(id!)

      toast.success('Analysis deleted')
      navigate('/history')
    } catch {
      toast.error('Failed to delete analysis')
    } finally {
      setShowDeleteModal(false)
    }
  }


  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">
              Analysis Results
            </h1>

            <p className="text-secondary-600">
              Loading your analysis...
            </p>
          </div>
        </div>

        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }


  if (!analysis) {
    return (
      <div className="max-w-5xl mx-auto text-center py-12">
        <AlertCircle className="w-12 h-12 text-danger-500 mx-auto mb-4" />

        <h2 className="text-xl font-semibold text-secondary-900 mb-2">
          Analysis not found
        </h2>

        <p className="text-secondary-600 mb-6">
          This analysis may have been deleted or never existed.
        </p>

        <Button asChild>
          <Link to="/analyzer">
            Analyze Another Resume
          </Link>
        </Button>
      </div>
    )
  }


  const {
    overall_score,
    category_scores,
    keyword_analysis,
    skill_analysis,
    wording_analysis,
    metrics_analysis,
    formatting_analysis,
    bullet_analysis,
    job_match,
    improvement_plan,
  } = analysis


  const filteredKeywords = () => {
    switch (keywordFilter) {
      case 'matched':
        return (keyword_analysis?.matched_keywords ?? [])

      case 'missing':
        return (keyword_analysis?.missing_keywords ?? [])

      case 'important':
        return (keyword_analysis?.important_keywords ?? [])

      default:
        return [
          ...(keyword_analysis?.matched_keywords ?? []),
          ...(keyword_analysis?.missing_keywords ?? []),
          ...(keyword_analysis?.important_keywords ?? []),
        ]
    }
  }


  const escapeHtml = (value: unknown): string => {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  const handleExportPdf = () => {
    const printWindow = window.open(
      '',
      '_blank',
      'width=1000,height=800'
    )

    if (!printWindow) {
      toast.error('Please allow pop-ups to export the PDF.')
      return
    }

    const categories = Object.entries(category_scores ?? {})
      .map(([key, score]) => {
        const label =
          categoryLabels[key as keyof CategoryScores] ?? key

        return `
          <div class="score-row">
            <div>
              <strong>${escapeHtml(label)}</strong>
            </div>
            <div class="score-value">${escapeHtml(score)}%</div>
          </div>
        `
      })
      .join('')

    const matchedKeywords =
      keyword_analysis?.matched_keywords ?? []

    const missingKeywords =
      keyword_analysis?.missing_keywords ?? []

    const importantKeywords =
      keyword_analysis?.important_keywords ?? []

    const renderKeywordList = (
      title: string,
      items: string[],
      className: string
    ) => `
      <section>
        <h3>${escapeHtml(title)}</h3>
        ${
          items.length
            ? `<div class="chips">
                ${items
                  .map(
                    (item) =>
                      `<span class="chip ${className}">${escapeHtml(item)}</span>`
                  )
                  .join('')}
              </div>`
            : '<p class="muted">None</p>'
        }
      </section>
    `

    const skillsSections = [
      {
        title: 'Matched Skills',
        data: skill_analysis?.matched_skills ?? [],
      },
      {
        title: 'Missing Skills',
        data: skill_analysis?.missing_skills ?? [],
      },
      {
        title: 'Additional Skills',
        data: skill_analysis?.additional_skills ?? [],
      },
    ]
      .map(
        ({ title, data }) => `
          <section>
            <h3>${escapeHtml(title)}</h3>
            ${
              data.length
                ? data
                    .map(
                      (category) => `
                        <div class="skill-category">
                          <strong>${escapeHtml(category.category)}</strong>
                          <div class="chips">
                            ${(category.skills ?? [])
                              .map(
                                (skill) =>
                                  `<span class="chip neutral">${escapeHtml(
                                    skill
                                  )}</span>`
                              )
                              .join('')}
                          </div>
                        </div>
                      `
                    )
                    .join('')
                : '<p class="muted">None</p>'
            }
          </section>
        `
      )
      .join('')

    const formattingChecks = (
      formatting_analysis?.checks ?? []
    )
      .map(
        (check) => `
          <div class="item">
            <strong>${escapeHtml(check.check)}</strong>
            <span class="status ${escapeHtml(check.status)}">
              ${escapeHtml(check.status)}
            </span>
            <p>${escapeHtml(check.message)}</p>
          </div>
        `
      )
      .join('')

    const weakWording = (
      wording_analysis?.weak_wording ?? []
    )
      .map(
        (issue) => `
          <div class="item">
            <strong>${escapeHtml(issue.original)}</strong>
            <p><b>Problem:</b> ${escapeHtml(issue.problem)}</p>
            <p><b>Why it matters:</b> ${escapeHtml(issue.why_it_matters)}</p>
            <p><b>Suggestion:</b> ${escapeHtml(
              issue.suggested_improvement
            )}</p>
          </div>
        `
      )
      .join('')

    const repeatedWords = (
      wording_analysis?.repeated_words ?? []
    )
      .map(
        (item) =>
          `<span class="chip warning">${escapeHtml(
            item.word
          )} (${escapeHtml(item.count)}x)</span>`
      )
      .join('')

    const passiveVoice = (
      wording_analysis?.passive_voice ?? []
    )
      .map(
        (phrase) =>
          `<span class="chip neutral">${escapeHtml(
            phrase
          )}</span>`
      )
      .join('')

    const bullets = (bullet_analysis ?? [])
      .map(
        (bullet, index) => `
          <div class="item">
            <div class="item-header">
              <strong>Bullet ${index + 1}</strong>
              <span class="status ${escapeHtml(
                bullet.priority
              )}">
                ${escapeHtml(bullet.priority)} priority
              </span>
            </div>
            <p><b>Original:</b> ${escapeHtml(
              bullet.original
            )}</p>
            ${
              (bullet.problems ?? []).length
                ? `<p><b>Issues:</b> ${escapeHtml(
                    bullet.problems.join(', ')
                  )}</p>`
                : ''
            }
            <p><b>Suggested improvement:</b> ${escapeHtml(
              bullet.suggested_improvement
            )}</p>
            <p><b>Quality score:</b> ${escapeHtml(
              bullet.quality_score
            )}/100</p>
          </div>
        `
      )
      .join('')

    const improvementSections = [
      {
        title: 'High Priority',
        items: improvement_plan?.high_priority ?? [],
      },
      {
        title: 'Medium Priority',
        items: improvement_plan?.medium_priority ?? [],
      },
      {
        title: 'Low Priority',
        items: improvement_plan?.low_priority ?? [],
      },
    ]
      .map(
        ({ title, items }) => `
          <section>
            <h3>${escapeHtml(title)}</h3>
            ${
              items.length
                ? items
                    .map(
                      (item) => `
                        <div class="item">
                          <strong>${escapeHtml(item.title)}</strong>
                          <p>${escapeHtml(item.description)}</p>
                          <p>
                            <b>Impact:</b> ${escapeHtml(item.impact)}
                            &nbsp;&nbsp;
                            <b>Effort:</b> ${escapeHtml(item.effort)}
                          </p>
                        </div>
                      `
                    )
                    .join('')
                : '<p class="muted">No items</p>'
            }
          </section>
        `
      )
      .join('')

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>ResuMatch AI - Analysis Report</title>
          <style>
            @page {
              size: A4;
              margin: 14mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              font-family: Arial, Helvetica, sans-serif;
              color: #172033;
              background: #ffffff;
              font-size: 12px;
              line-height: 1.55;
            }

            .page {
              max-width: 900px;
              margin: 0 auto;
            }

            .header {
              border-bottom: 2px solid #4338ca;
              padding-bottom: 14px;
              margin-bottom: 18px;
            }

            .brand {
              color: #4338ca;
              font-size: 22px;
              font-weight: 700;
              margin-bottom: 4px;
            }

            h1 {
              margin: 0;
              font-size: 24px;
            }

            h2 {
              margin: 22px 0 10px;
              font-size: 17px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
            }

            h3 {
              margin: 12px 0 7px;
              font-size: 14px;
            }

            .summary {
              display: grid;
              grid-template-columns: 170px 1fr;
              gap: 18px;
              margin-bottom: 18px;
            }

            .overall {
              border: 1px solid #e5e7eb;
              border-radius: 10px;
              padding: 18px;
              text-align: center;
            }

            .overall-score {
              font-size: 42px;
              font-weight: 800;
              color: #4338ca;
            }

            .muted {
              color: #64748b;
            }

            .score-row {
              display: flex;
              justify-content: space-between;
              gap: 10px;
              padding: 9px 0;
              border-bottom: 1px solid #eef2f7;
            }

            .score-value {
              font-weight: 700;
            }

            .chips {
              display: flex;
              flex-wrap: wrap;
              gap: 6px;
              margin-top: 6px;
            }

            .chip {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 999px;
              background: #eef2ff;
            }

            .chip.warning {
              background: #fef3c7;
            }

            .chip.danger {
              background: #fee2e2;
            }

            .chip.success {
              background: #dcfce7;
            }

            .chip.neutral {
              background: #f1f5f9;
            }

            .item {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 10px 12px;
              margin: 8px 0;
              page-break-inside: avoid;
            }

            .item-header {
              display: flex;
              justify-content: space-between;
              gap: 10px;
            }

            .status {
              font-size: 10px;
              padding: 3px 7px;
              border-radius: 999px;
              background: #f1f5f9;
              text-transform: capitalize;
            }

            .status.pass,
            .status.low {
              background: #dcfce7;
            }

            .status.warning,
            .status.medium {
              background: #fef3c7;
            }

            .status.fail,
            .status.high {
              background: #fee2e2;
            }

            .skill-category {
              margin-bottom: 10px;
            }

            p {
              margin: 5px 0;
            }

            .footer {
              margin-top: 30px;
              padding-top: 10px;
              border-top: 1px solid #e5e7eb;
              color: #64748b;
              text-align: center;
              font-size: 10px;
            }

            @media print {
              .page {
                max-width: none;
              }
            }
          </style>
        </head>

        <body>
          <div class="page">
            <div class="header">
              <div class="brand">ResuMatch AI</div>
              <h1>Analysis Results</h1>
              <div class="muted">
                ATS Resume Analysis Report
              </div>
            </div>

            <div class="summary">
              <div class="overall">
                <div class="overall-score">
                  ${escapeHtml(overall_score)}
                </div>
                <div>Overall ATS Score</div>
                <div class="muted">out of 100</div>
              </div>

              <div>
                <h2>Score Breakdown</h2>
                ${categories}
              </div>
            </div>

            <h2>Keyword Analysis</h2>
            ${renderKeywordList(
              'Matched Keywords',
              matchedKeywords,
              'success'
            )}
            ${renderKeywordList(
              'Missing Keywords',
              missingKeywords,
              'danger'
            )}
            ${renderKeywordList(
              'Important Keywords',
              importantKeywords,
              'warning'
            )}

            <h2>Skill Analysis</h2>
            ${skillsSections}

            <h2>ATS Formatting</h2>
            <p>
              <b>Overall rating:</b>
              ${escapeHtml(
                formatting_analysis?.overall_rating ?? 'Not available'
              )}
            </p>
            ${formattingChecks || '<p class="muted">No formatting checks available.</p>'}

            <h2>Wording Analysis</h2>
            ${
              weakWording ||
              '<p class="muted">No weak wording issues found.</p>'
            }

            ${
              passiveVoice
                ? `<h3>Passive Voice</h3>
                   <div class="chips">${passiveVoice}</div>`
                : ''
            }

            ${
              repeatedWords
                ? `<h3>Repeated Words</h3>
                   <div class="chips">${repeatedWords}</div>`
                : ''
            }

            <h2>Bullet Point Review</h2>
            ${bullets || '<p class="muted">No bullet analysis available.</p>'}

            <h2>Job Match</h2>
            <div class="item">
              <div class="score-row">
                <span>Overall Match</span>
                <strong>${escapeHtml(
                  job_match?.overall_match
                )}%</strong>
              </div>
              <div class="score-row">
                <span>Skill Match</span>
                <strong>${escapeHtml(
                  job_match?.skill_match
                )}%</strong>
              </div>
              <div class="score-row">
                <span>Keyword Match</span>
                <strong>${escapeHtml(
                  job_match?.keyword_match
                )}%</strong>
              </div>
              <div class="score-row">
                <span>Experience Match</span>
                <strong>${escapeHtml(
                  job_match?.experience_match
                )}%</strong>
              </div>
              <div class="score-row">
                <span>Education Match</span>
                <strong>${escapeHtml(
                  job_match?.education_match
                )}%</strong>
              </div>
              <p>
                ${escapeHtml(job_match?.explanation)}
              </p>
            </div>

            <h2>Improvement Plan</h2>
            ${improvementSections}

            <div class="footer">
              Generated by ResuMatch AI
            </div>
          </div>

          <script>
            window.addEventListener('load', function () {
              setTimeout(function () {
                window.print()
              }, 250)
            })
          </script>
        </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  }


  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div>
            <h1 className="text-3xl font-bold text-secondary-900">
              Analysis Results
            </h1>

            <p className="text-secondary-600">
              ATS Score: {overall_score}/100
            </p>
          </div>
        </div>


        <div className="flex items-center gap-2">

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>

          <Button
  variant="outline"
  size="sm"
  onClick={async () => {
    const shareUrl = window.location.href

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'ResuMatch AI - Analysis Results',
          text: `ATS Score: ${overall_score}/100`,
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Analysis link copied to clipboard!')
      }
    } catch (error) {
      // User cancelled the native share dialog
      if (
        error instanceof DOMException &&
        error.name === 'AbortError'
      ) {
        return
      }

      try {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Analysis link copied to clipboard!')
      } catch {
        toast.error('Unable to share or copy the link.')
      }
    }
  }}
>
  <Share2 className="w-4 h-4 mr-2" />
  Share
</Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="text-danger-600 hover:text-danger-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>

        </div>
      </div>


      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Analysis"
        size="sm"
      >
        <p className="text-secondary-600">
          Are you sure you want to delete this analysis?
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3 mt-6">

          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={handleDelete}
          >
            Delete
          </Button>

        </div>
      </Modal>


      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Score */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">

            <ScoreCircle
              score={overall_score}
              size="xl"
              label="Overall ATS Score"
            />

            <div className="mt-6 space-y-4">

              {Object.entries(category_scores ?? {}).map(
                ([key, score]) => (
                  <ScoreBar
                    key={key}
                    score={score}
                    label={
                      categoryLabels[
                        key as keyof CategoryScores
                      ]
                    }
                    size="sm"
                  />
                )
              )}

            </div>
          </CardContent>
        </Card>


        {/* Analysis */}
        <div className="lg:col-span-3 space-y-6">

          <Tabs
            tabs={tabConfig}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="pills"
          />


          {/* Overview */}
          <TabPanel
            id="overview"
            activeTab={activeTab}
            className="space-y-6"
          >

            <Card>
              <CardHeader>
                <CardTitle>
                  Score Breakdown
                </CardTitle>

                <CardDescription>
                  Detailed scores across all evaluation categories
                </CardDescription>
              </CardHeader>

              <CardContent>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {Object.entries(category_scores ?? {}).map(
                    ([key, score]) => {

                      const Icon =
                        categoryIcons[
                          key as keyof CategoryScores
                        ]

                      return (
                        <div
                          key={key}
                          className="p-4 bg-secondary-50 rounded-lg"
                        >

                          <div className="flex items-center justify-between mb-2">

                            <div className="flex items-center gap-2">

                              <Icon className="w-5 h-5 text-primary-600" />

                              <span className="font-medium text-secondary-900">
                                {
                                  categoryLabels[
                                    key as keyof CategoryScores
                                  ]
                                }
                              </span>

                            </div>

                            <Badge
                              variant={
                                score >= 80
                                  ? 'success'
                                  : score >= 60
                                    ? 'warning'
                                    : 'danger'
                              }
                            >
                              {score}%
                            </Badge>

                          </div>

                          <ScoreBar
                            score={score}
                            size="sm"
                            showLabel={false}
                          />

                        </div>
                      )
                    }
                  )}

                </div>

              </CardContent>
            </Card>


            <Card>

              <CardHeader>
                <CardTitle>
                  Job Match Analysis
                </CardTitle>

                <CardDescription>
                  How well your resume matches the target job
                </CardDescription>
              </CardHeader>

              <CardContent>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">

                  <div className="text-center p-4 bg-primary-50 rounded-lg">
                    <div className="text-3xl font-bold text-primary-600">
                      {job_match.overall_match}%
                    </div>
                    <div className="text-sm text-secondary-600">
                      Overall Match
                    </div>
                  </div>

                  <div className="text-center p-4 bg-secondary-50 rounded-lg">
                    <div className="text-2xl font-semibold text-secondary-900">
                      {job_match.skill_match}%
                    </div>
                    <div className="text-sm text-secondary-600">
                      Skill Match
                    </div>
                  </div>

                  <div className="text-center p-4 bg-secondary-50 rounded-lg">
                    <div className="text-2xl font-semibold text-secondary-900">
                      {job_match.keyword_match}%
                    </div>
                    <div className="text-sm text-secondary-600">
                      Keyword Match
                    </div>
                  </div>

                  <div className="text-center p-4 bg-secondary-50 rounded-lg">
                    <div className="text-2xl font-semibold text-secondary-900">
                      {job_match.experience_match}%
                    </div>
                    <div className="text-sm text-secondary-600">
                      Experience Match
                    </div>
                  </div>

                  <div className="text-center p-4 bg-secondary-50 rounded-lg">
                    <div className="text-2xl font-semibold text-secondary-900">
                      {job_match.education_match}%
                    </div>
                    <div className="text-sm text-secondary-600">
                      Education Match
                    </div>
                  </div>

                </div>

                <p className="text-secondary-600">
                  {job_match.explanation}
                </p>

              </CardContent>
            </Card>

          </TabPanel>


          {/* Keywords */}
          <TabPanel
            id="keywords"
            activeTab={activeTab}
            className="space-y-6"
          >

            <Card>

              <CardHeader className="flex flex-row items-center justify-between">

                <div>
                  <CardTitle>
                    Keyword Analysis
                  </CardTitle>

                  <CardDescription>
                    Coverage: {keyword_analysis.keyword_coverage}%
                  </CardDescription>
                </div>

                <Dropdown
                  options={[
                    {
                      value: 'all',
                      label: 'All Keywords',
                    },
                    {
                      value: 'matched',
                      label: 'Matched',
                    },
                    {
                      value: 'missing',
                      label: 'Missing',
                    },
                    {
                      value: 'important',
                      label: 'Important',
                    },
                  ]}
                  value={keywordFilter}
                  onChange={(value) =>
                    setKeywordFilter(
                      value as
                        | 'all'
                        | 'matched'
                        | 'missing'
                        | 'important'
                    )
                  }
                  placeholder="Filter"
                />

              </CardHeader>

              <CardContent>

                <div className="flex flex-wrap gap-2">

                  {filteredKeywords().map(
                    (keyword, index) => {

                      const isMatched =
                        (keyword_analysis?.matched_keywords ?? []).includes(
                          keyword
                        )

                      const isImportant =
                        (keyword_analysis?.important_keywords ?? []).includes(
                          keyword
                        )

                      return (
                        <Badge
                          key={`${keyword}-${index}`}
                          variant={
                            isMatched
                              ? 'success'
                              : isImportant
                                ? 'warning'
                                : 'danger'
                          }
                          className="gap-1"
                        >
                          {keyword}

                          {isMatched && (
                            <CheckCircle className="w-3 h-3" />
                          )}

                          {isImportant && !isMatched && (
                            <Info className="w-3 h-3" />
                          )}
                        </Badge>
                      )
                    }
                  )}

                </div>

                {filteredKeywords().length === 0 && (
                  <p className="text-secondary-500 text-center py-8">
                    No keywords found for this filter
                  </p>
                )}

              </CardContent>
            </Card>

          </TabPanel>


          {/* Skills */}
          <TabPanel
            id="skills"
            activeTab={activeTab}
            className="space-y-6"
          >

            <Card>

              <CardHeader>
                <CardTitle>
                  Skill Analysis
                </CardTitle>

                <CardDescription>
                  Categorized skill comparison between resume
                  and job requirements
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">

                {[
                  {
                    title: 'Matched Skills',
                    data: (skill_analysis?.matched_skills ?? []),
                    variant: 'success' as const,
                    icon: CheckCircle,
                  },
                  {
                    title: 'Missing Skills',
                    data: (skill_analysis?.missing_skills ?? []),
                    variant: 'danger' as const,
                    icon: AlertCircle,
                  },
                  {
                    title: 'Additional Skills',
                    data: (skill_analysis?.additional_skills ?? []),
                    variant: 'secondary' as const,
                    icon: Info,
                  },
                ].map(
                  ({
                    title,
                    data,
                    variant,
                    icon: Icon,
                  }) => (

                    <div key={title}>

                      <h4 className="font-medium text-secondary-900 mb-3 flex items-center gap-2">

                        <Icon
                          className={cn(
                            'w-5 h-5',
                            variant === 'success'
                              ? 'text-success-500'
                              : variant === 'danger'
                                ? 'text-danger-500'
                                : 'text-secondary-500'
                          )}
                        />

                        {title} (
                        {data.reduce(
                          (acc, cat) =>
                            acc + cat.skills.length,
                          0
                        )}
                        )

                      </h4>

                      <div className="flex flex-wrap gap-2">

                        {data.flatMap(
                          (cat) =>
                            cat.skills.map(
                              (skill) => (
                                <Badge
                                  key={`${cat.category}-${skill}`}
                                  variant={variant}
                                >
                                  {cat.category}: {skill}
                                </Badge>
                              )
                            )
                        )}

                      </div>

                    </div>

                  )
                )}

              </CardContent>
            </Card>

          </TabPanel>


          {/* Formatting */}
          <TabPanel
            id="formatting"
            activeTab={activeTab}
            className="space-y-6"
          >

            <Card>

              <CardHeader>
                <CardTitle>
                  ATS Formatting Check
                </CardTitle>

                <CardDescription>
                  Overall rating: {
                    formatting_analysis.overall_rating
                  }
                </CardDescription>
              </CardHeader>

              <CardContent>

                <div className="space-y-3">

                  {(formatting_analysis?.checks ?? []).map(
                    (check, index) => (

                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg"
                      >

                        <div
                          className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                            check.status === 'pass'
                              ? 'bg-success-100 text-success-600'
                              : check.status === 'warning'
                                ? 'bg-warning-100 text-warning-600'
                                : 'bg-danger-100 text-danger-600'
                          )}
                        >

                          {check.status === 'pass' && (
                            <CheckCircle className="w-4 h-4" />
                          )}

                          {check.status === 'warning' && (
                            <AlertCircle className="w-4 h-4" />
                          )}

                          {check.status === 'fail' && (
                            <X className="w-4 h-4" />
                          )}

                        </div>

                        <div className="flex-1">

                          <p className="font-medium text-secondary-900">
                            {check.check}
                          </p>

                          <p className="text-sm text-secondary-600">
                            {check.message}
                          </p>

                        </div>

                        <Badge
                          variant={
                            check.status === 'pass'
                              ? 'success'
                              : check.status === 'warning'
                                ? 'warning'
                                : 'danger'
                          }
                        >
                          {check.status}
                        </Badge>

                      </div>

                    )
                  )}

                </div>

              </CardContent>
            </Card>

          </TabPanel>


          {/* Wording */}
          <TabPanel
            id="wording"
            activeTab={activeTab}
            className="space-y-6"
          >

            <Card>

              <CardHeader>
                <CardTitle>
                  Wording Analysis
                </CardTitle>

                <CardDescription>
                  Issues with phrasing, tone, and clarity
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">

                {(wording_analysis?.weak_wording ?? []).length > 0 && (

                  <div>

                    <h4 className="font-medium text-secondary-900 mb-3">
                      Weak Wording
                    </h4>

                    <div className="space-y-3">

                      {(wording_analysis?.weak_wording ?? []).map(
                        (issue, index) => (

                          <div
                            key={index}
                            className="p-4 bg-secondary-50 rounded-lg border-l-4 border-warning-500"
                          >

                            <p className="font-medium text-secondary-900">
                              "{issue.original}"
                            </p>

                            <p className="text-sm text-secondary-600 mt-1">
                              <strong>Problem:</strong>{' '}
                              {issue.problem}
                            </p>

                            <p className="text-sm text-secondary-600">
                              <strong>Why it matters:</strong>{' '}
                              {issue.why_it_matters}
                            </p>

                            <p className="text-sm text-success-700 mt-1">
                              <strong>Suggestion:</strong>{' '}
                              {issue.suggested_improvement}
                            </p>

                            <Badge
                              variant={
                                issue.severity === 'high'
                                  ? 'danger'
                                  : issue.severity === 'medium'
                                    ? 'warning'
                                    : 'secondary'
                              }
                              size="sm"
                            >
                              {issue.severity}
                            </Badge>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}


                {(wording_analysis?.passive_voice ?? []).length > 0 && (

                  <div>

                    <h4 className="font-medium text-secondary-900 mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5 text-secondary-500" />
                      Passive Voice Detected
                    </h4>

                    <div className="flex flex-wrap gap-2">

                      {(wording_analysis?.passive_voice ?? []).map(
                        (phrase, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                          >
                            {phrase}
                          </Badge>
                        )
                      )}

                    </div>

                  </div>

                )}


                {(wording_analysis?.repeated_words ?? []).length > 0 && (

                  <div>

                    <h4 className="font-medium text-secondary-900 mb-3">
                      Repeated Words
                    </h4>

                    <div className="flex flex-wrap gap-2">

                      {(wording_analysis?.repeated_words ?? []).map(
                        (item, index) => (
                          <Badge
                            key={index}
                            variant="warning"
                          >
                            {item.word} ({item.count}x)
                          </Badge>
                        )
                      )}

                    </div>

                  </div>

                )}

              </CardContent>
            </Card>

          </TabPanel>


          {/* Bullets */}
          <TabPanel
            id="bullets"
            activeTab={activeTab}
            className="space-y-6"
          >

            <Card>

              <CardHeader>
                <CardTitle>
                  Bullet Point Review
                </CardTitle>

                <CardDescription>
                  Individual analysis of each resume bullet
                </CardDescription>
              </CardHeader>

              <CardContent>

                <div className="space-y-4">

                  {(bullet_analysis ?? []).map(
                    (bullet, index) => (

                      <div
                        key={index}
                        className="p-4 bg-secondary-50 rounded-lg"
                      >

                        <div className="flex items-start justify-between gap-4 mb-2">

                          <p className="text-secondary-700 flex-1">
                            "{bullet.original}"
                          </p>

                          <Badge
                            variant={
                              bullet.priority === 'high'
                                ? 'danger'
                                : bullet.priority === 'medium'
                                  ? 'warning'
                                  : 'secondary'
                            }
                          >
                            {bullet.priority} priority
                          </Badge>

                        </div>


                        {bullet.problems.length > 0 && (

                          <div className="mb-2">

                            <p className="text-sm font-medium text-secondary-900 mb-1">
                              Issues:
                            </p>

                            <ul className="list-disc list-inside text-sm text-secondary-600 space-y-1">

                              {bullet.problems.map(
                                (problem, index) => (
                                  <li key={index}>
                                    {problem}
                                  </li>
                                )
                              )}

                            </ul>

                          </div>

                        )}


                        <div className="p-3 bg-white rounded border border-secondary-200">

                          <p className="text-sm font-medium text-secondary-900 mb-1">
                            Suggested Improvement:
                          </p>

                          <p className="text-sm text-secondary-700">
                            "{bullet.suggested_improvement}"
                          </p>

                        </div>


                        <div className="mt-2 flex items-center gap-2">

                          <ScoreCircle
                            score={bullet.quality_score}
                            size="sm"
                            showLabel={false}
                          />

                          <span className="text-sm text-secondary-600">
                            Quality Score
                          </span>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </CardContent>
            </Card>

          </TabPanel>


          {/* Job Match */}
          <TabPanel
            id="match"
            activeTab={activeTab}
            className="space-y-6"
          >

            <Card>

              <CardHeader>
                <CardTitle>
                  Detailed Job Match
                </CardTitle>

                <CardDescription>
                  Breakdown of how your resume aligns with
                  the job requirements
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {[
                    {
                      label: 'Overall Match',
                      value: job_match.overall_match,
                    },
                    {
                      label: 'Skill Match',
                      value: job_match.skill_match,
                    },
                    {
                      label: 'Keyword Match',
                      value: job_match.keyword_match,
                    },
                    {
                      label: 'Experience Match',
                      value: job_match.experience_match,
                    },
                    {
                      label: 'Education Match',
                      value: job_match.education_match,
                    },
                  ].map((item) => (

                    <ScoreBar
                      key={item.label}
                      score={item.value}
                      label={item.label}
                      size="md"
                    />

                  ))}

                </div>


                <div className="p-4 bg-secondary-50 rounded-lg">

                  <p className="text-secondary-700">
                    {job_match.explanation}
                  </p>

                </div>

              </CardContent>
            </Card>

          </TabPanel>


          {/* Improvement Plan */}
          <TabPanel
            id="plan"
            activeTab={activeTab}
            className="space-y-6"
          >

            {[
              {
                title: 'High Priority',
                items: (improvement_plan?.high_priority ?? []),
                color: 'danger' as const,
                icon: AlertCircle,
              },
              {
                title: 'Medium Priority',
                items: (improvement_plan?.medium_priority ?? []),
                color: 'warning' as const,
                icon: Info,
              },
              {
                title: 'Low Priority',
                items: (improvement_plan?.low_priority ?? []),
                color: 'secondary' as const,
                icon: CheckCircle,
              },
            ].map(
              ({
                title,
                items,
                color,
                icon: Icon,
              }) => (

                <Card key={title}>

                  <CardHeader className="flex flex-row items-center justify-between">

                    <div className="flex items-center gap-2">

                      <Icon
                        className={cn(
                          'w-5 h-5',
                          color === 'danger'
                            ? 'text-danger-500'
                            : color === 'warning'
                              ? 'text-warning-500'
                              : 'text-secondary-500'
                        )}
                      />

                      <CardTitle className="text-lg">
                        {title}
                      </CardTitle>

                    </div>

                    <Badge variant={color}>
                      {items.length} items
                    </Badge>

                  </CardHeader>


                  <CardContent>

                    <div className="space-y-3">

                      {items.map(
                        (item, index) => (

                          <div
                            key={index}
                            className="p-4 bg-secondary-50 rounded-lg border-l-4"
                            style={{
                              borderColor:
                                color === 'danger'
                                  ? '#ef4444'
                                  : color === 'warning'
                                    ? '#f59e0b'
                                    : '#64748b',
                            }}
                          >

                            <h4 className="font-medium text-secondary-900 mb-1">
                              {item.title}
                            </h4>

                            <p className="text-secondary-600 text-sm mb-2">
                              {item.description}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-secondary-500">

                              <span>
                                Impact:{' '}
                                <span className="font-medium text-secondary-700">
                                  {item.impact}
                                </span>
                              </span>

                              <span>
                                Effort:{' '}
                                <span className="font-medium text-secondary-700 capitalize">
                                  {item.effort}
                                </span>
                              </span>

                            </div>

                          </div>

                        )
                      )}

                    </div>


                    {items.length === 0 && (
                      <p className="text-secondary-500 text-center py-8">
                        No items in this priority level
                      </p>
                    )}

                  </CardContent>

                </Card>

              )
            )}

          </TabPanel>

        </div>
      </div>

    </div>
  )
}