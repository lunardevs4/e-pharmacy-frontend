import React, { useState, useEffect } from 'react'
import { MedicineApi } from '@/services/medicine-api'
import { Reservation } from '@/types'
import ConfirmationDialog from '@/components/patient/ConfirmationDialog'
import { ClipboardList, Clock, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, MapPin, X, ArrowLeft, Info, HelpCircle } from 'lucide-react'

export default function Reservations() {
  const [list, setList] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null)
  
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 2500)
  }

  const loadReservations = async () => {
    setLoading(true)
    try {
      const data = await MedicineApi.getReservationHistory()
      setList(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReservations()
  }, [])

  const handleCancelConfirm = async () => {
    if (!selectedRes) return
    setCancelLoading(true)
    try {
      const success = await MedicineApi.cancelReservation(selectedRes.id)
      if (success) {
        const notKey = 'epharmacy_notifications'
        const rawNot = localStorage.getItem(notKey)
        const alertsList = rawNot ? JSON.parse(rawNot) : []
        const cancelAlert = {
          id: `not-${Math.random().toString(36).substring(2, 9)}`,
          title: 'Reservation Cancelled',
          message: `Your reservation ${selectedRes.id} for ${selectedRes.medicineName} was successfully cancelled. Inventory was reconciled back.`,
          type: 'RESERVATION',
          read: false,
          createdAt: new Date().toISOString()
        }
        localStorage.setItem(notKey, JSON.stringify([cancelAlert, ...alertsList]))

        triggerToast(`Reservation ${selectedRes.id} cancelled successfully.`)
        setSelectedRes(null)
        loadReservations()
      } else {
        triggerToast('Failed to cancel reservation.')
      }
    } catch (err: any) {
      triggerToast(err.message || 'Error executing cancellation.')
    } finally {
      setCancelLoading(false)
      setShowCancelDialog(false)
    }
  }

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200"><Clock className="w-3.5 h-3.5 mr-1" /> Pending Pickup</span>
      case 'CONFIRMED':
        return <span className="inline-flex items-center text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200"><ShieldCheck className="w-3.5 h-3.5 mr-1" /> Confirmed</span>
      case 'COLLECTED':
        return <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Collected</span>
      case 'CANCELLED':
        return <span className="inline-flex items-center text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200"><X className="w-3.5 h-3.5 mr-1" /> Cancelled</span>
      case 'EXPIRED':
      default:
        return <span className="inline-flex items-center text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> Expired</span>
    }
  }

  const getTimelineSteps = (status: Reservation['status']): { key: string; label: string; done: boolean; active?: boolean; failed?: boolean }[] => {
    const steps = [
      { key: 'PENDING', label: 'Reserved' },
      { key: 'CONFIRMED', label: 'Confirmed' },
      { key: 'READY', label: 'Ready for Pickup' },
      { key: 'COLLECTED', label: 'Collected' }
    ]

    if (status === 'CANCELLED') {
      return [
        { key: 'PENDING', label: 'Reserved', done: true, active: false, failed: false },
        { key: 'CANCELLED', label: 'Cancelled', done: true, active: true, failed: true }
      ]
    }

    let activeIndex = 0
    if (status === 'CONFIRMED') activeIndex = 1
    if (status === 'COLLECTED') activeIndex = 3

    return steps.map((s, idx) => ({
      ...s,
      done: idx <= activeIndex,
      active: idx === activeIndex,
      failed: false
    }))
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 relative">
      
      <ConfirmationDialog
        isOpen={showCancelDialog}
        title="Cancel Reservation?"
        message="Are you sure you want to cancel this reservation? Stock levels will immediately be reconciled back to the target pharmacy inventory."
        confirmLabel="Cancel Order"
        onConfirm={handleCancelConfirm}
        onCancel={() => setShowCancelDialog(false)}
        isLoading={cancelLoading}
      />

      {toastMsg && (
        <div className="fixed top-20 right-6 z-55 bg-emerald-50 border border-emerald-250 text-emerald-800 px-4.5 py-3 rounded-lg shadow-xl animate-fadeIn flex items-center space-x-2 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {!selectedRes ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center space-x-2">
              <ClipboardList className="w-6 h-6 text-health-primary" />
              <span>My Reservations</span>
            </h1>
            <p className="text-gray-500 text-xs mt-1">Track active reservations, view details, or retrieve pickup QR validation codes.</p>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400">
              Loading reservations history...
            </div>
          ) : list.length === 0 ? (
            <div className="py-16 text-center text-gray-500 space-y-4 border border-dashed rounded-xl">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto animate-pulse" />
              <div>
                <p className="font-bold text-gray-700">No active reservations.</p>
                <p className="text-xs text-gray-400 mt-1">Use the search hero on your dashboard to reserve medicines near you.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {list.map((res) => (
                <div
                  key={res.id}
                  onClick={() => setSelectedRes(res)}
                  className="border border-gray-200 rounded-xl p-5 hover:border-emerald-500 hover:shadow-xs transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer"
                >
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
                      <span>Quantity: <span className="text-gray-700">{res.quantity} units</span></span>
                      <span>&bull;</span>
                      <span>Ref ID: <span className="text-gray-700 font-mono">{res.id}</span></span>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end space-y-1.5 md:text-right w-full md:w-auto">
                    <div className="text-xs">
                      <span className="text-gray-400 block">Out-of-Pocket Payment</span>
                      <span className="text-sm font-black text-health-primary">{res.patientPays} RWF</span>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold">
                      <span className="text-[9px] font-bold text-gray-400 block uppercase leading-none">Collection deadline</span>
                      <span className="text-gray-800">{res.pickupDeadline.split(',')[0]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
          
          <button
            type="button"
            onClick={() => setSelectedRes(null)}
            className="text-gray-400 hover:text-gray-900 font-bold text-xs flex items-center space-x-1 focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to list</span>
          </button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-150 pb-4 gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-black text-gray-950">{selectedRes.medicineName}</h2>
                {getStatusBadge(selectedRes.status)}
              </div>
              <p className="text-xs text-gray-400 font-bold uppercase mt-1">Reservation Reference: <span className="font-mono text-gray-700">{selectedRes.id}</span></p>
            </div>
            
            {(selectedRes.status === 'PENDING' || selectedRes.status === 'CONFIRMED') && (
              <button
                type="button"
                onClick={() => setShowCancelDialog(true)}
                className="border border-red-300 hover:bg-red-50 text-red-700 px-4 py-2 rounded-lg text-xs font-bold transition-colors focus:outline-none"
              >
                Cancel Reservation
              </button>
            )}
          </div>

          <div className="space-y-3 bg-gray-50/50 border border-gray-200 p-5 rounded-xl">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Fulfillment Timeline Status</span>
            
            <div className="flex items-center justify-between pt-2">
              {getTimelineSteps(selectedRes.status).map((step, idx, arr) => (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center space-y-1 z-5 text-center flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border font-mono text-[10px] font-black transition-all ${
                      step.done 
                        ? step.failed ? 'bg-red-50 border-red-350 text-red-700' : 'bg-health-primary border-emerald-950 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className={`text-[10px] font-bold ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                  </div>
                  
                  {idx < arr.length - 1 && (
                    <div className={`h-0.5 flex-grow -mt-4 transition-colors ${
                      step.done ? 'bg-health-primary' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            <div className="md:col-span-2 space-y-4 text-xs font-bold text-gray-700">
              
              <div className="border border-gray-150 rounded-xl p-4 space-y-2">
                <span className="text-[10px] uppercase text-gray-400 block tracking-wider">Reserved Item details</span>
                <div className="flex justify-between items-center text-gray-950 text-sm">
                  <span>{selectedRes.medicineName}</span>
                  <span>Qty: {selectedRes.quantity} units</span>
                </div>
                <div className="text-[11px] text-gray-500 font-medium">
                  Please confirm dosage instructions and warnings printed on packaging at checkout counters.
                </div>
              </div>

              <div className="border border-gray-150 rounded-xl p-4 space-y-2">
                <span className="text-[10px] uppercase text-gray-400 block tracking-wider">Pickup Pharmacy details</span>
                <div className="text-gray-950 text-sm">{selectedRes.pharmacyName}</div>
                <p className="text-[11px] text-gray-500 font-medium flex items-center">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mr-1" />
                  <span>Kigali City, Gasabo Sector</span>
                </p>
                <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded p-2.5 text-[11px] font-semibold flex items-start space-x-1.5 leading-normal">
                  <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <span>Collect this reservation from the pharmacy before {selectedRes.pickupDeadline}.</span>
                </div>
              </div>

              <div className="border border-gray-150 rounded-xl p-4 space-y-2.5">
                <span className="text-[10px] uppercase text-gray-400 block tracking-wider">Payment Cost splits (RWF)</span>
                
                <div className="space-y-1.5 text-gray-650">
                  <div className="flex justify-between">
                    <span>Retail Price ({selectedRes.quantity} units)</span>
                    <span className="text-gray-900">{selectedRes.totalPrice} RWF</span>
                  </div>
                  <div className="flex justify-between text-blue-800 font-black">
                    <span>Insurance Pays ({selectedRes.insuranceProvider})</span>
                    <span>-{selectedRes.insurancePays} RWF</span>
                  </div>
                </div>

                <div className="border-t border-gray-150 pt-2 flex justify-between items-center text-sm font-black text-gray-950">
                  <span>Out-of-Pocket Copay</span>
                  <span className="text-health-primary">{selectedRes.patientPays} RWF</span>
                </div>
              </div>

            </div>

            <div className="border border-gray-250 rounded-xl p-5 bg-gray-50/50 flex flex-col items-center text-center space-y-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Reservation reference</span>
              
              <div className="space-y-1">
                <span className="font-mono text-base font-black text-emerald-800">{selectedRes.id}</span>
              </div>

              <p className="text-[10px] text-gray-400 leading-normal max-w-xs font-semibold">
                Use this reservation reference when speaking with the pharmacy.
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}
