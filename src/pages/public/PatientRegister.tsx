import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from '@/layouts/AuthLayout'
import { validateEmail } from '@/utils/validation'
import { AuthApi } from '@/services/auth-api'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  User,
  Calendar,
  Smartphone,
  Mail,
  Lock,
  Check,
} from 'lucide-react'

const BRAND = '#059669'
const BRAND_HOVER = '#047857'
const INPUT_BG = '#F7F8FA'
const SERIF = 'var(--font-family-base)'
const focusRing = '0 0 0 3px rgba(5, 150, 105, 0.15)'
const inputBorderRadius = '4px'

type RegStep = 1 | 2 | 3

export default function PatientRegister() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<RegStep>(1)

  const [fullName, setFullName] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('')
  const [phone, setPhone] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptPrivacy, setAcceptPrivacy] = useState(false)

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

  const getPasswordStrength = () => {
    const passed = Object.values(passwordCriteria).filter(Boolean).length
    if (passed <= 2) return { score: 1, label: 'Weak', color: '#EF4444' }
    if (passed <= 4) return { score: 2, label: 'Medium', color: '#F97316' }
    return { score: 3, label: 'Strong', color: BRAND }
  }

  const strength = getPasswordStrength()

  const validateStep1 = (): boolean => {
    setErrorMsg(null)
    if (!fullName.trim() || fullName.trim().length < 3) {
      setErrorMsg('Full name must be at least 3 characters long.')
      return false
    }
    if (!dob) {
      setErrorMsg('Date of birth is required.')
      return false
    }
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    if (age < 16) {
      setErrorMsg('You must be at least 16 years old to register an account.')
      return false
    }
    if (!gender) {
      setErrorMsg('Please select your gender.')
      return false
    }
    if (!phone || !/^(078|079|072|073)\d{7}$/.test(phone)) {
      setErrorMsg(
        'Phone number must be a valid 10-digit Rwandan mobile format (starts with 078, 079, 072, or 073).',
      )
      return false
    }
    return true
  }

  const validateStep2 = (): boolean => {
    setErrorMsg(null)
    if (!email.trim()) {
      setErrorMsg('Email address is required.')
      return false
    }
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      setErrorMsg(emailValidation.error || 'Please enter a valid email address.')
      return false
    }
    if (!meetsAllCriteria) {
      setErrorMsg('Password does not meet safety criteria.')
      return false
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return false
    }
    return true
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)

    try {
      await AuthApi.registerPatient({
        fullName,
        dob,
        gender,
        phone,
        email: email.trim() || undefined,
        password,
      })

      navigate(`/check-email?email=${encodeURIComponent(email.trim())}`)
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const goNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2)
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3)
    }
  }

  const goBack = () => {
    setErrorMsg(null)
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as RegStep)
    }
  }

  const inputBase =
    'block w-full pl-11 pr-4 py-[12px] placeholder:text-gray-400 font-normal focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed auth-input'

  const focusHandlers = (hasError: boolean) => ({})

  return (
    <AuthLayout
      mode="register"
      title="Create your account"
      subtitle="Register a secure patient account to access medicine search and reservation."
    >
      <form onSubmit={handleFinalSubmit}>
        {/* Step indicator */}
        <div
          className="mb-6 rounded-2xl p-4 max-w-sm mx-auto flex items-center justify-around"
          style={{
            backgroundColor: '#F0FDF4',
            border: '1px solid rgba(14,139,97,0.15)',
          }}
        >
          {[
            { num: 1, label: 'Personal' },
            { num: 2, label: 'Account' },
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center space-x-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={{
                    backgroundColor:
                      currentStep === s.num
                        ? BRAND
                        : currentStep > s.num
                          ? BRAND
                          : '#E5E7EB',
                    color:
                      currentStep === s.num || currentStep > s.num ? '#FFFFFF' : '#6B7280',
                    boxShadow:
                      currentStep === s.num ? `0 0 0 4px ${BRAND}15` : 'none',
                    transform: currentStep === s.num ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {currentStep > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: currentStep === s.num ? BRAND : '#6B7280',
                    fontFamily: SERIF,
                    letterSpacing: '-0.005em',
                  }}
                >
                  {s.label}
                </span>
              </div>
              {idx < 1 && (
                <span style={{ color: '#D1D5DB', fontSize: '12px' }}>&rarr;</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {errorMsg && (
          <div
            className="flex items-start rounded-2xl p-4 text-sm mb-5 shadow-sm"
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
            className="flex items-start rounded-2xl p-4 text-sm mb-5 shadow-sm"
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

        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Full Name */}
            <div className="group">
              <label
                htmlFor="fullName"
                className="block mb-2"
                style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937' }}
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User
                    className="h-[18px] w-[18px] text-gray-400 group-focus-within:text-health-primary transition-colors"
                    style={{ color: BRAND }}
                  />
                </div>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ borderRadius: inputBorderRadius, backgroundColor: INPUT_BG }}
                  className={inputBase}
                  placeholder="e.g. Mugisha Jean"
                  {...focusHandlers(false)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2" style={{ gap: '16px' }}>
              {/* DOB */}
              <div className="group">
                <label
                  htmlFor="dob"
                  className="block mb-2"
                  style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937' }}
                >
                  Date of Birth
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar
                      className="h-[18px] w-[18px] text-gray-400 group-focus-within:text-health-primary transition-colors"
                      style={{ color: BRAND }}
                    />
                  </div>
                  <input
                    id="dob"
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    style={{ borderRadius: inputBorderRadius, backgroundColor: INPUT_BG }}
                    className={inputBase}
                    {...focusHandlers(false)}
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="group">
                <label
                  htmlFor="gender"
                  className="block mb-2"
                  style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937' }}
                >
                  Gender
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User
                      className="h-[18px] w-[18px] text-gray-400 group-focus-within:text-health-primary transition-colors"
                      style={{ color: BRAND }}
                    />
                  </div>
                  <select
                    id="gender"
                    required
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={{ borderRadius: inputBorderRadius, backgroundColor: INPUT_BG }}
                    className={inputBase}
                  >
                    <option value="">Select...</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="group">
              <label
                htmlFor="phone"
                className="block mb-2"
                style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937' }}
              >
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Smartphone
                    className="h-[18px] w-[18px] text-gray-400 group-focus-within:text-health-primary transition-colors"
                    style={{ color: BRAND }}
                  />
                </div>
                <input
                  id="phone"
                  type="text"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  style={{ borderRadius: inputBorderRadius, backgroundColor: INPUT_BG }}
                  className={inputBase}
                  placeholder="07XXXXXXXX"
                  {...focusHandlers(false)}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={goNext}
              className="w-full flex justify-center items-center py-[13px] px-4 border border-transparent text-sm font-bold text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.99] mt-2 auth-button"
            >
              <span>Continue to Account Details</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email */}
            <div className="group">
              <label
                htmlFor="email"
                className="block mb-2"
                style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937' }}
              >
                Email Address (Required)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail
                    className="h-[18px] w-[18px] text-gray-400 group-focus-within:text-health-primary transition-colors"
                    style={{ color: BRAND }}
                  />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ borderRadius: inputBorderRadius, backgroundColor: INPUT_BG }}
                  className={inputBase}
                  placeholder="e.g. user@domain.rw"
                  {...focusHandlers(false)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <label
                htmlFor="pass"
                className="block mb-2"
                style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937' }}
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock
                    className="h-[18px] w-[18px] text-gray-400 group-focus-within:text-health-primary transition-colors"
                    style={{ color: BRAND }}
                  />
                </div>
                <input
                  id="pass"
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
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="flex justify-between items-center text-xs">
                    <span style={{ color: '#6B7280', fontWeight: 500 }}>Strength:</span>
                    <span style={{ fontWeight: 700, color: '#374151' }}>{strength.label}</span>
                  </div>
                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: '#E5E7EB' }}
                  >
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${(strength.score / 3) * 100}%`,
                        backgroundColor: strength.color,
                      }}
                    />
                  </div>
                </div>
              )}

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
                    style={{ fontWeight: 700, color: '#374151', fontFamily: SERIF, fontSize: '13.5px' }}
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
            <div className="group">
              <label
                htmlFor="confirmPass"
                className="block mb-2"
                style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937' }}
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock
                    className="h-[18px] w-[18px] text-gray-400 group-focus-within:text-health-primary transition-colors"
                    style={{ color: BRAND }}
                  />
                </div>
                <input
                  id="confirmPass"
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
                <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Passwords do not match.
                </p>
              )}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <>
            <div
              className="space-y-2.5 pt-3 mt-4"
              style={{ borderTop: '1px solid #F1F5F9', fontWeight: 500, color: '#6B7280' }}
            >
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 mt-0.5 cursor-pointer"
                  style={{ accentColor: BRAND, color: BRAND }}
                />
                <label
                  htmlFor="terms"
                  className="ml-2.5 block text-sm leading-normal cursor-pointer"
                  style={{ color: '#4B5563' }}
                >
                  I accept the{' '}
                  <a
                    href="#"
                    style={{ fontWeight: 600, color: BRAND }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    Terms of Service
                  </a>{' '}
                  for the Rwanda National Health System.
                </label>
              </div>

              <div className="flex items-start">
                <input
                  id="privacy"
                  type="checkbox"
                  required
                  checked={acceptPrivacy}
                  onChange={(e) => setAcceptPrivacy(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 mt-0.5 cursor-pointer"
                  style={{ accentColor: BRAND, color: BRAND }}
                />
                <label
                  htmlFor="privacy"
                  className="ml-2.5 block text-sm leading-normal cursor-pointer"
                  style={{ color: '#4B5563' }}
                >
                  I agree to the{' '}
                  <a
                    href="#"
                    style={{ fontWeight: 600, color: BRAND }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    Privacy Policy
                  </a>{' '}
                  regarding my health and medical records data processing.
                </label>
              </div>
            </div>

            <div className="flex pt-3" style={{ gap: '12px' }}>
              <button
                type="button"
                disabled={isLoading}
                onClick={goBack}
                className="w-1/3 flex items-center justify-center py-3 border rounded-md text-sm font-bold transition-colors disabled:opacity-50"
                style={{ borderColor: '#E5E7EB', color: '#4B5563', backgroundColor: '#FFFFFF' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={isLoading || !acceptTerms || !acceptPrivacy}
                className="w-2/3 flex items-center justify-center py-3.5 text-white text-sm font-bold transition-all duration-200 disabled:opacity-50 active:scale-[0.99] auth-button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <span>Complete Registration</span>
                )}
              </button>
            </div>
          </>
        )}
        <div
          className="text-center text-sm mt-6 pt-4"
          style={{ borderTop: '1px solid #F3F4F6' }}
        >
          <span style={{ color: '#6B7280', fontWeight: 500 }}>Already have an account? </span>
          <Link
            to="/login"
            style={{ fontWeight: 700, color: BRAND }}
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
