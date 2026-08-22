import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from '@/layouts/AuthLayout'
import { validateEmail, getEmailErrorMessage } from '@/utils/validation'
import { AuthApi } from '@/services/auth-api'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Eye,
  EyeOff,
  User,
  CreditCard,
  Calendar,
  Smartphone,
  Mail,
  Lock,
  Check,
  ShieldAlert,
} from 'lucide-react'

type RegStep = 1 | 2 | 3

export default function PatientRegister() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<RegStep>(1)

  // Step 1 States (Personal Details)
  const [fullName, setFullName] = useState('')
  // const [nid, setNid] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('')
  const [phone, setPhone] = useState('')

  // Step 2 States (Account Security)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptPrivacy, setAcceptPrivacy] = useState(false)

  // Feedback states
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Password criteria checks
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
    if (passed <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500' }
    if (passed <= 4) return { score: 2, label: 'Medium', color: 'bg-orange-500' }
    return { score: 3, label: 'Strong', color: 'bg-emerald-600' }
  }

  const strength = getPasswordStrength()

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    setErrorMsg(null)
    if (!fullName.trim() || fullName.trim().length < 3) {
      setErrorMsg('Full name must be at least 3 characters long.')
      return false
    }
    // if (!nid || !/^\d{16}$/.test(nid)) {
    //   setErrorMsg('National ID must be exactly 16 numeric digits.')
    //   return false
    // }
    if (!dob) {
      setErrorMsg('Date of birth is required.')
      return false
    }
    // Age check: minimum 16 years
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

  // Step 2 Validation
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

  // Final submit handler
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)

    try {
      await AuthApi.registerPatient({
        fullName,
        // nid,
        dob,
        gender,
        phone,
        email: email.trim() || undefined,
        password,
      })

      const [registeredFirstName, ...registeredRest] = fullName.trim().split(/\s+/)
      const registeredLastName = registeredRest.join(' ') || 'User'
      const registeredEmail = email.trim() || `${registeredFirstName.toLowerCase()}.${registeredLastName.toLowerCase().replace(/\s+/g, '.')}@epharmacy.local`
      navigate(`/check-email?email=${encodeURIComponent(registeredEmail)}`)
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

  return (
    <AuthLayout
      title="Patient Registration"
      subtitle="Register a secure citizen account to access medicine search and reservation."
    >
      <form onSubmit={handleFinalSubmit}>
        {/* Visual Stepper */}
        <div className="mb-6 bg-gray-50 border border-gray-150 rounded-xl p-3 max-w-sm mx-auto flex items-center justify-around">
          {[
            { num: 1, label: 'Personal' },
            { num: 2, label: 'Account' }
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                    currentStep === s.num
                      ? 'bg-health-primary text-white ring-2 ring-emerald-100 scale-105'
                      : currentStep > s.num
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {currentStep > s.num ? <Check className="w-3 h-3" /> : s.num}
                </div>
                <span
                  className={`text-[11px] font-bold ${
                    currentStep === s.num ? 'text-health-primary' : 'text-gray-450'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < 2 && <span className="text-gray-300 text-xs">&rarr;</span>}
            </React.Fragment>
          ))}
        </div>

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

        {/* Step 1: Personal Details */}
        {currentStep === 1 && (
          <div className="space-y-4 font-semibold text-xs text-gray-700">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1"
              >
                Full Name
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
                  placeholder="e.g. Mugisha Jean"
                />
              </div>
            </div>

            {/* National ID */}
            {/* <div>
            <label htmlFor="nid" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              National ID Number (16 Digits)
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="nid"
                type="text"
                required
                maxLength={16}
                value={nid}
                onChange={(e) => setNid(e.target.value.replace(/\D/g, ''))}
                className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-mono font-bold"
                placeholder="1YYYY7XXXXXXXXXXXXXXXX"
              />
            </div>
          </div> */}

            <div className="grid grid-cols-2 gap-4">
              {/* Date of Birth */}
              <div>
                <label
                  htmlFor="dob"
                  className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1"
                >
                  Date of Birth
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="dob"
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label
                  htmlFor="gender"
                  className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  required
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
                >
                  <option value="">Select...</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1"
              >
                Phone Number
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Smartphone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="text"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-mono font-bold"
                  placeholder="07XXXXXXXX"
                />
              </div>
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={goNext}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-health-primary hover:bg-health-secondary focus:outline-none transition-colors mt-2"
            >
              <span>Continue to Account Details</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        )}

        {/* Step 2: Account Security */}
        {currentStep === 2 && (
          <div className="space-y-4 font-semibold text-xs text-gray-700">
            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1"
              >
                Email Address (Required)
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
                  placeholder="e.g. user@domain.rw"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="pass"
                className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1"
              >
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="pass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
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

              {/* Strength indicator */}
              {password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-medium">Strength:</span>
                    <span className="font-bold text-gray-700">{strength.label}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${(strength.score / 3) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Validation Checklist */}
              <div className="mt-3 bg-gray-50 border border-gray-250 p-3 rounded-lg text-xs space-y-1.5 font-medium text-gray-600">
                <span className="font-bold text-gray-700 block mb-1">Password Requirements:</span>
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.length ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  />
                  <span
                    className={
                      passwordCriteria.length ? 'text-emerald-805 font-bold' : 'text-gray-500'
                    }
                  >
                    Minimum 8 characters
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.uppercase ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  />
                  <span
                    className={
                      passwordCriteria.uppercase ? 'text-emerald-805 font-bold' : 'text-gray-500'
                    }
                  >
                    At least one uppercase letter
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.lowercase ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  />
                  <span
                    className={
                      passwordCriteria.lowercase ? 'text-emerald-805 font-bold' : 'text-gray-500'
                    }
                  >
                    At least one lowercase letter
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.number ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  />
                  <span
                    className={
                      passwordCriteria.number ? 'text-emerald-805 font-bold' : 'text-gray-500'
                    }
                  >
                    At least one number
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.special ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  />
                  <span
                    className={
                      passwordCriteria.special ? 'text-emerald-805 font-bold' : 'text-gray-500'
                    }
                  >
                    At least one special character (@$!%*?&)
                  </span>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPass"
                className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1"
              >
                Confirm Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="confirmPass"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
                  placeholder="••••••••"
                />
              </div>
              {password && confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-655 font-bold">Passwords do not match.</p>
              )}
            </div>
      
          </div>
        )}

        {currentStep === 2 && (
          <>
            {/* Terms & Privacy checkboxes */}
            <div className="space-y-2 pt-2 border-t border-gray-150 font-medium text-gray-600">
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded mt-0.5 cursor-pointer"
                />
                <label
                  htmlFor="terms"
                  className="ml-2 block text-xs text-gray-650 leading-normal cursor-pointer"
                >
                  I accept the{' '}
                  <a href="#" className="font-semibold text-health-primary hover:underline">
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
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded mt-0.5 cursor-pointer"
                />
                <label
                  htmlFor="privacy"
                  className="ml-2 block text-xs text-gray-650 leading-normal cursor-pointer"
                >
                  I agree to the{' '}
                  <a href="#" className="font-semibold text-health-primary hover:underline">
                    Privacy Policy
                  </a>{' '}
                  regarding my health and medical records data processing.
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={goBack}
                className="w-1/3 flex items-center justify-center py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-650 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={isLoading || !acceptTerms || !acceptPrivacy}
                className="w-2/3 flex items-center justify-center py-2.5 text-white bg-health-primary hover:bg-health-secondary focus:outline-none rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
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
        {/* Footer Link */}
        <div className="text-center text-xs mt-6 pt-4 border-t border-gray-150">
          <span className="text-gray-500 font-semibold">Already have an account? </span>
          <Link to="/login" className="font-bold text-health-primary hover:underline">
            Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
