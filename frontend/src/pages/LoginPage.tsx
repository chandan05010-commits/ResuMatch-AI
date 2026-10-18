import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import {
  Card,
  CardContent,
  CardFooter,
} from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import { isValidEmail } from '../utils/helpers'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .refine(isValidEmail, 'Please enter a valid email'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

function GoogleLogo() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.78-.07-1.53-.23-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
      />
      <path
        fill="#34A853"
        d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.6Z"
      />
      <path
        fill="#FBBC05"
        d="M6.54 13.68a5.86 5.86 0 0 1 0-3.36V7.79H3.3a9.74 9.74 0 0 0 0 8.42l3.24-2.53Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.29c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.83 3.36 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.7 5.39l3.24 2.53C7.31 8.01 9.46 6.29 12 6.29Z"
      />
    </svg>
  )
}

function MicrosoftLogo() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="9" height="9" fill="#F35325" />
      <rect x="13" y="2" width="9" height="9" fill="#81BC06" />
      <rect x="2" y="13" width="9" height="9" fill="#05A6F0" />
      <rect x="13" y="13" width="9" height="9" fill="#FFBA08" />
    </svg>
  )
}

function LinkedInLogo() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="2"
        fill="#0A66C2"
      />
      <path
        fill="white"
        d="M7.1 9.1H4.4V18h2.7V9.1ZM5.75 4.7a1.57 1.57 0 1 0 0 3.14 1.57 1.57 0 0 0 0-3.14ZM19.6 12.9c0-2.68-1.43-3.93-3.34-3.93-1.54 0-2.23.85-2.62 1.45V9.1h-2.7V18h2.7v-4.4c0-1.16.22-2.28 1.65-2.28 1.4 0 1.42 1.32 1.42 2.35V18h2.7v-5.1h.19Z"
      />
    </svg>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true)

      // Login is handled inside AuthContext.
      // Do NOT call authApi.login() separately here.
      await login(data)

      toast.success('Welcome back!')

      const from =
        (location.state as { from?: string } | null)?.from ||
        '/dashboard'

      navigate(from, { replace: true })
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'Invalid email or password.'

      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (
    provider: 'Google' | 'Microsoft' | 'LinkedIn'
  ) => {
    toast(`${provider} sign-in will be connected to OAuth.`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back
            </h1>
            <p className="text-muted-foreground mt-2">
              Sign in to your ResuMatch AI account
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register('email')}
              error={errors.email?.message}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium"
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register('password')}
                  error={errors.password?.message}
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>

            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleSocialLogin('Google')}
            >
              <GoogleLogo />
              <span className="ml-2">Continue with Google</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleSocialLogin('Microsoft')}
            >
              <MicrosoftLogo />
              <span className="ml-2">
                Continue with Microsoft
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleSocialLogin('LinkedIn')}
            >
              <LinkedInLogo />
              <span className="ml-2">
                Continue with LinkedIn
              </span>
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center pb-8">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary font-medium hover:underline"
            >
              Create account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}