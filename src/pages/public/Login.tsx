import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types'
import { Lock, Mail, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['PATIENT', 'PHARMACY', 'INSURANCE', 'GOVERNMENT', 'ADMIN']),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Interactive secret Admin clicker
  const [logoClicks, setLogoClicks] = useState(0)
  const [showAdminRole, setShowAdminRole] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: 'PATIENT',
    },
  })

  const selectedRole = watch('role')

  const handleLogoClick = () => {
    const nextClicks = logoClicks + 1
    setLogoClicks(nextClicks)
    if (nextClicks >= 5) {
      setShowAdminRole(true)
    }
  }

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Mock error check
      if (data.email === 'error@epharmacy.gov.rw') {
        setErrorMsg('Invalid credentials. Please verify your email and password.')
        return
      }

      const mockUser = {
        id: 'usr_mock_123',
        email: data.email,
        name: data.email.split('@')[0].toUpperCase(),
        role: data.role as UserRole,
      }

      setSuccessMsg('Login successful! Redirecting to your portal...')
      
      // Save details to Zustand authStore
      login(mockUser, 'mock_jwt_token_header_secret_payload')

      // Redirect after a short delay
      setTimeout(() => {
        switch (data.role) {
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
      }, 1000)
    }, 1500)
  }

  const roleOptions = [
    { value: 'PATIENT', label: 'Patient / Citizen' },
    { value: 'PHARMACY', label: 'Licensed Pharmacy' },
    { value: 'INSURANCE', label: 'Insurance Provider' },
    { value: 'GOVERNMENT', label: 'Ministry of Health (Gov)' },
    ...(showAdminRole ? [{ value: 'ADMIN', label: 'System Administrator (Secret)' }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand logo that acts as secret admin portal toggle */}
        <button
          onClick={handleLogoClick}
          type="button"
          className="mx-auto w-12 h-12 rounded-xl bg-health-primary flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </button>

        {/* Secret click progress dots */}
        {logoClicks > 0 && logoClicks < 5 && (
          <div className="flex justify-center space-x-1 mt-2">
            {[...Array(logoClicks)].map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ))}
          </div>
        )}

        <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
          Rwanda National E-Pharmacy
        </h2>
        <p className="mt-1 text-sm text-gray-550">
          Secure central portal authentication.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-gray-200 shadow-xl rounded-2xl sm:px-10">
          
          {/* Status Messages */}
          {errorMsg && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-emerald-50 border border-emerald-250 rounded-lg p-3 flex items-start space-x-2 text-emerald-800 text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Role selection tabs */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {roleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue('role', opt.value as LoginFormValues['role'])}
                    className={`text-xs py-2 px-3 rounded-lg border font-medium text-center transition-all ${
                      selectedRole === opt.value
                        ? 'bg-emerald-50 text-health-primary border-health-primary shadow-sm font-semibold'
                        : 'bg-white text-gray-650 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {errors.role && (
                <p className="mt-1 text-xs text-red-650">{errors.role.message}</p>
              )}
            </div>

            {/* Email field */}
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
                  autoComplete="email"
                  disabled={isLoading}
                  {...register('email')}
                  className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                  placeholder="e.g. pacifique@health.gov.rw"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-650">{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  disabled={isLoading}
                  autoComplete="current-password"
                  {...register('password')}
                  className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-650">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-health-primary hover:bg-health-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </div>
          </form>

          {/* Footer link */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-health-primary hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
