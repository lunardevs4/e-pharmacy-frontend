import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '@/api/client'
import { ShieldAlert, Wrench, RefreshCw, Clock, AlertTriangle, CheckCircle2, Shield, Mail } from 'lucide-react'

interface SystemStatusData {
  mode: 'OPERATIONAL' | 'MAINTENANCE' | 'LOCKDOWN'
  message?: string
  reason?: string
  estimatedEndTime?: string
  updatedAt?: string
}

export default function Maintenance() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<SystemStatusData | null>(() => {
    try {
      const stored = sessionStorage.getItem('maintenance_info')
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          mode: parsed.code === 'SYSTEM_EMERGENCY_LOCKDOWN' ? 'LOCKDOWN' : 'MAINTENANCE',
          message: parsed.message,
          reason: parsed.reason,
          estimatedEndTime: parsed.estimatedEndTime,
          updatedAt: parsed.updatedAt,
        }
      }
    } catch {
      // fallback
    }
    return {
      mode: 'MAINTENANCE',
      message: 'System is currently undergoing scheduled maintenance.',
    }
  })
  const [checking, setChecking] = useState(false)

  const checkStatus = async () => {
    setChecking(true)
    try {
      const res = await apiClient.get('/public/system-status')
      const data = res.data?.data || res.data
      if (data) {
        setStatus(data)
        if (data.mode === 'OPERATIONAL') {
          sessionStorage.removeItem('maintenance_info')
          navigate('/')
        }
      }
    } catch {
      // ignore
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    checkStatus()
    const interval = setInterval(() => {
      checkStatus()
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const isLockdown = status?.mode === 'LOCKDOWN'

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-12 relative overflow-hidden font-sans">
      {/* Background Glow Overlay */}
      <div
        className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none opacity-20 ${
          isLockdown ? 'bg-red-600' : 'bg-amber-500'
        }`}
      />

      {/* Header */}
      <header className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/40">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide text-white">Rwanda E-Pharmacy</h1>
            <p className="text-xs text-slate-400">Ministry of Health Digital Health Portal</p>
          </div>
        </div>
        <button
          onClick={checkStatus}
          disabled={checking}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium px-4 py-2 rounded-lg transition border border-slate-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin text-emerald-400' : ''}`} />
          <span>{checking ? 'Checking...' : 'Check Status'}</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-2xl mx-auto w-full my-auto py-12 text-center">
        {/* Status Badge & Icon */}
        <div className="inline-flex items-center justify-center p-5 rounded-full mb-8 shadow-2xl relative">
          <div
            className={`absolute inset-0 rounded-full animate-ping opacity-25 ${
              isLockdown ? 'bg-red-500' : 'bg-amber-500'
            }`}
          />
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center border-2 ${
              isLockdown
                ? 'bg-red-950/80 border-red-500/50 text-red-500 shadow-red-900/50'
                : 'bg-amber-950/80 border-amber-500/50 text-amber-400 shadow-amber-900/50'
            }`}
          >
            {isLockdown ? (
              <ShieldAlert className="w-10 h-10 animate-bounce" />
            ) : (
              <Wrench className="w-10 h-10" />
            )}
          </div>
        </div>

        {/* Status Pill */}
        <div className="mb-4">
          <span
            className={`inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full border ${
              isLockdown
                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLockdown ? 'bg-red-500 animate-pulse' : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span>{isLockdown ? 'Emergency Lockdown Active' : 'Scheduled Maintenance'}</span>
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          {isLockdown
            ? 'System Access Temporarily Suspended'
            : 'We are updating the platform'}
        </h2>

        {/* Message */}
        <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed max-w-xl mx-auto">
          {status?.message ||
            (isLockdown
              ? 'An emergency kill-switch / lockdown has been activated by System Administrators. Normal access is currently restricted.'
              : 'The Rwanda E-Pharmacy platform is undergoing scheduled security and database enhancements.')}
        </p>

        {/* Reason Card (If available) */}
        {status?.reason && (
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 rounded-xl p-5 mb-8 text-left shadow-lg">
            <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Official Reason / Notice</span>
            </div>
            <p className="text-slate-200 text-sm italic leading-relaxed">
              "{status.reason}"
            </p>
          </div>
        )}

        {/* Estimated End Time (If available) */}
        {status?.estimatedEndTime && !isLockdown && (
          <div className="inline-flex items-center space-x-2 bg-slate-800/60 border border-slate-700/60 px-4 py-2.5 rounded-lg text-sm text-slate-300 mb-8">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Estimated End Time:</span>
            <span className="font-semibold text-emerald-400">
              {new Date(status.estimatedEndTime).toLocaleString()}
            </span>
          </div>
        )}

        {/* System Admin Sign In Link */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-slate-400">
          <span>Are you a System Administrator?</span>
          <a
            href="/login"
            className="text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-4"
          >
            Admin Sign In &amp; Governance
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>
          &copy; {new Date().getFullYear()} Republic of Rwanda — Ministry of Health. All rights reserved.
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="mailto:support@epharmacy.gov.rw"
            className="flex items-center space-x-1 hover:text-slate-300 transition"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Support: support@epharmacy.gov.rw</span>
          </a>
        </div>
      </footer>
    </div>
  )
}
