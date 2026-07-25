import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, FileText, AlertCircle, CheckCircle, Loader2, Award, Building } from 'lucide-react'

const registerSchema = z.object({
  name: z.string().min(3, 'Full name must be at least 3 characters long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string(),
  role: z.enum(['PATIENT', 'PHARMACY', 'INSURANCE', 'GOVERNMENT']),
  nid: z.string().optional(),
  licenseNumber: z.string().optional(),
  insuranceProvider: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).superRefine((data, ctx) => {
  if (data.role === 'PATIENT') {
    if (!data.nid || !/^1\d{15}$/.test(data.nid)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Rwandan National ID must be exactly 16 digits (starts with 1)',
        path: ['nid'],
      })
    }
  }
  if (data.role === 'PHARMACY') {
    if (!data.licenseNumber || data.licenseNumber.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ministry of Health license number is required',
        path: ['licenseNumber'],
      })
    }
  }
  if (data.role === 'INSURANCE') {
    if (!data.insuranceProvider || data.insuranceProvider.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Insurance agency name is required',
        path: ['insuranceProvider'],
      })
    }
  }
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function Register() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'PATIENT',
    },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      if (data.email === 'error@epharmacy.gov.rw') {
        setErrorMsg('Email address already registered in the system.')
        return
      }

      setSuccessMsg('Registration successful! Redirecting to login...')
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    }, 1500)
  }

  const roleOptions = [
    { value: 'PATIENT', label: 'Patient / Citizen' },
    { value: 'PHARMACY', label: 'Licensed Pharmacy' },
    { value: 'INSURANCE', label: 'Insurance Provider' },
    { value: 'GOVERNMENT', label: 'Ministry of Health (Gov)' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block">
          <div className="mx-auto w-12 h-12 rounded-xl bg-health-primary flex items-center justify-center text-white shadow-md">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </Link>
        <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
          Create Central Account
        </h2>
        <p className="mt-1 text-sm text-gray-550">
          Access the Rwanda National E-Pharmacy platform.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
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

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Select Your Role Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {roleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue('role', opt.value as RegisterFormValues['role'])}
                    className={`text-xs py-2 px-3 rounded-lg border font-medium text-center transition-all ${
                      selectedRole === opt.value
                        ? 'bg-emerald-50 text-health-primary border-health-primary shadow-sm font-semibold'
                        : 'bg-white text-gray-655 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                Full Name / Organization Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  disabled={isLoading}
                  {...register('name')}
                  className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                  placeholder="e.g. Pacifique Gakire"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-650">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
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
                  className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                  placeholder="e.g. pacifique@gmail.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-650">{errors.email.message}</p>
              )}
            </div>

            {/* Conditional fields based on selected role */}
            {selectedRole === 'PATIENT' && (
              <div>
                <label htmlFor="nid" className="block text-sm font-semibold text-gray-700">
                  National Identification Number (NID)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="nid"
                    type="text"
                    disabled={isLoading}
                    {...register('nid')}
                    className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-mono"
                    placeholder="1199580123456789 (16 digits)"
                    maxLength={16}
                  />
                </div>
                {errors.nid && (
                  <p className="mt-1 text-xs text-red-650">{errors.nid.message}</p>
                )}
              </div>
            )}

            {selectedRole === 'PHARMACY' && (
              <div>
                <label htmlFor="licenseNumber" className="block text-sm font-semibold text-gray-700">
                  Ministry of Health License Number
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Award className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="licenseNumber"
                    type="text"
                    disabled={isLoading}
                    {...register('licenseNumber')}
                    className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                    placeholder="e.g. MOH/PH/2026/0894"
                  />
                </div>
                {errors.licenseNumber && (
                  <p className="mt-1 text-xs text-red-650">{errors.licenseNumber.message}</p>
                )}
              </div>
            )}

            {selectedRole === 'INSURANCE' && (
              <div>
                <label htmlFor="insuranceProvider" className="block text-sm font-semibold text-gray-700">
                  Insurance Provider Agency Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="insuranceProvider"
                    type="text"
                    disabled={isLoading}
                    {...register('insuranceProvider')}
                    className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                    placeholder="e.g. RSSB, MMI, RAMA"
                  />
                </div>
                {errors.insuranceProvider && (
                  <p className="mt-1 text-xs text-red-650">{errors.insuranceProvider.message}</p>
                )}
              </div>
            )}

            {/* Password */}
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
                  {...register('password')}
                  className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-650">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  disabled={isLoading}
                  {...register('confirmPassword')}
                  className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-650">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-health-primary hover:bg-health-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <span>Register Central Account</span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-550">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-health-primary hover:underline">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
