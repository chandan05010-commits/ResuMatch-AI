import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { authApi } from '../services/api'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'

type Step = 'email' | 'otp' | 'password' | 'success'

const OTP_DURATION = 4 * 60

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [timeLeft, setTimeLeft] = useState(OTP_DURATION)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (step !== 'otp' || timeLeft <= 0) {
      return
    }

    const timer = window.setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [step, timeLeft])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`
  }

  const handleRequestOTP = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (!email.trim()) {
      toast.error('Please enter your email address.')
      return
    }

    try {
      setIsLoading(true)

      await authApi.requestPasswordReset(email.trim())

      setTimeLeft(OTP_DURATION)
      setStep('otp')

      toast.success('If an account exists, an OTP has been sent.')
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        'Unable to send OTP. Please try again.'

      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP.')
      return
    }

    if (timeLeft <= 0) {
      toast.error('OTP has expired. Please request a new OTP.')
      return
    }

    try {
      setIsLoading(true)

      await authApi.verifyPasswordResetOTP(
        email.trim(),
        otp
      )

      setStep('password')

      toast.success('OTP verified successfully.')
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        'Invalid or expired OTP.'

      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (password.length < 8) {
      toast.error(
        'Password must be at least 8 characters.'
      )
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    try {
      setIsLoading(true)

      await authApi.resetPassword(
        email.trim(),
        otp,
        password
      )

      setStep('success')

      toast.success('Password reset successfully.')
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        'Unable to reset password. Please try again.'

      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    try {
      setIsLoading(true)

      await authApi.requestPasswordReset(email.trim())

      setOtp('')
      setTimeLeft(OTP_DURATION)

      toast.success('A new OTP has been sent.')
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        'Unable to resend OTP.'

      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
            {step === 'otp' ? (
              <ShieldCheck className="h-7 w-7 text-indigo-600" />
            ) : (
              <Mail className="h-7 w-7 text-indigo-600" />
            )}
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            {step === 'email' && 'Forgot your password?'}
            {step === 'otp' && 'Verify your OTP'}
            {step === 'password' && 'Create new password'}
            {step === 'success' && 'Password reset complete'}
          </h1>

          <p className="mt-2 text-slate-600">
            {step === 'email' &&
              'Enter your email and we will send you a reset OTP.'}

            {step === 'otp' &&
              `Enter the 6-digit OTP sent to ${email}.`}

            {step === 'password' &&
              'Create a new password for your account.'}

            {step === 'success' &&
              'Your password has been changed successfully.'}
          </p>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-6">

            {step === 'email' && (
              <form
                onSubmit={handleRequestOTP}
                className="space-y-5"
              >
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoComplete="email"
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send Reset OTP'
                  )}
                </Button>
              </form>
            )}

            {step === 'otp' && (
              <form
                onSubmit={handleVerifyOTP}
                className="space-y-5"
              >
                <Input
                  label="6-Digit OTP"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value
                        .replace(/\D/g, '')
                        .slice(0, 6)
                    )
                  }
                  autoComplete="one-time-code"
                />

                <div className="text-center">
                  <p
                    className={`text-sm font-medium ${
                      timeLeft === 0
                        ? 'text-red-600'
                        : 'text-slate-600'
                    }`}
                  >
                    {timeLeft > 0
                      ? `OTP expires in ${formatTime(timeLeft)}`
                      : 'OTP expired'}
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || timeLeft === 0}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                >
                  Resend OTP
                </Button>
              </form>
            )}

            {step === 'password' && (
              <form
                onSubmit={handleResetPassword}
                className="space-y-5"
              >
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="new-password"
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  autoComplete="new-password"
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            )}

            {step === 'success' && (
              <div className="text-center space-y-4">
                <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                  <p className="text-sm text-green-800">
                    Your password has been reset successfully.
                    All previous sessions have been invalidated.
                  </p>
                </div>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center w-full h-11 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
                >
                  Sign In With New Password
                </Link>
              </div>
            )}

            {step !== 'success' && (
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  )
}