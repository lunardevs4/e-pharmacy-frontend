import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from '@/layouts/AuthLayout'
import { validateEmail, getEmailErrorMessage } from '@/utils/validation'
import { AuthApi } from '@/services/auth-api'
import { 
  AlertCircle, CheckCircle2, Loader2, Eye, EyeOff, User, Mail, Lock, Smartphone
} from 'lucide-react'

export default function PharmacyRegister() {
  const navigate = useNavigate()

  // State variables for only the required fields
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

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

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!fullname.trim() || fullname.trim().length < 3) {
      setErrorMsg('Full Name is required (minimum 3 characters).')
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
      await AuthApi.registerPharmacy({
        fullname,
        email,
        phone,
        passwordHash: password,
      })

      navigate(`/check-email?email=${encodeURIComponent(email.trim())}`)
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout 
      title="Pharmacy Owner Onboarding" 
      subtitle="Register a pharmacy owner account to manage store inventories, prescriptions, and staff."
    >
      <form onSubmit={handleFinalSubmit} className="space-y-4 text-xs font-bold text-gray-700">
        
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-red-800 text-xs mb-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-250 rounded-lg p-3 flex items-start space-x-2 text-emerald-805 text-xs mb-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              required
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
              placeholder="e.g. Jean Damascene"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
              placeholder="e.g. owner@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Smartphone className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
              placeholder="e.g. +250 788 000 000"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-500 uppercase tracking-wider mb-1">Password</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
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
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Validation Checklist */}
          {password && (
            <div className="mt-3 bg-gray-50 border border-gray-250 p-3 rounded-lg text-xs space-y-1.5 font-medium text-gray-600">
              <span className="font-bold text-gray-700 block mb-1">Password Requirements:</span>
              <div className="flex items-center space-x-2">
                <span className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.length ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className={passwordCriteria.length ? 'text-emerald-800 font-bold' : 'text-gray-500'}>Minimum 8 characters</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.uppercase ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className={passwordCriteria.uppercase ? 'text-emerald-800 font-bold' : 'text-gray-500'}>At least one uppercase letter</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.lowercase ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className={passwordCriteria.lowercase ? 'text-emerald-800 font-bold' : 'text-gray-500'}>At least one lowercase letter</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.number ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className={passwordCriteria.number ? 'text-emerald-800 font-bold' : 'text-gray-500'}>At least one number</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.special ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className={passwordCriteria.special ? 'text-emerald-800 font-bold' : 'text-gray-500'}>At least one special character (@$!%*?&)</span>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-gray-500 uppercase tracking-wider mb-1">Confirm Password</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
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

        <button
          type="submit"
          disabled={isLoading || !meetsAllCriteria || password !== confirmPassword}
          className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-health-primary hover:bg-health-secondary disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>Registering...</span>
            </>
          ) : (
            <span>Register Account</span>
          )}
        </button>

        <div className="text-center mt-4">
          <span className="text-gray-500 font-medium">Already have an account? </span>
          <Link to="/login" className="text-health-primary hover:underline font-bold">
            Sign In
          </Link>
        </div>

      </form>
    </AuthLayout>
  )
}
