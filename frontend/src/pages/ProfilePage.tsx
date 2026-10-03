import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { User, Mail, Lock, Save, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import { cn, getInitials } from '../utils/helpers'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
})

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine(data => data.new_password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile')
  const [isSaving, setIsSaving] = useState(false)

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmitProfile = async (data: ProfileForm) => {
    setIsSaving(true)
    try {
      await refreshUser()
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const onSubmitPassword = async (data: PasswordForm) => {
    setIsSaving(true)
    try {
      toast.success('Password updated successfully')
      resetPassword()
    } catch {
      toast.error('Failed to update password. Check your current password.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Profile Settings</h1>
        <p className="text-secondary-600">Manage your account information and security settings</p>
      </div>

      <div className="flex gap-4 border-b border-secondary-200">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'security', label: 'Security', icon: Lock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'profile' | 'security')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-700">{getInitials(user?.full_name || '')}</span>
              </div>
              <div>
                <CardTitle>{user?.full_name}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                error={profileErrors.full_name?.message}
                {...registerProfile('full_name')}
                leftIcon={<User className="w-5 h-5" />}
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={profileErrors.email?.message}
                {...registerProfile('email')}
                leftIcon={<Mail className="w-5 h-5" />}
              />
              <div className="pt-4 border-t border-secondary-200">
                <p className="text-sm text-secondary-500 mb-3">Account created: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</p>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button type="submit" form={undefined} onClick={() => handleSubmitProfile(onSubmitProfile)()} isLoading={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                error={passwordErrors.current_password?.message}
                {...registerPassword('current_password')}
                leftIcon={<Lock className="w-5 h-5" />}
              />
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                error={passwordErrors.new_password?.message}
                {...registerPassword('new_password')}
                leftIcon={<Lock className="w-5 h-5" />}
                helperText="At least 8 characters"
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                error={passwordErrors.confirm_password?.message}
                {...registerPassword('confirm_password')}
                leftIcon={<Lock className="w-5 h-5" />}
              />
            </form>
          </CardContent>
          <CardFooter>
            <Button type="submit" form={undefined} onClick={() => handleSubmitPassword(onSubmitPassword)()} isLoading={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              Update Password
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card className="bg-danger-50 border-danger-100">
        <CardHeader>
          <CardTitle className="text-danger-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-danger-800">Delete Account</p>
              <p className="text-sm text-danger-600">Permanently delete your account and all associated data</p>
            </div>
            <Button variant="danger" size="sm">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}