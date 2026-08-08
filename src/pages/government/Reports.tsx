import React, { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { FileText, Download, CheckCircle2, RefreshCw, BarChart2, Package, FileClock, Users } from 'lucide-react'
import { AuthApi } from '@/services/auth-api'

ChartJS.register(ArcElement, Title, Tooltip, Legend, Filler)

export default function GovernmentReports() {
  const [governmentReport, setGovernmentReport] = useState<any | null>(null)
  const [governmentSummary, setGovernmentSummary] = useState<any | null>(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [loadingReport, setLoadingReport] = useState<string | null>(null)
  const [reportError, setReportError] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const doughnutOpts = {
    responsive: true,
    cutout: '62%',
    plugins: {
      legend: { position: 'right' as const, labels: { font: { size: 10 }, boxWidth: 12 } },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed}` } }
    },
  }

  const fetchGovernmentData = async () => {
    setReportLoading(true)
    setReportError(null)
    try {
      const [summary, report] = await Promise.all([
        AuthApi.getGovernmentSummary(),
        AuthApi.getGovernmentReport(),
      ])
      setGovernmentSummary(summary)
      setGovernmentReport(report)
    } catch (err: any) {
      setReportError(err.message || 'Unable to load government report data.')
    } finally {
      setReportLoading(false)
    }
  }

  useEffect(() => {
    fetchGovernmentData()
  }, [])

  const reservationStatusData = {
    labels: governmentReport?.reservationsByStatus?.map((item: any) => item.status) || [],
    datasets: [{
      data: governmentReport?.reservationsByStatus?.map((item: any) => Number(item._count?.id ?? 0)) || [],
      backgroundColor: ['#0f5132', '#dc2626', '#f59e0b', '#2563eb', '#6d28d9'],
      borderColor: '#fff',
      borderWidth: 2,
      hoverOffset: 8,
    }],
  }

  const reportsList = [
    { name: 'National Pharmacy Licensing Register', description: 'Complete directory of approved, pending, and suspended pharmacies in Rwanda.', type: 'CSV', key: 'pharmacyLicensingRegister' },
    { name: 'Essential Drug Catalog & Classifications', description: 'Registered medicines including generic molecules, Rx status, and manufacturers.', type: 'PDF', key: 'essentialDrugCatalog' },
    { name: 'National Stock Shortage Incidents Log', description: 'MOH shortage flags, critical supply gaps, and dispatch logs.', type: 'PDF', key: 'stockShortageLog' },
    { name: 'Quarterly Pharmaceutical Compliance Audit', description: 'Summary of compliance inspection audits, fail ratios, and enforcement logs.', type: 'CSV', key: 'complianceAudit' },
  ]

  const refreshReportData = async (reportName: string) => {
    setLoadingReport(reportName)
    try {
      await fetchGovernmentData()
      triggerToast(`${reportName} refreshed successfully.`)
    } catch (error) {
      triggerToast('Unable to refresh report data. Please try again.')
    } finally {
      setLoadingReport(null)
    }
  }

  const summaryCards = [
    {
      title: 'Total Registered Pharmacies',
      value: governmentSummary?.totalPharmacies ?? governmentReport?.totalPharmacies ?? '—',
      icon: FileText,
    },
    {
      title: 'Total Registered Patients',
      value: governmentReport?.totalPatients ?? '—',
      icon: Users,
    },
    {
      title: 'Total Reservations',
      value: governmentSummary?.totalReservations ?? governmentReport?.totalReservations ?? '—',
      icon: FileClock,
    },
    {
      title: 'Total Inventory Units',
      value: governmentReport?.totalInventory ?? '—',
      icon: Package,
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 relative">

      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {reportError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
          {reportError}
        </div>
      )}

      {!governmentReport && reportLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-slate-600">Loading government report metrics...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {summaryCards.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.title} className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div>
                      <h3 className="text-sm font-black text-gray-900">{card.title}</h3>
                      <p className="text-[10px] text-gray-400">Ministry of Health dashboard metric</p>
                    </div>
                    <Icon className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="mt-4 text-3xl font-black text-gray-900">{card.value}</div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                <BarChart2 className="w-4 h-4 text-emerald-700" />
                <div>
                  <h3 className="text-sm font-black text-gray-900">Reservation Status Breakdown</h3>
                  <p className="text-[10px] text-gray-400">Current reservation counts by status</p>
                </div>
              </div>
              {governmentReport?.reservationsByStatus?.length ? (
                <Doughnut data={reservationStatusData} options={doughnutOpts} />
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-slate-50 p-6 text-center text-sm text-gray-500">
                  Reservation status distribution will appear once the government report is loaded.
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                <FileText className="w-4 h-4 text-emerald-700" />
                <div>
                  <h3 className="text-sm font-black text-gray-900">Report Coverage</h3>
                  <p className="text-[10px] text-gray-400">Latest national summary from government services</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500">Approved Pharmacies</div>
                  <div className="mt-2 text-2xl font-black text-gray-900">{governmentSummary?.approvedPharmacies ?? '—'}</div>
                </div>
                <div className="rounded-xl bg-red-50 border border-red-100 p-4">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500">Pending Reservations</div>
                  <div className="mt-2 text-2xl font-black text-gray-900">{governmentSummary?.pendingReservations ?? '—'}</div>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500">Active Essential Drugs</div>
                  <div className="mt-2 text-2xl font-black text-gray-900">{governmentSummary?.totalMedicines ?? '—'}</div>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500">Total Reservations</div>
                  <div className="mt-2 text-2xl font-black text-gray-900">{governmentSummary?.totalReservations ?? governmentReport?.totalReservations ?? '—'}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-gray-150">
          <FileText className="w-5 h-5 text-emerald-700" />
          <h2 className="text-sm font-black text-gray-900">Ministry of Health Reports Registry</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
          {reportsList.map((r, index) => (
            <div key={r.key} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 flex flex-col justify-between hover:border-emerald-300 transition-colors gap-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 font-bold text-sm block">{r.name}</span>
                  <span className="text-[9px] bg-slate-100 border border-gray-300 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold uppercase">{r.type}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium leading-normal">{r.description}</p>
              </div>
              <button
                type="button"
                disabled={loadingReport !== null}
                onClick={() => refreshReportData(r.name)}
                className="bg-health-primary hover:bg-health-secondary text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm disabled:opacity-50"
              >
                {loadingReport === r.name ? (
                  <><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Refreshing...</span></>
                ) : (
                  <><Download className="w-3.5 h-3.5" /><span>Refresh Data</span></>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
