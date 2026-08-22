import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import AuthLayout from '@/layouts/AuthLayout'
import { AuthApi } from '@/services/auth-api'

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')
  const attemptedToken = useRef<string | null>(null)
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying your email address...')
  useEffect(() => {
    if (!token) { setState('error'); setMessage('This verification link is missing its token.'); return }

    // React StrictMode intentionally re-runs effects in development. Email
    // verification is one-time, so do not submit the same token twice.
    if (attemptedToken.current === token) return
    attemptedToken.current = token

    let redirectTimer: ReturnType<typeof setTimeout> | undefined
    AuthApi.verifyEmail(token)
      .then((result) => {
        setState('success')
        setMessage(result.message)
        redirectTimer = setTimeout(() => navigate('/login', { replace: true }), 1500)
      })
      .catch((error: Error) => {
        setState('error')
        setMessage(error.message)
      })

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer)
    }
  }, [navigate, token])
  return <AuthLayout title="Email verification" subtitle="Confirm your e-Pharmacy account email.">
    <div className="text-center space-y-4">
      {state === 'loading' && <Loader2 className="w-10 h-10 mx-auto text-health-primary animate-spin" />}
      {state === 'success' && <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600" />}
      {state === 'error' && <AlertCircle className="w-10 h-10 mx-auto text-red-600" />}
      <p className={state === 'error' ? 'text-red-700 text-sm' : 'text-gray-700 text-sm'}>{message}</p>
      {state === 'success' && <p className="text-xs text-gray-500">Redirecting to sign in...</p>}
      {state === 'error' && <Link to="/login" className="inline-block font-bold text-health-primary hover:underline">Continue to sign in</Link>}
    </div>
  </AuthLayout>
}
