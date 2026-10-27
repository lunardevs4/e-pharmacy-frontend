import React, { useState, useEffect, useCallback } from 'react'
import { 
  FileText, CheckCircle2, XCircle, Clock, Search, Eye, 
  ExternalLink, AlertCircle, RefreshCw, X, ShieldAlert, Check, User
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { PharmacyApi } from '@/services/pharmacy-api'
import { useUIStore } from '@/store/uiStore'

interface PrescriptionItem {
  id: string
  patientId: string
  pharmacyId?: string | null
  documentUrl?: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  notes?: string | null
  createdAt: string
  patient?: {
    id: string
    user?: {
      firstName?: string
      lastName?: string
      nid?: string
      phone?: string
    }
  }
  medicines: Array<{
    id?: string
    dosage: string
    frequency: string
    duration: string
    quantity: number
    medicine?: {
      tradeName?: string
      genericName?: string
    }
  }>
}

export default function PharmacyPrescriptionReviewQueue() {
  const { user } = useAuthStore()
  const pharmacyId = user?.pharmacy?.id || user?.pharmacyId

  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [searchQuery, setSearchQuery] = useState('')

  // Reject modal state
  const [rejectingItem, setRejectingItem] = useState<PrescriptionItem | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Document preview modal
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const loadQueue = useCallback(async () => {
    if (!pharmacyId) return
    setLoading(true)
    setError(null)
    try {
      const data = await PharmacyApi.getPrescriptions(pharmacyId)
      setPrescriptions(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load pharmacy prescriptions queue.')
    } finally {
      setLoading(false)
    }
  }, [pharmacyId])

  useEffect(() => {
    loadQueue()
  }, [loadQueue])

  const handleApprove = async (prescription: PrescriptionItem) => {
    if (!pharmacyId || actionLoading) return
    setActionLoading(true)
    try {
      await PharmacyApi.updatePrescriptionStatus(pharmacyId, prescription.id, 'APPROVED')
      useUIStore.getState().successToast('Prescription Approved', `Prescription RX-${prescription.id.slice(0, 8).toUpperCase()} approved for dispensing.`)
      await loadQueue()
    } catch (err: any) {
      useUIStore.getState().errorToast(err, 'Approval Failed', 'Unable to approve prescription.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pharmacyId || !rejectingItem || actionLoading) return
    if (!rejectionReason.trim()) {
      useUIStore.getState().errorToast(new Error('Please provide a rejection reason.'), 'Validation Error', 'A rejection reason is required.')
      return
    }

    setActionLoading(true)
    try {
      await PharmacyApi.updatePrescriptionStatus(
        pharmacyId,
        rejectingItem.id,
        'REJECTED',
        rejectionReason.trim()
      )
      useUIStore.getState().infoToast('Prescription Rejected', `Prescription RX-${rejectingItem.id.slice(0, 8).toUpperCase()} has been rejected.`)
      setRejectingItem(null)
      setRejectionReason('')
      await loadQueue()
    } catch (err: any) {
      useUIStore.getState().errorToast(err, 'Rejection Failed', 'Unable to reject prescription.')
    } finally {
      setActionLoading(false)
    }
  }

  const filtered = prescriptions.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const patientUser = p.patient?.user
      const patientName = `${patientUser?.firstName || ''} ${patientUser?.lastName || ''}`.toLowerCase()
      const nid = (patientUser?.nid || '').toLowerCase()
      const rxId = p.id.toLowerCase()
      const matchMed = p.medicines?.some(
        (m) =>
          m.medicine?.tradeName?.toLowerCase().includes(q) ||
          m.medicine?.genericName?.toLowerCase().includes(q)
      )
      if (!patientName.includes(q) && !nid.includes(q) && !rxId.includes(q) && !matchMed) {
        return false
      }
    }
    return true
  })

  const pendingCount = prescriptions.filter((p) => p.status === 'PENDING').length
  const approvedCount = prescriptions.filter((p) => p.status === 'APPROVED').length
  const rejectedCount = prescriptions.filter((p) => p.status === 'REJECTED').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 text-health-primary rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Prescription Review Queue</h1>
            <p className="text-gray-500 text-xs mt-1">
              Verify doctor prescriptions, validate medical appropriateness, and approve for patient dispensing
            </p>
          </div>
        </div>
        <button
          onClick={loadQueue}
          disabled={loading}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-3.5 py-2 rounded-lg text-xs transition-colors flex items-center space-x-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <span className="text-[10px] text-gray-400 block uppercase font-bold">Total Assigned</span>
          <span className="text-xl font-black text-gray-950 mt-1 block">{prescriptions.length}</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <span className="text-[10px] text-amber-600 block uppercase font-bold">Awaiting Action</span>
          <span className="text-xl font-black text-amber-700 mt-1 block">{pendingCount}</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <span className="text-[10px] text-emerald-600 block uppercase font-bold">Approved</span>
          <span className="text-xl font-black text-emerald-700 mt-1 block">{approvedCount}</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <span className="text-[10px] text-red-600 block uppercase font-bold">Rejected</span>
          <span className="text-xl font-black text-red-700 mt-1 block">{rejectedCount}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === tab
                  ? 'bg-slate-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab === 'PENDING'
                ? `Pending Review (${pendingCount})`
                : tab === 'APPROVED'
                ? `Approved (${approvedCount})`
                : tab === 'REJECTED'
                ? `Rejected (${rejectedCount})`
                : `All (${prescriptions.length})`}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, NID, or medicine..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Queue Table / Cards */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
            <span>Loading prescription queue...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-sm font-bold text-gray-800">{error}</p>
            <button
              type="button"
              onClick={loadQueue}
              className="px-4 py-2 bg-health-primary text-white text-xs font-bold rounded-lg hover:bg-health-secondary"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <FileText className="w-12 h-12 text-gray-200 mx-auto" />
            <p className="text-sm font-bold text-gray-700">No prescriptions found</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {statusFilter === 'PENDING'
                ? 'Your review queue is clear. No pending doctor prescriptions await pharmacist verification.'
                : 'No prescriptions match the selected status filter.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((item) => {
              const patientUser = item.patient?.user
              const patientName = [patientUser?.firstName, patientUser?.lastName].filter(Boolean).join(' ') || 'Patient'

              return (
                <div key={item.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-xs font-bold text-gray-500">
                          RX-{item.id.slice(0, 8).toUpperCase()}
                        </span>
                        {getStatusBadge(item.status)}
                        <span className="text-xs text-gray-400">
                          Submitted: {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <span className="inline-flex items-center gap-1.5 font-bold text-gray-900">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {patientName}
                        </span>
                        {patientUser?.nid && (
                          <span className="text-gray-500 font-mono">
                            NID: {patientUser.nid}
                          </span>
                        )}
                        {patientUser?.phone && (
                          <span className="text-gray-500">
                            Tel: {patientUser.phone}
                          </span>
                        )}
                      </div>

                      {item.notes && (
                        <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-150">
                          <span className="font-bold text-gray-700">Clinical Notes:</span> {item.notes}
                        </p>
                      )}

                      {item.medicines && item.medicines.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            Requested Medications ({item.medicines.length})
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {item.medicines.map((m, idx) => (
                              <div key={idx} className="bg-emerald-50/30 border border-emerald-100 rounded-lg p-2 text-xs">
                                <p className="font-bold text-gray-900">
                                  {m.medicine?.tradeName || m.medicine?.genericName || 'Medication item'}
                                </p>
                                <p className="text-[11px] text-gray-500">
                                  {m.dosage} · {m.frequency} · Qty: {m.quantity}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions Panel */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-2 flex-shrink-0 pt-2 lg:pt-0">
                      {item.documentUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewUrl(item.documentUrl as string)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-250 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Prescription</span>
                        </button>
                      )}

                      {item.status === 'PENDING' && (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => handleApprove(item)}
                            disabled={actionLoading}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectingItem(item)
                              setRejectionReason('')
                            }}
                            disabled={actionLoading}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Rejection Reason Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xs">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-red-600 font-black text-base">
                <ShieldAlert className="w-5 h-5" />
                <span>Reject Prescription</span>
              </div>
              <button
                onClick={() => setRejectingItem(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Please enter the clinical or regulatory reason for rejecting prescription{' '}
              <strong className="text-gray-900 font-mono">
                RX-{rejectingItem.id.slice(0, 8).toUpperCase()}
              </strong>. This explanation will be visible to the patient.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Unclear dosage, expired doctor signature, or medication contraindicated..."
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingItem(null)}
                  className="flex-1 py-2 rounded-lg border border-gray-250 text-xs font-bold text-gray-600 hover:bg-gray-50"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Confirm Rejection</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-3xl w-full p-5 shadow-2xl relative space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900">Prescription Document Preview</h3>
              <button
                onClick={() => setPreviewUrl(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-[400px] overflow-auto flex items-center justify-center bg-gray-50 rounded-xl p-2 border">
              {previewUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe src={previewUrl} className="w-full h-full min-h-[500px] border-0" title="PDF Document" />
              ) : (
                <img src={previewUrl} alt="Prescription Document" className="max-h-[500px] object-contain rounded" />
              )}
            </div>
            <div className="flex justify-end">
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-health-primary text-white text-xs font-bold rounded-lg hover:bg-health-secondary"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in New Tab</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
