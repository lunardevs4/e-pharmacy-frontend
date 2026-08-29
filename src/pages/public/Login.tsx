import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { AuthApi } from '@/services/auth-api'
import { isValidRealEmail } from '@/utils/validation'
import AuthLayout from '@/layouts/AuthLayout'
import {
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  Clock,
  ArrowLeft,
  RefreshCw,
  XCircle,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'


const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .refine((value) => isValidRealEmail(value), 'Please enter a valid email address'),
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


const BRAND = '#059669'
const BRAND_HOVER = '#047857'
const INPUT_BG = '#F7F8FA'
const SERIF = "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif"


export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()


  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)


  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isStaffLogin, setIsStaffLogin] = useState(false)


  const [pharmacyStatusData, setPharmacyStatusData] = useState<PharmacyStatusData | null>(null)
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false)
  const [lastCheckedEmail, setLastCheckedEmail] = useState('')


  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })
  const loginEmail = watch('email')


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
    setLastCheckedEmail(data.email)

    try {
      const res = await AuthApi.login(data.email, data.password)

      if (rememberMe) {
        localStorage.setItem('epharmacy_remembered_email', data.email)
      } else {
        localStorage.removeItem('epharmacy_remembered_email')
      }

      setSuccessMsg('Authentication successful! Redirecting...')
      login(res.user, res.accessToken)

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
          case 'PHARMACY_OWNER':
          case 'PHARMACIST':
            navigate('/pharmacy')
            break

          case 'GOVERNMENT':
            navigate('/government')
            break
          case 'INSURANCE':
            navigate('/insurance')
            break
          case 'ADMIN':
            navigate('/admin')
            break
          default:
            navigate('/')
        }
      }, 1200)
    } catch (err: unknown) {
      const error = err as Error & { message?: string }
      if (error.message && error.message.startsWith('PHARMACY_STATUS_ERROR:')) {
        const statusJson = error.message.substring('PHARMACY_STATUS_ERROR:'.length)
        try {
          const parsed = JSON.parse(statusJson)
          setPharmacyStatusData(parsed)
        } catch {
          setErrorMsg('Failed to parse pharmacy registration details.')
        }
      } else {
        const message = error.message?.toLowerCase() || ''
        if (message.includes('verification link expired')) {
          navigate(`/check-email?email=${encodeURIComponent(data.email)}&expired=1`)
        } else if (message.includes('verify your email')) {
          navigate(`/check-email?email=${encodeURIComponent(data.email)}&reason=login`)
        } else if (message.includes('account is not active')) {
          setErrorMsg('Your account exists, but it is not active yet. Please wait for approval or contact an administrator.')
        } else {
          setErrorMsg(error.message || 'We could not sign you in. Please check your credentials or try again later.')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }


  const handleRefreshStatus = async () => {
    setIsRefreshingStatus(true)
    setErrorMsg(null)
    try {
      const updated = await AuthApi.getRegistrationStatus(lastCheckedEmail)
      const statusData = updated as PharmacyStatusData
      setPharmacyStatusData({
        status: statusData.status,
        pharmacyName: statusData.pharmacyName,
        submissionDate: statusData.submissionDate,
        estimatedReviewTime: statusData.estimatedReviewTime,
        statusNotes: statusData.statusNotes
      })
      if (statusData.status === 'APPROVED') {
        setSuccessMsg('Your pharmacy registration has been approved! You can now sign in.')
        setPharmacyStatusData(null)
      }
    } catch (err: unknown) {
      const error = err as Error & { message?: string }
      setErrorMsg(error.message || 'Could not verify updated status.')
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
      <div className="space-y-6 animate-fadeIn" style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
        <div className="text-center pb-2" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <span
            className="inline-block mb-2 px-2 py-0.5 rounded border"
            style={{
              fontSize: '10px',
              letterSpacing: '0.15em',
              fontWeight: 900,
              textTransform: 'uppercase',
              color: BRAND,
              backgroundColor: '#ECFDF5',
              borderColor: '#A7F3D0',
            }}
          >
            MoH Audit System
          </span>
          <h3 className="text-base font-black text-gray-900">{data.pharmacyName}</h3>
        </div>


        <div
          className="flex flex-col items-center rounded-lg p-5 text-center auth-card"
          style={{
            gap: '12px',
            backgroundColor: '#F9FAFB',
          }}
        >
          <div
            className={`p-3.5 rounded-full ${current.color.split(' ')[0]} ${current.color.split(' ')[1]}`}
          >
            <IconComponent className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${current.color}`}
            >
              {current.label}
            </span>
            <p
              className="text-gray-950 font-extrabold text-sm pt-2"
              style={{ fontFamily: SERIF }}
            >
              {current.message}
            </p>
            <p className="text-[11px] font-medium leading-relaxed px-2 pt-1 text-gray-550">
              {current.desc}
            </p>
          </div>


          {data.statusNotes && (
            <div
              className="w-full rounded-md p-3.5 mt-2 text-left"
              style={{
                gap: '4px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
              }}
            >
              <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Auditor Board Comments:
              </span>
              <p className="text-gray-800 text-[11px] font-mono leading-normal">
                {data.statusNotes}
              </p>
            </div>
          )}
        </div>


        <div
          className="grid grid-cols-2 p-4 rounded-lg text-left"
          style={{
            gap: '16px',
            backgroundColor: 'rgba(249,250,251,0.5)',
            border: '1px solid #F1F5F9',
            fontSize: '11px',
            lineHeight: 1.6,
          }}
        >
          <div>
            <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-400">
              Submission Date
            </span>
            <span className="font-bold font-mono text-gray-800">{data.submissionDate}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-400">
              Estimated Review Time
            </span>
            <span className="font-bold text-gray-800">{data.estimatedReviewTime}</span>
          </div>
        </div>


        <div className="flex pt-2" style={{ gap: '12px' }}>
          <button
            type="button"
            onClick={() => setPharmacyStatusData(null)}
            className="w-1/2 flex items-center justify-center py-2.5 border rounded-md text-sm font-bold transition-colors"
            style={{
              borderColor: '#D1D5DB',
              color: '#4B5563',
              backgroundColor: '#FFFFFF',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Back to Sign In</span>
          </button>

          <button
            type="button"
            disabled={isRefreshingStatus}
            onClick={handleRefreshStatus}
            className="w-1/2 flex items-center justify-center py-2.5 rounded-md text-sm font-bold shadow-md transition-all disabled:opacity-50"
            style={{ backgroundColor: BRAND, color: '#FFFFFF' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
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
    <AuthLayout
      mode="login"
      title={pharmacyStatusData ? 'Registration Status' : 'Welcome back!'}
      subtitle={pharmacyStatusData ? undefined : 'Enter your email and password to sign in to your account'}
    >
      {errorMsg && (
        <div
          className="flex items-start rounded-2xl p-4 mb-5 text-sm shadow-sm"
          style={{
            gap: '12px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#991B1B',
          }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="font-medium leading-relaxed">{errorMsg}</span>
        </div>
      )}
      {errorMsg?.toLowerCase().includes('verify your email') && (
        <button
          type="button"
          disabled={isLoading || !loginEmail}
          onClick={async () => {
            setIsLoading(true)
            try { const result = await AuthApi.resendVerification(loginEmail); setSuccessMsg(result.message); setErrorMsg(null) }
            catch (error) { setErrorMsg(error instanceof Error ? error.message : 'Could not resend verification email.') }
            finally { setIsLoading(false) }
          }}
          className="w-full text-xs font-bold text-health-primary hover:underline disabled:opacity-50"
        >Resend verification email</button>
      )}
      {successMsg && (
        <div
          className="flex items-start rounded-2xl p-4 mb-5 text-sm shadow-sm"
          style={{
            gap: '12px',
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
          }}
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="font-medium leading-relaxed">{successMsg}</span>
        </div>
      )}
      {pharmacyStatusData ? (
        renderStatusCard(pharmacyStatusData)
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              htmlFor="email"
              className="block mb-1.5"
              style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}
            >
              Email
            </label>
            <div className="group">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User style={{ height: '18px', width: '18px', color: BRAND }} />
                </div>
                <input
                  id="email"
                  type="email"
                  disabled={isLoading}
                  {...register('email')}
                  className={`block w-full pl-11 pr-3.5 py-[12px] placeholder:text-gray-400 font-normal focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed auth-input ${
                    errors.email ? 'error' : ''
                  }`}
                  placeholder="Enter your email"
                />
              </div>
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label
                htmlFor="password"
                className="block"
                style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}
              >
                Password
              </label>
            </div>
            <div className="group">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock style={{ height: '18px', width: '18px', color: BRAND }} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  disabled={isLoading}
                  {...register('password')}
                  className={`block w-full pl-11 pr-11 py-[12px] placeholder:text-gray-400 font-normal focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed auth-input ${
                    errors.password ? 'error' : ''
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors"
                  style={{ color: '#9CA3AF' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = BRAND)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                >
                  {showPassword ? (
                    <EyeOff style={{ width: '18px', height: '18px' }} />
                  ) : (
                    <Eye style={{ width: '18px', height: '18px' }} />
                  )}
                </button>
              </div>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.password.message}
              </p>
            )}
          </div>
          <div
            className="flex items-center justify-between pt-0.5"
            style={{ fontSize: '13px' }}
          >
            <div className="flex items-center">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-[15px] w-[15px] rounded cursor-pointer flex-shrink-0"
                style={{ accentColor: BRAND, color: BRAND, borderColor: '#D1D5DB' }}
              />
              <label
                htmlFor="remember_me"
                className="ml-2 block cursor-pointer font-medium"
                style={{ color: '#4B5563' }}
              >
                Remember me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="font-semibold transition-colors"
              style={{ color: BRAND }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-[12.5px] px-4 border border-transparent text-sm font-bold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.99] auth-button"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-[18px] h-[18px] mr-2 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
          <div className="flex items-center gap-3 py-0.5">
            <div className="flex-1 h-px" style={{ backgroundColor: '#E5E7EB' }} />
            <span
              className="text-xs text-gray-400 font-medium"
              style={{ fontSize: '12px', color: '#9CA3AF' }}
            >
              or
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#E5E7EB' }} />
          </div>
         
          <div
            className="text-center pt-1 font-sans"
            style={{ fontSize: '14px' }}
          >
            <span style={{ color: '#6B7280', fontWeight: 500 }}>Don&apos;t have an account? </span>
            <Link
              to="/register"
              className="font-semibold transition-colors"
              style={{ color: BRAND }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Register
            </Link>
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
