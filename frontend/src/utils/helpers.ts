import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-success-600'
  if (score >= 60) return 'text-warning-600'
  return 'text-danger-600'
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-success-100'
  if (score >= 60) return 'bg-warning-100'
  return 'bg-danger-100'
}

export function getScoreRingColor(score: number): string {
  if (score >= 80) return 'text-success-500'
  if (score >= 60) return 'text-warning-500'
  return 'text-danger-500'
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length).trim() + '...'
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

export function sanitizeUrl(url: string): string {
  if (!validateUrl(url)) return '#'
  return url
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  )
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  )
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'applied':
      return 'bg-primary-100 text-primary-700'
    case 'screening':
      return 'bg-warning-100 text-warning-700'
    case 'interview':
      return 'bg-info-100 text-info-700'
    case 'offer':
      return 'bg-success-100 text-success-700'
    case 'rejected':
      return 'bg-danger-100 text-danger-700'
    case 'saved':
    default:
      return 'bg-secondary-100 text-secondary-700'
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'applied':
      return '📤'
    case 'screening':
      return '🔍'
    case 'interview':
      return '🎯'
    case 'offer':
      return '🎉'
    case 'rejected':
      return '❌'
    case 'saved':
    default:
      return '💾'
  }
}