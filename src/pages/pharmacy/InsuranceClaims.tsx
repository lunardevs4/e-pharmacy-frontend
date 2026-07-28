import React, { useState } from 'react'
import { DollarSign, Shield, Users, Info, CheckCircle2, AlertCircle, RefreshCw, Landmark, Receipt } from 'lucide-react'

interface MedicineOption {
  id: string
  name: string
  price: number
}

interface Claim {
  id: string
  patient: string
  medicine: string
  total: number
  insurancePays: number
  patientPays: number
  date: string
  status: 'Approved' | 'Pending' | 'Paid' | 'Rejected'
}

export default function PharmacyBilling() {
  // Pre-populated medicines dropdown selection catalog
  const medicineCatalog: MedicineOption[] = [
    { id: 'med-1', name: 'Artemether + Lumefantrine', price: 3500 },
    { id: 'med-2', name: 'Amoxicillin 500mg', price: 800 },
    { id: 'med-3', name: 'Paracetamol 500mg', price: 300 },
    { id: 'med-4', name: 'Metformin 850mg', price: 1200 },
    { id: 'med-5', name: 'Atenolol 50mg', price: 950 },
    { id: 'med-6', name: 'Insulin Glargine', price: 27000 }
  ]

  // States for interactive calculator
  const [selectedMedId, setSelectedMedId] = useState('med-3') // Default is Paracetamol 500mg matching invoice sum mockup
  const [quantity, setQuantity] = useState(2)
  const [insuranceProvider, setInsuranceProvider] = useState('RSSB')

  // Insurance coverage configuration details
  const copayRates: Record<string, number> = {
    RSSB: 0.80, // RSSB (80%)
    MMI: 0.90, // MMI (90%)
    SANLAM: 0.75, // SANLAM (75%)
    Radiant: 0.70, // Radiant (70%)
    None: 0.00 // Private Patient
  }

  // Pre-populated mock claim list matching user's mockup screenshots
  const [claimsList, setClaimsList] = useState<Claim[]>([
    { id: 'CLM-2024-001', patient: 'Marie Uwimana', medicine: 'Artemether + Lumefantrine', total: 7000, insurancePays: 5600, patientPays: 1400, date: '2024-08-12', status: 'Approved' },
    { id: 'CLM-2024-002', patient: 'Aline Mukamana', medicine: 'Insulin Glargine', total: 54000, insurancePays: 43200, patientPays: 10800, date: '2024-08-11', status: 'Pending' },
    { id: 'CLM-2024-003', patient: 'Emmanuel Habimana', medicine: 'Metformin 850mg', total: 1920, insurancePays: 1440, patientPays: 480, date: '2024-08-10', status: 'Paid' },
    { id: 'CLM-2024-004', patient: 'Robert Uwera', medicine: 'Atenolol 50mg', total: 1900, insurancePays: 1520, patientPays: 380, date: '2024-08-09', status: 'Rejected' }
  ])

  // Calculation parameters based on state values
  const currentMed = medicineCatalog.find((m) => m.id === selectedMedId) || medicineCatalog[2]
  const unitPrice = currentMed.price
  const subtotalCost = unitPrice * quantity
  const insuranceCopayPercent = copayRates[insuranceProvider]
  const insurancePaysVal = Math.round(subtotalCost * insuranceCopayPercent)
  const patientPaysVal = subtotalCost - insurancePaysVal

  // Submits checkout details to the claims list dynamically
  const handleGenerateReceipt = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newClaim: Claim = {
      id: `CLM-2024-00${claimsList.length + 1}`,
      patient: 'Walk-in Patient',
      medicine: currentMed.name,
      total: subtotalCost,
      insurancePays: insurancePaysVal,
      patientPays: patientPaysVal,
      date: new Date().toISOString().split('T')[0],
      status: insuranceProvider === 'None' ? 'Paid' : 'Pending'
    }

    setClaimsList((prev) => [newClaim, ...prev])
  }

  const getStatusBadge = (status: Claim['status']) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            Approved
          </span>
        )
      case 'Paid':
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-250">
            Paid
          </span>
        )
      case 'Pending':
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
            Pending
          </span>
        )
      case 'Rejected':
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-red-750 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
            Rejected
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Top metrics summary grid matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Today's Revenue</span>
            <p className="text-2xl font-black text-gray-900 mt-1">RWF 312K</p>
            <span className="text-[11px] text-gray-400 block font-medium">42 transactions</span>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 flex-shrink-0">
            <Receipt className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Insurance Claims</span>
            <p className="text-2xl font-black text-gray-900 mt-1">28</p>
            <span className="text-[11px] text-gray-400 block font-medium">RWF 224K covered</span>
          </div>
          <div className="p-2 bg-gray-50 text-gray-650 rounded-lg border border-gray-205 flex-shrink-0">
            <Shield className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Patient Contributions</span>
            <p className="text-2xl font-black text-gray-900 mt-1">RWF 88K</p>
            <span className="text-[11px] text-gray-400 block font-medium">None</span>
          </div>
          <div className="p-2 bg-gray-50 text-gray-650 rounded-lg border border-gray-205 flex-shrink-0">
            <Users className="w-4 h-4" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Pending Claims</span>
            <p className="text-2xl font-black text-gray-900 mt-1">6</p>
            <span className="text-[11px] text-gray-400 block font-medium">Awaiting approval</span>
          </div>
          <div className="p-2 bg-gray-50 text-gray-650 rounded-lg border border-gray-205 flex-shrink-0">
            <Info className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* Interactive Billing Calculator Side-by-Side block */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-black text-gray-900 pb-2 border-b border-gray-150">Billing Calculator</h2>

        <form onSubmit={handleGenerateReceipt} className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
          
          {/* Left Inputs Section */}
          <div className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Medicine</label>
              <select
                value={selectedMedId}
                onChange={(e) => setSelectedMedId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-bold"
              >
                {medicineCatalog.map((med) => (
                  <option key={med.id} value={med.id}>
                    {med.name} — RWF {med.price}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Insurance</label>
                <select
                  value={insuranceProvider}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-bold"
                >
                  <option value="RSSB">RSSB (80%)</option>
                  <option value="MMI">MMI (90%)</option>
                  <option value="SANLAM">SANLAM (75%)</option>
                  <option value="Radiant">Radiant (70%)</option>
                  <option value="None">None (Private)</option>
                </select>
              </div>
            </div>

          </div>

          {/* Right Invoice Summary Summary card */}
          <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-5 flex flex-col justify-between space-y-4">
            <span className="text-[10px] font-bold text-gray-450 block uppercase tracking-wider">Invoice Summary</span>
            
            <div className="space-y-2 text-xs font-medium">
              <div className="flex justify-between items-center text-gray-650">
                <span>Medicine</span>
                <span className="font-bold text-gray-900">{currentMed.name}</span>
              </div>
              <div className="flex justify-between items-center text-gray-650">
                <span>Quantity</span>
                <span className="font-bold text-gray-900">{quantity}</span>
              </div>
              <div className="flex justify-between items-center text-gray-650">
                <span>Unit price</span>
                <span className="font-bold text-gray-900">RWF {unitPrice}</span>
              </div>
              
              <div className="h-px bg-gray-250 my-1" />
              
              <div className="flex justify-between items-center text-sm font-black text-gray-950">
                <span>Total</span>
                <span>RWF {subtotalCost}</span>
              </div>

              {insuranceProvider !== 'None' && (
                <div className="flex justify-between items-center text-blue-700 font-bold">
                  <span>Insurance pays ({Math.round(insuranceCopayPercent * 100)}%)</span>
                  <span>RWF {insurancePaysVal}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-emerald-800 font-black">
                <span>Patient pays</span>
                <span>RWF {patientPaysVal}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-health-primary hover:bg-health-secondary text-white font-bold py-2.5 rounded-lg text-xs transition-colors focus:outline-none flex items-center justify-center space-x-1.5"
            >
              <Receipt className="w-4 h-4" />
              <span>Complete Sale &amp; Generate Receipt</span>
            </button>
          </div>

        </form>
      </div>

      {/* Insurance Claims table registry */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-black text-gray-900 pb-2 border-b border-gray-150">Insurance Claims</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-gray-150">
            <thead>
              <tr className="text-[10px] font-black text-slate-450 uppercase tracking-wider">
                <th className="py-2.5">Claim ID</th>
                <th className="py-2.5">Patient</th>
                <th className="py-2.5">Medicine</th>
                <th className="py-2.5">Total</th>
                <th className="py-2.5">Insurance Pays</th>
                <th className="py-2.5">Patient Pays</th>
                <th className="py-2.5">Date</th>
                <th className="py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {claimsList.map((cl) => (
                <tr key={cl.id} className="hover:bg-gray-50/50">
                  <td className="py-3 font-semibold text-gray-900">{cl.id}</td>
                  <td className="py-3 font-bold text-gray-950">{cl.patient}</td>
                  <td className="py-3">{cl.medicine}</td>
                  <td className="py-3 font-black text-gray-900">RWF {cl.total}</td>
                  <td className="py-3 text-blue-700 font-bold">RWF {cl.insurancePays}</td>
                  <td className="py-3 text-emerald-800 font-bold">RWF {cl.patientPays}</td>
                  <td className="py-3 text-gray-500">{cl.date}</td>
                  <td className="py-3">{getStatusBadge(cl.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
