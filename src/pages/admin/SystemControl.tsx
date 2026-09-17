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
  FileText,
  Shield,
  Activity,
  User,
  Info,
  Check,
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
        message: 'System maintenance mode enabled successfully.',
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
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              System Control &amp; Emergency Kill-Switch
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage system operational status, scheduled maintenance, and emergency kill-switch controls.
          </p>
        </div>
        <button
          onClick={() => {
            fetchStatus()
            fetchAuditLogs()
          }}
          className="inline-flex items-center space-x-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Current Status Overview Banner */}
      <div
        className={`rounded-2xl p-6 border shadow-sm relative overflow-hidden transition-all ${
          mode === 'OPERATIONAL'
            ? 'bg-gradient-to-r from-emerald-900/10 via-emerald-800/5 to-slate-900/5 dark:from-emerald-950/40 dark:to-slate-900/40 border-emerald-200 dark:border-emerald-800/80'
            : mode === 'MAINTENANCE'
            ? 'bg-gradient-to-r from-amber-900/10 via-amber-800/5 to-slate-900/5 dark:from-amber-950/40 dark:to-slate-900/40 border-amber-200 dark:border-amber-800/80'
            : 'bg-gradient-to-r from-red-900/20 via-red-800/10 to-slate-900/5 dark:from-red-950/60 dark:to-slate-900/40 border-red-300 dark:border-red-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div
              className={`p-3.5 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-inner ${
                mode === 'OPERATIONAL'
                  ? 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'
                  : mode === 'MAINTENANCE'
                  ? 'bg-amber-100 dark:bg-amber-900/80 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-700'
                  : 'bg-red-100 dark:bg-red-900/80 text-red-600 dark:text-red-300 border-red-200 dark:border-red-700'
              }`}
            >
              {mode === 'OPERATIONAL' ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : mode === 'MAINTENANCE' ? (
                <Wrench className="w-8 h-8" />
              ) : (
                <ShieldAlert className="w-8 h-8 animate-pulse" />
              )}
            </div>

            <div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Current System State
                </span>
                <span
                  className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    mode === 'OPERATIONAL'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                      : mode === 'MAINTENANCE'
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                      : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30 animate-pulse'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      mode === 'OPERATIONAL'
                        ? 'bg-emerald-500'
                        : mode === 'MAINTENANCE'
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <span>{mode}</span>
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">
                {mode === 'OPERATIONAL' && 'System is fully operational and serving traffic'}
                {mode === 'MAINTENANCE' && 'Scheduled Maintenance in progress'}
                {mode === 'LOCKDOWN' && 'Emergency Kill-Switch / Lockdown Active'}
              </h2>

              {status?.reason && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 italic">
                  "{status.reason}"
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-3">
                {status?.updatedAt && (
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Updated: {new Date(status.updatedAt).toLocaleString()}</span>
                  </span>
                )}
                {status?.updatedBy?.email && (
                  <span className="flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>By: {status.updatedBy.email}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Resume Button if in Maintenance or Lockdown */}
          {mode !== 'OPERATIONAL' && (
            <button
              onClick={handleResumeOperation}
              disabled={submitting}
              className="flex-shrink-0 inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg shadow-emerald-900/30 transition border border-emerald-500 disabled:opacity-50"
            >
              <Power className="w-4 h-4" />
              <span>Resume Normal Operations</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Maintenance Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Schedule Maintenance Mode
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Gracefully block non-admin users with custom maintenance message.
                </p>
              </div>
            </div>

            <form onSubmit={handleEnableMaintenance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  User Notification Message
                </label>
                <input
                  type="text"
                  value={maintMessage}
                  onChange={(e) => setMaintMessage(e.target.value)}
                  placeholder="System is currently undergoing scheduled maintenance..."
                  className="w-full text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Internal / Official Reason
                </label>
                <input
                  type="text"
                  value={maintReason}
                  onChange={(e) => setMaintReason(e.target.value)}
                  placeholder="e.g. Database schema migration & security audit"
                  className="w-full text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Estimated End Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={maintEndTime}
                  onChange={(e) => setMaintEndTime(e.target.value)}
                  className="w-full text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center space-x-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm py-3 px-4 rounded-xl transition shadow-md shadow-amber-900/20 disabled:opacity-50"
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-950/80 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Emergency Kill-Switch / Lockdown
                </h3>
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  Instant platform access suspension for security incidents.
                </p>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl p-4 mb-6 text-xs text-red-800 dark:text-red-300 space-y-2">
              <div className="flex items-center space-x-2 font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span>Critical Governance Control</span>
              </div>
              <p>
                Triggering Emergency Lockdown will immediately block all non-admin users across Patient, Pharmacy, Government, and Insurance portals with HTTP 503 error.
              </p>
              <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-300 pt-1">
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
            className="w-full inline-flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm py-3 px-4 rounded-xl transition shadow-lg shadow-red-900/30 disabled:opacity-50"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>
              {mode === 'LOCKDOWN' ? 'Emergency Lockdown Active' : 'TRIGGER EMERGENCY LOCKDOWN'}
            </span>
          </button>
        </div>
      </div>

      {/* Audit Log Trail Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              System Governance Audit Trail
            </h3>
          </div>
          <span className="text-xs text-gray-500">Last 10 System Actions</span>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-sm text-gray-500 italic py-4 text-center">
            No system status change logs recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-slate-800/60 text-gray-500 dark:text-gray-400 uppercase font-semibold">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Admin User</th>
                  <th className="p-3">Details / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          log.action.includes('LOCKDOWN')
                            ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                            : log.action.includes('ENABLED')
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-gray-900 dark:text-white">
                      {log.user?.email || 'System Admin'}
                    </td>
                    <td className="p-3 truncate max-w-xs italic text-gray-500">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-red-500/80 max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowLockdownModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 text-red-600 dark:text-red-400 mb-4">
              <ShieldAlert className="w-8 h-8 flex-shrink-0 animate-bounce" />
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  Confirm Emergency Lockdown
                </h3>
                <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                  Rwanda E-Pharmacy Emergency Protocol
                </p>
              </div>
            </div>

            {lockdownError && (
              <div className="bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-200 text-xs p-3 rounded-xl mb-4 font-medium">
                {lockdownError}
              </div>
            )}

            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <p>
                You are about to activate the Emergency Kill-Switch for the platform. This action will immediately block all non-admin API requests with HTTP 503 error code.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1">
                  Mandatory Security Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={lockdownReason}
                  onChange={(e) => setLockdownReason(e.target.value)}
                  placeholder="Describe the incident or reason for emergency lockdown..."
                  className="w-full text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div className="flex items-start space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="lockdown-confirm"
                  checked={lockdownConfirmed}
                  onChange={(e) => setLockdownConfirmed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-red-600 focus:ring-red-500 border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800"
                />
                <label htmlFor="lockdown-confirm" className="text-xs font-medium text-gray-600 dark:text-gray-300 select-none">
                  I confirm that I am an authorized System Administrator and intend to restrict non-admin traffic immediately.
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowLockdownModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLockdown}
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-extrabold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-900/40 transition disabled:opacity-50 inline-flex items-center space-x-2"
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
