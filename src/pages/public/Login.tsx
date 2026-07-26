import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { AuthApi } from '@/services/auth-api'
import AuthLayout from '@/layouts/AuthLayout'
import { Lock, Mail, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('epharmacy_remembered_email')
    if (savedEmail) {
      setValue('email', savedEmail)
      setRememberMe(true)
    }
  }, [setValue])

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      // Authenticate via NestJS-compatible auth service
      const res = await AuthApi.login(data.email, data.password)
      
      // Save email if rememberMe is enabled
      if (rememberMe) {
        localStorage.setItem('epharmacy_remembered_email', data.email)
      } else {
        localStorage.removeItem('epharmacy_remembered_email')
      }

      setSuccessMsg('Authentication successful! Redirecting...')
      
      // Save details to Zustand authStore
      login(res.user, res.accessToken)

      // Automatically check firstLogin flag
      setTimeout(() => {
        if (res.user.firstLogin) {
          navigate('/change-password')
          return
        }

        // Direct roles to appropriate dashboards
        switch (res.user.role) {
          case 'PATIENT':
            navigate('/patient')
            break
          case 'PHARMACY':
            navigate('/pharmacy')
            break
          case 'INSURANCE':
            navigate('/insurance')
            break
          case 'GOVERNMENT':
            navigate('/government')
            break
          case 'ADMIN':
            navigate('/admin')
            break
          default:
            navigate('/')
        }
      }, 1200)
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="Sign In" subtitle="Access your secure Rwanda National E-Pharmacy account.">
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-red-800 text-xs mb-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-250 rounded-lg p-3 flex items-start space-x-2 text-emerald-800 text-xs mb-4">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Address */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
            Email Address
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              disabled={isLoading}
              {...register('email')}
              className={`block w-full pl-10 pr-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g. staff@epharmacy.rw"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-650">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs font-semibold text-health-primary hover:underline">
              Forgot Password?
            </Link>
          </div>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              disabled={isLoading}
              {...register('password')}
              className={`block w-full pl-10 pr-10 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-650"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-650">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember_me"
              name="remember_me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="remember_me" className="ml-2 block text-xs text-gray-750 font-medium cursor-pointer">
              Remember me
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-health-primary hover:bg-health-secondary focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>

        {/* Registration Link */}
        <div className="text-center text-xs mt-4 pt-4 border-t border-gray-150">
          <span className="text-gray-500">Need a secure account? </span>
          <Link to="/register" className="font-semibold text-health-primary hover:underline">
            Register Now
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
