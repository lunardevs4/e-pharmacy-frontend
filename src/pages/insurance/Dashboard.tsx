import React from 'react'

export default function InsuranceDashboard() {
  const claims = [
    { id: 'CLM-001', pharmacy: 'Bralirwa Pharmacy', patientNid: '1199580123456789', drug: 'Paracetamol', total: 'RWF 300', insurancePay: 'RWF 270', patientPay: 'RWF 30', split: '90/10', status: 'Approved' },
    { id: 'CLM-002', pharmacy: 'CityMed Nyarugenge', patientNid: '1199080987654321', drug: 'Artemether', total: 'RWF 1,200', insurancePay: 'RWF 1,080', patientPay: 'RWF 120', split: '90/10', status: 'Pending' },
    { id: 'CLM-003', pharmacy: 'MedPlus Remera', patientNid: '1199880112233445', drug: 'Amoxicillin', total: 'RWF 950', insurancePay: 'RWF 855', patientPay: 'RWF 95', split: '90/10', status: 'Approved' },
  ]

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 font-semibold block uppercase">Total Claims Processed</span>
          <span className="text-2xl font-black text-gray-900 block mt-2">1,245</span>
          <span className="text-xs text-emerald-700 mt-1 font-semibold block">↑ 12% from last month</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 font-semibold block uppercase">Average Approval Rate</span>
          <span className="text-2xl font-black text-health-primary block mt-2">96.4%</span>
          <span className="text-xs text-emerald-700 mt-1 font-semibold block">KPI Target &gt;95.0%</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 font-semibold block uppercase">Pending Claims</span>
          <span className="text-2xl font-black text-orange-600 block mt-2">18</span>
          <span className="text-xs text-gray-500 mt-1 block">Awaiting standard audit</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 font-semibold block uppercase">Total Disbursed</span>
          <span className="text-2xl font-black text-gray-900 block mt-2">RWF 3.8M</span>
          <span className="text-xs text-gray-500 mt-1 block">Paid to 142 pharmacies</span>
        </div>
      </div>

      {/* Claims Table / Dashboard section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Claims Review Queue</h2>
            <p className="text-xs text-gray-500">Live insurance split & contribution tables</p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">
            RSSB Co-Pay Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-100 text-xs font-semibold text-gray-650 uppercase border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Claim ID</th>
                <th className="px-6 py-3">Pharmacy</th>
                <th className="px-6 py-3">Patient NID</th>
                <th className="px-6 py-3">Drug</th>
                <th className="px-6 py-3">Total Cost</th>
                <th className="px-6 py-3">Insurance Split</th>
                <th className="px-6 py-3">Patient Split</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              {claims.map((claim, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-bold text-gray-900">{claim.id}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{claim.pharmacy}</td>
                  <td className="px-6 py-4 font-mono text-xs">{claim.patientNid}</td>
                  <td className="px-6 py-4">{claim.drug}</td>
                  <td className="px-6 py-4 font-bold">{claim.total}</td>
                  <td className="px-6 py-4 text-emerald-800 font-semibold">{claim.insurancePay} <span className="text-[10px] text-gray-400">({claim.split.split('/')[0]}%)</span></td>
                  <td className="px-6 py-4 text-gray-650 font-semibold">{claim.patientPay} <span className="text-[10px] text-gray-400">({claim.split.split('/')[1]}%)</span></td>
                  <td className="px-6 py-4">
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
                      claim.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-850'
                    }`}>
                      {claim.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
