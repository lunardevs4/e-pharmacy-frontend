import React, { useState } from 'react'
import { CheckSquare, ShieldCheck, Search, Filter, ShieldAlert, Plus, X } from 'lucide-react'

interface Inspection {
  id: string
  pharmacyName: string
  licenceNumber: string
  inspector: string
  date: string
  result: 'Pass' | 'Fail' | 'Pending Review'
}

export default function GovernmentCompliance() {
  const [inspections, setInspections] = useState<Inspection[]>([
    { id: 'INS-801', pharmacyName: 'Kigali National Pharmacy', licenceNumber: 'LIC-KIG-48293-2026', inspector: 'Jean Bosco Gasana', date: '2026-07-24', result: 'Pass' },
    { id: 'INS-802', pharmacyName: 'Remera City Medical', licenceNumber: 'LIC-GAS-90238-2026', inspector: 'Diane Mukamana', date: '2026-07-25', result: 'Pass' },
    { id: 'INS-803', pharmacyName: 'Nyarugenge Health Pharmacy', licenceNumber: 'LIC-NYA-72819-2026', inspector: 'Olivier Habimana', date: '2026-07-27', result: 'Pending Review' },
    { id: 'INS-804', pharmacyName: 'Gikondo District Pharmacy', licenceNumber: 'LIC-KIC-19238-2026', inspector: 'Jean Bosco Gasana', date: '2026-07-15', result: 'Fail' }
  ])

  // Form states
  const [showAddModal, setShowAddModal] = useState(false)
  const [pharmacyName, setPharmacyName] = useState('')
  const [licenceNumber, setLicenceNumber] = useState('')
  const [inspector, setInspector] = useState('Jean Bosco Gasana')
  const [result, setResult] = useState<'Pass' | 'Fail' | 'Pending Review'>('Pass')

  const handleCreateInspection = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pharmacyName || !licenceNumber) return

    const newIns: Inspection = {
      id: `INS-80${inspections.length + 1}`,
      pharmacyName,
      licenceNumber,
      inspector,
      date: new Date().toISOString().split('T')[0],
      result
    }

    setInspections((prev) => [newIns, ...prev])
    setShowAddModal(false)

    // Clear inputs
    setPharmacyName('')
    setLicenceNumber('')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Compliance Warning banner */}
      <div className="bg-emerald-50 border border-emerald-250 text-emerald-900 rounded-xl p-4 flex items-start space-x-3 text-xs shadow-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-800 flex-shrink-0 mt-0.5" />
        <div className="leading-normal">
          <span className="font-bold">MOH Compliance Protocol:</span> All pharmaceutical operations are subject to quarterly on-site clinical audits to verify stock handling, temperature controls, and pharmacist-to-patient dispensing registries.
        </div>
      </div>

      {/* Directory log table */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
        
        <div className="flex justify-between items-center pb-2 border-b border-gray-150">
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-black text-gray-900">Regulatory inspection Audits</h3>
          </div>
          <span className="text-xs text-slate-500 font-bold">{inspections.length} Audit Records</span>
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center">
          <div className="text-xs font-bold text-gray-400 uppercase">Audit Logging Registry</div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-health-primary hover:bg-health-secondary text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm focus:outline-none"
          >
            <Plus className="w-4 h-4" />
            <span>Record Inspection</span>
          </button>
        </div>

        {/* Table list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-gray-150">
            <thead>
              <tr className="text-[10px] font-black text-slate-450 uppercase tracking-wider">
                <th className="py-2.5">Audit ID</th>
                <th className="py-2.5">Pharmacy Name</th>
                <th className="py-2.5">Licence Key</th>
                <th className="py-2.5">Inspector</th>
                <th className="py-2.5">Audit Date</th>
                <th className="py-2.5 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {inspections.map((ins) => (
                <tr key={ins.id} className="hover:bg-gray-50/50">
                  <td className="py-3 font-semibold text-gray-900">{ins.id}</td>
                  <td className="py-3 font-bold text-gray-950">{ins.pharmacyName}</td>
                  <td className="py-3 font-mono text-gray-550 font-bold">{ins.licenceNumber}</td>
                  <td className="py-3">{ins.inspector}</td>
                  <td className="py-3 font-mono text-gray-450">{ins.date}</td>
                  <td className="py-3 text-right">
                    {ins.result === 'Pass' ? (
                      <span className="inline-flex items-center text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-250">
                        Passed
                      </span>
                    ) : ins.result === 'Pending Review' ? (
                      <span className="inline-flex items-center text-[9px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-250">
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[9px] font-black text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        Failed Audit
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Record Inspection Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center px-4 py-6">
          <div onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-gray-900/50 backdrop-blur-xs" />
          
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-gray-250 shadow-2xl overflow-hidden z-55 flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900">
              <div>
                <h3 className="font-black text-sm">Record Compliance Audit</h3>
                <p className="text-xs text-emerald-300">Register pharmacy inspection outcomes</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateInspection} className="p-6 space-y-4 text-xs font-bold text-gray-700">
              
              <div className="space-y-1.5">
                <label className="block text-gray-400 uppercase tracking-wider text-[10px]">Pharmacy Name</label>
                <input
                  type="text"
                  placeholder="e.g. Nyarugenge Wellness Pharmacy"
                  required
                  value={pharmacyName}
                  onChange={(e) => setPharmacyName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-400 uppercase tracking-wider text-[10px]">Licence Reference Number</label>
                <input
                  type="text"
                  placeholder="e.g. LIC-NYA-12893-2026"
                  required
                  value={licenceNumber}
                  onChange={(e) => setLicenceNumber(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-400 uppercase tracking-wider text-[10px]">Lead Inspector</label>
                <select
                  value={inspector}
                  onChange={(e) => setInspector(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs focus:outline-none text-gray-950 font-bold"
                >
                  <option value="Jean Bosco Gasana">Jean Bosco Gasana</option>
                  <option value="Diane Mukamana">Diane Mukamana</option>
                  <option value="Olivier Habimana">Olivier Habimana</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-400 uppercase tracking-wider text-[10px]">Inspection Outcome</label>
                <select
                  value={result}
                  onChange={(e) => setResult(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs focus:outline-none text-gray-950 font-bold"
                >
                  <option value="Pass">Pass (Fully Compliant)</option>
                  <option value="Pending Review">Pending Review / Minor Flags</option>
                  <option value="Fail">Fail (Regulatory Infractions)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-health-primary hover:bg-health-secondary text-white font-bold py-2.5 rounded-lg text-xs transition-colors shadow-sm focus:outline-none mt-2"
              >
                Log Compliance Audit Report
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  )
}
