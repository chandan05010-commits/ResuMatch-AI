import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card'
import { authApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { isValidEmail } from '../utils/helpers'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').refine(isValidEmail, 'Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      await login(data)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { detail?: string } } }
      const message = axiosError.response?.data?.detail || 'Invalid email or password'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary-600 mb-6">
          <span className="text-3xl">📄</span>
          <span>ResuMatch AI</span>
        </Link>
        <h1 className="text-2xl font-bold text-secondary-900">Welcome back</h1>
        <p className="text-secondary-600 mt-2">Sign in to your account to continue</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
              autoComplete="email"
              disabled={isLoading}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
                autoComplete="current-password"
                disabled={isLoading}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-secondary-400 hover:text-secondary-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-secondary-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4" />}
              Sign In
            </Button>
          </form>

          <CardFooter className="pt-6">
            <p className="text-center text-secondary-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </CardContent>
      </Card>

      <div className="mt-6 text-center text-sm text-secondary-500">
        <p>By continuing, you agree to our </p>
        <Link to="/terms" className="text-primary-600 hover:text-primary-700">Terms of Service</Link>
        <p className="text-secondary-500"> and </p>
        <Link to="/privacy" className="text-primary-600 hover:text-primary-700">Privacy Policy</Link>
      </div>
    </div>
  )
}