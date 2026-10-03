import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
  Search,
  Trash2,
  Eye,
  Loader2,
  Clock,
} from 'lucide-react'

import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Dropdown } from '../components/ui/Dropdown'
import { Card, CardContent } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { analysisApi } from '../services/api'
import type { ResumeScan } from '../types'
import { cn, formatDate, formatRelativeTime } from '../utils/helpers'

export default function HistoryPage() {
  const [scans, setScans] = useState<ResumeScan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<
    'all' | 'week' | 'month' | 'year'
  >('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    fetchScans()
  }, [page])

  const getErrorMessage = (error: unknown): string => {
    const axiosError = error as {
      response?: {
        data?: {
          detail?: string | Array<{ msg?: string }>
        }
      }
      message?: string
    }

    const detail = axiosError.response?.data?.detail

    if (Array.isArray(detail)) {
      return detail
        .map((item) => item?.msg || 'Validation error')
        .join(', ')
    }

    if (typeof detail === 'string' && detail.trim()) {
      return detail
    }

    if (axiosError.message) {
      return axiosError.message
    }

    return 'Failed to load history'
  }

  const fetchScans = async () => {
    if (page === 1) {
      setIsLoading(true)
    }

    try {
      const response = await analysisApi.list(page, 20)

      /*
       * Backend may return either:
       *
       * 1. Paginated:
       * {
       *   items: [],
       *   page: 1,
       *   total_pages: 1
       * }
       *
       * 2. Direct array:
       * [
       *   ...
       * ]
       *
       * Handle both safely.
       */

      const data = response.data as
        | {
            items?: ResumeScan[]
            page?: number
            total_pages?: number
          }
        | ResumeScan[]

      if (Array.isArray(data)) {
        if (page === 1) {
          setScans(data)
        } else {
          setScans((prev) => [...prev, ...data])
        }

        setHasMore(data.length === 20)
        return
      }

      const items = Array.isArray(data.items)
        ? data.items
        : []

      if (page === 1) {
        setScans(items)
      } else {
        setScans((prev) => [...prev, ...items])
      }

      if (
        typeof data.page === 'number' &&
        typeof data.total_pages === 'number'
      ) {
        setHasMore(data.page < data.total_pages)
      } else {
        setHasMore(items.length === 20)
      }
    } catch (error: unknown) {
      console.error('Failed to load history:', error)

      const message = getErrorMessage(error)

      toast.error(message)

      /*
       * If page > 1 fails, go back to previous page
       * instead of leaving the UI stuck.
       */
      if (page > 1) {
        setPage((prev) => Math.max(1, prev - 1))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return

    try {
      await analysisApi.delete(deletingId)

      toast.success('Analysis deleted successfully')

      setScans((prev) =>
        prev.filter((scan) => scan.id !== deletingId)
      )
    } catch (error: unknown) {
      console.error('Failed to delete analysis:', error)

      toast.error('Failed to delete analysis')
    } finally {
      setDeletingId(null)
    }
  }

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage((prev) => prev + 1)
    }
  }

  const filteredScans = scans.filter((scan) => {
    const jobTitle = scan.target_job_title || ''

    const matchesSearch = jobTitle
      .toLowerCase()
      .includes(searchQuery.toLowerCase())

    if (dateFilter === 'all') {
      return matchesSearch
    }

    const scanDate = new Date(scan.created_at)
    const now = new Date()

    const diffDays =
      (now.getTime() - scanDate.getTime()) /
      (1000 * 60 * 60 * 24)

    if (dateFilter === 'week') {
      return diffDays <= 7 && matchesSearch
    }

    if (dateFilter === 'month') {
      return diffDays <= 30 && matchesSearch
    }

    if (dateFilter === 'year') {
      return diffDays <= 365 && matchesSearch
    }

    return matchesSearch
  })

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            Scan History
          </h1>

          <p className="text-secondary-600">
            View and manage your past resume analyses
          </p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4">

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />

          <Input
            placeholder="Search by job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dropdown
          options={[
            {
              value: 'all',
              label: 'All Time',
            },
            {
              value: 'week',
              label: 'Last Week',
            },
            {
              value: 'month',
              label: 'Last Month',
            },
            {
              value: 'year',
              label: 'Last Year',
            },
          ]}
          value={dateFilter}
          onChange={(value) =>
  setDateFilter(value as 'year' | 'month' | 'week' | 'all')
}
          placeholder="Filter by date"
          className="w-full sm:w-48"
        />
      </div>

      {/* Loading */}
      {isLoading && page === 1 ? (
        <div className="space-y-4">

          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">

                <div className="flex items-center gap-4">

                  <div className="w-12 h-12 bg-secondary-200 animate-pulse rounded" />

                  <div className="flex-1 space-y-2">

                    <div className="h-4 bg-secondary-200 animate-pulse rounded w-1/3" />

                    <div className="h-4 bg-secondary-200 animate-pulse rounded w-1/4" />

                  </div>

                </div>

              </CardContent>
            </Card>
          ))}

        </div>

      ) : filteredScans.length === 0 ? (

        /* Empty state */
        <Card>
          <CardContent className="p-12 text-center">

            <Clock className="w-12 h-12 text-secondary-300 mx-auto mb-4" />

            <h3 className="text-lg font-medium text-secondary-900 mb-1">
              No scan history yet
            </h3>

            <p className="text-secondary-500 mb-4">
              Your resume analyses will appear here
            </p>

            <Button asChild>
              <a href="/analyzer">
                Analyze Your First Resume
              </a>
            </Button>

          </CardContent>
        </Card>

      ) : (

        <>
          {/* Scan list */}
          <div className="space-y-4">

            {filteredScans.map((scan) => (

              <Card key={scan.id} hover>

                <CardContent className="p-6">

                  <div className="flex items-center justify-between">

                    {/* Job information */}
                    <div className="flex-1 min-w-0">

                      <h3 className="font-semibold text-secondary-900 truncate">
                        {scan.target_job_title || 'Untitled Analysis'}
                      </h3>

                      <p className="text-secondary-500 text-sm">
                        {formatRelativeTime(scan.created_at)}
                      </p>

                    </div>

                    {/* Score + Actions */}
                    <div className="flex items-center gap-4">

                      <div className="text-right">

                        <div
                          className={cn(
                            'text-2xl font-bold',
                            scan.ats_score >= 80
                              ? 'text-success-600'
                              : scan.ats_score >= 60
                                ? 'text-warning-600'
                                : 'text-danger-600'
                          )}
                        >
                          {scan.ats_score}
                        </div>

                        <div className="text-xs text-secondary-500">
                          ATS Score
                        </div>

                      </div>

                      <div className="flex items-center gap-2">

                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a href={`/results/${scan.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </a>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setDeletingId(scan.id)
                          }
                          className="text-danger-600 hover:text-danger-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>

                      </div>

                    </div>

                  </div>

                  {/* Details */}
                  <div className="mt-4 pt-4 border-t border-secondary-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">

                    <div>
                      <p className="text-secondary-500">
                        Status
                      </p>

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
                    </div>

                    <div>
                      <p className="text-secondary-500">
                        Resume ID
                      </p>

                      <p className="font-mono text-secondary-700">
                        {scan.resume_id
                          ? `${scan.resume_id.slice(0, 8)}...`
                          : '—'}
                      </p>
                    </div>

                    <div>
                      <p className="text-secondary-500">
                        Created
                      </p>

                      <p className="text-secondary-700">
                        {formatDate(scan.created_at)}
                      </p>
                    </div>

                    <div>
                      <p className="text-secondary-500">
                        Completed
                      </p>

                      <p className="text-secondary-700">
                        {scan.completed_at
                          ? formatDate(scan.completed_at)
                          : '—'}
                      </p>
                    </div>

                  </div>

                </CardContent>

              </Card>

            ))}

          </div>

          {/* Load More */}
          {hasMore && (

            <div className="text-center">

              <Button
                variant="outline"
                onClick={loadMore}
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>

            </div>

          )}

        </>

      )}

      {/* Delete Modal */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
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
            onClick={() => setDeletingId(null)}
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

    </div>
  )
}