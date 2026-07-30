import React, { useState } from 'react'
import { Landmark, Users, Package, AlertTriangle, FileText, CheckCircle2, ChevronRight, Activity, TrendingUp } from 'lucide-react'

export default function GovernmentDashboard() {
  const [shortages] = useState([
    { id: 1, drug: 'Coartem (Artemether/Lumefantrine)', region: 'Northern Province (Musanze)', stockLevel: 'Critical (5 tabs left)', severity: 'HIGH' },
    { id: 2, drug: 'Metformin 500mg', region: 'Western Province (Rubavu)', stockLevel: 'Limited (18 tabs left)', severity: 'MEDIUM' },
    { id: 3, drug: 'Amoxicillin 250mg', region: 'Eastern Province (Bugesera)', stockLevel: 'Critical (2 tabs left)', severity: 'HIGH' }
  ])

  const [pendingLicenses, setPendingLicenses] = useState([
    { id: 'LIC-REQ-901', name: 'Gasabo Sector Wellness Pharmacy', director: 'Jean de Dieu Mutara', date: '2026-07-28', status: 'Pending Review' },
    { id: 'LIC-REQ-902', name: 'Gisenyi Lake View Pharma', director: 'Marie Grace Ineza', date: '2026-07-29', status: 'Pending Review' }
  ])

  const handleApproveLicense = (id: string) => {
    setPendingLicenses((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* MoH Rwanda Regulatory Header Banner */}
      <div className="bg-white text-gray-900 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center border border-emerald-805/20 shadow-xs relative overflow-hidden gap-6">
        <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-50/40 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-2 text-center sm:text-left flex-grow">
          <div className="flex justify-center sm:justify-start items-center space-x-2.5">
            <Landmark className="w-5 h-5 text-emerald-800" />
            <span className="text-[9px] tracking-widest font-black uppercase text-emerald-850 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-200">MoH Regulator Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-950">Ministry of Health Regulator Dashboard</h1>
          <p className="text-gray-500 text-xs max-w-xl leading-normal font-medium">
            National regulatory oversight of essential drug cataloguing, licensing verification, and district stock availability index tracking across Rwanda.
          </p>
        </div>

        <div className="flex-shrink-0 bg-emerald-50 border border-emerald-200/60 px-5 py-3.5 rounded-xl text-center">
          <span className="text-[9px] uppercase text-emerald-800 block font-black">National stock level</span>
          <span className="text-2xl font-black block mt-0.5 text-emerald-955">94.2%</span>
          <span className="text-[9px] text-gray-450 block font-semibold">Essential list coverage</span>
        </div>
      </div>

      {/* Statistics grids */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center space-x-3.5 shadow-xs">
          <div className="p-2.5 bg-emerald-50 text-health-primary rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-gray-400 block uppercase font-bold">Registered Pharmacies</span>
            <span className="text-lg font-black text-gray-950">1,847 total</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center space-x-3.5 shadow-xs">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-gray-400 block uppercase font-bold">Essential Catalog</span>
            <span className="text-lg font-black text-gray-950">1,420 drugs</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center space-x-3.5 shadow-xs">
          <div className="p-2.5 bg-red-50 text-red-700 rounded-lg">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] text-gray-400 block uppercase font-bold">Critical Shortages</span>
            <span className="text-lg font-black text-red-650">3 reports</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center space-x-3.5 shadow-xs">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-gray-400 block uppercase font-bold">Pending Licences</span>
            <span className="text-lg font-black text-gray-950">{pendingLicenses.length} requests</span>
          </div>
        </div>

      </div>

      {/* Alert sections & charts splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Critical stock levels shortage logs */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-150">
              <h3 className="font-black text-gray-950 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>MOH Critical Stock Shortage Alerts</span>
              </h3>
              <span className="text-[9px] bg-red-50 text-red-700 font-bold border border-red-200 px-2 py-0.5 rounded-full">Requires MOH Intervention</span>
            </div>

            <div className="divide-y divide-gray-100 text-xs">
              {shortages.map((s) => (
                <div key={s.id} className="py-3 flex justify-between items-center gap-4">
                  <div className="space-y-1">
                    <span className="font-bold text-gray-900 block">{s.drug}</span>
                    <span className="text-[10px] text-gray-500 block font-semibold">{s.region}</span>
                  </div>
                  <div className="text-right flex items-center space-x-2">
                    <span className="font-mono text-red-650 font-bold">{s.stockLevel}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.25 rounded ${
                      s.severity === 'HIGH' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {s.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Licences Approval Center */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-150">
              <h3 className="font-black text-gray-950 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Pending Licensing applications</span>
              </h3>
              <span className="text-[9px] text-gray-400 font-bold font-mono">Verify Store Keys</span>
            </div>

            {pendingLicenses.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">
                All licensing applications processed successfully.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                {pendingLicenses.map((lic) => (
                  <div key={lic.id} className="py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="space-y-1">
                      <span className="font-bold text-gray-950 block">{lic.name}</span>
                      <span className="text-[10px] text-gray-500 block font-medium">Director: {lic.director} &bull; Received on {lic.date}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <span className="text-[9px] font-bold text-amber-750 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        {lic.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleApproveLicense(lic.id)}
                        className="bg-health-primary hover:bg-emerald-900 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Analytics & Demands (1/3 width) */}
        <div className="space-y-6">
          
          {/* Conic Donut categories chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-150">
              <h3 className="font-black text-gray-950 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-emerald-700" />
                <span>Drug Category Split</span>
              </h3>
            </div>

            {/* Circular conic chart preview */}
            <div className="relative w-32 h-32 mx-auto rounded-full flex items-center justify-center border-4 border-gray-100" style={{
              background: 'conic-gradient(#0f5132 0% 35%, #0d6efd 35% 65%, #ffc107 65% 85%, #dc3545 85% 100%)'
            }}>
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center flex-col shadow-inner">
                <span className="text-[9px] text-gray-400 block font-bold uppercase tracking-wider leading-none">Catalog</span>
                <span className="text-base font-black text-gray-950 mt-1 block">1.4K</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-500 pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-health-primary rounded-sm" />
                <span>Analgesics (35%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-sm" />
                <span>Antibiotics (30%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm" />
                <span>Antidiabetics (20%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-sm" />
                <span>Antihypertensives (15%)</span>
              </div>
            </div>
          </div>

          {/* Platform Performance overview */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-150">
              <h3 className="font-black text-gray-950 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span>Monthly Reservation Trends</span>
              </h3>
            </div>

            {/* SVG graph preview */}
            <div className="w-full h-24 pt-2">
              <svg viewBox="0 0 100 30" className="w-full h-full text-emerald-800">
                <path d="M0,25 Q15,10 30,18 T60,5 T90,2 T100,0" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <path d="M0,25 Q15,10 30,18 T60,5 T90,2 T100,0 L100,30 L0,30 Z" fill="rgba(16,185,129,0.05)" />
              </svg>
            </div>

            <div className="flex justify-between text-[9px] font-bold text-gray-400 font-mono uppercase tracking-wider">
              <span>Mar 26</span>
              <span>Apr 26</span>
              <span>May 26</span>
              <span>Jun 26</span>
              <span>Jul 26</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
