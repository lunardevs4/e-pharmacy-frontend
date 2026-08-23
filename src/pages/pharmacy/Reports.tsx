import React, { useEffect, useMemo, useState } from 'react'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js'
import { useAuthStore } from '@/store/authStore'
import { PharmacyApi } from '@/services/pharmacy-api'
import { DollarSign, Package, Users, TrendingUp } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler)
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

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
  const monthly = useMemo(() => months.map((_, index) => reservations.filter((r: any) => new Date(r.createdAt).getMonth() === index).reduce((sum: number, r: any) => sum + Number(r.quantity || 0), 0)), [reservations])
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
    elements: { line: { tension: 0.5 }, point: { radius: 4, hoverRadius: 6, borderWidth: 2, borderColor: '#fff' } },
    plugins: { legend: { position: 'top' as const, labels: { font: { size: 10 } } }, tooltip: { backgroundColor: '#0f5132', titleFont: { size: 10 }, bodyFont: { size: 10 } } },
    scales: { y: { border: { display: false }, ticks: { font: { size: 10 } }, grid: { color: 'rgba(15,81,50,0.08)' } }, x: { border: { display: false }, ticks: { font: { size: 10 } }, grid: { color: 'rgba(15,81,50,0.05)' } } },
  }
  const lineData = { labels: months, datasets: [{ label: 'Units reserved', data: monthly, borderColor: '#0f5132', backgroundColor: 'rgba(15,81,50,.1)', fill: true, tension: .35 }] }
  const categoryData = { labels: Object.keys(categories), datasets: [{ data: Object.values(categories), backgroundColor: ['#059669', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#475569'] }] }
  return <div className="space-y-6 max-w-7xl mx-auto pb-16">
    {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{summary.map(({ label, value, icon: Icon }) => <div key={label} className="bg-white border border-gray-200 rounded-xl p-4"><Icon className="w-4 h-4 text-emerald-700 mb-2" /><span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span><p className="text-xl font-black text-gray-900">{value}</p></div>)}</div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white border border-gray-200 rounded-xl p-5"><h3 className="font-black mb-3">Reservation Activity</h3><div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-blue-50/70 p-3"><Line data={lineData} options={chartOptions} /></div></div>
      <div className="bg-white border border-gray-200 rounded-xl p-5"><h3 className="font-black mb-3">Units by Medicine Category</h3>{Object.keys(categories).length ? <Doughnut data={categoryData} options={chartOptions} /> : <p className="py-20 text-center text-gray-400">No reservation data yet.</p>}</div>
    </div>
    <div className="bg-white border border-gray-200 rounded-xl p-5"><h3 className="font-black mb-3">Recent Reservations</h3><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="text-[10px] uppercase text-slate-500"><th className="py-2">Date</th><th>Medicine</th><th>Patient</th><th>Quantity</th><th>Status</th></tr></thead><tbody className="divide-y">{reservations.map((r: any) => <tr key={r.id}><td className="py-3">{new Date(r.createdAt).toLocaleDateString()}</td><td>{r.medicine?.name || 'Medication'}</td><td>{[r.patient?.user?.firstName, r.patient?.user?.lastName].filter(Boolean).join(' ') || 'Patient'}</td><td>{r.quantity}</td><td>{r.status}</td></tr>)}</tbody></table></div></div>
  </div>
}
