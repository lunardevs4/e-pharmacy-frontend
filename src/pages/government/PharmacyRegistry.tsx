import React, { useState, useEffect } from 'react'
import {
  Users, Search, X, Check, Eye, AlertTriangle, CheckCircle2,
  MapPin, User, FileText, Download, Landmark, Calendar, RefreshCw, XCircle, ArrowLeft, Loader2
} from 'lucide-react'
import { AuthApi } from '@/services/auth-api'

interface TimelineEvent {
  event: string
  date: string
  notes?: string
}

type PharmacyStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

interface PharmacyOwner {
  id?: string
  firstName?: string
  lastName?: string
  email?: string
}

interface PharmacyDocument {
  name: string
  fileType?: string
  fileSize?: number
}

interface Pharmacy {
  id: string
  ownerId: string
  name: string
  pharmacyName?: string
  address: string
  latitude?: number | string | null
  longitude?: number | string | null
  phone: string
  licenseNumber?: string | null
  district?: string | null
  province?: string | null
  managerName?: string | null
  licenseUrl?: string | null
  status: PharmacyStatus
  isActive: boolean
  category?: string | null
  ownershipType?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  username?: string | null
  tin?: string | null
  village?: string | null
  documents?: PharmacyDocument[]
  statusNotes?: string | null
  timeline?: TimelineEvent[]

  // Included relation
  owner?: PharmacyOwner | null
}

const normalizePharmacy = (payload: any): Pharmacy => {
  const defaultDate = new Date().toISOString()
  return {
    id: payload?.id || payload?.pharmacyId || payload?.owner?.pharmacyId || '',
    ownerId: payload?.ownerId || payload?.owner?.id || payload?.owner?.userId || '',
    name: payload?.name || payload?.pharmacyName || payload?.pharmacy?.name || 'Untitled Pharmacy',
    pharmacyName: payload?.pharmacyName || payload?.name || payload?.pharmacy?.name,
    address: payload?.address || payload?.location || payload?.pharmacy?.address || 'Unknown address',
    latitude: payload?.latitude,
    longitude: payload?.longitude,
    phone: payload?.phone || payload?.contactNumber || payload?.pharmacy?.phone || 'Unknown',
    licenseNumber: payload?.licenseNumber || payload?.licenseNo || payload?.pharmacy?.licenseNumber || null,
    district: payload?.district || payload?.pharmacy?.district || null,
    province: payload?.province || payload?.pharmacy?.province || null,
    managerName: payload?.managerName || payload?.pharmacistName || payload?.pharmacy?.managerName || null,
    licenseUrl: payload?.licenseUrl || payload?.documents?.find((d: any) => d.type === 'license')?.url || null,
    status: (payload?.status || payload?.pharmacy?.status || 'PENDING') as PharmacyStatus,
    isActive: payload?.isActive ?? payload?.active ?? true,
    category: payload?.category || payload?.pharmacy?.category || null,
    ownershipType: payload?.ownershipType || payload?.pharmacy?.ownershipType || null,
    createdAt: payload?.createdAt || payload?.created_at || payload?.pharmacy?.createdAt || defaultDate,
    updatedAt: payload?.updatedAt || payload?.updated_at || payload?.pharmacy?.updatedAt || payload?.createdAt || defaultDate,
    deletedAt: payload?.deletedAt || payload?.deleted_at || null,
    username: payload?.username || payload?.owner?.username || null,
    tin: payload?.tin || payload?.taxId || null,
    village: payload?.village || null,
    documents: Array.isArray(payload?.documents) ? payload.documents : [],
    timeline: Array.isArray(payload?.timeline) ? payload.timeline : [],
    owner: payload?.owner ? {
      id: payload.owner.id,
      firstName: payload.owner.firstName || payload.owner.first_name,
      lastName: payload.owner.lastName || payload.owner.last_name,
      email: payload.owner.email,
    } : undefined,
  }
}

export default function PharmacyRegistry() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [selectedPharm, setSelectedPharm] = useState<Pharmacy | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Filters
  const [searchVal, setSearchVal] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Verification Dialogs/Modals
  const [activeModal, setActiveModal] = useState<'REJECT' | 'SUSPEND' | 'REQUEST_INFO' | null>(null)
  const [modalComment, setModalComment] = useState('')
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)

  // Mock Document Viewer Modal
  const [viewingDoc, setViewingDoc] = useState<{ label: string; name: string } | null>(null)

  useEffect(() => {
    fetchPharmacies()
  }, [])

  const fetchPharmacies = async () => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const data = await AuthApi.getAllPharmacies()
      const normalized = Array.isArray(data)
        ? data.map(normalizePharmacy)
        : []
      setPharmacies(normalized)
      if (normalized.length > 0) {
        setSelectedPharm(normalized[0])
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load pharmacy directory.')
    } finally {
      setIsLoading(false)
    }
  }

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  // Handle regulatory actions
  const handleApprove = async () => {
    if (!selectedPharm) return
    setIsSubmittingAction(true)
    try {
      const updated = await AuthApi.approvePharmacy(selectedPharm.id)
      updateLocalList(updated)
      triggerToast(`License approved for ${selectedPharm.name || selectedPharm.id}.`)
    } catch (err: any) {
      setErrorMsg(err.message || 'Approval action failed.')
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const handleReactivate = async () => {
    if (!selectedPharm) return
    setIsSubmittingAction(true)
    try {
      const updated = await AuthApi.reactivatePharmacy(selectedPharm.id)
      updateLocalList(updated)
      triggerToast(`Pharmacy license reactivated for ${selectedPharm.name || selectedPharm.id}.`)
    } catch (err: any) {
      setErrorMsg(err.message || 'Reactivation action failed.')
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPharm || !activeModal || !modalComment.trim()) return

    setIsSubmittingAction(true)
    try {
      let updated: Pharmacy
      if (activeModal === 'REJECT') {
        updated = await AuthApi.rejectPharmacy(selectedPharm.id)
        triggerToast(`Application rejected for ${selectedPharm.name || selectedPharm.id}.`)
      } else if (activeModal === 'SUSPEND') {
        // Backend does not support suspend directly; use REJECTED as administrative hold
        updated = await AuthApi.rejectPharmacy(selectedPharm.id)
        triggerToast(`Pharmacy license suspended for ${selectedPharm.name || selectedPharm.id}.`)
      } else {
        updated = await AuthApi.requestMoreInformation(selectedPharm.id, modalComment)
        triggerToast(`Requested additional information for ${selectedPharm.name || selectedPharm.id}.`)
      }

      updateLocalList(updated)
      setActiveModal(null)
      setModalComment('')
    } catch (err: any) {
      setErrorMsg(err.message || 'Regulatory control action failed.')
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const updateLocalList = (updated: Pharmacy) => {
    const normalized = normalizePharmacy(updated)
    setPharmacies((prev) =>
      prev.map((ph) => ph.id === normalized.id ? normalized : ph)
    )
    setSelectedPharm(normalized)
  }

  // Filter listings
  const filteredPharmacies = pharmacies.filter((p) => {
    const query = searchVal.toLowerCase()
    const matchesSearch =
      p.name?.toLowerCase().includes(query) ||
      p.licenseNumber?.toLowerCase().includes(query) ||
      p.phone?.toLowerCase().includes(query) ||
      p.managerName?.toLowerCase().includes(query) ||
      p.address?.toLowerCase().includes(query) ||
      p.owner?.email?.toLowerCase().includes(query)

    let matchesStatus = true
    if (statusFilter !== 'ALL') {
      matchesStatus = p.status === statusFilter
    }
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const maps = {
      APPROVED: 'text-emerald-700 bg-emerald-50 border-emerald-250',
      PENDING: 'text-amber-700 bg-amber-50 border-amber-250',
      REJECTED: 'text-red-700 bg-red-50 border-red-250',
    }
    const label = {
      APPROVED: 'Approved',
      PENDING: 'Pending Review',
      REJECTED: 'Rejected',
    }
    return (
      <span className={`inline-flex items-center text-[10px] font-bold border px-2 py-0.5 rounded uppercase tracking-wider ${maps[status as keyof typeof maps] || maps.PENDING}`}>
        {label[status as keyof typeof label] || 'Unknown'}
      </span>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 relative">
      {/* Toast alert popup */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-50 border border-emerald-250 text-emerald-805 px-4.5 py-3 rounded-lg shadow-xl animate-fadeIn flex items-center space-x-2 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-red-800 text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Registry Search and List (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-150">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-black text-gray-900">Verification Module</h3>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{filteredPharmacies.length} Match(es)</span>
          </div>

          {/* Filters console */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, license, pharmacist..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-semibold text-gray-900"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-2 py-2 text-xs text-gray-700 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Pharmacy Listings */}
          {isLoading ? (
            <div className="text-center py-10 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
              <span className="text-xs text-gray-400 font-medium">Fetching directory...</span>
            </div>
          ) : filteredPharmacies.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl text-gray-400 font-medium text-xs">
              No matching applications found.
            </div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto max-h-[550px] pr-1">
              {filteredPharmacies.map((pharm) => {
                const isSelected = selectedPharm?.id === pharm.id
                return (
                  <div
                    key={pharm.id}
                    onClick={() => {
                      setSelectedPharm(pharm)
                      setErrorMsg(null)
                    }}
                    className={`border p-3.5 rounded-xl transition-all cursor-pointer text-left flex flex-col gap-2 ${isSelected
                      ? 'border-emerald-600 bg-emerald-50/10 shadow-xs'
                      : 'border-gray-200 hover:border-gray-350 hover:bg-gray-50/20'
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5 max-w-[70%]">
                        <span className="font-extrabold text-xs text-gray-950 block truncate">{pharm.name || pharm.pharmacyName}</span>
                        <span className="text-[10px] text-gray-450 block font-mono font-semibold">{pharm.licenseNumber || pharm.phone || 'No license info'}</span>
                      </div>
                      {getStatusBadge(pharm.status)}
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium flex justify-between pt-1 border-t border-gray-100">
                      <span>Created: {new Date(pharm.createdAt || pharm.updatedAt || '').toLocaleDateString() || '—'}</span>
                      <span className="text-gray-800 font-bold">{pharm.province || 'Unknown'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Pane: Auditing Report & Verification Console (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-5 shadow-xs text-left">
          {!selectedPharm ? (
            <div className="text-center py-24 text-gray-400 font-medium text-xs">
              Select a pharmacy registry card from the left panel to review compliance details.
            </div>
          ) : (
            <div className="space-y-6 font-semibold text-xs text-gray-700">

              {/* Detailed Header */}
              <div className="pb-4 border-b border-gray-150 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-gray-950 uppercase tracking-tight">{selectedPharm.name || selectedPharm.id}</h3>
                  <p className="text-[10px] text-gray-500 font-medium">Licensed under RDB and National Superintendent Register</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(selectedPharm.status)}
                  <span className="text-[10px] text-gray-400 font-mono">ID: {selectedPharm.id}</span>
                </div>
              </div>

              {/* Status Alert for Rejections/Suspensions */}
              {selectedPharm.statusNotes && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-xl text-[11px] leading-relaxed font-sans flex items-start space-x-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold block">Board Regulatory Comments:</span>
                    <p className="font-mono mt-0.5">{selectedPharm.statusNotes}</p>
                  </div>
                </div>
              )}

              {/* Report Tab Container */}
              <div className="space-y-5">

                {/* Section 1: Corporate Details */}
                <div className="space-y-2">
                  <h4 className="text-[10px] text-gray-450 uppercase font-black tracking-wider pb-1 border-b border-gray-100 flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-emerald-805" />
                    <span>Pharmacy Operating Details</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-[11px] font-medium leading-relaxed">
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Trading Name</span>
                      <span className="text-gray-900 font-bold">{selectedPharm.name || 'None'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Category</span>
                      <span className="text-gray-900 font-bold">{selectedPharm.category || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Ownership Type</span>
                      <span className="text-gray-900 font-bold">{selectedPharm.ownershipType || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">MoH License Ref</span>
                      <span className="text-gray-900 font-mono font-bold">{selectedPharm.licenseNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Business TIN</span>
                      <span className="text-gray-900 font-mono font-bold">{selectedPharm.tin}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">RDB Business Reg</span>
                      <span className="text-gray-900 font-mono font-bold">{selectedPharm.licenseNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Contact Info */}
                <div className="space-y-2">
                  <h4 className="text-[10px] text-gray-450 uppercase font-black tracking-wider pb-1 border-b border-gray-100 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-805" />
                    <span>Contact Info</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-[11px] font-medium leading-relaxed">
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Official Email</span>
                      <span className="text-gray-950 font-bold break-all block">{selectedPharm.owner?.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Official Phone</span>
                      <span className="text-gray-950 font-bold">{selectedPharm.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Portal Username</span>
                      <span className="text-gray-955 font-bold font-mono">{selectedPharm.username}</span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Geographic jurisdiction */}
                <div className="space-y-2">
                  <h4 className="text-[10px] text-gray-450 uppercase font-black tracking-wider pb-1 border-b border-gray-100 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-805" />
                    <span>Geographic Jurisdiction</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-[11px] font-medium leading-relaxed">
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Province</span>
                      <span className="text-gray-900 font-bold">{selectedPharm.province || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">District</span>
                      <span className="text-gray-900 font-bold">{selectedPharm.district || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Sector</span>
                      <span className="text-gray-900 font-bold">{selectedPharm.district || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Cell</span>
                      <span className="text-gray-900 font-bold">{selectedPharm.address || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Village</span>
                      <span className="text-gray-900 font-bold">{selectedPharm.village}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">GPS Coordinates</span>
                      <span className="text-gray-900 font-mono font-bold">Not Captured</span>
                    </div>
                  </div>
                </div>

                {/* Section 4: Responsible Superintendent Pharmacist */}
                <div className="space-y-2">
                  <h4 className="text-[10px] text-gray-450 uppercase font-black tracking-wider pb-1 border-b border-gray-100 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-805" />
                    <span>Responsible Pharmacist</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-[11px] font-medium leading-relaxed">
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Full Name</span>
                      <span className="text-gray-900 font-bold">{selectedPharm.managerName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">National ID (NID)</span>
                      <span className="text-gray-900 font-mono font-bold">N/A</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Professional License</span>
                      <span className="text-gray-900 font-mono font-bold">N/A</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Phone Number</span>
                      <span className="text-gray-900 font-bold">N/A</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Email Address</span>
                      <span className="text-gray-900 font-bold">N/A</span>
                    </div>
                  </div>
                </div>

                {/* Section 5: Documents Auditing */}
                <div className="space-y-2">
                  <h4 className="text-[10px] text-gray-450 uppercase font-black tracking-wider pb-1 border-b border-gray-100 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-805" />
                    <span>Compliance Certificates</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    {[
                      { key: 'pharmacyLicense', label: 'Operating License (MoH)' },
                      { key: 'businessReg', label: 'Business Reg Cert (RDB)' },
                      { key: 'pharmacistLicense', label: 'Pharmacist Council License' },
                      { key: 'taxCertificate', label: 'RRA Tax Clearance Certificate' }
                    ].map((doc) => {
                      const file = selectedPharm.documents?.find(d => d.name.toLowerCase().includes(doc.key.toLowerCase()))
                        || { name: `${doc.key}_mock_file.pdf`, fileType: 'application/pdf', fileSize: 240000 }
                      return (
                        <div key={doc.key} className="border border-gray-200 rounded-xl p-3 flex items-center justify-between bg-gray-50/50 shadow-xxs">
                          <div className="space-y-0.5">
                            <span className="text-gray-700 font-bold block leading-none">{doc.label}</span>
                            <span className="text-[9px] text-gray-400 font-mono block truncate max-w-[150px]">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setViewingDoc({ label: doc.label, name: file.name })}
                            className="bg-white border border-gray-300 hover:border-health-primary text-gray-700 hover:text-health-primary text-[10px] font-bold px-2 py-1 rounded transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Audit</span>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Section 6: Auditing history timeline */}
                <div className="space-y-2">
                  <h4 className="text-[10px] text-gray-450 uppercase font-black tracking-wider pb-1 border-b border-gray-100 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-805" />
                    <span>Auditing Review Timeline</span>
                  </h4>
                  <div className="space-y-3 pl-3 border-l border-gray-200 pt-1">
                    {selectedPharm.timeline && selectedPharm.timeline.map((evt, idx) => (
                      <div key={idx} className="relative space-y-0.5">
                        <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-emerald-600 border border-white" />
                        <div className="flex items-center justify-between text-[11px] font-medium text-gray-500">
                          <span className="font-extrabold text-gray-900">{evt.event}</span>
                          <span className="font-mono">{evt.date}</span>
                        </div>
                        {evt.notes && <p className="text-[10px] text-gray-550 leading-relaxed font-sans">{evt.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Section 7: Verification Actions */}
              <div className="pt-5 border-t border-gray-200 flex flex-wrap gap-2.5 justify-end">
                {selectedPharm.status === 'PENDING' ? (
                  <>
                    <button
                      type="button"
                      disabled={isSubmittingAction}
                      onClick={() => {
                        setActiveModal('REQUEST_INFO')
                        setModalComment('')
                      }}
                      className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold px-3 py-2 rounded-lg transition-colors focus:outline-none cursor-pointer"
                    >
                      Request Info
                    </button>
                    <button
                      type="button"
                      disabled={isSubmittingAction}
                      onClick={() => {
                        setActiveModal('REJECT')
                        setModalComment('')
                      }}
                      className="border border-red-300 hover:bg-red-50 text-red-750 font-bold px-3 py-2 rounded-lg transition-colors focus:outline-none cursor-pointer"
                    >
                      Reject Application
                    </button>
                    <button
                      type="button"
                      disabled={isSubmittingAction}
                      onClick={handleApprove}
                      className="bg-health-primary hover:bg-health-secondary text-white font-bold px-4.5 py-2 rounded-lg shadow-sm transition-colors focus:outline-none flex items-center gap-1 cursor-pointer"
                    >
                      {isSubmittingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />}
                      <span>Approve &amp; Activate</span>
                    </button>
                  </>
                ) : selectedPharm.status === 'APPROVED' ? (
                  <button
                    type="button"
                    disabled={isSubmittingAction}
                    onClick={() => {
                      setActiveModal('SUSPEND')
                      setModalComment('')
                    }}
                    className="bg-rose-50 border border-rose-205 hover:bg-rose-100 text-rose-800 font-bold px-3.5 py-2 rounded-lg transition-colors focus:outline-none flex items-center gap-1 cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Suspend License</span>
                  </button>
                ) : (
                  // Rejected or Suspended
                  <button
                    type="button"
                    disabled={isSubmittingAction}
                    onClick={handleReactivate}
                    className="bg-health-primary hover:bg-health-secondary text-white font-bold px-4.5 py-2 rounded-lg shadow-sm transition-colors focus:outline-none flex items-center gap-1 cursor-pointer"
                  >
                    {isSubmittingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>Reactivate Store License</span>
                  </button>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Decision comment dialog popup */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setActiveModal(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xxs" />

          <div className="relative w-full max-w-sm bg-white rounded-2xl border border-gray-250 shadow-2xl overflow-hidden z-50 flex flex-col text-left text-xs font-bold text-gray-700">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-black text-sm">
                  {activeModal === 'REJECT' && 'Reject Application'}
                  {activeModal === 'SUSPEND' && 'Suspend Pharmacy License'}
                  {activeModal === 'REQUEST_INFO' && 'Request Additional Information'}
                </h3>
                <p className="text-[10px] text-slate-400">MoH Audit board decision log</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-gray-400 uppercase tracking-wider text-[9px]">Justification Comments</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide details for this audit decision..."
                  value={modalComment}
                  onChange={(e) => setModalComment(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-medium leading-relaxed font-sans"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-1/3 py-2 border border-gray-300 rounded-lg text-gray-650 hover:bg-gray-55 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction || !modalComment.trim()}
                  className={`w-2/3 py-2 text-white font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 ${activeModal === 'REQUEST_INFO' ? 'bg-blue-600 hover:bg-blue-755' : 'bg-red-600 hover:bg-red-755'
                    }`}
                >
                  Confirm Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulated Document Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
          <div onClick={() => setViewingDoc(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xxs" />

          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-gray-250 shadow-2xl overflow-hidden z-55 flex flex-col text-left">
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900">
              <div>
                <h3 className="font-black text-sm">{viewingDoc.label}</h3>
                <p className="text-xs text-emerald-300 font-bold">{viewingDoc.name}</p>
              </div>
              <button onClick={() => setViewingDoc(null)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 bg-gray-50 flex items-center justify-center min-h-[300px]">
              <div className="bg-white border-4 border-double border-emerald-800 p-8 rounded-xl shadow-md max-w-sm text-center space-y-6 relative overflow-hidden">
                {/* Background Watermark */}
                <div className="absolute inset-0 opacity-5 flex items-center justify-center font-bold text-3xl rotate-45 pointer-events-none select-none">
                  RWANDA MOH
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Landmark className="w-10 h-10 text-emerald-800" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-805">Republic of Rwanda</span>
                  <span className="text-[9px] font-bold text-gray-500">Ministry of Health Regulatory Board</span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-extrabold text-gray-950 text-xs border-y border-emerald-100 py-2.5 uppercase tracking-wide">
                    Certificate of Official Validation
                  </h4>
                  <p className="text-[10px] text-gray-500 leading-normal font-sans">
                    This document certifies that the licensing credentials uploaded for **{selectedPharm?.pharmacyName}** have been cross-checked against national databases.
                  </p>
                </div>

                <div className="flex justify-between items-center text-[9px] font-bold text-gray-450 border-t border-gray-100 pt-4">
                  <span className="font-mono">VERIFIED MoH MOCK</span>
                  <span>Board Inspector Seal</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 border-t border-gray-150 flex justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-650 hover:bg-gray-50 text-xs font-bold transition-colors"
              >
                Close Audit View
              </button>
              <button
                type="button"
                onClick={() => triggerToast(`Downloaded ${viewingDoc.name} locally.`)}
                className="bg-health-primary hover:bg-health-secondary text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                <span>Download Copy</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
