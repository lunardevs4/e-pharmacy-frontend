import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  LineElement, PointElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  Users, Package, ShieldCheck, FileLock2, Activity, CheckCircle2,
  AlertTriangle, Server, Clock, UserCheck, UserX, RefreshCw,
  ArrowRight, Shield, Settings, Cpu, Wifi, Database, Lock,
  TrendingUp, MapPin, FileText, DollarSign, ClipboardList,
} from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend, Filler)

// ── Shared data mirroring every module in the app ─────────────────────────────

const ALL_USERS = [
  { id: 'USR-001', name: 'Marie Uwimana',         role: 'PATIENT',    status: 'Active',    createdAt: '2026-01', lastLogin: '2026-07-30' },
  { id: 'USR-002', name: 'Eric Mugisha',           role: 'PHARMACY',   status: 'Active',    createdAt: '2026-02', lastLogin: '2026-08-01' },
  { id: 'USR-003', name: 'Jean Bosco Gasana',      role: 'GOVERNMENT', status: 'Active',    createdAt: '2026-01', lastLogin: '2026-07-31' },
  { id: 'USR-004', name: 'Diane Mukamana',         role: 'INSURANCE',  status: 'Active',    createdAt: '2026-03', lastLogin: '2026-07-28' },
  { id: 'USR-005', name: 'Aline Ingabire',         role: 'PATIENT',    status: 'Pending',   createdAt: '2026-07', lastLogin: '—'         },
  { id: 'USR-006', name: 'Patrick Habimana',       role: 'PHARMACY',   status: 'Suspended', createdAt: '2025-11', lastLogin: '2026-06-01' },
  { id: 'USR-007', name: 'Claudine Uwera',         role: 'INSURANCE',  status: 'Active',    createdAt: '2026-04', lastLogin: '2026-07-25' },
  { id: 'USR-008', name: 'System Admin',           role: 'ADMIN',      status: 'Active',    createdAt: '2025-01', lastLogin: '2026-08-01' },
]

const ALL_MEDICINES = [
  { id: 'MED-001', name: 'Panadol Forte 500mg',  category: 'Analgesics',       status: 'Active',       rx: false },
  { id: 'MED-002', name: 'Coartem 80/480mg',      category: 'Antimalarials',    status: 'Active',       rx: true  },
  { id: 'MED-003', name: 'Amoxil 500mg',          category: 'Antibiotics',      status: 'Active',       rx: true  },
  { id: 'MED-004', name: 'Glucophage 850mg',      category: 'Antidiabetics',    status: 'Active',       rx: true  },
  { id: 'MED-005', name: 'Tenormin 50mg',         category: 'Antihypertensives',status: 'Active',       rx: true  },
  { id: 'MED-006', name: 'Insulatard 100IU/mL',   category: 'Antidiabetics',    status: 'Active',       rx: true  },
  { id: 'MED-007', name: 'Zithromax 250mg',       category: 'Antibiotics',      status: 'Under Review', rx: true  },
  { id: 'MED-008', name: 'ORS Sachet 20g',        category: 'Electrolytes',     status: 'Active',       rx: false },
]

const ALL_RESERVATIONS = [
  { id: 'RES-001', patient: 'Marie Uwimana',    medicine: 'Artemether + Lumefantrine', pharmacy: 'Bralirwa Pharmacy',    status: 'Ready for Pickup', insurance: true,  total: 3500  },
  { id: 'RES-002', patient: 'Jean-Pierre N.',   medicine: 'Amoxicillin 500mg',         pharmacy: 'CityMed Nyarugenge',   status: 'Pending',           insurance: false, total: 1600  },
  { id: 'RES-003', patient: 'Aline Mukamana',   medicine: 'Insulin Glargine',          pharmacy: 'MedPlus Remera',       status: 'Collected',         insurance: true,  total: 27000 },
  { id: 'RES-004', patient: 'Emmanuel H.',      medicine: 'Metformin 850mg',           pharmacy: 'Bralirwa Pharmacy',    status: 'Expired',           insurance: true,  total: 1920  },
  { id: 'RES-005', patient: 'Clarisse Ingabire',medicine: 'Paracetamol 500mg',         pharmacy: 'HealthPoint Kicukiro', status: 'Collected',         insurance: false, total: 900   },
  { id: 'RES-006', patient: 'Robert Uwera',     medicine: 'Atenolol 50mg',             pharmacy: 'Gasabo Health',        status: 'Pending',           insurance: true,  total: 950   },
]

const ALL_CLAIMS = [
  { id: 'CLM-001', pharmacy: 'Bralirwa Pharmacy',    medicine: 'Artemether + Lumefantrine', total: 3500,  insurancePays: 2975,  insurer: 'RSSB',    status: 'Pending'  },
  { id: 'CLM-002', pharmacy: 'CityMed Nyarugenge',   medicine: 'Metformin 850mg',           total: 1920,  insurancePays: 1728,  insurer: 'RSSB',    status: 'Approved' },
  { id: 'CLM-003', pharmacy: 'MedPlus Remera',       medicine: 'Insulin Glargine',          total: 27000, insurancePays: 24300, insurer: 'MMI',     status: 'Paid'     },
  { id: 'CLM-004', pharmacy: 'HealthPoint Kicukiro', medicine: 'Amoxicillin 500mg',         total: 1600,  insurancePays: 1200,  insurer: 'SANLAM',  status: 'Rejected' },
  { id: 'CLM-005', pharmacy: 'Bralirwa Pharmacy',    medicine: 'Atenolol 50mg',             total: 950,   insurancePays: 665,   insurer: 'Radiant', status: 'Approved' },
  { id: 'CLM-006', pharmacy: 'Gasabo Health',        medicine: 'Paracetamol 500mg',         total: 1200,  insurancePays: 1020,  insurer: 'RSSB',    status: 'Paid'     },
]

const ALL_PHARMACIES = [
  { name: 'Bralirwa Pharmacy',      province: 'Kigali City',       status: 'APPROVED',            category: 'Retail'     },
  { name: 'CityMed Nyarugenge',     province: 'Kigali City',       status: 'APPROVED',            category: 'Retail'     },
  { name: 'Remera City Medical',    province: 'Kigali City',       status: 'PENDING_VERIFICATION',category: 'Hospital'   },
  { name: 'Musanze District Pharmacy',province: 'Northern Province',status: 'APPROVED',           category: 'Retail'     },
  { name: 'Rubavu Health Centre',   province: 'Western Province',  status: 'SUSPENDED',           category: 'Wholesale'  },
  { name: 'Bugesera Community',     province: 'Eastern Province',  status: 'MORE_INFO_REQUESTED', category: 'Retail'     },
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

const SERVICES = [
  { name: 'Auth API',         status: 'online',   latency: '42ms',  icon: Lock     },
  { name: 'Medicine Service', status: 'online',   latency: '68ms',  icon: Database },
  { name: 'MoH Registry',     status: 'online',   latency: '95ms',  icon: Wifi     },
  { name: 'Insurance Bridge', status: 'degraded', latency: '310ms', icon: Shield   },
  { name: 'File Storage',     status: 'online',   latency: '55ms',  icon: Server   },
  { name: 'Email / SMS',      status: 'online',   latency: '120ms', icon: Cpu      },
]

const MONTHS = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']

// ── District shortage data (from DistrictAnalytics) ───────────────────────────
const DISTRICT_CRITICAL = [
  { name: 'Musanze',   province: 'Northern', stock: 61, drugs: ['Coartem', 'Amoxicillin'] },
  { name: 'Bugesera',  province: 'Eastern',  stock: 59, drugs: ['Amoxicillin', 'ORS']     },
  { name: 'Gisagara',  province: 'Northern', stock: 74, drugs: ['Metformin']              },
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState(new Date())

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => { setLastRefreshed(new Date()); setRefreshing(false) }, 700)
  }

  // ── Derived platform stats ─────────────────────────────────────────────────
  const totalUsers     = ALL_USERS.length
  const activeUsers    = ALL_USERS.filter(u => u.status === 'Active').length
  const pendingUsers   = ALL_USERS.filter(u => u.status === 'Pending').length
  const suspendedUsers = ALL_USERS.filter(u => u.status === 'Suspended').length

  const totalMeds    = ALL_MEDICINES.length
  const activeMeds   = ALL_MEDICINES.filter(m => m.status === 'Active').length
  const reviewMeds   = ALL_MEDICINES.filter(m => m.status === 'Under Review').length

  const totalRes     = ALL_RESERVATIONS.length
  const pendingRes   = ALL_RESERVATIONS.filter(r => r.status === 'Pending' || r.status === 'Ready for Pickup').length
  const collectedRes = ALL_RESERVATIONS.filter(r => r.status === 'Collected').length

  const totalClaims    = ALL_CLAIMS.length
  const pendingClaims  = ALL_CLAIMS.filter(c => c.status === 'Pending').length
  const paidClaims     = ALL_CLAIMS.filter(c => c.status === 'Paid').length
  const totalDisbursed = ALL_CLAIMS.filter(c => c.status === 'Paid' || c.status === 'Approved').reduce((a, c) => a + c.insurancePays, 0)

  const approvedPharm  = ALL_PHARMACIES.filter(p => p.status === 'APPROVED').length
  const pendingPharm   = ALL_PHARMACIES.filter(p => p.status === 'PENDING_VERIFICATION' || p.status === 'MORE_INFO_REQUESTED').length

  const failedLogins  = AUDIT_LOGS.filter(l => l.status === 'Failed').length
  const warningLogs   = AUDIT_LOGS.filter(l => l.status === 'Warning').length

  const totalPendingActions = reviewMeds + pendingUsers + pendingClaims + pendingPharm + failedLogins

  // ── Chart data ─────────────────────────────────────────────────────────────
  const roleChartData = {
    labels: ['Patient', 'Pharmacy', 'Insurance', 'Government', 'Admin'],
    datasets: [{
      data: ['PATIENT','PHARMACY','INSURANCE','GOVERNMENT','ADMIN'].map(r => ALL_USERS.filter(u => u.role === r).length),
      backgroundColor: ['#7dd3fc','#6ee7b7','#c4b5fd','#fcd34d','#fca5a5'],
      borderWidth: 2, borderColor: '#fff', hoverOffset: 6,
    }],
  }

  const regData = {
    labels: MONTHS,
    datasets: [{
      label: 'New Users',
      data: [4, 7, 5, 9, 6, 11, 8],
      backgroundColor: '#6ee7b7',
      borderRadius: 5, borderSkipped: false,
    }],
  }

  const auditLineData = {
    labels: MONTHS,
    datasets: [
      { label: 'Success', data: [28,34,29,41,37,45,38], borderColor:'#10b981', backgroundColor:'rgba(16,185,129,0.08)', fill:true, tension:0.4, borderWidth:1.5, pointRadius:2 },
      { label: 'Failed',  data: [2,1,3,1,4,2,3],        borderColor:'#f87171', backgroundColor:'rgba(248,113,113,0.06)', fill:true, tension:0.4, borderWidth:1.5, pointRadius:2 },
    ],
  }

  const reservationData = {
    labels: MONTHS,
    datasets: [
      { label: 'Reservations', data: [120,145,132,168,155,188,176], backgroundColor:'#a5b4fc', borderRadius:5, borderSkipped:false },
      { label: 'Collected',    data: [98, 120,115,140,132,162,148], backgroundColor:'#6ee7b7', borderRadius:5, borderSkipped:false },
    ],
  }

  const claimsData = {
    labels: MONTHS,
    datasets: [
      { label: 'Approved', data:[142,165,178,190,210,225,248], backgroundColor:'#6ee7b7', borderRadius:5, borderSkipped:false },
      { label: 'Rejected', data:[12,9,14,11,8,10,7],           backgroundColor:'#fca5a5', borderRadius:5, borderSkipped:false },
    ],
  }

  const scaleOpts = {
    y: { ticks:{ font:{ size:9 } }, grid:{ color:'rgba(0,0,0,0.04)' } },
    x: { ticks:{ font:{ size:9 } }, grid:{ display:false } },
  }

  const PENDING_ACTIONS = [
    { type:'Medicine Approvals',   count:reviewMeds,    to:'/admin/medicines', color:'bg-amber-50 border-amber-200 text-amber-700'    },
    { type:'Pending Users',        count:pendingUsers,  to:'/admin/users',     color:'bg-sky-50 border-sky-200 text-sky-700'          },
    { type:'Claims to Review',     count:pendingClaims, to:'/admin/audit',     color:'bg-purple-50 border-purple-200 text-purple-700' },
    { type:'Security Alerts',      count:failedLogins,  to:'/admin/audit',     color:'bg-rose-50 border-rose-200 text-rose-700'       },
    { type:'Pharmacy Applications',count:pendingPharm,  to:'/admin/users',     color:'bg-orange-50 border-orange-200 text-orange-700' },
  ].filter(p => p.count > 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="bg-white rounded-lg p-1 flex-shrink-0">
              <img src="/logo1.png" alt="" aria-hidden="true" className="h-6 w-auto object-contain" />
            </div>
            <h1 className="text-xl font-black text-gray-800">Administrator Dashboard</h1>
          </div>
          <p className="text-xs text-gray-400 font-medium">
            Platform-wide overview — users, medicines, reservations, claims, pharmacies, security &amp; system health.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            All Systems Operational
          </span>
          <button onClick={handleRefresh} aria-label="Refresh dashboard"
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-400 transition-colors">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ── Pending Actions Banner ─────────────────────────────────────────── */}
      {PENDING_ACTIONS.length > 0 && (
        <section aria-labelledby="pending-h" className="bg-amber-50/60 border border-amber-100 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-amber-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" aria-hidden="true" />
            <h2 id="pending-h" className="text-sm font-bold text-amber-700">Actions Awaiting Review</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
            {PENDING_ACTIONS.map(p => (
              <Link key={p.type} to={p.to}
                className="flex flex-col items-center justify-center p-4 hover:bg-white/60 transition-colors text-center group border-r border-amber-100 last:border-r-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500">
                <span className={`text-2xl font-black ${p.color.split(' ')[2]}`}>{p.count}</span>
                <span className="text-[10px] text-gray-500 font-semibold mt-1">{p.type}</span>
                <span className={`text-[10px] font-bold border px-2 py-0.5 rounded mt-1.5 ${p.color} flex items-center gap-0.5 group-hover:opacity-70 transition-opacity`}>
                  Review <ArrowRight className="w-2.5 h-2.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Platform-wide KPI row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3" role="list" aria-label="Platform statistics">
        {[
          { label:'Total Users',     value:totalUsers,   sub:`${activeUsers} active`,        icon:Users,        c:'text-slate-700',  bg:'bg-slate-50'  },
          { label:'Medicines',       value:totalMeds,    sub:`${reviewMeds} under review`,   icon:Package,      c:'text-blue-600',   bg:'bg-blue-50'   },
          { label:'Reservations',    value:totalRes,     sub:`${pendingRes} active`,         icon:ClipboardList,c:'text-indigo-600', bg:'bg-indigo-50' },
          { label:'Insurance Claims',value:totalClaims,  sub:`${pendingClaims} pending`,     icon:FileText,     c:'text-purple-600', bg:'bg-purple-50' },
          { label:'Pharmacies',      value:ALL_PHARMACIES.length, sub:`${approvedPharm} approved`, icon:MapPin, c:'text-emerald-600',bg:'bg-emerald-50'},
          { label:'Security Events', value:AUDIT_LOGS.length, sub:`${failedLogins} failed`, icon:Shield,       c:'text-rose-500',   bg:'bg-rose-50'   },
        ].map(s => (
          <div key={s.label} role="listitem" className="bg-white border border-gray-100 rounded-xl p-4 flex items-start justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">{s.label}</p>
              <p className={`text-2xl font-black mt-1.5 ${s.c}`}>{s.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
            </div>
            <div className={`p-2 rounded-lg ${s.bg} flex-shrink-0`} aria-hidden="true">
              <s.icon className={`w-4 h-4 ${s.c}`} />
            </div>
          </div>
        ))}
      </div>

      {/* ── User breakdown + District alerts row ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* User status breakdown */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-gray-700">User Accounts</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label:'Active',    value:activeUsers,    c:'text-emerald-600', bg:'bg-emerald-50', icon:UserCheck },
              { label:'Pending',   value:pendingUsers,   c:'text-amber-600',   bg:'bg-amber-50',   icon:Clock     },
              { label:'Suspended', value:suspendedUsers, c:'text-red-500',     bg:'bg-red-50',     icon:UserX     },
              { label:'Medicines', value:activeMeds,     c:'text-blue-600',    bg:'bg-blue-50',    icon:Package   },
            ].map(s => (
              <div key={s.label} className={`flex items-center gap-2.5 p-3 rounded-lg ${s.bg}`}>
                <s.icon className={`w-4 h-4 ${s.c} flex-shrink-0`} aria-hidden="true" />
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase">{s.label}</p>
                  <p className={`text-lg font-black ${s.c}`}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/admin/users" className="text-xs font-bold text-gray-400 hover:text-health-primary flex items-center gap-1 transition-colors mt-1">
            Manage users <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Pharmacy registration status */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-gray-700">Pharmacy Registry</h2>
          <div className="space-y-2">
            {[
              { label:'Approved',          count: ALL_PHARMACIES.filter(p=>p.status==='APPROVED').length,            c:'text-emerald-600', bar:'bg-emerald-400' },
              { label:'Pending Review',    count: ALL_PHARMACIES.filter(p=>p.status==='PENDING_VERIFICATION').length,c:'text-amber-600',   bar:'bg-amber-400'   },
              { label:'Info Requested',    count: ALL_PHARMACIES.filter(p=>p.status==='MORE_INFO_REQUESTED').length, c:'text-blue-600',    bar:'bg-blue-400'    },
              { label:'Suspended',         count: ALL_PHARMACIES.filter(p=>p.status==='SUSPENDED').length,           c:'text-red-500',     bar:'bg-red-400'     },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400 font-semibold w-28 flex-shrink-0">{s.label}</span>
                <div className="flex-grow bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.bar}`} style={{ width:`${(s.count/ALL_PHARMACIES.length)*100}%` }} />
                </div>
                <span className={`text-xs font-black ${s.c} w-4 text-right flex-shrink-0`}>{s.count}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400">{ALL_PHARMACIES.length} total registered pharmacies</p>
        </div>

        {/* District shortage alerts from DistrictAnalytics */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-700">District Shortages</h2>
            <Link to="/government/districts" className="text-[10px] font-bold text-gray-400 hover:text-health-primary transition-colors">
              View heatmap →
            </Link>
          </div>
          <div className="space-y-2.5">
            {DISTRICT_CRITICAL.map(d => (
              <div key={d.name} className="flex items-center justify-between gap-3 bg-red-50/50 border border-red-100 rounded-lg p-2.5">
                <div>
                  <span className="text-xs font-bold text-gray-800">{d.name}</span>
                  <span className="text-[10px] text-gray-400 block">{d.province}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-red-500 block">{d.stock}%</span>
                  <div className="flex flex-wrap gap-1 justify-end mt-0.5">
                    {d.drugs.map(drug => (
                      <span key={drug} className="text-[9px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">{drug}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400">{DISTRICT_CRITICAL.length} districts below 75% stock threshold</p>
        </div>
      </div>

      {/* ── Charts row 1: Users + Registrations + Audit ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-2">
          <h2 className="text-sm font-bold text-gray-700">User Role Distribution</h2>
          <p className="text-[10px] text-gray-400">Across all 5 portal roles</p>
          <div className="max-w-[200px] mx-auto pt-1">
            <Doughnut data={roleChartData} options={{ responsive:true, cutout:'58%', plugins:{ legend:{ position:'bottom', labels:{ font:{ size:9 }, boxWidth:10, padding:8 } } } }} />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-2">
          <h2 className="text-sm font-bold text-gray-700">New Registrations</h2>
          <p className="text-[10px] text-gray-400">Monthly account creations (Feb – Aug)</p>
          <Bar data={regData} options={{ responsive:true, plugins:{ legend:{ display:false } }, scales:scaleOpts }} />
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-2">
          <h2 className="text-sm font-bold text-gray-700">Audit Event Trend</h2>
          <p className="text-[10px] text-gray-400">Success vs Failed events per month</p>
          <Line data={auditLineData} options={{ responsive:true, plugins:{ legend:{ position:'top', labels:{ font:{ size:9 }, boxWidth:10 } } }, scales:scaleOpts }} />
        </div>
      </div>

      {/* ── Charts row 2: Reservations + Claims ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-700">Reservation Volume</h2>
              <p className="text-[10px] text-gray-400">Created vs Collected per month</p>
            </div>
            <Link to="/pharmacy/reservations" className="text-[10px] font-bold text-gray-400 hover:text-health-primary transition-colors">View →</Link>
          </div>
          <Bar data={reservationData} options={{ responsive:true, plugins:{ legend:{ position:'top', labels:{ font:{ size:9 }, boxWidth:10 } } }, scales:scaleOpts }} />
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-700">Insurance Claims</h2>
              <p className="text-[10px] text-gray-400">Approved vs Rejected per month</p>
            </div>
            <Link to="/insurance/claims" className="text-[10px] font-bold text-gray-400 hover:text-health-primary transition-colors">View →</Link>
          </div>
          <Bar data={claimsData} options={{ responsive:true, plugins:{ legend:{ position:'top', labels:{ font:{ size:9 }, boxWidth:10 } } }, scales:scaleOpts }} />
        </div>
      </div>

      {/* ── Live data tables row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent Reservations snapshot */}
        <section aria-labelledby="res-h" className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-gray-400" aria-hidden="true" />
              <h2 id="res-h" className="text-sm font-bold text-gray-700">Recent Reservations</h2>
            </div>
            <Link to="/pharmacy/reservations" className="text-[10px] font-bold text-gray-400 hover:text-health-primary transition-colors">
              View all <ArrowRight className="w-3 h-3 inline" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" aria-label="Recent reservations">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th scope="col" className="px-4 py-2.5">Patient</th>
                  <th scope="col" className="px-4 py-2.5">Medicine</th>
                  <th scope="col" className="px-4 py-2.5">Pharmacy</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ALL_RESERVATIONS.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-4 py-2.5 font-semibold text-gray-700">{r.patient}</td>
                    <td className="px-4 py-2.5 text-gray-500">{r.medicine}</td>
                    <td className="px-4 py-2.5 text-gray-400 text-[10px]">{r.pharmacy}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`inline-flex text-[10px] font-bold border px-1.5 py-0.5 rounded ${
                        r.status==='Collected'        ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                        r.status==='Ready for Pickup' ? 'text-blue-600 bg-blue-50 border-blue-100' :
                        r.status==='Pending'          ? 'text-amber-600 bg-amber-50 border-amber-100' :
                        'text-gray-400 bg-gray-50 border-gray-100'
                      }`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Insurance Claims snapshot */}
        <section aria-labelledby="clm-h" className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" aria-hidden="true" />
              <h2 id="clm-h" className="text-sm font-bold text-gray-700">Insurance Claims</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-gray-400">
                RWF {(totalDisbursed/1000000).toFixed(2)}M disbursed
              </span>
              <Link to="/insurance/claims" className="text-[10px] font-bold text-gray-400 hover:text-health-primary transition-colors">
                View all <ArrowRight className="w-3 h-3 inline" />
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" aria-label="Insurance claims">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th scope="col" className="px-4 py-2.5">Pharmacy</th>
                  <th scope="col" className="px-4 py-2.5">Medicine</th>
                  <th scope="col" className="px-4 py-2.5">Insurer</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ALL_CLAIMS.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-4 py-2.5 font-semibold text-gray-700">{c.pharmacy}</td>
                    <td className="px-4 py-2.5 text-gray-500">{c.medicine}</td>
                    <td className="px-4 py-2.5 text-gray-400 text-[10px]">{c.insurer}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`inline-flex text-[10px] font-bold border px-1.5 py-0.5 rounded ${
                        c.status==='Paid'     ? 'text-blue-600 bg-blue-50 border-blue-100'         :
                        c.status==='Approved' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                        c.status==='Pending'  ? 'text-amber-600 bg-amber-50 border-amber-100'       :
                        'text-red-500 bg-red-50 border-red-100'
                      }`}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ── Audit feed + System health ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent audit log */}
        <section aria-labelledby="audit-h" className="lg:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-400" aria-hidden="true" />
              <h2 id="audit-h" className="text-sm font-bold text-gray-700">Recent System Activity</h2>
            </div>
            <Link to="/admin/audit" className="text-[10px] font-bold text-gray-400 hover:text-health-primary flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>
          <ul className="divide-y divide-gray-50">
            {AUDIT_LOGS.slice(0, 8).map((item, idx) => (
              <li key={idx} className="px-5 py-2.5 flex items-start gap-3 text-xs hover:bg-gray-50/40 transition-colors">
                <span aria-hidden="true" className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  item.status==='Success' ? 'bg-emerald-400' :
                  item.status==='Warning' ? 'bg-amber-400' : 'bg-red-400'
                }`} />
                <div className="flex-grow min-w-0">
                  <p className="text-gray-600 truncate">
                    <span className="font-semibold text-gray-800">{item.actor}</span>
                    <span className="text-gray-400"> · {item.resource}</span>
                    <span> — {item.action}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-bold border px-1.5 py-0.5 rounded ${
                    item.status==='Success' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                    item.status==='Warning' ? 'text-amber-600 bg-amber-50 border-amber-100' :
                    'text-red-500 bg-red-50 border-red-100'
                  }`}>{item.status}</span>
                  <time className="text-gray-400 font-mono text-[10px]">{item.time}</time>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* System health */}
        <section aria-labelledby="health-h" className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
            <Server className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <h2 id="health-h" className="text-sm font-bold text-gray-700">System Health</h2>
          </div>
          <ul className="divide-y divide-gray-50">
            {SERVICES.map(svc => (
              <li key={svc.name} className="px-5 py-2.5 flex items-center justify-between text-xs hover:bg-gray-50/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-md ${svc.status==='online' ? 'bg-emerald-50' : 'bg-amber-50'}`} aria-hidden="true">
                    <svc.icon className={`w-3.5 h-3.5 ${svc.status==='online' ? 'text-emerald-500' : 'text-amber-500'}`} />
                  </div>
                  <span className="text-gray-600 font-medium">{svc.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-gray-400 text-[10px]">{svc.latency}</span>
                  <span className={`text-[10px] font-bold border px-1.5 py-0.5 rounded ${
                    svc.status==='online'
                      ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                      : 'text-amber-600 bg-amber-50 border-amber-100'
                  }`}>{svc.status==='online' ? 'OK' : 'Degraded'}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="px-5 py-2.5 border-t border-gray-50 bg-gray-50/50">
            <p className="text-[10px] text-gray-400">
              Checked: <time dateTime={lastRefreshed.toISOString()}>{lastRefreshed.toLocaleTimeString()}</time>
            </p>
          </div>
        </section>
      </div>

      {/* ── Quick navigation to all admin sections ─────────────────────────── */}
      <section aria-labelledby="nav-h" className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h2 id="nav-h" className="text-sm font-bold text-gray-700">Admin Sections</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          {[
            { to:'/admin/users',    icon:Users,      label:'Users',      desc:`${totalUsers} accounts`,         c:'text-slate-600 bg-slate-50'   },
            { to:'/admin/medicines',icon:Package,    label:'Medicines',  desc:`${totalMeds} catalogue entries`, c:'text-blue-600 bg-blue-50'     },
            { to:'/admin/roles',    icon:ShieldCheck,label:'Roles',      desc:'5 permission groups',            c:'text-purple-600 bg-purple-50' },
            { to:'/admin/audit',    icon:FileLock2,  label:'Audit Logs', desc:`${AUDIT_LOGS.length} entries`,   c:'text-amber-600 bg-amber-50'   },
            { to:'/admin/settings', icon:Settings,   label:'Settings',   desc:'System configuration',           c:'text-gray-500 bg-gray-100'    },
          ].map(q => {
            const [tc, bg] = q.c.split(' ')
            return (
              <Link key={q.to} to={q.to}
                className="flex flex-col items-center justify-center p-5 hover:bg-gray-50/60 transition-colors group text-center border-r border-gray-100 last:border-r-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500">
                <div className={`p-2.5 rounded-xl ${bg} mb-2 group-hover:scale-105 transition-transform`} aria-hidden="true">
                  <q.icon className={`w-5 h-5 ${tc}`} />
                </div>
                <p className="text-xs font-bold text-gray-700 group-hover:text-health-primary transition-colors">{q.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{q.desc}</p>
              </Link>
            )
          })}
        </div>
      </section>

    </div>
  )
}
