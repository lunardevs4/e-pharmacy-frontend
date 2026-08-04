import React from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Package, ShieldCheck, FileLock2, Activity,
  CheckCircle2, AlertTriangle, TrendingUp, Server, Clock
} from 'lucide-react'

const stats = [
  { label: 'Total Active Users', value: '142,504', sub: 'Across all system roles', icon: Users, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  { label: 'Medicines in Catalogue', value: '1,284', sub: '8 pending approval', icon: Package, color: 'text-blue-700', bg: 'bg-blue-50' },
  { label: 'System Status', value: 'Optimal', sub: 'All APIs < 150ms', icon: Server, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  { label: 'Pending Verifications', value: '14', sub: 'Pharmacies awaiting MoH', icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50' },
]

const recentActivity = [
  { time: '10:42', actor: 'System', action: 'Automatic backup completed successfully', type: 'success' },
  { time: '10:15', actor: 'Admin', action: 'User USR-006 suspended — policy violation', type: 'warning' },
  { time: '09:50', actor: 'MoH API', action: 'Pharmacy LIC-KIG-48293 status updated to APPROVED', type: 'success' },
  { time: '09:22', actor: 'Admin', action: 'New medicine Zithromax 250mg added to catalogue', type: 'success' },
  { time: '08:45', actor: 'System', action: 'Failed login attempt from IP 41.217.204.12 (3 attempts)', type: 'error' },
]

const quickLinks = [
  { to: '/admin/users', label: 'Manage Users', icon: Users, desc: 'Add, suspend, or remove user accounts' },
  { to: '/admin/medicines', label: 'Medicine Catalogue', icon: Package, desc: 'Review and approve medicine entries' },
  { to: '/admin/roles', label: 'Roles & Permissions', icon: ShieldCheck, desc: 'Configure role-based access controls' },
  { to: '/admin/audit', label: 'Audit Logs', icon: FileLock2, desc: 'Monitor system-wide security events' },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      {/* Page header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Administrator Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Platform configurations, user registrations, role-based controls, and security audit logs.
          </p>
        </div>
        <span className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full">
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          <span>All Systems Operational</span>
        </span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="list" aria-label="Platform statistics">
        {stats.map((s) => (
          <div
            key={s.label}
            role="listitem"
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start justify-between"
          >
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
              <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-gray-400 mt-1">{s.sub}</p>
            </div>
            <div className={`p-2.5 rounded-lg ${s.bg} flex-shrink-0`} aria-hidden="true">
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Activity Feed */}
        <section aria-labelledby="activity-heading" className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            <h2 id="activity-heading" className="font-black text-gray-900 text-sm">Recent System Activity</h2>
          </div>
          <ul className="divide-y divide-gray-100">
            {recentActivity.map((item, idx) => (
              <li key={idx} className="px-5 py-3.5 flex items-start space-x-3 text-xs">
                <span
                  aria-hidden="true"
                  className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    item.type === 'success' ? 'bg-emerald-500' :
                    item.type === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                />
                <div className="flex-grow min-w-0">
                  <p className="text-gray-800 font-medium">
                    <span className="font-bold text-gray-900">{item.actor}</span> — {item.action}
                  </p>
                </div>
                <time className="text-gray-400 font-mono flex-shrink-0">{item.time}</time>
              </li>
            ))}
          </ul>
          <div className="px-5 py-3 border-t border-gray-100">
            <Link
              to="/admin/audit"
              className="text-xs font-bold text-health-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 rounded"
            >
              View full audit log →
            </Link>
          </div>
        </section>

        {/* Quick Links */}
        <section aria-labelledby="quicklinks-heading" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 id="quicklinks-heading" className="font-black text-gray-900 text-sm">Quick Actions</h2>
          </div>
          <ul className="divide-y divide-gray-100">
            {quickLinks.map((q) => (
              <li key={q.to}>
                <Link
                  to={q.to}
                  className="flex items-center space-x-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
                >
                  <div className="p-2 bg-gray-100 group-hover:bg-emerald-50 rounded-lg transition-colors flex-shrink-0" aria-hidden="true">
                    <q.icon className="w-4 h-4 text-gray-600 group-hover:text-emerald-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 group-hover:text-health-primary transition-colors">{q.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">{q.desc}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

      </div>
    </div>
  )
}
