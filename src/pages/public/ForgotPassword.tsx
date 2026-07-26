import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '@/layouts/AuthLayout'
import { AuthApi } from '@/services/auth-api'
import { Mail, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react'

type ForgotStep = 'EMAIL' | 'OTP' | 'RESET' | 'SUCCESS'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState<ForgotStep>('EMAIL')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Loading and alerts
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Password criteria checks
  const criteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  }
  const meetsAllCriteria = Object.values(criteria).every(Boolean)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.')
      return
    }

    setIsLoading(true)
    setErrorMsg(null)
    try {
      await AuthApi.requestPasswordReset(email)
      setStep('OTP')
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP code.')
      return
    }

    setIsLoading(true)
    setErrorMsg(null)
    try {
      await AuthApi.verifyResetOTP(email, otp)
      setStep('RESET')
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!meetsAllCriteria) {
      setErrorMsg('Password does not meet all strength requirements.')
      return
    }
    if (password !== confirmPassword) {
      setErrorMsg('New password and confirm password fields do not match.')
      return
    }

    setIsLoading(true)
    setErrorMsg(null)
    try {
      await AuthApi.resetPassword(email, password)
      setStep('SUCCESS')
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 'EMAIL':
        return 'Forgot Password'
      case 'OTP':
        return 'Email Verification'
      case 'RESET':
        return 'Create New Password'
      case 'SUCCESS':
        return 'Password Updated'
    }
  }

  const getStepSubtitle = () => {
    switch (step) {
      case 'EMAIL':
        return 'Enter your email to receive a password reset verification code.'
      case 'OTP':
        return `We have sent a verification code to ${email}.`
      case 'RESET':
        return 'Set a strong password for your secure National Health account.'
      case 'SUCCESS':
        return 'Your password has been changed successfully.'
    }
  }

  const getPasswordStrength = () => {
    const passed = Object.values(criteria).filter(Boolean).length
    if (passed <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500' }
    if (passed <= 4) return { score: 2, label: 'Medium', color: 'bg-orange-500' }
    return { score: 3, label: 'Strong', color: 'bg-emerald-600' }
  }

  const strength = getPasswordStrength()

  return (
    <AuthLayout title={getStepTitle()} subtitle={getStepSubtitle()}>
      {errorMsg && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-red-800 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {step === 'EMAIL' && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                placeholder="e.g. user@epharmacy.rw"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-health-primary hover:bg-health-secondary focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Verification Code'}
          </button>

          <div className="text-center mt-4">
            <Link to="/login" className="text-xs font-semibold text-health-primary hover:underline">
              Back to Sign In
            </Link>
          </div>
        </form>
      )}

      {step === 'OTP' && (
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-semibold text-gray-700">
              Verification Code (OTP)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ShieldCheck className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="otp"
                type="text"
                required
                maxLength={6}
                disabled={isLoading}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-mono tracking-widest text-center"
                placeholder="123456"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-gray-500">
              For testing flow, enter the verification code <span className="font-bold text-gray-700">123456</span>.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-health-primary hover:bg-health-secondary focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
          </button>

          <div className="flex justify-between items-center text-xs mt-4">
            <button
              type="button"
              onClick={() => setStep('EMAIL')}
              className="font-semibold text-gray-500 hover:text-gray-700"
            >
              Change Email
            </button>
            <button
              type="button"
              onClick={handleEmailSubmit}
              className="font-semibold text-health-primary hover:underline"
            >
              Resend Code
            </button>
          </div>
        </form>
      )}

      {step === 'RESET' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {/* New Password */}
          <div>
            <label htmlFor="newPass" className="block text-sm font-semibold text-gray-700">
              New Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                id="newPass"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength indicator */}
            {password && (
              <div className="mt-2 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Strength:</span>
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
            <div className="mt-3 bg-gray-50 border border-gray-250 p-3 rounded-lg text-xs space-y-1.5">
              <span className="font-bold text-gray-700 block mb-1">Password Requirements:</span>
              <div className="flex items-center space-x-2">
                <span className={`w-1.5 h-1.5 rounded-full ${criteria.length ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className={criteria.length ? 'text-emerald-800' : 'text-gray-500'}>Minimum 8 characters</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-1.5 h-1.5 rounded-full ${criteria.uppercase ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className={criteria.uppercase ? 'text-emerald-800' : 'text-gray-500'}>At least one uppercase letter</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-1.5 h-1.5 rounded-full ${criteria.lowercase ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className={criteria.lowercase ? 'text-emerald-800' : 'text-gray-500'}>At least one lowercase letter</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-1.5 h-1.5 rounded-full ${criteria.number ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className={criteria.number ? 'text-emerald-800' : 'text-gray-500'}>At least one number</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-1.5 h-1.5 rounded-full ${criteria.special ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className={criteria.special ? 'text-emerald-800' : 'text-gray-500'}>At least one special character (@$!%*?&)</span>
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPass" className="block text-sm font-semibold text-gray-700">
              Confirm New Password
            </label>
            <input
              id="confirmPass"
              type="password"
              required
              disabled={isLoading}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
              placeholder="••••••••"
            />
            {password && confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-xs text-red-650">Passwords do not match.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !meetsAllCriteria || password !== confirmPassword}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-health-primary hover:bg-health-secondary focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
          </button>
        </form>
      )}

      {step === 'SUCCESS' && (
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-health-primary rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm text-gray-600">
            Your secure account credentials have been successfully updated.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-health-primary hover:bg-health-secondary focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          >
            Sign In Now
          </button>
        </div>
      )}
    </AuthLayout>
  )
}
