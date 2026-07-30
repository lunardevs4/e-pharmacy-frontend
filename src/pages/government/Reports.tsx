import React, { useState } from 'react'
import { FileText, Download, CheckCircle2, RefreshCw } from 'lucide-react'

export default function GovernmentReports() {
  const [loadingReport, setLoadingReport] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleDownload = (reportName: string) => {
    setLoadingReport(reportName)
    setTimeout(() => {
      setLoadingReport(null)
      triggerToast(`${reportName} generated and downloaded successfully.`)
    }, 1500)
  }

  const reportsList = [
    { name: 'National Pharmacy Licensing Register', description: 'Complete directory of approved, pending, and suspended pharmacies in Rwanda.', type: 'CSV' },
    { name: 'Essential Drug Catalog & Classifications', description: 'List of registered medicines including generic molecules, Rx status, and manufacturers.', type: 'PDF' },
    { name: 'National Stock Shortage Incidents Log', description: 'MOH shortage flags, critical supply gaps, and dispatch logs from Northern Province.', type: 'PDF' },
    { name: 'Quarterly Pharmaceutical Compliance Audit', description: 'Summary of compliance inspection audits, fail ratios, and enforcement logs.', type: 'CSV' }
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 relative">
      
      {/* Toast alert popup */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-55 bg-emerald-50 border border-emerald-250 text-emerald-800 px-4.5 py-3 rounded-lg shadow-xl animate-fadeIn flex items-center space-x-2 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Reports registry card list */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-gray-150">
          <FileText className="w-5 h-5 text-emerald-700" />
          <h2 className="text-sm font-black text-gray-900 font-sans">Ministry of Health Reports Registry</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
          {reportsList.map((r, index) => (
            <div key={index} className="border border-gray-250 rounded-xl p-4.5 bg-gray-50/50 flex flex-col justify-between hover:border-emerald-350 transition-colors gap-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-950 font-bold text-sm block">{r.name}</span>
                  <span className="text-[9px] bg-slate-100 border border-gray-300 text-slate-650 px-1.5 py-0.25 rounded font-mono font-bold uppercase">{r.type}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium leading-normal">{r.description}</p>
              </div>

              <button
                type="button"
                disabled={loadingReport !== null}
                onClick={() => handleDownload(r.name)}
                className="bg-health-primary hover:bg-health-secondary text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm focus:outline-none disabled:opacity-50"
              >
                {loadingReport === r.name ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Report...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Report</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
