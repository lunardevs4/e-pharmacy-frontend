import React, { useState, useEffect } from 'react'
import { FileLock2, Search, ShieldAlert, RefreshCw, Download, Loader2 } from 'lucide-react'
import { AuthApi } from '@/services/auth-api'

type LogStatus = 'Success' | 'Failed' | 'Warning'

interface AuditEntry {
  id: string
  timestamp: string
  actor: string
  role: string
  action: string
  resource: string
  ip: string
  status: LogStatus
}

const STATUS_STYLE: Record<LogStatus, string> = {
  Success: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  Failed:  'text-red-700 bg-red-50 border-red-200',
  Warning: 'text-amber-700 bg-amber-50 border-amber-200',
}

const FALLBACK_LOGS: AuditEntry[] = [
  { id: 'LOG-001', timestamp: '2026-08-01 10:42', actor: 'System',       role: 'Automated',       action: 'Automated backup completed',                     resource: 'Database',    ip: '127.0.0.1',      status: 'Success' },
  { id: 'LOG-002', timestamp: '2026-08-01 10:15', actor: 'admin',        role: 'ADMIN',           action: 'User USR-006 suspended',                          resource: 'Users',       ip: '41.217.204.12',  status: 'Success' },
  { id: 'LOG-003', timestamp: '2026-08-01 09:50', actor: 'MoH API',      role: 'System',          action: 'Pharmacy LIC-KIG-48293 status → APPROVED',        resource: 'Pharmacies',  ip: '196.12.10.5',    status: 'Success' },
  { id: 'LOG-004', timestamp: '2026-08-01 09:22', actor: 'admin',        role: 'ADMIN',           action: 'Medicine "Zithromax 250mg" added to catalogue',   resource: 'Medicines',   ip: '41.217.204.12',  status: 'Success' },
  { id: 'LOG-005', timestamp: '2026-08-01 08:45', actor: 'Unknown',      role: '—',               action: 'Failed login attempt (3 tries)',                   resource: 'Auth',        ip: '41.217.204.99',  status: 'Failed'  },
  { id: 'LOG-006', timestamp: '2026-07-31 17:30', actor: 'government',   role: 'GOVERNMENT',      action: 'Viewed NationalAnalytics report',                 resource: 'Reports',     ip: '196.12.10.22',   status: 'Success' },
  { id: 'LOG-007', timestamp: '2026-07-31 16:10', actor: 'manager',      role: 'PHARMACY',        action: 'Updated inventory: Amoxicillin +200 units',       resource: 'Inventory',   ip: '197.243.12.90',  status: 'Success' },
  { id: 'LOG-008', timestamp: '2026-07-31 14:55', actor: 'patient',      role: 'PATIENT',         action: 'Reservation RES-2026-001 created',                resource: 'Reservations',ip: '41.217.201.44',  status: 'Success' },
  { id: 'LOG-009', timestamp: '2026-07-31 11:20', actor: 'admin',        role: 'ADMIN',           action: 'Role permissions updated for INSURANCE',          resource: 'Roles',       ip: '41.217.204.12',  status: 'Warning' },
  { id: 'LOG-010', timestamp: '2026-07-31 09:05', actor: 'System',       role: 'Automated',       action: 'Session tokens rotated (scheduled)',              resource: 'Auth',        ip: '127.0.0.1',      status: 'Success' },
]

const normalizeAuditLog = (item: any): AuditEntry => {
  const statusStr = String(item.status || item.outcome || 'SUCCESS').toUpperCase()
  let status: LogStatus = 'Success'
  if (statusStr.includes('FAIL') || statusStr.includes('ERROR')) status = 'Failed'
  else if (statusStr.includes('WARN') || statusStr.includes('ALERT')) status = 'Warning'

  return {
    id: item.id || item.logId || `LOG-${Math.random().toString(36).substr(2, 8)}`,
    timestamp: item.timestamp || item.createdAt || new Date().toISOString().split('T')[0],
    actor: item.actor || item.performedBy || item.user?.name || 'System',
    role: item.role || item.user?.role || 'Automated',
    action: item.action || item.description || 'System action',
    resource: item.resource || item.entityType || 'System',
    ip: item.ip || item.ipAddress || '—',
    status,
  }
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditEntry[]>(FALLBACK_LOGS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LogStatus | ''>('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadAuditLogs = async () => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const response = await AuthApi.getGovernmentAuditLogs(1, 100)
      const items = Array.isArray((response as any)?.data) ? (response as any).data : Array.isArray(response) ? response : []
      if (items.length > 0) {
        setLogs(items.map(normalizeAuditLog))
      }
    } catch (error: any) {
      console.warn('Using fallback audit logs due to error:', error)
      setErrorMsg(error?.message || 'Unable to load audit logs from backend. Using fallback data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAuditLogs()
  }, [])

  const filtered = logs.filter(l => {
    const q = search.toLowerCase()
    const matchSearch = l.actor.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) ||
      l.resource.toLowerCase().includes(q) || l.ip.includes(q)
    const matchStatus = statusFilter ? l.status === statusFilter : true
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      {errorMsg && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 flex items-start space-x-3 text-xs">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p>{errorMsg}</p>
        </div>
      )}

      <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start space-x-3 text-xs">
        <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p><strong>Security Notice:</strong> Audit logs are immutable. Attempts to alter entries are automatically flagged and reported to the MoH security board.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 flex-grow max-w-2xl">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" aria-hidden="true" />
              <input
                type="search"
                aria-label="Search audit logs"
                placeholder="Search actor, action, resource, IP..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as LogStatus | '')}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="Success">Success</option>
              <option value="Warning">Warning</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
          <button
            onClick={loadAuditLogs}
            disabled={isLoading}
            aria-label="Refresh audit logs"
            className="flex items-center space-x-1.5 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 font-bold px-3 py-2 rounded-lg text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />}
            <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" aria-label="Security audit log">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th scope="col" className="px-5 py-3">Timestamp</th>
                <th scope="col" className="px-5 py-3">Actor</th>
                <th scope="col" className="px-5 py-3">Role</th>
                <th scope="col" className="px-5 py-3">Action</th>
                <th scope="col" className="px-5 py-3">Resource</th>
                <th scope="col" className="px-5 py-3">IP Address</th>
                <th scope="col" className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-mono text-gray-500 whitespace-nowrap">{l.timestamp}</td>
                  <td className="px-5 py-3 font-bold text-gray-900">{l.actor}</td>
                  <td className="px-5 py-3 text-gray-500">{l.role}</td>
                  <td className="px-5 py-3 text-gray-800">{l.action}</td>
                  <td className="px-5 py-3">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-semibold">{l.resource}</span>
                  </td>
                  <td className="px-5 py-3 font-mono text-gray-400">{l.ip}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex text-[10px] font-bold border px-2 py-0.5 rounded ${STATUS_STYLE[l.status]}`}>
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-xs">No log entries match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <span className="text-xs text-gray-500">Showing <strong>{filtered.length}</strong> of <strong>{logs.length}</strong> entries</span>
          <button
            aria-label="Export audit log as CSV"
            className="flex items-center space-x-1.5 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>
    </div>
  )
}
