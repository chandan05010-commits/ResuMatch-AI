import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Loader2, ArrowRight, FileText, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { FileUpload, UploadProgress } from '../components/ui/FileUpload'
import { resumeApi, analysisApi } from '../services/api'
import { formatFileSize } from '../utils/helpers'

const analyzerSchema = z.object({
  target_job_title: z.string().min(2, 'Job title is required').max(200),
  job_description: z.string().min(50, 'Job description must be at least 50 characters').max(10000),
})

type AnalyzerForm = z.infer<typeof analyzerSchema>

export default function AnalyzerPage() {
  const navigate = useNavigate()
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'parsing' | 'analyzing' | 'complete' | 'error'>('idle')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [resumeId, setResumeId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<AnalyzerForm>({
    resolver: zodResolver(analyzerSchema),
  })

  const jobDescription = watch('job_description') || ''
  const handleFileSelect = async (file: File) => {
    setUploadStatus('uploading')
    setUploadProgress(0)
    try {
      const response = await resumeApi.upload(file, (progress) => setUploadProgress(progress))
      setResumeFile(file)
      setResumeId(response.data.id)
      setUploadStatus('complete')
      toast.success('Resume uploaded successfully')
      setTimeout(() => setUploadStatus('idle'), 2000)
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { detail?: string } } }
      const message = axiosError.response?.data?.detail || 'Upload failed'
      toast.error(message)
      setUploadStatus('error')
    }
  }

  const handleRemoveFile = () => {
    setResumeFile(null)
    setResumeId(null)
    setUploadStatus('idle')
    setUploadProgress(0)
  }

  const handleAnalyze = async (data: AnalyzerForm) => {
    if (!resumeId) {
      toast.error('Please upload a resume first')
      return
    }

    setIsAnalyzing(true)
    setUploadStatus('parsing')
    setUploadProgress(0)

    try {
      setUploadStatus('analyzing')
      const response = await analysisApi.analyze({
        resume_id: resumeId,
        target_job_title: data.target_job_title,
        job_description: data.job_description,
      })

      setUploadStatus('complete')
      toast.success('Analysis complete!')
      navigate(`/results/${response.data.id}`)
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { detail?: string } } }
      const message = axiosError.response?.data?.detail || 'Analysis failed. Please try again.'
      toast.error(message)
      setUploadStatus('error')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const canAnalyze = resumeId && !isAnalyzing

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-secondary-900">Resume Analyzer</h1>
        <p className="text-secondary-600 mt-2">Upload your resume and paste a job description to get a detailed ATS analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Upload Resume</CardTitle>
            <CardDescription>PDF only · Max 10MB</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFileSelect={handleFileSelect}
              acceptedTypes={['application/pdf']}
              maxSizeMB={10}
              currentFile={resumeFile}
              onRemove={handleRemoveFile}
              isLoading={uploadStatus === 'uploading' || uploadStatus === 'parsing'}
              error={uploadStatus === 'error' ? 'Upload failed. Please try again.' : undefined}
            />

            {uploadStatus !== 'idle' && uploadStatus !== 'complete' && (
              <UploadProgress
                progress={uploadProgress}
                status={uploadStatus}
              />
            )}

            {resumeFile && uploadStatus === 'complete' && (
              <div className="mt-4 p-3 bg-success-50 border border-success-200 rounded-lg flex items-center gap-3">
                <FileText className="w-5 h-5 text-success-600" />
                <div className="flex-1">
                  <p className="font-medium text-success-800">{resumeFile.name}</p>
                  <p className="text-sm text-success-600">{formatFileSize(resumeFile.size)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Job Details</CardTitle>
            <CardDescription>Enter the target role and job description</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleAnalyze)} className="space-y-4" noValidate>
              <Input
                label="Target Job Title"
                placeholder="e.g., Senior Frontend Engineer"
                error={errors.target_job_title?.message}
                {...register('target_job_title')}
                disabled={isAnalyzing}
              />

              <Textarea
                label="Job Description"
                placeholder="Paste the full job description here..."
                rows={10}
                error={errors.job_description?.message}
                {...register('job_description')}
                disabled={isAnalyzing}
                helperText={`${jobDescription.length}/10000 characters`}
              />

              <div className="flex items-center gap-4 pt-4">
                <Button type="submit" size="lg" className="flex-1" isLoading={isAnalyzing} disabled={!canAnalyze}>
                  {isAnalyzing && <Loader2 className="w-5 h-5" />}
                  Analyze Resume <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary-50 border-primary-100">
        <CardContent className="p-6">
          <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" />
            What You'll Get
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-secondary-700">
              <span className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold">1</span>
              Overall ATS Score (0-100)
            </div>
            <div className="flex items-center gap-2 text-secondary-700">
              <span className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold">2</span>
              Keyword Match & Coverage
            </div>
            <div className="flex items-center gap-2 text-secondary-700">
              <span className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold">3</span>
              Skill Gap Analysis
            </div>
            <div className="flex items-center gap-2 text-secondary-700">
              <span className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold">4</span>
              Formatting & Wording Review
            </div>
            <div className="flex items-center gap-2 text-secondary-700">
              <span className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold">5</span>
              Bullet-by-Bullet Feedback
            </div>
            <div className="flex items-center gap-2 text-secondary-700">
              <span className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold">6</span>
              Prioritized Improvement Plan
            </div>
            <div className="flex items-center gap-2 text-secondary-700">
              <span className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold">7</span>
              Job Match Percentage
            </div>
            <div className="flex items-center gap-2 text-secondary-700">
              <span className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold">8</span>
              Save to History & Track
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}