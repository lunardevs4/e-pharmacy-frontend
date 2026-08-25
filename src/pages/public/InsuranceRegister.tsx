import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from '@/layouts/AuthLayout'
import { validateEmail } from '@/utils/validation'
import { AuthApi } from '@/services/auth-api'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  Building2,
  Mail,
  Lock,
  Smartphone,
} from 'lucide-react'

const BRAND = '#059669'
const BRAND_HOVER = '#047857'
const INPUT_BG = '#F7F8FA'
const SERIF = "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif"
const focusRing = '0 0 0 3px rgba(5, 150, 105, 0.15)'
const inputBorderRadius = '4px'

export default function InsuranceRegister() {
  const navigate = useNavigate()

  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const passwordCriteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  }
  const meetsAllCriteria = Object.values(passwordCriteria).every(Boolean)

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!fullname.trim() || fullname.trim().length < 3) {
      setErrorMsg('Provider Name is required (minimum 3 characters).')
      return
    }

    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      setErrorMsg(emailValidation.error || 'A valid real email address is required.')
      return
    }

    if (!phone.trim() || phone.trim().length < 8) {
      setErrorMsg('A valid phone number is required.')
      return
    }

    if (!meetsAllCriteria) {
      setErrorMsg('Password does not meet the safety requirements.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    setIsLoading(true)

    try {
      await AuthApi.registerInsurance({
        fullname,
        email,
        phone,
        passwordHash: password,
      })

      setSuccessMsg('Insurance Provider account registered successfully!')
      setTimeout(() => {
        navigate('/login')
      }, 2500)
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputBase =
    'block w-full pl-11 pr-4 py-[12px] placeholder:text-gray-400 font-normal focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed auth-input'

  const focusHandlers = (hasError: boolean) => ({})

  return (
    <AuthLayout
      mode="register"
      title="Create Insurance Account"
      subtitle="Register a digital insurance portal account to process claims, verify policies, and view co-pay reports."
    >
      <form
        onSubmit={handleFinalSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        {errorMsg && (
          <div
            className="flex items-start rounded-2xl p-4 text-sm shadow-sm font-sans"
            style={{
              gap: '12px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#991B1B',
            }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            className="flex items-start rounded-2xl p-4 text-sm shadow-sm font-sans"
            style={{
              gap: '12px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
            }}
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* Provider Name */}
        <div className="group font-sans">
          <label
            className="block mb-2"
            style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937' }}
          >
            Insurance Provider Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Building2 style={{ height: '18px', width: '18px', color: BRAND }} />
            </div>
            <input
              type="text"
              required
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              style={{ borderRadius: inputBorderRadius, backgroundColor: INPUT_BG }}
              className={inputBase}
              placeholder="e.g. RSSB, MMI, or Sanlam"
              {...focusHandlers(false)}
            />
          </div>
        </div>

        {/* Email */}
        <div className="group font-sans">
          <label
            className="block mb-2"
            style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937' }}
          >
            Contact Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail style={{ height: '18px', width: '18px', color: BRAND }} />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ borderRadius: inputBorderRadius, backgroundColor: INPUT_BG }}
              className={inputBase}
              placeholder="e.g. portal@rssb.rw"
              {...focusHandlers(false)}
            />
          </div>
        </div>

        {/* Phone */}
        <div className="group font-sans">
          <label
            className="block mb-2"
            style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937' }}
          >
            Contact Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Smartphone style={{ height: '18px', width: '18px', color: BRAND }} />
            </div>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ borderRadius: inputBorderRadius, backgroundColor: INPUT_BG }}
              className={inputBase}
              placeholder="e.g. +250 788 000 000"
              {...focusHandlers(false)}
            />
          </div>
        </div>

        {/* Password */}
        <div className="group font-sans">
          <label
            className="block mb-2"
            style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937' }}
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock style={{ height: '18px', width: '18px', color: BRAND }} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ borderRadius: inputBorderRadius, backgroundColor: INPUT_BG }}
              className={inputBase + ' pr-12'}
              placeholder="••••••••"
              {...focusHandlers(false)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors"
              style={{ color: '#9CA3AF' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = BRAND)}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
            >
              {showPassword ? (
                <EyeOff className="w-[18px] h-[18px]" />
              ) : (
                <Eye className="w-[18px] h-[18px]" />
              )}
            </button>
          </div>

          {password && (
            <div
              className="mt-3.5 p-4 rounded-2xl text-xs space-y-2 font-medium"
              style={{
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                color: '#6B7280',
              }}
            >
              <span
                className="block mb-1.5"
                style={{
                  fontWeight: 700,
                  color: '#374151',
                  fontFamily: SERIF,
                  fontSize: '13.5px',
                }}
              >
                Password Requirements:
              </span>
              {(['length', 'uppercase', 'lowercase', 'number', 'special'] as const).map((k) => {
                const labels: Record<string, string> = {
                  length: 'Minimum 8 characters',
                  uppercase: 'At least one uppercase letter',
                  lowercase: 'At least one lowercase letter',
                  number: 'At least one number',
                  special: 'At least one special character (@$!%*?&)',
                }
                const ok = passwordCriteria[k]
                return (
                  <div key={k} className="flex items-center space-x-2.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: ok ? BRAND : '#D1D5DB' }}
                    />
                    <span style={{ color: ok ? BRAND : '#6B7280', fontWeight: ok ? 700 : 500 }}>
                      {labels[k]}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="group font-sans">
          <label
            className="block mb-2"
            style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937' }}
          >
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock style={{ height: '18px', width: '18px', color: BRAND }} />
            </div>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ borderRadius: inputBorderRadius, backgroundColor: INPUT_BG }}
              className={inputBase}
              placeholder="••••••••"
              {...focusHandlers(false)}
            />
          </div>
          {password && confirmPassword && password !== confirmPassword && (
            <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1 font-sans">
              <AlertCircle className="w-3.5 h-3.5" />
              Passwords do not match.
            </p>
          )}
        </div>

        {/* Submit button — pill */}
        <button
          type="submit"
          disabled={isLoading || !meetsAllCriteria || password !== confirmPassword}
          className="w-full flex justify-center items-center py-[13px] px-4 border border-transparent text-sm font-bold text-white disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 active:scale-[0.99] mt-2 auth-button font-sans"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              <span>Registering...</span>
            </>
          ) : (
            <span>Register Account</span>
          )}
        </button>

        <div className="text-center text-sm mt-4 font-sans font-semibold">
          <span style={{ color: '#6B7280', fontWeight: 500 }}>Already onboarded? </span>
          <Link
            to="/login"
            style={{ color: BRAND, fontWeight: 700 }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
