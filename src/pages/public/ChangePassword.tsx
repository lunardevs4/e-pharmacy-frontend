import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '@/layouts/AuthLayout'
import { useAuthStore } from '@/store/authStore'
import { AuthApi } from '@/services/auth-api'
import { AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react'

export default function ChangePassword() {
  const navigate = useNavigate()
  const { user, token, login } = useAuthStore()

  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showPass, setShowPass] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Password criteria checks
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
      // Call mock auth api
      await AuthApi.changePassword(user.username, currentPass, newPass)
      setSuccessMsg('Password updated successfully! Redirecting to portal...')
      
      // Update state in Zustand store
      const updatedUser = { ...user, firstLogin: false }
      login(updatedUser, token || '')

      // Redirect to correct dashboard
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

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Temporary Password */}
        <div>
          <label htmlFor="tempPass" className="block text-sm font-semibold text-gray-700">
            Current Temporary Password
          </label>
          <input
            id="tempPass"
            type="password"
            required
            disabled={isLoading}
            value={currentPass}
            onChange={(e) => setCurrentPass(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
            placeholder="••••••••"
          />
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="newPass" className="block text-sm font-semibold text-gray-700">
            New Password
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              id="newPass"
              type={showPass ? 'text' : 'password'}
              required
              disabled={isLoading}
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-650"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength meter */}
          {newPass && (
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
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
            placeholder="••••••••"
          />
          {newPass && confirmPass && newPass !== confirmPass && (
            <p className="mt-1 text-xs text-red-650">Passwords do not match.</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !meetsAllCriteria || newPass !== confirmPass}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-health-primary hover:bg-health-secondary focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
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
