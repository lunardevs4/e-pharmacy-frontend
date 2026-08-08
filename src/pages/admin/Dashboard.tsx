import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  LineElement, PointElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  Users, Package, ShieldCheck, FileLock2, Activity,
  CheckCircle2, AlertTriangle, Server, Clock, TrendingUp,
  UserCheck, UserX, RefreshCw, ArrowRight, Shield, Settings,
  Cpu, Wifi, Database, Lock,
} from 'lucide-react'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  LineElement, PointElement, Title, Tooltip, Legend, Filler,
)

// ── Mock data (mirrors Users.tsx + Medicines.tsx + AuditLogs.tsx) ─────────────
const USERS = [
  { role: 'PATIENT',     status: 'Active',    createdAt: '2026-01' },
  { role: 'PHARMACY',    status: 'Active',    createdAt: '2026-02' },
  { role: 'GOVERNMENT',  status: 'Active',    createdAt: '2026-01' },
  { role: 'INSURANCE',   status: 'Active',    createdAt: '2026-03' },
  { role: 'PATIENT',     status: 'Pending',   createdAt: '2026-07' },
  { role: 'PHARMACY',    status: 'Suspended', createdAt: '2025-11' },
  { role: 'INSURANCE',   status: 'Active',    createdAt: '2026-04' },
  { role: 'ADMIN',       status: 'Active',    createdAt: '2025-01' },
]

const MEDICINES = [
  { status: 'Active' }, { status: 'Active' }, { status: 'Active' },
  { status: 'Active' }, { status: 'Active' }, { status: 'Active' },
  { status: 'Under Review' }, { status: 'Active' },
]

const AUDIT_LOGS = [
  { actor: 'System',    role: 'Automated', action: 'Automated backup completed',               resource: 'Database',    status: 'Success', time: '10:42' },
  { actor: 'admin',     role: 'ADMIN',     action: 'User USR-006 suspended',                   resource: 'Users',       status: 'Success', time: '10:15' },
  { actor: 'MoH API',   role: 'System',    action: 'Pharmacy LIC-KIG-48293 → APPROVED',        resource: 'Pharmacies',  status: 'Success', time: '09:50' },
  { actor: 'admin',     role: 'ADMIN',     action: 'Medicine "Zithromax 250mg" added',         resource: 'Medicines',   status: 'Success', time: '09:22' },
  { actor: 'Unknown',   role: '—',         action: 'Failed login attempt (3 tries)',            resource: 'Auth',        status: 'Failed',  time: '08:45' },
  { actor: 'government',role: 'GOVERNMENT',action: 'Viewed NationalAnalytics report',          resource: 'Reports',     status: 'Success', time: '17:30' },
  { actor: 'manager',   role: 'PHARMACY',  action: 'Inventory: Amoxicillin +200 units',        resource: 'Inventory',   status: 'Success', time: '16:10' },
  { actor: 'patient',   role: 'PATIENT',   action: 'Reservation RES-2026-001 created',         resource: 'Reservations',status: 'Success', time: '14:55' },
  { actor: 'admin',     role: 'ADMIN',     action: 'Role permissions updated for INSURANCE',   resource: 'Roles',       status: 'Warning', time: '11:20' },
  { actor: 'System',    role: 'Automated', action: 'Session tokens rotated (scheduled)',       resource: 'Auth',        status: 'Success', time: '09:05' },
]

// System health services
const SERVICES = [
  { name: 'Auth API',         status: 'online',  latency: '42ms',  icon: Lock },
  { name: 'Medicine Service', status: 'online',  latency: '68ms',  icon: Database },
  { name: 'MoH Registry',     status: 'online',  latency: '95ms',  icon: Wifi },
  { name: 'Insurance Bridge', status: 'degraded',latency: '310ms', icon: Shield },
  { name: 'File Storage',     status: 'online',  latency: '55ms',  icon: Server },
  { name: 'Email / SMS',      status: 'online',  latency: '120ms', icon: Cpu },
]

// Pending actions
const PENDING = [
  { type: 'Medicine Approval',     count: MEDICINES.filter(m => m.status === 'Under Review').length, to: '/admin/medicines', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { type: 'Pending User Accounts', count: USERS.filter(u => u.status === 'Pending').length,          to: '/admin/users',    color: 'text-sky-700 bg-sky-50 border-sky-200' },
  { type: 'Suspended Users',       count: USERS.filter(u => u.status === 'Suspended').length,        to: '/admin/users',    color: 'text-red-700 bg-red-50 border-red-200' },
  { type: 'Security Alerts',       count: AUDIT_LOGS.filter(l => l.status === 'Failed').length,     to: '/admin/audit',    color: 'text-rose-700 bg-rose-50 border-rose-200' },
]

const MONTHS = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']

export default function AdminDashboard() {
  const [lastRefreshed, setLastRefreshed] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setLastRefreshed(new Date())
      setRefreshing(false)
    }, 800)
  }

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalUsers     = USERS.length
  const activeUsers    = USERS.filter(u => u.status === 'Active').length
  const pendingUsers   = USERS.filter(u => u.status === 'Pending').length
  const suspendedUsers = USERS.filter(u => u.status === 'Suspended').length
  const totalMeds      = MEDICINES.length
  const activeMeds     = MEDICINES.filter(m => m.status === 'Active').length
  const reviewMeds     = MEDICINES.filter(m => m.status === 'Under Review').length
  const failedLogins   = AUDIT_LOGS.filter(l => l.status === 'Failed').length
  const successLogs    = AUDIT_LOGS.filter(l => l.status === 'Success').length

  // ── Chart: User role distribution (doughnut) ──────────────────────────────
  const roleCounts = ['PATIENT', 'PHARMACY', 'INSURANCE', 'GOVERNMENT', 'ADMIN'].map(
    r => USERS.filter(u => u.role === r).length
  )
  const roleChartData = {
    labels: ['Patient', 'Pharmacy', 'Insurance', 'Government', 'Admin'],
    datasets: [{
      data: roleCounts,
      backgroundColor: ['#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'],
      borderWidth: 2,
      borderColor: '#fff',
      hoverOffset: 8,
    }],
  }

  // ── Chart: New registrations per month (bar) ──────────────────────────────
  const regData = {
    labels: MONTHS,
    datasets: [{
      label: 'New Users',
      data: [4, 7, 5, 9, 6, 11, 8],
      backgroundColor: 'rgba(15,81,50,0.75)',
      borderRadius: 6,
      borderSkipped: false,
    }],
  }

  // ── Chart: Audit activity over time (line) ────────────────────────────────
  const auditLineData = {
    labels: MONTHS,
    datasets: [
      {
        label: 'Success',
        data: [28, 34, 29, 41, 37, 45, 38],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.10)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
      },
      {
        label: 'Failed',
        data: [2, 1, 3, 1, 4, 2, 3],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
      },
    ],
  }

  const baseScaleOpts = {
    y: { ticks: { font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
    x: { ticks: { font: { size: 10 } }, grid: { display: false } },
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Administrator Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">
            Platform overview · users, medicines, security, and system health.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="inline-flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>All Systems Operational</span>
          </span>
          <button
            onClick={handleRefresh}
            aria-label="Refresh dashboard"
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ── Top KPI Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="list" aria-label="Platform KPIs">
        {[
          { label: 'Total Users',        value: totalUsers,   sub: `${activeUsers} active`,       icon: Users,      color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Medicine Catalogue', value: totalMeds,    sub: `${reviewMeds} under review`,  icon: Package,    color: 'text-blue-700',    bg: 'bg-blue-50' },
          { label: 'Security Events',    value: successLogs,  sub: `${failedLogins} failed login${failedLogins !== 1 ? 's' : ''}`, icon: Shield, color: 'text-purple-700', bg: 'bg-purple-50' },
          { label: 'Pending Actions',    value: PENDING.reduce((a,p) => a + p.count, 0), sub: 'Needs admin review', icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50' },
        ].map(s => (
          <div key={s.label} role="listitem" className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
              <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-gray-400 mt-1">{s.sub}</p>
            </div>
            <div className={`p-2.5 rounded-lg ${s.bg} flex-shrink-0`} aria-hidden="true">
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* ── User breakdown sub-cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active',    value: activeUsers,    icon: UserCheck, color: 'text-emerald-700 bg-emerald-50' },
          { label: 'Pending',   value: pendingUsers,   icon: Clock,     color: 'text-amber-700 bg-amber-50' },
          { label: 'Suspended', value: suspendedUsers, icon: UserX,     color: 'text-red-700 bg-red-50' },
          { label: 'Active Meds', value: activeMeds,  icon: Package,   color: 'text-blue-700 bg-blue-50' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-3.5 flex items-center space-x-3 shadow-xs">
            <div className={`p-2 rounded-lg ${s.color.split(' ')[1]} flex-shrink-0`} aria-hidden="true">
              <s.icon className={`w-4 h-4 ${s.color.split(' ')[0]}`} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">{s.label}</p>
              <p className={`text-xl font-black ${s.color.split(' ')[0]}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Pending Actions ─────────────────────────────────────────── */}
      {PENDING.some(p => p.count > 0) && (
        <section aria-labelledby="pending-heading" className="bg-white border border-amber-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-amber-100 flex items-center space-x-2 bg-amber-50">
            <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden="true" />
            <h2 id="pending-heading" className="font-black text-amber-800 text-sm">Pending Actions Required</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
            {PENDING.map(p => (
              <Link
                key={p.type}
                to={p.to}
                className="flex flex-col items-center justify-center p-5 hover:bg-gray-50 transition-colors group text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
              >
                <span className={`text-3xl font-black ${p.color.split(' ')[0]}`}>{p.count}</span>
                <span className="text-[11px] text-gray-500 font-semibold mt-1">{p.type}</span>
                <span className={`inline-flex items-center text-[10px] font-bold border px-2 py-0.5 rounded mt-2 ${p.color} group-hover:opacity-80 transition-opacity`}>
                  Review <ArrowRight className="w-3 h-3 ml-1" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Charts Row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* User role distribution */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-black text-gray-900">User Role Distribution</h2>
          <p className="text-[10px] text-gray-400">Breakdown across all 5 system roles</p>
          <div className="max-w-[220px] mx-auto">
            <Doughnut
              data={roleChartData}
              options={{
                responsive: true,
                cutout: '60%',
                plugins: {
                  legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 12, padding: 10 } },
                },
              }}
            />
          </div>
        </div>

        {/* New registrations */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-black text-gray-900">New User Registrations</h2>
          <p className="text-[10px] text-gray-400">Monthly account creations (Feb – Aug 2026)</p>
          <Bar
            data={regData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: baseScaleOpts,
            }}
          />
        </div>

        {/* Audit activity */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-black text-gray-900">Audit Event Trend</h2>
          <p className="text-[10px] text-gray-400">Success vs Failed events per month</p>
          <Line
            data={auditLineData}
            options={{
              responsive: true,
              plugins: { legend: { position: 'top', labels: { font: { size: 10 }, boxWidth: 12 } } },
              scales: baseScaleOpts,
            }}
          />
        </div>
      </div>

      {/* ── Activity feed + System health ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent activity */}
        <section aria-labelledby="activity-heading" className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              <h2 id="activity-heading" className="font-black text-gray-900 text-sm">Recent System Activity</h2>
            </div>
            <Link to="/admin/audit" className="text-xs font-bold text-health-primary hover:underline flex items-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 rounded">
              View all <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {AUDIT_LOGS.slice(0, 7).map((item, idx) => (
              <li key={idx} className="px-5 py-3 flex items-start space-x-3 text-xs">
                <span
                  aria-hidden="true"
                  className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    item.status === 'Success' ? 'bg-emerald-500' :
                    item.status === 'Warning' ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                />
                <div className="flex-grow min-w-0">
                  <p className="text-gray-800 font-medium truncate">
                    <span className="font-bold text-gray-900">{item.actor}</span>
                    {' · '}
                    <span className="text-gray-500">{item.resource}</span>
                    {' — '}
                    {item.action}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`inline-flex text-[10px] font-bold border px-1.5 py-0.5 rounded ${
                    item.status === 'Success' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                    item.status === 'Warning' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                    'text-red-700 bg-red-50 border-red-200'
                  }`}>{item.status}</span>
                  <time className="text-gray-400 font-mono">{item.time}</time>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* System health */}
        <section aria-labelledby="health-heading" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-2">
            <Server className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            <h2 id="health-heading" className="font-black text-gray-900 text-sm">System Health</h2>
          </div>
          <ul className="divide-y divide-gray-100">
            {SERVICES.map(svc => (
              <li key={svc.name} className="px-5 py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <div className={`p-1.5 rounded-md ${svc.status === 'online' ? 'bg-emerald-50' : 'bg-amber-50'}`} aria-hidden="true">
                    <svc.icon className={`w-3.5 h-3.5 ${svc.status === 'online' ? 'text-emerald-600' : 'text-amber-600'}`} />
                  </div>
                  <span className="font-semibold text-gray-800">{svc.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-gray-400 text-[10px]">{svc.latency}</span>
                  <span className={`inline-flex text-[10px] font-bold border px-1.5 py-0.5 rounded ${
                    svc.status === 'online'
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-amber-700 bg-amber-50 border-amber-200'
                  }`}>
                    {svc.status === 'online' ? 'Online' : 'Degraded'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-[10px] text-gray-400">
              Last checked: <time dateTime={lastRefreshed.toISOString()}>{lastRefreshed.toLocaleTimeString()}</time>
            </p>
          </div>
        </section>

      </div>

      {/* ── Quick nav to all admin sections ─────────────────────────── */}
      <section aria-labelledby="quicknav-heading" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 id="quicknav-heading" className="font-black text-gray-900 text-sm">Admin Sections</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-gray-100">
          {[
            { to: '/admin/users',    icon: Users,      label: 'Users',     desc: `${totalUsers} accounts`,       color: 'text-emerald-700 bg-emerald-50' },
            { to: '/admin/medicines',icon: Package,     label: 'Medicines', desc: `${totalMeds} catalogue entries`,color: 'text-blue-700 bg-blue-50' },
            { to: '/admin/roles',    icon: ShieldCheck, label: 'Roles',     desc: '5 permission groups',           color: 'text-purple-700 bg-purple-50' },
            { to: '/admin/audit',    icon: FileLock2,   label: 'Audit Logs',desc: `${AUDIT_LOGS.length} entries`,  color: 'text-amber-700 bg-amber-50' },
            { to: '/admin/settings', icon: Settings,    label: 'Settings',  desc: 'System configuration',          color: 'text-gray-700 bg-gray-100' },
          ].map(q => (
            <Link
              key={q.to}
              to={q.to}
              className="flex flex-col items-center justify-center p-5 hover:bg-gray-50 transition-colors group text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
            >
              <div className={`p-3 rounded-xl ${q.color.split(' ')[1]} mb-2 group-hover:scale-105 transition-transform`} aria-hidden="true">
                <q.icon className={`w-5 h-5 ${q.color.split(' ')[0]}`} />
              </div>
              <p className="text-xs font-black text-gray-900 group-hover:text-health-primary transition-colors">{q.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{q.desc}</p>
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}
