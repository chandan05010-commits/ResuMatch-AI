import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import {
  Card,
  CardContent,
  CardFooter,
} from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import { cn, isValidEmail } from '../utils/helpers'

const registerSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100),

  email: z
    .string()
    .min(1, 'Email is required')
    .refine(isValidEmail, 'Invalid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),

  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
)

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  // Important: watch() can return undefined initially
  const password = watch('password') || ''

  const getPasswordStrength = (pwd: string) => {
    let strength = 0

    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[a-z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++

    return strength
  }

  const strength = getPasswordStrength(password)

  const strengthLabels = [
    'Very Weak',
    'Weak',
    'Fair',
    'Good',
    'Strong',
  ]

  const strengthColors = [
    'bg-danger-500',
    'bg-danger-500',
    'bg-warning-500',
    'bg-primary-500',
    'bg-success-500',
  ]

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)

    try {
      await registerUser({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
      })

      toast.success('Account created successfully!')

      navigate('/dashboard', {
        replace: true,
      })
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
        'Registration failed. Please try again.'

      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-2xl font-bold text-primary-600 mb-6"
        >
          <span className="text-3xl">📄</span>
          <span>ResuMatch AI</span>
        </Link>

        <h1 className="text-2xl font-bold text-secondary-900">
          Create your account
        </h1>

        <p className="text-secondary-600 mt-2">
          Start optimizing your resume for free
        </p>
      </div>

      {/* Register Card */}
      <Card>
        <CardContent className="p-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            {/* Full Name */}
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              error={errors.full_name?.message}
              {...register('full_name')}
              autoComplete="name"
              disabled={isLoading}
            />

            {/* Email */}
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
              autoComplete="email"
              disabled={isLoading}
            />

            {/* Password */}
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
                autoComplete="new-password"
                disabled={isLoading}
                helperText="At least 8 characters"
              />

              {/* Password visibility button */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isLoading}
                className="absolute right-3 top-[38px] text-secondary-400 hover:text-secondary-600 z-10"
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Password strength */}
            {password && (
              <div className="space-y-1.5">
                <div className="h-1.5 bg-secondary-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      strengthColors[strength - 1] ||
                        'bg-secondary-200'
                    )}
                    style={{
                      width: `${(strength / 5) * 100}%`,
                    }}
                  />
                </div>

                <p className="text-xs text-secondary-500">
                  Password strength:{' '}
                  {strengthLabels[strength - 1] || 'Very Weak'}
                </p>
              </div>
            )}

            {/* Confirm Password */}
            <div className="relative">
              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
                autoComplete="new-password"
                disabled={isLoading}
              />
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />

              <label
                htmlFor="terms"
                className="text-sm text-secondary-600"
              >
                I agree to the{' '}
                <Link
                  to="/terms"
                  className="text-primary-600 hover:text-primary-700"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to="/privacy"
                  className="text-primary-600 hover:text-primary-700"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          {/* Login link */}
          <CardFooter className="pt-6">
            <p className="text-center text-secondary-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  )
}