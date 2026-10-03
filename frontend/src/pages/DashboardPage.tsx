import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  Plus,
  TrendingUp,
  BarChart2,
  Briefcase,
  FileText,
  Award,
  Clock,
  ArrowRight,
} from 'lucide-react'

import { Button } from '../components/ui/Button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { dashboardApi } from '../services/api'
import type { ResumeScan, DashboardStats } from '../types'
import { formatRelativeTime } from '../utils/helpers'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

import { Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

/* ============================================================
   CHART OPTIONS
   ============================================================ */

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      display: false,
    },

    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#f8fafc',
      bodyColor: '#f8fafc',
      borderColor: '#334155',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
    },
  },

  interaction: {
    intersect: false,
    mode: 'index' as const,
  },

  scales: {
    x: {
      grid: {
        display: false,
      },

      ticks: {
        color: '#94a3b8',
      },
    },

    y: {
      grid: {
        color: '#e2e8f0',
      },

      ticks: {
        color: '#94a3b8',
      },

      beginAtZero: true,
      max: 100,
    },
  },
}

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
    },

    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#f8fafc',
      bodyColor: '#f8fafc',
      borderColor: '#334155',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
    },
  },
}

/* ============================================================
   DASHBOARD
   ============================================================ */

export default function DashboardPage() {
  const [stats, setStats] =
    useState<DashboardStats | null>(null)

  const [recentScans, setRecentScans] =
  useState<ResumeScan[]>([])

  const [isLoading, setIsLoading] =
    useState(true)

  /* ==========================================================
     FETCH DASHBOARD DATA
     ========================================================== */

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, historyRes] =
        await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getHistory(1, 20),
        ])

      setStats(statsRes.data)

      /*
       * Backend returns the recent analysis list.
       * Keep only valid array data.
       */
      setRecentScans(
        Array.isArray(historyRes.data)
          ? historyRes.data
          : []
      )
    } catch (error: unknown) {
      console.error(
        'Failed to load dashboard:',
        error
      )

      const axiosError = error as {
        response?: {
          data?: {
            detail?:
              | string
              | Array<{
                  msg?: string
                }>
          }
        }

        message?: string
      }

      const detail =
        axiosError.response?.data?.detail

      let message = 'Failed to load dashboard'

      if (Array.isArray(detail)) {
        message = detail
          .map(
            (item) =>
              item?.msg || 'Validation error'
          )
          .join(', ')
      } else if (
        typeof detail === 'string' &&
        detail.trim()
      ) {
        message = detail
      } else if (
        typeof axiosError.message === 'string' &&
        axiosError.message.trim()
      ) {
        message = axiosError.message
      }

      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  /* ==========================================================
     REAL ATS SCORE HISTORY
     ========================================================== */

  const sortedScans = [...recentScans].sort(
    (a, b) =>
      new Date(a.created_at).getTime() -
      new Date(b.created_at).getTime()
  )

  const scoreHistoryData = {
    labels:
      sortedScans.length > 0
        ? sortedScans.map((scan) =>
            new Date(
              scan.created_at
            ).toLocaleDateString(
              'en-IN',
              {
                day: 'numeric',
                month: 'short',
              }
            )
          )
        : ['No scans'],

    datasets: [
      {
        label: 'ATS Score',

        data:
          sortedScans.length > 0
            ? sortedScans.map(
                (scan) =>
                  scan.ats_score ?? 0
              )
            : [0],

        borderColor: '#6366f1',
        backgroundColor:
          'rgba(99, 102, 241, 0.1)',

        fill: true,
        tension: 0.4,

        pointBackgroundColor:
          '#6366f1',

        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  /* ==========================================================
     REAL ATS SCORE DISTRIBUTION
     ========================================================== */

  const scoreDistribution = {
    excellent: recentScans.filter(
      (scan) =>
        (scan.ats_score ?? 0) >= 80
    ).length,

    good: recentScans.filter(
      (scan) =>
        (scan.ats_score ?? 0) >= 60 &&
        (scan.ats_score ?? 0) < 80
    ).length,

    average: recentScans.filter(
      (scan) =>
        (scan.ats_score ?? 0) >= 40 &&
        (scan.ats_score ?? 0) < 60
    ).length,

    low: recentScans.filter(
      (scan) =>
        (scan.ats_score ?? 0) < 40
    ).length,
  }

  const matchDistributionData = {
    labels: [
      '80-100%',
      '60-79%',
      '40-59%',
      '0-39%',
    ],

    datasets: [
      {
        data: [
          scoreDistribution.excellent,
          scoreDistribution.good,
          scoreDistribution.average,
          scoreDistribution.low,
        ],

        backgroundColor: [
          '#22c55e',
          '#6366f1',
          '#f59e0b',
          '#ef4444',
        ],

        borderWidth: 0,
      },
    ],
  }

  /* ==========================================================
     REAL ANALYSIS STATUS DISTRIBUTION
     ========================================================== */

  const completedCount =
    recentScans.filter(
      (scan) =>
        scan.status === 'completed'
    ).length

  const processingCount =
    recentScans.filter(
      (scan) =>
        scan.status === 'processing'
    ).length

  const pendingCount =
    recentScans.filter(
      (scan) =>
        scan.status === 'pending'
    ).length

  const failedCount =
    recentScans.filter(
      (scan) =>
        scan.status === 'failed'
    ).length

  const statusData = {
    labels: [
      'Completed',
      'Processing',
      'Pending',
      'Failed',
    ],

    datasets: [
      {
        data: [
          completedCount,
          processingCount,
          pendingCount,
          failedCount,
        ],

        backgroundColor: [
          '#22c55e',
          '#f59e0b',
          '#6366f1',
          '#ef4444',
        ],

        borderWidth: 0,
      },
    ],
  }

  /* ==========================================================
     LOADING
     ========================================================== */

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-secondary-900">
            Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">

                <div className="h-8 bg-secondary-200 animate-pulse rounded mb-4" />

                <div className="h-12 bg-secondary-200 animate-pulse rounded" />

              </CardContent>
            </Card>
          ))}

        </div>

      </div>
    )
  }

  /* ==========================================================
     PAGE
     ========================================================== */

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>

          <h1 className="text-3xl font-bold text-secondary-900">
            Dashboard
          </h1>

          <p className="text-secondary-600">
            Track your resume performance and application progress
          </p>

        </div>

        <Link to="/analyzer">

          <Button size="lg">

            <Plus className="w-5 h-5 mr-2" />

            New Analysis

          </Button>

        </Link>

      </div>

      {/* ======================================================
          STATS
          ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Average ATS */}
        <Card>

          <CardContent className="p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-secondary-500">
                  Average ATS Score
                </p>

                <div className="flex items-baseline gap-2 mt-1">

                  <span className="text-3xl font-bold text-secondary-900">
                    {stats?.average_ats_score ?? 0}
                  </span>

                  <TrendingUp className="w-5 h-5 text-success-500" />

                </div>

              </div>

              <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center">

                <BarChart2 className="w-8 h-8 text-primary-600" />

              </div>

            </div>

          </CardContent>

        </Card>

        {/* Applications */}
        <Card>

          <CardContent className="p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-secondary-500">
                  Total Applications
                </p>

                <div className="flex items-baseline gap-2 mt-1">

                  <span className="text-3xl font-bold text-secondary-900">
                    {stats?.total_applications ?? 0}
                  </span>

                  <Briefcase className="w-5 h-5 text-primary-500" />

                </div>

              </div>

              <div className="w-16 h-16 rounded-xl bg-success-100 flex items-center justify-center">

                <Award className="w-8 h-8 text-success-600" />

              </div>

            </div>

          </CardContent>

        </Card>

        {/* Interviews */}
        <Card>

          <CardContent className="p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-secondary-500">
                  Interviews
                </p>

                <div className="flex items-baseline gap-2 mt-1">

                  <span className="text-3xl font-bold text-secondary-900">
                    {stats?.interviews ?? 0}
                  </span>

                </div>

              </div>

              <div className="w-16 h-16 rounded-xl bg-warning-100 flex items-center justify-center">

                <FileText className="w-8 h-8 text-warning-600" />

              </div>

            </div>

          </CardContent>

        </Card>

        {/* Offers */}
        <Card>

          <CardContent className="p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-secondary-500">
                  Offers
                </p>

                <div className="flex items-baseline gap-2 mt-1">

                  <span className="text-3xl font-bold text-secondary-900">
                    {stats?.offers ?? 0}
                  </span>

                </div>

              </div>

              <div className="w-16 h-16 rounded-xl bg-danger-100 flex items-center justify-center">

                <Clock className="w-8 h-8 text-danger-600" />

              </div>

            </div>

          </CardContent>

        </Card>

      </div>

      {/* ======================================================
          REAL CHARTS
          ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ATS SCORE HISTORY */}
        <Card>

          <CardHeader>

            <CardTitle>
              ATS Score History
            </CardTitle>

            <CardDescription>
              Your recent resume scores
            </CardDescription>

          </CardHeader>

          <CardContent>

            <div className="h-64">

              <Line
                data={scoreHistoryData}
                options={lineChartOptions}
              />

            </div>

          </CardContent>

        </Card>

        {/* ATS SCORE DISTRIBUTION */}
        <Card>

          <CardHeader>

            <CardTitle>
              ATS Score Distribution
            </CardTitle>

            <CardDescription>
              Distribution of your recent resume scores
            </CardDescription>

          </CardHeader>

          <CardContent>

            <div className="h-64 flex items-center justify-center">

              <Doughnut
                data={matchDistributionData}
                options={doughnutChartOptions}
              />

            </div>

          </CardContent>

        </Card>

        {/* ANALYSIS STATUS */}
        <Card>

          <CardHeader>

            <CardTitle>
              Analysis Status
            </CardTitle>

            <CardDescription>
              Status of your recent resume analyses
            </CardDescription>

          </CardHeader>

          <CardContent>

            <div className="h-64 flex items-center justify-center">

              <Doughnut
                data={statusData}
                options={doughnutChartOptions}
              />

            </div>

          </CardContent>

        </Card>

        {/* SCORE SUMMARY */}
        <Card>

          <CardHeader>

            <CardTitle>
              Score Summary
            </CardTitle>

            <CardDescription>
              Your latest analysis scores
            </CardDescription>

          </CardHeader>

          <CardContent>

            {sortedScans.length === 0 ? (

              <div className="h-64 flex items-center justify-center text-secondary-500">
                No analysis data available
              </div>

            ) : (

              <div className="space-y-4">

                {sortedScans
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((scan) => (

                    <div
                      key={scan.id}
                      className="flex items-center justify-between border-b border-secondary-100 pb-3 last:border-0"
                    >

                      <div className="min-w-0">

                        <p className="font-medium text-secondary-900 truncate">
                          {scan.target_job_title}
                        </p>

                        <p className="text-sm text-secondary-500">
                          {formatRelativeTime(
                            scan.created_at
                          )}
                        </p>

                      </div>

                      <div
                        className={
                          scan.ats_score >= 80
                            ? 'font-bold text-success-600'
                            : scan.ats_score >= 60
                              ? 'font-bold text-warning-600'
                              : 'font-bold text-danger-600'
                        }
                      >
                        {scan.ats_score ?? 0}
                      </div>

                    </div>

                  ))}

              </div>

            )}

          </CardContent>

        </Card>

      </div>

      {/* ======================================================
          RECENT RESUME SCANS
          ====================================================== */}

      <Card>

        <CardHeader className="flex flex-row items-center justify-between">

          <div>

            <CardTitle>
              Recent Resume Scans
            </CardTitle>

            <CardDescription>
              Your latest analyses
            </CardDescription>

          </div>

          <Link to="/history">

            <Button
              variant="ghost"
              size="sm"
            >

              View All

              <ArrowRight className="w-4 h-4 ml-1" />

            </Button>

          </Link>

        </CardHeader>

        <CardContent>

          {recentScans.length === 0 ? (

            <div className="text-center py-12">

              <FileText className="w-12 h-12 text-secondary-300 mx-auto mb-4" />

              <h3 className="text-lg font-medium text-secondary-900 mb-1">
                No resume scans yet
              </h3>

              <p className="text-secondary-500 mb-4">
                Analyze your first resume to see your ATS history
              </p>

              <Link to="/analyzer">

                <Button>
                  Analyze Resume
                </Button>

              </Link>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-secondary-200 text-left text-sm text-secondary-500">

                    <th className="pb-3 font-medium">
                      Job Title
                    </th>

                    <th className="pb-3 font-medium">
                      Company
                    </th>

                    <th className="pb-3 font-medium text-center">
                      ATS Score
                    </th>

                    <th className="pb-3 font-medium text-center">
                      Status
                    </th>

                    <th className="pb-3 font-medium">
                      Date
                    </th>

                    <th className="pb-3 font-medium text-right">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-secondary-100">

                  {recentScans
                    .slice(0, 5)
                    .map((scan) => (

                      <tr
                        key={scan.id}
                        className="hover:bg-secondary-50"
                      >

                        <td className="py-4">

                          <div className="font-medium text-secondary-900">
                            {scan.target_job_title}
                          </div>

                        </td>

                        <td className="py-4 text-secondary-600">
                          —
                        </td>

                        <td className="py-4 text-center">

                          <Badge
                            variant={
                              scan.ats_score >= 80
                                ? 'success'
                                : scan.ats_score >= 60
                                  ? 'warning'
                                  : 'danger'
                            }
                          >
                            {scan.ats_score ?? 0}
                          </Badge>

                        </td>

                        <td className="py-4 text-center">

                          <Badge
                            variant={
                              scan.status === 'completed'
                                ? 'success'
                                : scan.status === 'processing'
                                  ? 'warning'
                                  : 'danger'
                            }
                          >
                            {scan.status}
                          </Badge>

                        </td>

                        <td className="py-4 text-secondary-500">

                          {formatRelativeTime(
                            scan.created_at
                          )}

                        </td>

                        <td className="py-4 text-right">

                          <Link
                            to={`/results/${scan.id}`}
                          >

                            <Button
                              variant="ghost"
                              size="sm"
                            >
                              View
                            </Button>

                          </Link>

                        </td>

                      </tr>

                    ))}

                </tbody>

              </table>

            </div>

          )}

        </CardContent>

      </Card>

    </div>
  )
}