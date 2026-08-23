import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '@/layouts/AuthLayout'
import { useAuthStore } from '@/store/authStore'
import { AuthApi } from '@/services/auth-api'
import { AlertCircle, CheckCircle2, Loader2, Eye, EyeOff, Lock } from 'lucide-react'

export default function ChangePassword() {
  const navigate = useNavigate()
  const { user, token, login } = useAuthStore()

  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const criteria = {
    length: newPass.length >= 8,
    uppercase: /[A-Z]/.test(newPass),
    lowercase: /[a-z]/.test(newPass),
    number: /\d/.test(newPass),
    special: /[@$!%*?&]/.test(newPass),
  }
  const meetsAllCriteria = Object.values(criteria).every(Boolean)

  const getPasswordStrength = () => {
    const passed = Object.values(criteria).filter(Boolean).length
    if (passed <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500' }
    if (passed <= 4) return { score: 2, label: 'Medium', color: 'bg-orange-500' }
    return { score: 3, label: 'Strong', color: 'bg-emerald-600' }
  }

  const strength = getPasswordStrength()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setErrorMsg('No authenticated session found. Please sign in again.')
      return
    }
    if (!meetsAllCriteria) {
      setErrorMsg('New password does not meet safety criteria.')
      return
    }
    if (newPass !== confirmPass) {
      setErrorMsg('Passwords do not match.')
      return
    }

    setIsLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      await AuthApi.changePassword(user.username, currentPass, newPass)
      setSuccessMsg('Password updated successfully! Redirecting to portal...')
      
      const updatedUser = { ...user, firstLogin: false }
      login(updatedUser, token || '')

      setTimeout(() => {
        switch (user.role) {
          case 'PATIENT':
            navigate('/patient')
            break
          case 'PHARMACY':
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
      }, 1500)
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during password change.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="Update Temporary Password" subtitle="For security compliance, first-time users must configure a new secure account password.">
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-3 text-red-800 text-sm mb-5 shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start space-x-3 text-emerald-800 text-sm mb-5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="group">
          <label htmlFor="tempPass" className="text-[13px] font-semibold text-gray-800 mb-2 block">
            Current Temporary Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-[18px] w-[18px] text-gray-400 group-focus-within:text-health-primary transition-colors" />
            </div>
            <input
              id="tempPass"
              type={showCurrent ? 'text' : 'password'}
              required
              disabled={isLoading}
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              className="block w-full pl-11 pr-12 py-[13px] bg-white border-2 rounded-2xl focus:outline-none focus:ring-0 focus:border-health-primary focus:shadow-[0_0_0_4px_rgba(35,83,71,0.08)] transition-all duration-200 text-[14px] text-gray-900 placeholder:text-gray-400 font-normal border-gray-200 hover:border-gray-300"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="group">
          <label htmlFor="newPass" className="text-[13px] font-semibold text-gray-800 mb-2 block">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-[18px] w-[18px] text-gray-400 group-focus-within:text-health-primary transition-colors" />
            </div>
            <input
              id="newPass"
              type={showNew ? 'text' : 'password'}
              required
              disabled={isLoading}
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="block w-full pl-11 pr-12 py-[13px] bg-white border-2 rounded-2xl focus:outline-none focus:ring-0 focus:border-health-primary focus:shadow-[0_0_0_4px_rgba(35,83,71,0.08)] transition-all duration-200 text-[14px] text-gray-900 placeholder:text-gray-400 font-normal border-gray-200 hover:border-gray-300"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {newPass && (
            <div className="mt-2.5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Strength:</span>
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

          <div className="mt-3.5 bg-gray-50 border border-gray-200 p-4 rounded-2xl text-xs space-y-2 font-medium text-gray-600">
            <span className="font-bold text-gray-700 block mb-1.5">Password Requirements:</span>
            <div className="flex items-center space-x-2.5">
              <span className={`w-2 h-2 rounded-full ${criteria.length ? 'bg-health-primary' : 'bg-gray-300'}`} />
              <span className={criteria.length ? 'text-health-primary font-bold' : 'text-gray-500'}>Minimum 8 characters</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className={`w-2 h-2 rounded-full ${criteria.uppercase ? 'bg-health-primary' : 'bg-gray-300'}`} />
              <span className={criteria.uppercase ? 'text-health-primary font-bold' : 'text-gray-500'}>At least one uppercase letter</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className={`w-2 h-2 rounded-full ${criteria.lowercase ? 'bg-health-primary' : 'bg-gray-300'}`} />
              <span className={criteria.lowercase ? 'text-health-primary font-bold' : 'text-gray-500'}>At least one lowercase letter</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className={`w-2 h-2 rounded-full ${criteria.number ? 'bg-health-primary' : 'bg-gray-300'}`} />
              <span className={criteria.number ? 'text-health-primary font-bold' : 'text-gray-500'}>At least one number</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className={`w-2 h-2 rounded-full ${criteria.special ? 'bg-health-primary' : 'bg-gray-300'}`} />
              <span className={criteria.special ? 'text-health-primary font-bold' : 'text-gray-500'}>At least one special character (@$!%*?&)</span>
            </div>
          </div>
        </div>

        <div className="group">
          <label htmlFor="confirmPass" className="text-[13px] font-semibold text-gray-800 mb-2 block">
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className={`h-[18px] w-[18px] transition-colors ${newPass && confirmPass && newPass !== confirmPass ? 'text-red-400' : 'text-gray-400 group-focus-within:text-health-primary'}`} />
            </div>
            <input
              id="confirmPass"
              type="password"
              required
              disabled={isLoading}
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className={`block w-full pl-11 pr-4 py-[13px] bg-white border-2 rounded-2xl focus:outline-none focus:ring-0 transition-all duration-200 text-[14px] text-gray-900 placeholder:text-gray-400 font-normal ${newPass && confirmPass && newPass !== confirmPass ? 'border-red-300 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(220,38,38,0.08)]' : 'border-gray-200 hover:border-gray-300 focus:border-health-primary focus:shadow-[0_0_0_4px_rgba(35,83,71,0.08)]'}`}
              placeholder="••••••••"
            />
          </div>
          {newPass && confirmPass && newPass !== confirmPass && (
            <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Passwords do not match.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !meetsAllCriteria || newPass !== confirmPass}
          className="w-full flex justify-center py-[13px] px-4 border border-transparent rounded-2xl shadow-lg shadow-health-primary/20 text-sm font-bold text-white bg-health-primary hover:bg-health-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-health-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl hover:shadow-health-primary/25 active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              <span>Updating password...</span>
            </>
          ) : (
            <span>Update Password</span>
          )}
        </button>
      </form>
    </AuthLayout>
  )
}
