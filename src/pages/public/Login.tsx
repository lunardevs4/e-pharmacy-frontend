import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { AuthApi } from '@/services/auth-api'
import AuthLayout from '@/layouts/AuthLayout'
import { Lock, User, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff, Clock, ArrowLeft, RefreshCw, XCircle, ShieldAlert } from 'lucide-react'

const loginSchema = z.object({
  identifier: z.string().min(1, 'Username or Email is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface PharmacyStatusData {
  status: 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'EXPIRED' | 'MORE_INFO_REQUESTED'
  pharmacyName: string
  submissionDate: string
  estimatedReviewTime: string
  statusNotes?: string
}

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Status view for unapproved pharmacies
  const [pharmacyStatusData, setPharmacyStatusData] = useState<PharmacyStatusData | null>(null)
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false)
  const [lastCheckedIdentifier, setLastCheckedIdentifier] = useState('')

  // Load remembered identifier on mount
  useEffect(() => {
    const savedIdentifier = localStorage.getItem('epharmacy_remembered_identifier')
    if (savedIdentifier) {
      setValue('identifier', savedIdentifier)
      setRememberMe(true)
    }
  }, [])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    setLastCheckedIdentifier(data.identifier)

    try {
      // Authenticate via NestJS-compatible auth service
      const res = await AuthApi.login(data.identifier, data.password)
      
      // Save identifier if rememberMe is enabled
      if (rememberMe) {
        localStorage.setItem('epharmacy_remembered_identifier', data.identifier)
      } else {
        localStorage.removeItem('epharmacy_remembered_identifier')
      }

      setSuccessMsg('Authentication successful! Redirecting...')
      
      // Save details to Zustand authStore
      login(res.user, res.accessToken)

      // Direct roles to appropriate dashboards based STRICTLY on returned user role
      setTimeout(() => {
        if (res.user.firstLogin) {
          navigate('/change-password')
          return
        }

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
      if (err.message && err.message.startsWith('PHARMACY_STATUS_ERROR:')) {
        const statusJson = err.message.substring('PHARMACY_STATUS_ERROR:'.length)
        try {
          const parsed = JSON.parse(statusJson)
          setPharmacyStatusData(parsed)
        } catch (e) {
          setErrorMsg('Failed to parse pharmacy registration details.')
        }
      } else {
        setErrorMsg(err.message || 'Authentication failed. Please check your credentials.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Reload status to check if MOH has updated it
  const handleRefreshStatus = async () => {
    setIsRefreshingStatus(true)
    setErrorMsg(null)
    try {
      const updated = await AuthApi.getRegistrationStatus(lastCheckedIdentifier)
      setPharmacyStatusData({
        status: updated.status,
        pharmacyName: updated.pharmacyName,
        submissionDate: updated.submissionDate,
        estimatedReviewTime: updated.estimatedReviewTime,
        statusNotes: updated.statusNotes
      })
      if (updated.status === 'APPROVED') {
        setSuccessMsg('Your pharmacy registration has been approved! You can now sign in.')
        setPharmacyStatusData(null)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not verify updated status.')
    } finally {
      setIsRefreshingStatus(false)
    }
  }

  const renderStatusCard = (data: PharmacyStatusData) => {
    const statusMap = {
      PENDING_VERIFICATION: {
        label: 'Under MoH Review',
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        message: 'Your pharmacy registration is currently under Ministry of Health review.',
        desc: 'Our administrative inspectors are auditing your uploaded operating licenses, RDB registration certifications, superintendent pharmacist credentials, and RRA clearances.',
        icon: Clock
      },
      APPROVED: {
        label: 'Approved',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        message: 'Your pharmacy registration has been approved!',
        desc: 'You can now sign in to your portal.',
        icon: CheckCircle2
      },
      REJECTED: {
        label: 'Application Rejected',
        color: 'bg-red-100 text-red-800 border-red-200',
        message: 'Your pharmacy registration application was rejected by the Ministry of Health.',
        desc: 'Please review the auditor notes below for details on missing or incorrect compliance documentation.',
        icon: XCircle
      },
      SUSPENDED: {
        label: 'License Suspended',
        color: 'bg-rose-100 text-rose-800 border-rose-200',
        message: 'Your pharmacy operating portal access has been suspended.',
        desc: 'Suspensions are applied by the MoH compliance board due to regulatory concerns, pharmacy licensing expirations, or code-of-conduct violations.',
        icon: ShieldAlert
      },
      EXPIRED: {
        label: 'Operating License Expired',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        message: 'Your pharmacy operating license has expired.',
        desc: 'Please contact the Ministry of Health licensing division to file your renewal audit and reactivate your portal privileges.',
        icon: ShieldAlert
      },
      MORE_INFO_REQUESTED: {
        label: 'Additional Info Requested',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        message: 'The Ministry of Health requires additional information to complete your registration.',
        desc: 'Please review the auditor comment below and supply updated details to your regional verification officer.',
        icon: MailIcon
      }
    }

    const current = statusMap[data.status] || statusMap.PENDING_VERIFICATION
    const IconComponent = current.icon

    return (
      <div className="space-y-6 animate-fadeIn font-semibold text-xs text-gray-700">
        <div className="text-center pb-2 border-b border-gray-150">
          <span className="text-[10px] tracking-widest font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mb-2">MoH Audit System</span>
          <h3 className="text-base font-black text-gray-900">{data.pharmacyName}</h3>
        </div>

        <div className="flex flex-col items-center bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center gap-3">
          <div className={`p-3.5 rounded-full ${current.color.split(' ')[0]} ${current.color.split(' ')[1]}`}>
            <IconComponent className="w-7 h-7" />
          </div>
          
          <div className="space-y-1">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${current.color}`}>
              {current.label}
            </span>
            <p className="text-gray-950 font-extrabold text-sm pt-2">{current.message}</p>
            <p className="text-gray-550 text-[11px] font-medium leading-relaxed px-2 pt-1">{current.desc}</p>
          </div>

          {data.statusNotes && (
            <div className="w-full bg-white border border-gray-200 rounded-xl p-3.5 mt-2 text-left space-y-1">
              <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Auditor Board Comments:</span>
              <p className="text-gray-800 text-[11px] font-mono leading-normal">{data.statusNotes}</p>
            </div>
          )}
        </div>

        {/* Timelines and metadata */}
        <div className="grid grid-cols-2 gap-4 bg-gray-50/50 border border-gray-150 p-4 rounded-xl text-left text-[11px] leading-relaxed">
          <div>
            <span className="text-gray-450 block text-[10px] uppercase font-bold tracking-wider">Submission Date</span>
            <span className="text-gray-800 font-bold font-mono">{data.submissionDate}</span>
          </div>
          <div>
            <span className="text-gray-450 block text-[10px] uppercase font-bold tracking-wider">Estimated Review Time</span>
            <span className="text-gray-800 font-bold">{data.estimatedReviewTime}</span>
          </div>
        </div>

        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={() => setPharmacyStatusData(null)}
            className="w-1/2 flex items-center justify-center py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-650 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Back to Sign In</span>
          </button>
          
          <button
            type="button"
            disabled={isRefreshingStatus}
            onClick={handleRefreshStatus}
            className="w-1/2 flex items-center justify-center py-2.5 text-white bg-health-primary hover:bg-health-secondary rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
          >
            {isRefreshingStatus ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                <span>Check Status</span>
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <AuthLayout title={pharmacyStatusData ? "Registration Status" : "Sign In"} subtitle={pharmacyStatusData ? undefined : "Access your secure Rwanda National E-Pharmacy account."}>
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-red-800 text-xs mb-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-250 rounded-lg p-3 flex items-start space-x-2 text-emerald-805 text-xs mb-4">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {pharmacyStatusData ? (
        renderStatusCard(pharmacyStatusData)
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-semibold text-xs text-gray-700">
          {/* Username or Email Address */}
          <div>
            <label htmlFor="identifier" className="block text-sm font-semibold text-gray-700">
              Username or Email
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="identifier"
                type="text"
                disabled={isLoading}
                {...register('identifier')}
                className={`block w-full pl-10 pr-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold ${
                  errors.identifier ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Username or Email address"
              />
            </div>
            {errors.identifier && (
              <p className="mt-1 text-xs text-red-655 font-bold">{errors.identifier.message}</p>
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
                className={`block w-full pl-10 pr-10 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold ${
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
              <p className="mt-1 text-xs text-red-655 font-bold">{errors.password.message}</p>
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
              <label htmlFor="remember_me" className="ml-2 block text-xs text-gray-755 font-medium cursor-pointer">
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
          <div className="text-center text-xs mt-4 pt-4 border-t border-gray-150 flex flex-col gap-2">
            <div>
              <span className="text-gray-500">Need a secure patient account? </span>
              <Link to="/register/patient" className="font-bold text-health-primary hover:underline">
                Register as Patient
              </Link>
            </div>
            <div>
              <span className="text-gray-500">Register a pharmacy store? </span>
              <Link to="/register/pharmacy" className="font-bold text-health-primary hover:underline">
                Onboard Pharmacy
              </Link>
            </div>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" {...props}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}
