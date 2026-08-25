import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react'
import AuthLayout from '@/layouts/AuthLayout'
import { AuthApi } from '@/services/auth-api'

export default function CheckEmail() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const email = params.get('email') || ''
  const reason = params.get('reason')
  const expired = params.get('expired') === '1'
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const resend = async () => {
    if (!email) return
    setIsLoading(true)
    setMessage(null)
    setError(null)
    try {
      const result = await AuthApi.resendVerification(email)
      setMessage(result.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend the verification email.')
    } finally {
      setIsLoading(false)
    }
  }

  const title = expired ? 'Verification link expired' : 'Check your email'
  const description = expired
    ? 'Your verification link expired and your account was removed. Please register again with the same email address.'
    : reason === 'login'
      ? 'Your email is not verified yet. Check your inbox for the verification link before signing in.'
      : 'Your account was created. Check your inbox for the verification link before signing in.'

  return (
    <AuthLayout mode="reset" title={title} subtitle="Complete your e-Pharmacy account setup.">
      <div className="text-center space-y-4 font-sans">
        {expired ? <AlertCircle className="w-10 h-10 mx-auto text-red-605" /> : <Mail className="w-10 h-10 mx-auto text-[#059669]" />}
        <p className="text-sm text-gray-700">{description}</p>
        {email && <p className="text-sm font-bold text-gray-900 break-all">{email}</p>}

        {message && <div className="flex items-center justify-center gap-2 text-sm text-emerald-700 font-bold"><CheckCircle2 className="w-4 h-4" />{message}</div>}
        {error && <div className="flex items-center justify-center gap-2 text-sm text-red-700 font-bold"><AlertCircle className="w-4 h-4" />{error}</div>}

        {!expired && email && (
          <button type="button" onClick={resend} disabled={isLoading} className="w-full text-sm font-bold text-white disabled:opacity-50 auth-button">
            {isLoading ? <><Loader2 className="inline w-4 h-4 mr-2 animate-spin" />Sending...</> : 'Resend verification email'}
          </button>
        )}

        <button type="button" onClick={() => navigate('/login')} className="inline-block font-bold hover:underline" style={{ color: '#059669' }}>
          Continue to sign in
        </button>
        {expired && <p className="text-xs text-gray-500">You can create a new account from the registration page.</p>}
        <Link to="/register/patient" className="block text-xs text-gray-500 hover:underline">Register a new account</Link>
      </div>
    </AuthLayout>
  )
}
