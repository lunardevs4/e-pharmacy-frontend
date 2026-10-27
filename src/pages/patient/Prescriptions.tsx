import React, { useState, useEffect, useCallback } from 'react'
import { 
  FileText, Plus, Upload, CheckCircle2, Clock, XCircle, 
  ExternalLink, RefreshCw, AlertCircle, Search, Eye, Filter, X
} from 'lucide-react'
import { MedicineApi } from '@/services/medicine-api'
import { useUIStore } from '@/store/uiStore'

interface PrescriptionMedicineItem {
  id?: string
  medicineId: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
  medicine?: {
    tradeName?: string
    genericName?: string
  }
}

interface Prescription {
  id: string
  patientId: string
  pharmacyId?: string | null
  documentUrl?: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  notes?: string | null
  createdAt: string
  updatedAt: string
  pharmacy?: {
    id: string
    name: string
    address?: string
    phone?: string
  } | null
  pharmacist?: {
    firstName: string
    lastName: string
  } | null
  medicines: PrescriptionMedicineItem[]
}

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadNotes, setUploadNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Document preview modal
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const loadPrescriptions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await MedicineApi.getMyPrescriptions()
      setPrescriptions(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load prescriptions.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPrescriptions()
  }, [loadPrescriptions])

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile) {
      setUploadError('Please select a prescription document (PDF or image).')
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      // 1. Upload file to backend
      const uploadResult = await MedicineApi.uploadPrescriptionFile(uploadFile)
      const docUrl = uploadResult?.fileUrl || ''

      // 2. Submit prescription with documentUrl and empty/initial medicine list
      await MedicineApi.submitPrescription({
        documentUrl: docUrl,
        notes: uploadNotes.trim() || undefined,
        medicines: [],
      })

      useUIStore.getState().successToast('Prescription Uploaded', 'Your prescription has been submitted for pharmacist review.')
      setShowUploadModal(false)
      setUploadFile(null)
      setUploadNotes('')
      await loadPrescriptions()
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || err?.message || 'Failed to upload prescription. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const filtered = prescriptions.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchPharmacy = p.pharmacy?.name?.toLowerCase().includes(q)
      const matchNotes = p.notes?.toLowerCase().includes(q)
      const matchMed = p.medicines?.some(
        (m) =>
          m.medicine?.tradeName?.toLowerCase().includes(q) ||
          m.medicine?.genericName?.toLowerCase().includes(q)
      )
      if (!matchPharmacy && !matchNotes && !matchMed) return false
    }
    return true
  })

  const pendingCount = prescriptions.filter((p) => p.status === 'PENDING').length
  const approvedCount = prescriptions.filter((p) => p.status === 'APPROVED').length

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
            Under Review
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
            <h1 className="text-2xl font-black text-gray-900">My Prescriptions</h1>
            <p className="text-gray-500 text-xs mt-1">
              Upload doctor prescriptions and track pharmacist reviews and fulfillment
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-health-primary hover:bg-health-secondary text-white font-bold px-4 py-2.5 rounded-lg text-xs transition-colors flex items-center space-x-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Prescription</span>
        </button>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <span className="text-[10px] text-gray-400 block uppercase font-bold">Total Prescriptions</span>
          <span className="text-xl font-black text-gray-950 mt-1 block">{prescriptions.length}</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <span className="text-[10px] text-amber-600 block uppercase font-bold">Pending Review</span>
          <span className="text-xl font-black text-amber-700 mt-1 block">{pendingCount}</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <span className="text-[10px] text-emerald-600 block uppercase font-bold">Approved</span>
          <span className="text-xl font-black text-emerald-700 mt-1 block">{approvedCount}</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === tab
                  ? 'bg-slate-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab === 'ALL' ? 'All Prescriptions' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prescriptions..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Prescriptions List / State Handling */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
            <span>Loading your prescriptions...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-sm font-bold text-gray-800">{error}</p>
            <button
              type="button"
              onClick={loadPrescriptions}
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
              {searchQuery || statusFilter !== 'ALL'
                ? 'No prescriptions matched your active filters.'
                : 'You have not uploaded any prescriptions yet. Click "Upload Prescription" above to get started.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((item) => (
              <div key={item.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-gray-500">
                        RX-{item.id.slice(0, 8).toUpperCase()}
                      </span>
                      {getStatusBadge(item.status)}
                      <span className="text-xs text-gray-400">
                        Submitted: {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {item.pharmacy && (
                      <p className="text-xs text-gray-600">
                        <span className="font-bold text-gray-700">Assigned Pharmacy:</span> {item.pharmacy.name}
                      </p>
                    )}

                    {item.notes && (
                      <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-150">
                        <span className="font-bold text-gray-700">Notes / Remarks:</span> {item.notes}
                      </p>
                    )}

                    {item.medicines && item.medicines.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                          Prescribed Medications ({item.medicines.length})
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.medicines.map((m, idx) => (
                            <div key={idx} className="bg-emerald-50/40 border border-emerald-100 rounded-lg p-2 text-xs">
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

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.documentUrl && (
                      <button
                        onClick={() => setPreviewUrl(item.documentUrl as string)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-250 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Document</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Prescription Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xs">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-black text-gray-900">Upload Doctor Prescription</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Prescription Document (PDF, JPG, PNG) *
                </label>
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 border border-gray-300 rounded-lg p-2"
                  required
                />
                <p className="text-[11px] text-gray-400 mt-1">Maximum file size: 10MB.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Clinical Notes or Instructions (Optional)
                </label>
                <textarea
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="Doctor name, clinic, or notes for the dispensing pharmacist..."
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-gray-250 text-xs font-bold text-gray-600 hover:bg-gray-50"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-2.5 rounded-lg bg-health-primary text-white text-xs font-bold hover:bg-health-secondary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Prescription</span>
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
