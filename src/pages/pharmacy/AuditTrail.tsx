import React, { useState, useEffect } from 'react'
import { FileLock2, Search, Filter, ShieldAlert, RefreshCw } from 'lucide-react'

interface AuditLog {
  time: string
  staff: string
  role: string
  action: string
  ip: string
  status: 'Success' | 'Failed'
}

export default function AuditTrail() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [searchVal, setSearchVal] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Default pre-populated log records (matching screenshots)
  const defaultLogs: AuditLog[] = [
    { time: '2024-08-12 10:15', staff: 'Patrick Habimana', role: 'Inventory Officer', action: 'updated Paracetamol stock (+500 units)', ip: '197.243.10.85', status: 'Success' },
    { time: '2024-08-12 09:40', staff: 'Diane Ineza', role: 'Cashier', action: 'processed payment for Reservation RES-2024-003', ip: '197.243.10.82', status: 'Success' },
    { time: '2024-08-12 09:05', staff: 'Eric Mugisha', role: 'Pharmacy Manager', action: 'confirmed Reservation RES-2024-001', ip: '197.243.12.90', status: 'Success' },
    { time: '2024-08-12 08:30', staff: 'Alice Uwimana', role: 'Pharmacist', action: 'added 200 units of Amoxicillin 500mg', ip: '197.243.10.64', status: 'Success' },
    { time: '2024-08-11 15:45', staff: 'Grace Niyonzima', role: 'Pharmacist', action: 'Failed login attempt (invalid password)', ip: '197.243.15.11', status: 'Failed' }
  ]

  // Read logs from LocalStorage or seed default ones on load
  useEffect(() => {
    const localLogs = localStorage.getItem('pharmacy_audit_logs')
    if (localLogs) {
      setLogs(JSON.parse(localLogs))
    } else {
      localStorage.setItem('pharmacy_audit_logs', JSON.stringify(defaultLogs))
      setLogs(defaultLogs)
    }
  }, [])

  // Clear Audit Trail
  const handleClearAuditLogs = () => {
    localStorage.removeItem('pharmacy_audit_logs')
    setLogs([])
  }

  // Filter logs list
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.staff.toLowerCase().includes(searchVal.toLowerCase()) || 
                          log.action.toLowerCase().includes(searchVal.toLowerCase()) ||
                          log.role.toLowerCase().includes(searchVal.toLowerCase())
    const matchesStatus = statusFilter ? log.status === statusFilter : true
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Information security warning alert banner */}
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start space-x-3 text-xs shadow-xs">
        <ShieldAlert className="w-5 h-5 text-red-650 flex-shrink-0 mt-0.5" />
        <div className="leading-normal">
          <span className="font-bold">MOH Security Protocol:</span> Audit logs are immutable records. Any attempts to alter timestamps or trace actions will be flagged automatically to government officials.
        </div>
      </div>

      {/* Filters Search controls and Table list */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
        
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto flex-grow max-w-2xl">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search audit trail action logs..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-semibold"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-gray-700 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Status</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleClearAuditLogs}
            className="border border-red-300 hover:bg-red-50 text-red-700 font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5 focus:outline-none"
          >
            <span>Reset Logs</span>
          </button>
        </div>

        {/* Audit Logs Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-gray-150">
            <thead>
              <tr className="text-[10px] font-black text-slate-450 uppercase tracking-wider">
                <th className="py-2.5">Timestamp</th>
                <th className="py-2.5">Staff Member</th>
                <th className="py-2.5">Role</th>
                <th className="py-2.5">Action Performed</th>
                <th className="py-2.5">IP Address</th>
                <th className="py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 text-xs">
                    No audit records matching filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50/50">
                    <td className="py-3 font-mono text-gray-450">{log.time}</td>
                    <td className="py-3 font-bold text-gray-900">{log.staff}</td>
                    <td className="py-3 text-gray-500 font-bold">{log.role}</td>
                    <td className="py-3 text-gray-950 font-bold">{log.action}</td>
                    <td className="py-3 text-gray-500 font-mono">{log.ip}</td>
                    <td className="py-3">
                      {log.status === 'Success' ? (
                        <span className="inline-flex items-center text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.25 rounded border border-emerald-250">
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[9px] font-black text-red-700 bg-red-50 px-1.5 py-0.25 rounded border border-red-250">
                          Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
