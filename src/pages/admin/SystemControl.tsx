import React, { useState, useEffect } from 'react'
import { apiClient } from '@/api/client'
import { useLanguageStore } from '@/store/languageStore'
import { LoadingState } from '@/components/ui/LoadingState'
import {
  ShieldAlert,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Power,
  Shield,
  Activity,
  User,
  X,
} from 'lucide-react'

interface SystemStatus {
  id?: string
  mode: 'OPERATIONAL' | 'MAINTENANCE' | 'LOCKDOWN'
  message?: string
  reason?: string
  estimatedEndTime?: string
  updatedAt?: string
  updatedBy?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
}

interface AuditLogItem {
  id: string
  action: string
  entityType: string
  createdAt: string
  user?: {
    firstName?: string
    lastName?: string
    email?: string
  }
  metadata?: any
}

export default function SystemControl() {
  const { t } = useLanguageStore()
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([])

  // Form states for Maintenance
  const [maintMessage, setMaintMessage] = useState('')
  const [maintReason, setMaintReason] = useState('')
  const [maintEndTime, setMaintEndTime] = useState('')

  // Lockdown modal state
  const [showLockdownModal, setShowLockdownModal] = useState(false)
  const [lockdownReason, setLockdownReason] = useState('')
  const [lockdownConfirmed, setLockdownConfirmed] = useState(false)
  const [lockdownError, setLockdownError] = useState('')

  // Toast / feedback message
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchStatus = async () => {
    try {
      const res = await apiClient.get('/admin/system/status')
      const data = res.data?.data || res.data
      setStatus(data)
      if (data.message && data.mode === 'MAINTENANCE') {
        setMaintMessage(data.message)
      }
      if (data.reason && data.mode === 'MAINTENANCE') {
        setMaintReason(data.reason)
      }
      if (data.estimatedEndTime && data.mode === 'MAINTENANCE') {
        const dateISO = new Date(data.estimatedEndTime).toISOString().slice(0, 16)
        setMaintEndTime(dateISO)
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.error?.message || 'Failed to fetch system status',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAuditLogs = async () => {
    try {
      const res = await apiClient.get('/audit-logs?entityType=SystemStatus&limit=10')
      const data = res.data?.data?.items || res.data?.data || res.data?.items || res.data
      if (Array.isArray(data)) {
        setAuditLogs(data)
      }
    } catch {
      // audit logs fetch optional
    }
  }

  useEffect(() => {
    fetchStatus()
    fetchAuditLogs()
  }, [])

  const handleEnableMaintenance = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFeedback(null)
    try {
      const payload: any = {
        message: maintMessage.trim() || undefined,
        reason: maintReason.trim() || undefined,
        estimatedEndTime: maintEndTime ? new Date(maintEndTime).toISOString() : undefined,
      }
      const res = await apiClient.post('/admin/system/maintenance', payload)
      const data = res.data?.data || res.data
      setStatus(data.systemStatus || data)
      setFeedback({
        type: 'success',
        message: 'Scheduled maintenance mode enabled successfully.',
      })
      fetchAuditLogs()
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.error?.message || 'Failed to enable maintenance mode',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmLockdown = async () => {
    if (!lockdownReason.trim()) {
      setLockdownError('A mandatory reason is required for emergency lockdown.')
      return
    }
    if (!lockdownConfirmed) {
      setLockdownError('Please check the confirmation box to proceed.')
      return
    }

    setSubmitting(true)
    setLockdownError('')
    setFeedback(null)
    try {
      const res = await apiClient.post('/admin/system/lockdown', {
        reason: lockdownReason.trim(),
      })
      const data = res.data?.data || res.data
      setStatus(data.systemStatus || data)
      setShowLockdownModal(false)
      setLockdownReason('')
      setLockdownConfirmed(false)
      setFeedback({
        type: 'success',
        message: 'Emergency Lockdown activated immediately.',
      })
      fetchAuditLogs()
    } catch (err: any) {
      setLockdownError(err?.response?.data?.error?.message || 'Failed to activate emergency lockdown')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResumeOperation = async () => {
    setSubmitting(true)
    setFeedback(null)
    try {
      const res = await apiClient.post('/admin/system/resume', {
        reason: 'Restored normal operations via Admin System Control Panel',
      })
      const data = res.data?.data || res.data
      setStatus(data.systemStatus || data)
      setFeedback({
        type: 'success',
        message: 'System returned to OPERATIONAL state successfully.',
      })
      fetchAuditLogs()
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.error?.message || 'Failed to resume normal operation',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingState message="Loading System Status & Governance..." />
  }

  const mode = status?.mode || 'OPERATIONAL'

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* Top Header Card matching Rwanda E-Pharmacy Admin Console style */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-emerald-700" />
            <span className="text-[9px] sm:text-[10px] tracking-widest font-black uppercase text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Super Admin Console
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">
            System Control &amp; Emergency Kill-Switch
          </h1>
          <p className="text-slate-500 text-[10px] sm:text-xs leading-relaxed">
            Manage system operational status, scheduled maintenance, and emergency kill-switch controls.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              fetchStatus()
              fetchAuditLogs()
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs transition-colors flex items-center space-x-2 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Current System State Banner Card */}
      <div
        className={`rounded-xl p-5 sm:p-6 border shadow-xs transition-all ${
          mode === 'OPERATIONAL'
            ? 'bg-emerald-50/70 border-emerald-200'
            : mode === 'MAINTENANCE'
            ? 'bg-amber-50/70 border-amber-200'
            : 'bg-red-50/80 border-red-300'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-md ${
                mode === 'OPERATIONAL'
                  ? 'bg-emerald-600 shadow-emerald-700/20'
                  : mode === 'MAINTENANCE'
                  ? 'bg-amber-500 shadow-amber-600/20'
                  : 'bg-red-600 shadow-red-700/20 animate-bounce'
              }`}
            >
              {mode === 'OPERATIONAL' ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : mode === 'MAINTENANCE' ? (
                <Wrench className="w-6 h-6" />
              ) : (
                <ShieldAlert className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2.5 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Current System State
                </span>
                <span
                  className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                    mode === 'OPERATIONAL'
                      ? 'bg-emerald-600 text-white'
                      : mode === 'MAINTENANCE'
                      ? 'bg-amber-600 text-white animate-pulse'
                      : 'bg-red-600 text-white animate-pulse'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>{mode}</span>
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-gray-900">
                {mode === 'OPERATIONAL' && 'System is fully operational and serving traffic'}
                {mode === 'MAINTENANCE' && 'Scheduled Maintenance Mode in progress'}
                {mode === 'LOCKDOWN' && 'Emergency Kill-Switch / Lockdown Active'}
              </h2>

              {status?.reason && (
                <p className="text-xs text-gray-700 mt-1.5 italic font-medium">
                  Notice: "{status.reason}"
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-500 mt-2.5">
                {status?.updatedAt && (
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Updated: {new Date(status.updatedAt).toLocaleString()}</span>
                  </span>
                )}
                {status?.updatedBy?.email && (
                  <span className="flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>Admin: {status.updatedBy.email}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Resume Operations Button */}
          {mode !== 'OPERATIONAL' && (
            <button
              onClick={handleResumeOperation}
              disabled={submitting}
              className="flex-shrink-0 group inline-flex items-center justify-center space-x-2.5 bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md shadow-emerald-700/25 hover:shadow-lg hover:shadow-emerald-800/30 ring-1 ring-emerald-500/30 hover:ring-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 transition-all duration-200 ease-in-out transform hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Power className="w-4.5 h-4.5 group-hover:animate-pulse" />
              <span>Resume Normal Operations</span>
            </button>
          )}
        </div>
      </div>

      {/* Governance Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule Maintenance Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-5 border-b border-gray-100 pb-4">
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Schedule Maintenance Mode
                </h3>
                <p className="text-xs text-gray-500">
                  Gracefully block non-admin users with custom maintenance message.
                </p>
              </div>
            </div>

            <form onSubmit={handleEnableMaintenance} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  User Notification Message
                </label>
                <input
                  type="text"
                  value={maintMessage}
                  onChange={(e) => setMaintMessage(e.target.value)}
                  placeholder="System is currently undergoing scheduled maintenance..."
                  className="w-full text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-lg p-2.5 sm:p-3 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Internal / Official Reason
                </label>
                <input
                  type="text"
                  value={maintReason}
                  onChange={(e) => setMaintReason(e.target.value)}
                  placeholder="e.g. Database schema migration & security audit"
                  className="w-full text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-lg p-2.5 sm:p-3 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Estimated End Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={maintEndTime}
                  onChange={(e) => setMaintEndTime(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-lg p-2.5 sm:p-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-lg shadow-xs transition disabled:opacity-50"
              >
                <Wrench className="w-4 h-4" />
                <span>
                  {mode === 'MAINTENANCE' ? 'Update Maintenance Details' : 'Enable Scheduled Maintenance'}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Emergency Kill-Switch Panel */}
        <div className="bg-white border border-red-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-5 border-b border-red-100 pb-4">
              <div className="p-2.5 rounded-lg bg-red-50 text-red-600 border border-red-200">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Emergency Kill-Switch / Lockdown
                </h3>
                <p className="text-xs text-red-600 font-semibold">
                  Instant platform access suspension for security incidents.
                </p>
              </div>
            </div>

            <div className="bg-red-50/90 border border-red-200 rounded-xl p-4 mb-6 text-xs text-red-900 space-y-2">
              <div className="flex items-center space-x-2 font-bold uppercase tracking-wider text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Critical Governance Control</span>
              </div>
              <p className="leading-relaxed">
                Triggering Emergency Lockdown will immediately block all non-admin users across Patient, Pharmacy, Government, and Insurance portals with HTTP 503 error.
              </p>
              <ul className="list-disc list-inside space-y-1 text-red-800 pt-1 font-medium">
                <li>Authenticated System Administrators retain management access</li>
                <li>Audit log entry will record admin user &amp; mandatory reason</li>
                <li>Requires mandatory reason &amp; explicit confirmation</li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => {
              setLockdownError('')
              setShowLockdownModal(true)
            }}
            disabled={submitting || mode === 'LOCKDOWN'}
            className="w-full inline-flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-lg shadow-sm shadow-red-700/20 transition disabled:opacity-50"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>
              {mode === 'LOCKDOWN' ? 'Emergency Lockdown Active' : 'TRIGGER EMERGENCY LOCKDOWN'}
            </span>
          </button>
        </div>
      </div>

      {/* Governance Audit Log Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-gray-900">
              System Governance Audit Log
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
            Last 10 Actions
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-gray-500 italic py-6 text-center">
            No system status change logs recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-800">
              <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Admin User</th>
                  <th className="p-3">Reason / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80 transition">
                    <td className="p-3 font-mono text-[11px] text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          log.action.includes('LOCKDOWN')
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : log.action.includes('ENABLED')
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-gray-900">
                      {log.user?.email || 'System Admin'}
                    </td>
                    <td className="p-3 truncate max-w-xs italic text-gray-600">
                      {log.metadata?.reason || log.metadata?.message || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Emergency Lockdown */}
      {showLockdownModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border-2 border-red-500 max-w-lg w-full p-6 shadow-2xl relative text-gray-900">
            <button
              onClick={() => setShowLockdownModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 text-red-600 mb-4">
              <ShieldAlert className="w-8 h-8 flex-shrink-0 animate-bounce" />
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">
                  Confirm Emergency Lockdown
                </h3>
                <p className="text-xs text-red-600 font-bold uppercase tracking-wider">
                  Rwanda E-Pharmacy Emergency Protocol
                </p>
              </div>
            </div>

            {lockdownError && (
              <div className="bg-red-50 border border-red-300 text-red-800 text-xs p-3 rounded-lg mb-4 font-medium">
                {lockdownError}
              </div>
            )}

            <div className="space-y-4 text-xs sm:text-sm text-gray-700">
              <p className="leading-relaxed">
                You are about to activate the Emergency Kill-Switch. This action will immediately block all non-admin API requests across Patient, Pharmacy, Government, and Insurance portals with HTTP 503 error code.
              </p>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-800 mb-1">
                  Mandatory Security Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={lockdownReason}
                  onChange={(e) => setLockdownReason(e.target.value)}
                  placeholder="Describe the incident or reason for emergency lockdown..."
                  className="w-full text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition"
                />
              </div>

              <div className="flex items-start space-x-3 pt-1">
                <input
                  type="checkbox"
                  id="lockdown-confirm"
                  checked={lockdownConfirmed}
                  onChange={(e) => setLockdownConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500 border-gray-300 bg-gray-50"
                />
                <label htmlFor="lockdown-confirm" className="text-xs font-medium text-gray-700 select-none">
                  I confirm that I am an authorized System Administrator and intend to restrict non-admin traffic immediately.
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowLockdownModal(false)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLockdown}
                disabled={submitting}
                className="px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm shadow-red-700/30 transition disabled:opacity-50 inline-flex items-center space-x-2"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Activate Lockdown</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
