import React, { useEffect, useState } from 'react'
import { ShieldCheck, FileSearch, AlertTriangle } from 'lucide-react'
import { AuthApi } from '@/services/auth-api'

interface AuditLog {
  id: string
  entityType: string
  action: string
  pharmacyId?: string
  entityId?: string
  changes?: any
  createdAt: string
  user?: {
    firstName?: string
    lastName?: string
    email?: string
  }
}

export default function GovernmentCompliance() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  const fetchAuditLogs = async () => {
    setIsLoading(true)
    setErrorMsg(null)

    try {
      const response = await AuthApi.getGovernmentAuditLogs(1, 25)
      const data = Array.isArray((response as any)?.data)
        ? (response as any).data
        : Array.isArray((response as any)?.data?.data)
          ? (response as any).data.data
          : (response as any)?.data ?? []
      setAuditLogs(data)
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to load government audit logs.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStatusBadge = (action: string) => {
    if (action.includes('REJECT') || action.includes('FAIL')) {
      return 'bg-red-50 text-red-700 border-red-200'
    }
    if (action.includes('APPROVE') || action.includes('PASS') || action.includes('UPDATE')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
    return 'bg-amber-50 text-amber-700 border-amber-200'
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-red-800 text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-emerald-800">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] tracking-widest font-black uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Government Audit Logs</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-950">MOH Compliance Audit Registry</h1>
          <p className="text-xs text-gray-500 max-w-2xl leading-normal">
            Live Ministry of Health audit logs for pharmacy inspections, inventory reviews, and regulatory actions. Data is sourced from the backend audit ledger for government access.
          </p>
        </div>
        <div className="text-right text-xs text-gray-500 font-bold">
          <div>{auditLogs.length} entries</div>
          <div className="mt-1">Scope: Government-limited audit access</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
        <div className="flex justify-between items-center pb-3 border-b border-gray-150 mb-3">
          <div className="flex items-center space-x-2 text-gray-900 font-black text-xs uppercase tracking-wider">
            <FileSearch className="w-4 h-4 text-emerald-700" />
            <span>Audit Record Stream</span>
          </div>
          <button
            type="button"
            onClick={fetchAuditLogs}
            className="text-[10px] font-bold text-health-primary border border-health-primary px-3 py-2 rounded-lg hover:bg-health-primary/5 transition"
          >
            Refresh Logs
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-400 text-xs">Loading audit logs...</div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs">No government audit logs available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-150">
              <thead>
                <tr className="text-[10px] font-black text-slate-450 uppercase tracking-wider">
                  <th className="py-2.5">ID</th>
                  <th className="py-2.5">Entity</th>
                  <th className="py-2.5">Action</th>
                  <th className="py-2.5">Pharmacy</th>
                  <th className="py-2.5">Auditor</th>
                  <th className="py-2.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-semibold text-gray-900">{log.id}</td>
                    <td className="py-3 text-gray-900 font-bold">{log.entityType}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center text-[10px] font-black px-2 py-0.5 rounded border ${renderStatusBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 text-gray-700">{log.pharmacyId ?? 'N/A'}</td>
                    <td className="py-3 text-gray-700">
                      {log.user?.firstName || log.user?.email || 'System'}
                    </td>
                    <td className="py-3 font-mono text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
