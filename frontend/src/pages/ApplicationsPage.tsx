import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  Briefcase,
} from 'lucide-react'

import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Dropdown } from '../components/ui/Dropdown'
import {
  Card,
  CardContent,
} from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { applicationApi } from '../services/api'
import type { Application } from '../types'
import {
  formatDate,
  sanitizeUrl,
  getStatusIcon,
} from '../utils/helpers'

const statusOptions = [
  { value: 'saved', label: 'Saved' },
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
]

const initialFormState = {
  company: '',
  job_title: '',
  application_date: new Date().toISOString().split('T')[0],
  job_url: '',
  status: 'saved' as const,
  notes: '',
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingApp, setEditingApp] =
    useState<Application | null>(null)
  const [deletingId, setDeletingId] =
    useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<string>('all')
  const [formData, setFormData] =
    useState(initialFormState)
  const [isSubmitting, setIsSubmitting] =
    useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const getErrorMessage = (error: unknown, fallback: string) => {
    const axiosError = error as {
      response?: {
        data?: {
          detail?: unknown
        }
      }
    }

    const detail =
      axiosError.response?.data?.detail

    if (typeof detail === 'string') {
      return detail
    }

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => {
          if (
            typeof item === 'object' &&
            item !== null &&
            'msg' in item
          ) {
            return String(
              (item as { msg?: unknown }).msg ?? ''
            )
          }

          return ''
        })
        .filter(Boolean)

      if (messages.length > 0) {
        return messages.join(', ')
      }
    }

    return fallback
  }

  const fetchApplications = async () => {
    setIsLoading(true)

    try {
      const response =
        await applicationApi.list(1, 100)

      /*
       * Backend returns:
       * [
       *   Application,
       *   Application,
       *   ...
       * ]
       *
       * It does NOT return:
       * { items: [...] }
       */
      const data = response.data

      setApplications(
        Array.isArray(data) ? data : []
      )
    } catch (error: unknown) {
      setApplications([])

      toast.error(
        getErrorMessage(
          error,
          'Failed to load applications'
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingApp) {
        await applicationApi.update(
          editingApp.id,
          formData
        )

        toast.success(
          'Application updated'
        )
      } else {
        await applicationApi.create(
          formData
        )

        toast.success(
          'Application added'
        )
      }

      setShowModal(false)
      setEditingApp(null)
      setFormData(initialFormState)

      await fetchApplications()
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(
          error,
          'Failed to save application'
        )
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (
    app: Application
  ) => {
    setEditingApp(app)

    setFormData({
      company: app.company,
      job_title: app.job_title,
      application_date:
        app.application_date.split('T')[0],
      job_url: app.job_url || '',
      status: app.status as typeof initialFormState.status,
      notes: app.notes || '',
    })

    setShowModal(true)
  }

  const handleDelete = async () => {
    if (!deletingId) return

    try {
      await applicationApi.delete(
        deletingId
      )

      toast.success(
        'Application deleted'
      )

      await fetchApplications()
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(
          error,
          'Failed to delete application'
        )
      )
    } finally {
      setDeletingId(null)
    }
  }

  const handleOpenJobUrl = (
    url: string
  ) => {
    const safeUrl = sanitizeUrl(url)

    if (safeUrl !== '#') {
      window.open(
        safeUrl,
        '_blank',
        'noopener,noreferrer'
      )
    }
  }

  const filteredApps =
    applications.filter((app) => {
      const company =
        app.company?.toLowerCase() || ''

      const jobTitle =
        app.job_title?.toLowerCase() || ''

      const query =
        searchQuery.toLowerCase()

      const matchesSearch =
        company.includes(query) ||
        jobTitle.includes(query)

      const matchesStatus =
        statusFilter === 'all' ||
        app.status === statusFilter

      return (
        matchesSearch &&
        matchesStatus
      )
    })

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            Applications
          </h1>

          <p className="text-secondary-600">
            Track your job applications and progress
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingApp(null)
            setFormData(initialFormState)
            setShowModal(true)
          }}
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Application
        </Button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4">

        <div className="relative flex-1">

          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />

          <Input
            placeholder="Search company or role..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            className="pl-10"
          />

        </div>

        <Dropdown
          options={[
            {
              value: 'all',
              label: 'All Statuses',
            },
            ...statusOptions,
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Filter by status"
          className="w-full sm:w-48"
        />

      </div>

      {/* Loading */}
      {isLoading ? (

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {[...Array(6)].map((_, i) => (

            <Card key={i}>

              <CardContent className="p-6">

                <div className="space-y-3">

                  <div className="h-4 bg-secondary-200 animate-pulse rounded w-3/4" />

                  <div className="h-4 bg-secondary-200 animate-pulse rounded w-1/2" />

                  <div className="h-4 bg-secondary-200 animate-pulse rounded w-1/3" />

                </div>

              </CardContent>

            </Card>

          ))}

        </div>

      ) : filteredApps.length === 0 ? (

        /* Empty state */

        <Card>

          <CardContent className="p-12 text-center">

            <Briefcase className="w-12 h-12 text-secondary-300 mx-auto mb-4" />

            <h3 className="text-lg font-medium text-secondary-900 mb-1">
              No applications found
            </h3>

            <p className="text-secondary-500 mb-4">
              Start tracking your job applications
            </p>

            <Button
              onClick={() => {
                setEditingApp(null)
                setFormData(initialFormState)
                setShowModal(true)
              }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Application
            </Button>

          </CardContent>

        </Card>

      ) : (

        /* Applications */

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {filteredApps.map((app) => (

            <Card
              key={app.id}
              hover
            >

              <CardContent className="p-6">

                <div className="flex items-start justify-between mb-4">

                  <div className="flex-1 min-w-0">

                    <h3 className="font-semibold text-secondary-900 truncate">
                      {app.job_title}
                    </h3>

                    <p className="text-secondary-600 truncate">
                      {app.company}
                    </p>

                  </div>

                  <Badge
                    variant={
                      app.status === 'offer'
                        ? 'success'
                        : app.status === 'interview'
                          ? 'primary'
                          : app.status === 'screening'
                            ? 'warning'
                            : app.status === 'rejected'
                              ? 'danger'
                              : 'secondary'
                    }
                  >
                    {getStatusIcon(app.status)}{' '}
                    {app.status
                      .charAt(0)
                      .toUpperCase() +
                      app.status.slice(1)}
                  </Badge>

                </div>

                <div className="space-y-2 text-sm text-secondary-600 mb-4">

                  <div className="flex items-center gap-2">

                    <Calendar className="w-4 h-4" />

                    <span>
                      Applied:{' '}
                      {formatDate(
                        app.application_date
                      )}
                    </span>

                  </div>

                  {app.job_url && (

                    <div className="flex items-center gap-2">

                      <ExternalLink className="w-4 h-4" />

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto px-2 py-1"
                        onClick={() =>
                          handleOpenJobUrl(
                            app.job_url!
                          )
                        }
                      >
                        View Job
                      </Button>

                    </div>

                  )}

                </div>

                {app.notes && (

                  <div className="p-3 bg-secondary-50 rounded-lg mb-4">

                    <p className="text-sm text-secondary-700 line-clamp-2">
                      {app.notes}
                    </p>

                  </div>

                )}

                <div className="flex items-center gap-2">

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleEdit(app)
                    }
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setDeletingId(app.id)
                    }
                    className="text-danger-600 hover:text-danger-700 flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>

                </div>

              </CardContent>

            </Card>

          ))}

        </div>

      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingApp(null)
          setFormData(initialFormState)
        }}
        title={
          editingApp
            ? 'Edit Application'
            : 'Add Application'
        }
        size="lg"
      >

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Input
              label="Company"
              placeholder="e.g., Google"
              value={formData.company}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  company: e.target.value,
                })
              }
              required
            />

            <Input
              label="Job Title"
              placeholder="e.g., Software Engineer"
              value={formData.job_title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  job_title: e.target.value,
                })
              }
              required
            />

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Input
              label="Application Date"
              type="date"
              value={formData.application_date}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  application_date:
                    e.target.value,
                })
              }
              required
            />

            <Dropdown
            
              options={statusOptions}
              value={formData.status}
              onChange={(v) =>
                setFormData({
                  ...formData,
                  status:
                    v as typeof formData.status,
                })
              }
            />

          </div>

          <Input
            label="Job URL (optional)"
            type="url"
            placeholder="https://jobs.company.com/123"
            value={formData.job_url}
            onChange={(e) =>
              setFormData({
                ...formData,
                job_url: e.target.value,
              })
            }
            helperText="Will open in new tab"
          />

          <div>

            <label className="block text-sm font-medium text-secondary-700 mb-1.5">
              Notes
            </label>

            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  notes: e.target.value,
                })
              }
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Interview dates, contact person, follow-up notes..."
            />

          </div>

          <div className="flex justify-end gap-3 pt-4">

            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowModal(false)
                setEditingApp(null)
                setFormData(initialFormState)
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              isLoading={isSubmitting}
            >
              {editingApp
                ? 'Update'
                : 'Add'}
            </Button>

          </div>

        </form>

      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deletingId}
        onClose={() =>
          setDeletingId(null)
        }
        title="Delete Application"
        size="sm"
      >

        <p className="text-secondary-600">
          Are you sure you want to delete this application?
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3 mt-6">

          <Button
            variant="secondary"
            onClick={() =>
              setDeletingId(null)
            }
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