import React, { useEffect, useMemo, useState } from 'react'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import '@/utils/chartTheme'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js'
import { useAuthStore } from '@/store/authStore'
import { PharmacyApi } from '@/services/pharmacy-api'
import { DollarSign, Package, Users, TrendingUp } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler)
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const cleanPatientName = (firstName?: string, lastName?: string) => {
  const parts = [firstName, lastName].filter(Boolean).join(' ').split(/\s+/)
  return parts
    .filter((part, index) => index === 0 || part.toLowerCase() !== parts[index - 1].toLowerCase())
    .join(' ') || 'Patient'
}

export default function PharmacyReports() {
  const { user } = useAuthStore()
  const [report, setReport] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const id = user?.pharmacy?.id || user?.pharmacyId
    if (!id) return
    PharmacyApi.getReport(id).then(setReport).catch((err) => setError(err.message || 'Unable to load reports.'))
  }, [user?.pharmacy?.id, user?.pharmacyId])

  const reservations = report?.reservations || []
  const currentYear = new Date().getFullYear()
  const monthly = useMemo(() => months.map((_, index) => reservations.filter((r: any) => {
    const date = new Date(r.createdAt)
    return date.getFullYear() === currentYear && date.getMonth() === index
  }).reduce((sum: number, r: any) => sum + Number(r.quantity || 0), 0)), [reservations, currentYear])
  const categories = useMemo(() => { const result: Record<string, number> = {}; reservations.forEach((r: any) => { const key = r.medicine?.category?.name || 'Other'; result[key] = (result[key] || 0) + Number(r.quantity || 0) }); return result }, [reservations])
  const summary = [
    { label: 'Reservations', value: report?.totalReservations ?? '—', icon: Package },
    { label: 'Inventory Units', value: report?.totalInventoryCount ?? '—', icon: TrendingUp },
    { label: 'Patients Served', value: new Set(reservations.map((r: any) => r.patientId)).size, icon: Users },
    { label: 'Data Source', value: report ? 'Backend' : 'Loading…', icon: DollarSign },
  ]
  const chartOptions = {
    responsive: true,
    interaction: { mode: 'index' as const, intersect: false },
    elements: { line: { tension: 0.45, borderWidth: 3 }, point: { radius: 0, hoverRadius: 5, borderWidth: 2, borderColor: '#fff' } },
    plugins: { legend: { position: 'top' as const, labels: { font: { size: 10 } } } },
    scales: { y: { border: { display: false }, ticks: { font: { size: 10 } }, grid: { color: 'rgba(15,81,50,0.08)' } }, x: { border: { display: false }, ticks: { font: { size: 10 } }, grid: { color: 'rgba(15,81,50,0.05)' } } },
  }
  const lineData = { labels: months, datasets: [{ label: 'Units reserved', data: monthly, borderColor: '#059669', backgroundColor: 'rgba(5,150,105,.14)', fill: true, tension: .45, borderWidth: 3, pointRadius: 0, pointHoverRadius: 5 }] }
  const categoryData = { labels: Object.keys(categories), datasets: [{ data: Object.values(categories), backgroundColor: ['#059669', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#475569'] }] }
  return <div className="space-y-6 max-w-7xl mx-auto pb-16">
    {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{summary.map(({ label, value, icon: Icon }) => <div key={label} className="bg-white border border-gray-200 rounded-xl p-4"><Icon className="w-4 h-4 text-emerald-700 mb-2" /><span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span><p className="text-xl font-black text-gray-900">{value}</p></div>)}</div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"><h3 className="font-black mb-1 text-slate-900">Reservation Activity</h3><p className="text-[10px] text-slate-400 mb-3">Monthly units reserved</p><div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-blue-50/70 p-3"><Line data={lineData} options={chartOptions} /></div></div>
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"><h3 className="font-black mb-1 text-slate-900">Units by Medicine Category</h3><p className="text-[10px] text-slate-400 mb-3">Distribution across categories</p>{Object.keys(categories).length ? <Doughnut data={categoryData} options={chartOptions} /> : <p className="py-20 text-center text-gray-400">No reservation data yet.</p>}</div>
    </div>
    <div className="bg-white border border-gray-200 rounded-xl p-5"><h3 className="font-black mb-3">Recent Reservations</h3><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="text-[10px] uppercase text-slate-500"><th className="py-2">Date</th><th>Medicine</th><th>Patient</th><th>Quantity</th><th>Status</th></tr></thead><tbody className="divide-y">{reservations.map((r: any) => <tr key={r.id}><td className="py-3">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td><td>{r.medicine?.tradeName || r.medicine?.name || 'Medication'}</td><td>{cleanPatientName(r.patient?.user?.firstName, r.patient?.user?.lastName)}</td><td>{r.quantity}</td><td>{r.status}</td></tr>)}</tbody></table></div></div>
  </div>
}
