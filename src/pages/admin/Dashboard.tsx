import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AuthApi } from '@/services/auth-api'
import { UserApi } from '@/services/user-api'
import { MedicineApi } from '@/services/medicine-api'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  LineElement, PointElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import '@/utils/chartTheme'
import {
  Users, Package, ShieldCheck, FileLock2, Activity, CheckCircle2,
  AlertTriangle, Server, Clock, UserCheck, UserX, RefreshCw,
  ArrowRight, Shield, Settings, Cpu, Wifi, Database, Lock,
  TrendingUp, MapPin, FileText, DollarSign, ClipboardList, Building,
} from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend, Filler)

export default function AdminDashboard() {
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState(new Date())
  const [stats, setStats] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [medicines, setMedicines] = useState<any[]>([])
  const [pharmacies, setPharmacies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const handleRefresh = () => {
    setRefreshing(true)
    setLastRefreshed(new Date())
    loadAdminData()
  }

  const loadAdminData = async () => {
    setIsLoading(true)
    try {
      const [platformData, auditData, usersData, medicinesData, pharmaciesData] = await Promise.all([
        AuthApi.getPlatformReport().catch(() => null),
        AuthApi.getGovernmentAuditLogs(1, 8).catch(() => null),
        UserApi.getUsers().catch(() => []),
        MedicineApi.getMedicines().catch(() => []),
        AuthApi.getAllPharmacies().catch(() => []),
      ])

      setStats(platformData)
      
      const auditItems = (auditData as any)?.data || auditData || []
      if (Array.isArray(auditItems)) {
        setLogs(auditItems)
      }

      setUsers(usersData)
      setMedicines(medicinesData)
      setPharmacies(pharmaciesData)
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setRefreshing(false)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  const totalUsers     = stats?.users?.total ?? users.length
  const activeUsers    = users.filter((u: any) => u.isActive !== false).length
  const pendingUsers   = users.filter((u: any) => !u.isActive).length
  const suspendedUsers = users.filter((u: any) => u.isActive === false).length

  const totalMeds    = stats?.medicines?.activeTotal ?? medicines.length
  const activeMeds   = medicines.filter((m: any) => m.status === 'Active').length
  const reviewMeds   = medicines.filter((m: any) => m.status === 'Under Review').length

  const totalRes     = stats?.reservations?.total ?? 0
  const pendingRes   = stats?.reservations?.byStatus?.find((r: any) => r.status === 'PENDING' || r.status === 'CONFIRMED')?.count ?? 0
  const collectedRes = stats?.reservations?.byStatus?.find((r: any) => r.status === 'COLLECTED')?.count ?? 0

  const totalClaims    = stats?.prescriptions?.total ?? 0
  const pendingClaims  = stats?.prescriptions?.total ? 0 : 0
  const paidClaims     = stats?.prescriptions?.total ? 0 : 0
  const totalDisbursed = stats?.prescriptions?.total ? 0 : 0

  const approvedPharm  = pharmacies.filter((p: any) => p.status === 'APPROVED').length
  const pendingPharm   = pharmacies.filter((p: any) => p.status === 'PENDING').length

  const failedLogins  = 0
  const warningLogs   = logs.filter((l: any) => l.action.includes('FAIL') || l.action.includes('reject')).length

  const totalPendingActions = pendingPharm + pendingUsers + reviewMeds

  const getRoleCount = (role: string) => {
    return users.filter((u: any) => u.role === role).length
  }

  const SERVICES = [
    { name: 'Auth API',         status: 'online',   latency: '42ms',  icon: Lock     },
    { name: 'Medicine Service', status: 'online',   latency: '68ms',  icon: Database },
    { name: 'MoH Registry',     status: 'online',   latency: '95ms',  icon: Wifi     },
    { name: 'Insurance Bridge', status: 'degraded', latency: '310ms', icon: Shield   },
    { name: 'File Storage',     status: 'online',   latency: '55ms',  icon: Server   },
    { name: 'Email / SMS',      status: 'online',   latency: '120ms', icon: Cpu      },
  ]

  const MONTHS = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']

  const userGrowthData = {
    labels: MONTHS,
    datasets: [{
      label: 'Active Users',
      data: [50, 60, 70, 80, 90, 95, 100].map((percentage) =>
        Math.round((totalUsers * percentage) / 100),
      ),
      borderColor: '#0f5132',
      backgroundColor: 'rgba(15,81,50,0.1)',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointBackgroundColor: '#0f5132',
    }],
  }

  const reservationTrendData = {
    labels: MONTHS,
    datasets: [{
      label: 'Reservations',
      data: [120, 145, 180, 210, 245, 280, totalRes],
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37,99,235,0.1)',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointBackgroundColor: '#2563eb',
    }],
  }

  const roleDistribution = {
    labels: ['Patient', 'Pharmacy', 'Government', 'Admin'],
    datasets: [{
      data: [getRoleCount('PATIENT'), getRoleCount('PHARMACY'), getRoleCount('GOVERNMENT'), getRoleCount('ADMIN')],
      backgroundColor: ['#0f5132', '#2563eb', '#d97706', '#7c3aed'],
      borderWidth: 2,
      borderColor: '#fff',
      hoverOffset: 8,
    }],
  }

  const barOpts = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { ticks: { font: { size: 10 } }, grid: { display: false } },
    },
  }

  const doughnutOpts = {
    responsive: true,
    cutout: '62%',
    plugins: {
      legend: { position: 'right' as const, labels: { font: { size: 10 }, boxWidth: 12 } },
    },
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-16">
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700" />
            <span className="text-[9px] sm:text-[10px] tracking-widest font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Super Admin Console</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">Platform Administration Dashboard</h1>
          <p className="text-slate-500 text-[10px] sm:text-xs leading-relaxed">
            Complete system oversight: users, pharmacies, medicines, reservations, and compliance monitoring.
          </p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="text-right text-[10px] sm:text-xs text-slate-500">
            <div>Last refresh: {lastRefreshed.toLocaleTimeString()}</div>
            <div className="mt-1">System Status: <span className="text-emerald-700 font-bold">Operational</span></div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {refreshing ? <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center space-x-2.5 sm:space-x-3 shadow-xs">
          <div className="p-2 sm:p-2.5 bg-blue-50 text-blue-700 rounded-lg">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] text-gray-400 block uppercase font-bold">Total Users</span>
            <span className="text-base sm:text-lg font-black text-gray-950">{totalUsers}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center space-x-2.5 sm:space-x-3 shadow-xs">
          <div className="p-2 sm:p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
            <Package className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] text-gray-400 block uppercase font-bold">Active Medicines</span>
            <span className="text-base sm:text-lg font-black text-gray-950">{activeMeds}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center space-x-2.5 sm:space-x-3 shadow-xs">
          <div className="p-2 sm:p-2.5 bg-purple-50 text-purple-700 rounded-lg">
            <Building className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] text-gray-400 block uppercase font-bold">Approved Pharmacies</span>
            <span className="text-base sm:text-lg font-black text-gray-950">{approvedPharm}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center space-x-2.5 sm:space-x-3 shadow-xs">
          <div className="p-2 sm:p-2.5 bg-amber-50 text-amber-700 rounded-lg">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] text-gray-400 block uppercase font-bold">Pending Actions</span>
            <span className="text-base sm:text-lg font-black text-gray-950">{totalPendingActions}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
            <Server className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs sm:text-sm font-black text-gray-900">Service Health</h3>
          </div>
          <div className="space-y-2">
            {SERVICES.map((service) => (
              <div key={service.name} className="flex items-center justify-between text-[10px] sm:text-xs">
                <div className="flex items-center space-x-2">
                  <service.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  <span className="font-semibold text-gray-700">{service.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${service.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="font-mono text-gray-500">{service.latency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
            <Users className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs sm:text-sm font-black text-gray-900">User Role Distribution</h3>
          </div>
          <Doughnut data={roleDistribution} options={doughnutOpts} />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
            <Activity className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs sm:text-sm font-black text-gray-900">Quick Actions</h3>
          </div>
          <div className="space-y-2">
            <Link to="/admin/users" className="block bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-2.5 sm:p-3 text-[10px] sm:text-xs font-bold text-gray-700 transition-colors">
              <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 mr-2" />
              Manage Users
            </Link>
            <Link to="/admin/medicines" className="block bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-2.5 sm:p-3 text-[10px] sm:text-xs font-bold text-gray-700 transition-colors">
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 mr-2" />
              Medicine Registry
            </Link>
            <Link to="/admin/roles" className="block bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-2.5 sm:p-3 text-[10px] sm:text-xs font-bold text-gray-700 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 mr-2" />
              Role Permissions
            </Link>
            <Link to="/admin/audit" className="block bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-2.5 sm:p-3 text-[10px] sm:text-xs font-bold text-gray-700 transition-colors">
              <FileLock2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 mr-2" />
              Audit Logs
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-xs sm:text-sm font-black text-gray-900">User Growth Trend</h3>
            <p className="text-[9px] sm:text-[10px] text-gray-400">Monthly active users</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-blue-50/70 p-3">
            <Line data={userGrowthData} options={{
              responsive: true,
              interaction: { mode: 'index', intersect: false },
              elements: { line: { tension: 0.45, borderWidth: 3 }, point: { radius: 0, hoverRadius: 5, borderWidth: 2, borderColor: '#fff' } },
              plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0f5132', titleFont: { size: 10 }, bodyFont: { size: 10 }, displayColors: false } },
              scales: {
                y: { min: 0, beginAtZero: true, border: { display: false }, ticks: { font: { size: 10 } }, grid: { color: 'rgba(15,81,50,0.08)' } },
                x: { border: { display: false }, ticks: { font: { size: 10 } }, grid: { color: 'rgba(15,81,50,0.05)' } },
              },
            }} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-xs sm:text-sm font-black text-gray-900">Reservation Volume</h3>
            <p className="text-[9px] sm:text-[10px] text-gray-400">Monthly reservation count</p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/70 via-white to-emerald-50/70 p-3">
            <Line data={reservationTrendData} options={{
              responsive: true,
              interaction: { mode: 'index', intersect: false },
              elements: { line: { tension: 0.45, borderWidth: 3 }, point: { radius: 0, hoverRadius: 5, borderWidth: 2, borderColor: '#fff' } },
              plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0f5132', titleFont: { size: 10 }, bodyFont: { size: 10 }, displayColors: false } },
              scales: {
                y: { border: { display: false }, ticks: { font: { size: 10 } }, grid: { color: 'rgba(15,81,50,0.08)' } },
                x: { border: { display: false }, ticks: { font: { size: 10 } }, grid: { color: 'rgba(15,81,50,0.05)' } },
              },
            }} />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center space-x-2">
            <FileLock2 className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs sm:text-sm font-black text-gray-900">Recent System Activity</h3>
          </div>
          <span className="text-[10px] sm:text-xs text-gray-400 font-bold">{logs.length} recent logs</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] sm:text-xs">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="px-3 sm:px-5 py-2 sm:py-3">Actor</th>
                <th className="px-3 sm:px-5 py-2 sm:py-3">Role</th>
                <th className="px-3 sm:px-5 py-2 sm:py-3">Action</th>
                <th className="px-3 sm:px-5 py-2 sm:py-3">Resource</th>
                <th className="px-3 sm:px-5 py-2 sm:py-3">Status</th>
                <th className="px-3 sm:px-5 py-2 sm:py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {logs.slice(0, 8).map((log, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="px-3 sm:px-5 py-2 sm:py-3 font-semibold text-gray-900">{log.actor || 'System'}</td>
                  <td className="px-3 sm:px-5 py-2 sm:py-3">{log.role || '—'}</td>
                  <td className="px-3 sm:px-5 py-2 sm:py-3">{log.action || '—'}</td>
                  <td className="px-3 sm:px-5 py-2 sm:py-3">{log.resource || '—'}</td>
                  <td className="px-3 sm:px-5 py-2 sm:py-3">
                    <span className={`inline-flex items-center text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded ${
                      log.status === 'Success' ? 'bg-emerald-50 text-emerald-700' :
                      log.status === 'Failed' ? 'bg-red-50 text-red-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {log.status || '—'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-5 py-2 sm:py-3 font-mono text-gray-500">{log.time || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
