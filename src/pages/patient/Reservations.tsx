import React, { useState, useEffect } from 'react'
import { ClipboardList, Clock, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, MapPin } from 'lucide-react'
import { MedicineApi } from '@/services/medicine-api'
import { Reservation } from '@/types'

export default function Reservations() {
  const [list, setList] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    MedicineApi.getReservationHistory()
      .then((data: Reservation[]) => setList(data))
      .catch((err: any) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200"><Clock className="w-3.5 h-3.5 mr-1" /> Pending Pickup</span>
      case 'CONFIRMED':
        return <span className="inline-flex items-center text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200"><ShieldCheck className="w-3.5 h-3.5 mr-1" /> Confirmed</span>
      case 'COLLECTED':
        return <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Collected</span>
      case 'EXPIRED':
      default:
        return <span className="inline-flex items-center text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> Expired</span>
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-gray-900 flex items-center space-x-2">
          <ClipboardList className="w-6 h-6 text-health-primary" />
          <span>My Reservations</span>
        </h1>
        <p className="text-gray-500 text-xs mt-1">Track active reservations and show pickup codes at pharmacies.</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">
          Loading reservations history...
        </div>
      ) : list.length === 0 ? (
        <div className="py-16 text-center text-gray-500 space-y-4 border border-dashed rounded-xl">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto" />
          <div>
            <p className="font-bold text-gray-700">No active reservations.</p>
            <p className="text-xs text-gray-400 mt-1">Use the search hero on your dashboard to reserve medicines near you.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((res) => (
            <div key={res.id} className="border border-gray-200 rounded-xl p-5 hover:border-emerald-350 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                  <h3 className="font-bold text-gray-900 text-base">{res.medicineName}</h3>
                  {getStatusBadge(res.status)}
                </div>
                <p className="text-xs text-gray-500 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                  <span>Pickup location: <span className="font-bold text-gray-800">{res.pharmacyName}</span></span>
                </p>
                <div className="flex items-center space-x-4 text-xs font-semibold text-gray-400">
                  <span>Quantity: <span className="text-gray-700">{res.quantity} tablets</span></span>
                  <span>&bull;</span>
                  <span>Insurance: <span className="text-gray-700">{res.insuranceProvider !== 'None' ? res.insuranceProvider : 'None'}</span></span>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end space-y-1.5 md:text-right w-full md:w-auto">
                <div className="text-xs">
                  <span className="text-gray-400 block">Out-of-Pocket Payment</span>
                  <span className="text-sm font-black text-health-primary">{res.patientPays} RWF</span>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg flex items-center space-x-2.5 text-xs w-full md:w-auto justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase leading-none">Pickup Code</span>
                    <span className="font-mono font-black text-emerald-800 text-sm">{res.pickupCode}</span>
                  </div>
                  <div className="h-6 w-px bg-gray-250" />
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase leading-none">Deadline</span>
                    <span className="font-bold text-gray-800">{res.pickupDeadline.split(',')[0]}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
