import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { 
  Bell, 
  Moon, 
  Sun, 
  Monitor, 
  Palette, 
  Globe, 
  Shield, 
  Download, 
  Trash2,
  Save,
  Loader2,
  Linkedin,
  Github,
  Calendar,
  FileText,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Dropdown } from '../components/ui/Dropdown'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Switch } from '../components/ui/Switch'
import { cn } from '../utils/helpers'

const notificationSchema = z.object({
  email_notifications: z.boolean(),
  weekly_digest: z.boolean(),
  application_reminders: z.boolean(),
  scan_complete: z.boolean(),
  marketing_emails: z.boolean(),
})

type NotificationForm = z.infer<typeof notificationSchema>

const appearanceOptions = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
]

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'notifications' | 'appearance' | 'data' | 'integrations'>('notifications')
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<NotificationForm>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      email_notifications: true,
      weekly_digest: true,
      application_reminders: true,
      scan_complete: true,
      marketing_emails: false,
    },
  })

  const emailNotifications = watch('email_notifications')

  const notificationItems: Array<{
    key: keyof NotificationForm
    label: string
    description: string
    required: boolean
  }> = [
    { key: 'email_notifications', label: 'Email Notifications', description: 'Receive all email notifications', required: true },
    { key: 'weekly_digest', label: 'Weekly Digest', description: 'Weekly summary of your application activity', required: false },
    { key: 'application_reminders', label: 'Application Reminders', description: 'Reminders to follow up on applications', required: false },
    { key: 'scan_complete', label: 'Scan Complete', description: 'Notification when resume analysis finishes', required: false },
    { key: 'marketing_emails', label: 'Marketing Emails', description: 'Product updates and tips (optional)', required: false },
  ]

  const onSubmit = async (data: NotificationForm) => {
    setIsSaving(true)
    try {
      await new Promise(r => setTimeout(r, 500))
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Privacy', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Globe },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Settings</h1>
        <p className="text-secondary-600">Customize your ResuMatch AI experience</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-secondary-200 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              activeTab === tab.id
                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>Choose what emails you'd like to receive</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {notificationItems.map(({ key, label, description, required }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register(key)}
                          className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                          disabled={required}
                        />
                        <span className="font-medium text-secondary-900">{label}{required && ' *'}</span>
                      </label>
                      <p className="text-sm text-secondary-500 mt-1 ml-6">{description}</p>
                    </div>
                    {!required && (
                      <Switch
                        checked={watch(key)}
                        onChange={(checked) => register(key).onChange({ target: { checked } })}
                        disabled={!emailNotifications && key !== 'email_notifications'}
                      />
                    )}
                  </div>
                ))}
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button type="submit" form={undefined} onClick={() => handleSubmit(onSubmit)()} isLoading={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </CardFooter>
        </Card>
      )}

      {activeTab === 'appearance' && (
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how ResuMatch AI looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">Theme</label>
              <div className="grid grid-cols-3 gap-4">
                {appearanceOptions.map((option) => (
                  <button
                    key={option.value}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all text-left',
                      option.value === 'system'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-secondary-200 hover:border-primary-300'
                    )}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <option.icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <span className="font-medium text-secondary-900">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">Language</label>
              <Dropdown
                options={languageOptions}
                value="en"
                onChange={() => {}}
                placeholder="Select language"
              />
            </div>

            <div className="pt-4 border-t border-secondary-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-secondary-700">Reduce motion (disable animations)</span>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'data' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Export</CardTitle>
              <CardDescription>Download all your data in JSON format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-secondary-900">Export Data</p>
                  <p className="text-sm text-secondary-500">Includes profile, resumes, analyses, applications, and history</p>
                </div>
                <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>Export Data</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-danger-50 border-danger-100">
            <CardHeader>
              <CardTitle className="text-danger-900 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Delete All Data
              </CardTitle>
              <CardDescription>Permanently remove all your data from our servers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-danger-800">Delete Account & Data</p>
                  <p className="text-sm text-danger-600">This action cannot be undone. All your resumes, analyses, applications, and history will be permanently deleted.</p>
                </div>
                <Button variant="danger" size="sm">Delete Everything</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'integrations' && (
        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>Connect external services (coming soon)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'LinkedIn', description: 'Import profile data and track applications', icon: Linkedin, status: 'coming' },
              { name: 'GitHub', description: 'Showcase projects and contributions', icon: Github, status: 'coming' },
              { name: 'Google Calendar', description: 'Sync interview schedules', icon: Calendar, status: 'coming' },
              { name: 'Notion', description: 'Export analyses to Notion workspace', icon: FileText, status: 'coming' },
            ].map((integration) => (
              <div key={integration.name} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <integration.icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">{integration.name}</p>
                    <p className="text-sm text-secondary-500">{integration.description}</p>
                  </div>
                </div>
                <Badge variant="secondary">{integration.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="bg-secondary-50 border-secondary-200">
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>Application information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-secondary-600">Version</span><span className="font-medium text-secondary-900">1.0.0</span></div>
          <div className="flex justify-between"><span className="text-secondary-600">Environment</span><span className="font-medium text-secondary-900">Development</span></div>
          <div className="flex justify-between"><span className="text-secondary-600">AI Provider</span><span className="font-medium text-secondary-900">Gemini + Local NLP</span></div>
        </CardContent>
      </Card>
    </div>
  )
}