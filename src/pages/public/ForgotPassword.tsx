import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '@/layouts/AuthLayout'
import { AuthApi } from '@/services/auth-api'
import { validateEmail } from '@/utils/validation'
import { Mail, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, Lock } from 'lucide-react'
import { useLanguageStore } from '@/store/languageStore'

type ForgotStep = 'EMAIL' | 'OTP' | 'RESET' | 'SUCCESS'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { t } = useLanguageStore()
  const [step, setStep] = useState<ForgotStep>('EMAIL')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

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
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      setErrorMsg(emailValidation.error || t('forgot.validationEmail'))
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
      setErrorMsg(t('forgot.validationOtp'))
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
      setErrorMsg(t('forgot.validationStrength'))
      return
    }
    if (password !== confirmPassword) {
      setErrorMsg(t('forgot.validationMatch'))
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
        return t('forgot.title')
      case 'OTP':
        return t('forgot.otpTitle')
      case 'RESET':
        return t('forgot.resetTitle')
      case 'SUCCESS':
        return t('forgot.successTitle')
    }
  }

  const getStepSubtitle = () => {
    switch (step) {
      case 'EMAIL':
        return t('forgot.subtitle')
      case 'OTP':
        return t('forgot.otpSubtitle', { email })
      case 'RESET':
        return t('forgot.resetSubtitle')
      case 'SUCCESS':
        return t('forgot.successSubtitle')
    }
  }

  const getPasswordStrength = () => {
    const passed = Object.values(criteria).filter(Boolean).length
    if (passed <= 2) return { score: 1, label: t('forgot.strengthWeak'), color: 'bg-red-500' }
    if (passed <= 4) return { score: 2, label: t('forgot.strengthMedium'), color: 'bg-orange-500' }
    return { score: 3, label: t('forgot.strengthStrong'), color: 'bg-emerald-600' }
  }

  const strength = getPasswordStrength()

  return (
    <AuthLayout mode="reset" title={getStepTitle()} subtitle={getStepSubtitle()}>
      {errorMsg && (
        <div className="rounded-2xl p-4 flex items-start space-x-3 text-sm mb-5 shadow-sm bg-red-50 border border-red-200 text-red-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {step === 'EMAIL' && (
        <form onSubmit={handleEmailSubmit} className="space-y-5">
          <div className="group">
            <label htmlFor="email" className="text-[13px] font-semibold text-gray-800 mb-2 block">
              {t('forgot.emailLabel')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="text-gray-400 group-focus-within:text-health-primary transition-colors h-[18px] w-[18px]" />
              </div>
              <input
                id="email"
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-[13px] placeholder:text-gray-400 font-normal focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed auth-input"
                placeholder={t('forgot.emailPlaceholder')}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-[13px] px-4 border border-transparent text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.99] auth-button"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('forgot.sendCode')}
          </button>

          <div className="text-center mt-4">
            <Link to="/login" className="text-sm font-semibold text-health-primary hover:underline">
              {t('forgot.backToSignIn')}
            </Link>
          </div>
        </form>
      )}

      {step === 'OTP' && (
        <form onSubmit={handleOtpSubmit} className="space-y-5">
          <div className="group">
            <label htmlFor="otp" className="text-[13px] font-semibold text-gray-800 mb-2 block">
              {t('forgot.otpLabel')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <ShieldCheck className="text-gray-400 group-focus-within:text-health-primary transition-colors h-[18px] w-[18px]" />
              </div>
              <input
                id="otp"
                type="text"
                required
                maxLength={6}
                disabled={isLoading}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="block w-full pl-11 pr-4 py-[13px] placeholder:text-gray-400 font-normal focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed tracking-widest text-center font-mono auth-input"
                placeholder={t('forgot.otpPlaceholder')}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 font-medium">
              {t('forgot.otpHint')}
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-[13px] px-4 border border-transparent text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.99] auth-button"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('forgot.verifyCodeBtn')}
          </button>

          <div className="flex justify-between items-center text-sm mt-4">
            <button
              type="button"
              onClick={() => setStep('EMAIL')}
              className="font-semibold text-gray-500 hover:text-gray-700"
            >
              {t('forgot.changeEmail')}
            </button>
            <button
              type="button"
              onClick={handleEmailSubmit}
              className="font-semibold text-health-primary hover:underline"
            >
              {t('forgot.resendCode')}
            </button>
          </div>
        </form>
      )}

      {step === 'RESET' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <div>
            <label htmlFor="newPass" className="block text-sm font-semibold text-gray-700 mb-1.5">
              {t('forgot.newPasswordLabel')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-health-primary" />
              </div>
              <input
                id="newPass"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-11 py-3 placeholder:text-gray-400 font-normal focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed auth-input"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-650"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {password && (
              <div className="mt-2.5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">{t('forgot.passwordStrength')}</span>
                  <span className="font-bold text-gray-700">{strength.label}</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${strength.color}`} 
                    style={{ width: `${(strength.score / 3) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-3.5 bg-gray-50 border border-gray-200 p-4 rounded-xl text-xs space-y-2 font-medium text-gray-600">
              <span className="font-bold text-gray-700 block mb-1.5">{t('forgot.requirementsTitle')}</span>
              <div className="flex items-center space-x-2.5">
                <span className={`w-2 h-2 rounded-full ${criteria.length ? 'bg-health-primary' : 'bg-gray-300'}`} />
                <span className={criteria.length ? 'text-health-primary font-bold' : 'text-gray-500'}>{t('forgot.reqLength')}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className={`w-2 h-2 rounded-full ${criteria.uppercase ? 'bg-health-primary' : 'bg-gray-300'}`} />
                <span className={criteria.uppercase ? 'text-health-primary font-bold' : 'text-gray-500'}>{t('forgot.reqUppercase')}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className={`w-2 h-2 rounded-full ${criteria.lowercase ? 'bg-health-primary' : 'bg-gray-300'}`} />
                <span className={criteria.lowercase ? 'text-health-primary font-bold' : 'text-gray-500'}>{t('forgot.reqLowercase')}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className={`w-2 h-2 rounded-full ${criteria.number ? 'bg-health-primary' : 'bg-gray-300'}`} />
                <span className={criteria.number ? 'text-health-primary font-bold' : 'text-gray-500'}>{t('forgot.reqNumber')}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className={`w-2 h-2 rounded-full ${criteria.special ? 'bg-health-primary' : 'bg-gray-300'}`} />
                <span className={criteria.special ? 'text-health-primary font-bold' : 'text-gray-500'}>{t('forgot.reqSpecial')}</span>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPass" className="block text-sm font-semibold text-gray-700 mb-1.5">
              {t('forgot.confirmPasswordLabel')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-health-primary" />
              </div>
              <input
                id="confirmPass"
                type="password"
                required
                disabled={isLoading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 placeholder:text-gray-400 font-normal focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed auth-input"
                placeholder="••••••••"
              />
            </div>
            {password && confirmPassword && password !== confirmPassword && (
              <p className="mt-1.5 text-xs text-red-600 font-semibold">{t('forgot.passwordsDoNotMatch')}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !meetsAllCriteria || password !== confirmPassword}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold text-white disabled:opacity-50 transition-all duration-200 active:scale-[0.99] auth-button"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('forgot.resetBtn')}
          </button>
        </form>
      )}

      {step === 'SUCCESS' && (
        <div className="text-center space-y-5">
          <div className="w-16 h-16 bg-health-50 border border-health-100 text-health-primary rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="text-sm text-gray-600 font-medium leading-relaxed">
            {t('forgot.successDesc')}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold text-white transition-all duration-200 active:scale-[0.99] auth-button"
          >
            {t('forgot.signInNow')}
          </button>
        </div>
      )}
    </AuthLayout>
  )
}
