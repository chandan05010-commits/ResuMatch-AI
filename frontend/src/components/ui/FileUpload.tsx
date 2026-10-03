import React, { useCallback, useState, DragEvent } from 'react'
import { cn, formatFileSize } from '../../utils/helpers'
import { Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  acceptedTypes?: string[]
  maxSizeMB?: number
  currentFile?: File | null
  onRemove?: () => void
  isLoading?: boolean
  error?: string
  className?: string
}

export function FileUpload({
  onFileSelect,
  acceptedTypes = ['application/pdf'],
  maxSizeMB = 10,
  currentFile,
  onRemove,
  isLoading = false,
  error,
  className,
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedTypes.includes(file.type)) {
        return `Invalid file type. Please upload a PDF file.`
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        return `File size exceeds ${maxSizeMB}MB limit.`
      }
      return null
    },
    [acceptedTypes, maxSizeMB]
  )

  const handleFileSelect = useCallback(
    (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        return
      }
      onFileSelect(file)
    },
    [onFileSelect, validateFile]
  )

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDragActive(false)
      const file = event.dataTransfer.files[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragActive(false)
  }, [])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) handleFileSelect(file)
    event.target.value = ''
  }

  const handleRemove = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    onRemove?.()
  }

  if (currentFile) {
    return (
      <div className={cn('relative p-4 rounded-lg border transition-colors', className)}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-100 rounded-lg">
            <FileText className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-secondary-900 truncate">{currentFile.name}</p>
            <p className="text-sm text-secondary-500">{formatFileSize(currentFile.size)}</p>
          </div>
          <button
            onClick={handleRemove}
            disabled={isLoading}
            className="p-2 rounded-lg text-secondary-400 hover:text-danger-600 hover:bg-danger-50 transition-colors disabled:opacity-50"
            aria-label="Remove file"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {error && (
          <div className="mt-3 p-3 bg-danger-50 border border-danger-200 rounded-lg flex items-center gap-2 text-danger-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleInputChange}
        className="sr-only"
        disabled={isLoading}
        aria-label="Upload resume PDF"
      />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={cn(
          'relative p-8 rounded-xl border-2 border-dashed text-center transition-all duration-200 cursor-pointer',
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-secondary-300 hover:border-primary-400 hover:bg-secondary-50',
          error && 'border-danger-500 bg-danger-50',
          isLoading && 'opacity-50 cursor-wait'
        )}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className={cn(
              'p-3 rounded-lg transition-colors',
              isDragActive ? 'bg-primary-100' : 'bg-secondary-100'
            )}
          >
            <Upload className={cn('w-8 h-8', isDragActive ? 'text-primary-600' : 'text-secondary-400')} />
          </div>
          <div>
            <p className="font-medium text-secondary-900">
              {isDragActive ? 'Drop your resume here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-secondary-500 mt-1">
              PDF only · Max {maxSizeMB}MB
            </p>
          </div>
        </div>
      </div>
      {error && (
        <div className="mt-3 p-3 bg-danger-50 border border-danger-200 rounded-lg flex items-center gap-2 text-danger-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}

interface UploadProgressProps {
  progress: number
  status: 'uploading' | 'parsing' | 'analyzing' | 'complete' | 'error'
  message?: string
}

const statusMessages = {
  uploading: 'Uploading resume...',
  parsing: 'Parsing resume...',
  analyzing: 'Analyzing content...',
  complete: 'Analysis complete!',
  error: 'Analysis failed',
}

export function UploadProgress({ progress, status, message }: UploadProgressProps) {
  const statusColors = {
    uploading: 'text-primary-600',
    parsing: 'text-primary-600',
    analyzing: 'text-primary-600',
    complete: 'text-success-600',
    error: 'text-danger-600',
  }

  const statusIcons = {
    uploading: <Upload className="w-5 h-5 animate-spin" />,
    parsing: <FileText className="w-5 h-5 animate-pulse" />,
    analyzing: <Upload className="w-5 h-5 animate-pulse" />,
    complete: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
  }

  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className={cn('flex-1 h-2 bg-secondary-200 rounded-full overflow-hidden')}>
          <div
            className={cn('h-full rounded-full transition-all duration-300', statusColors[status])}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={cn('text-sm font-medium w-12 text-right', statusColors[status])}>
          {progress}%
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-secondary-600">
        {statusIcons[status]}
        <span>{message || statusMessages[status]}</span>
      </div>
    </div>
  )
}