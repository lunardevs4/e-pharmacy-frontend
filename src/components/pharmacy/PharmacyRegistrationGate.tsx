import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { AuthApi } from '@/services/auth-api'
import LocationSelector from '@/components/LocationSelector'
import {
  Building,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  ArrowRight,
  MapPin,
  XCircle,
  LogOut,
} from 'lucide-react'

interface UserLike {
  role?: string
  email?: string
  pharmacy?: {
    id?: string
    name?: string
    address?: string
    licenseNumber?: string
    category?: string
    ownershipType?: string
    province?: string
    district?: string
    sector?: string
    cell?: string
    village?: string
    status?: string
  } | null
}

/**
 * A pharmacy owner whose store has not been registered/approved yet is
 * considered gated:
 *  - No pharmacy record at all
 *  - Placeholder registration details (licenseNumber 'PENDING')
 *  - Status not APPROVED (PENDING or REJECTED)
 */
export function isPharmacyGated(user: UserLike | null | undefined): boolean {
  if (!user) return false
  if (user.role !== 'PHARMACY' && user.role !== 'PHARMACY_OWNER') return false
  const pharmacy = user.pharmacy
  if (!pharmacy?.id) return true
  const needsRegistration =
    !pharmacy.name ||
    pharmacy.licenseNumber === 'PENDING' ||
    pharmacy.address === 'Pending Address'
  if (needsRegistration) return true
  return pharmacy.status !== 'APPROVED'
}

export default function PharmacyRegistrationGate({
  children,
}: {
  children: React.ReactNode
}) {
  const navigate = useNavigate()
  const { user, updateProfile, logout } = useAuthStore()
  const gated = isPharmacyGated(user)

  // ── Company details form state ────────────────────────────────────────────
  const [pharmacyName, setPharmacyName] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [category, setCategory] = useState('')
  const [ownershipType, setOwnershipType] = useState('')
  const [province, setProvince] = useState('')
  const [district, setDistrict] = useState('')
  const [sector, setSector] = useState('')
  const [cell, setCell] = useState('')
  const [village, setVillage] = useState('')
  const [streetAddress, setStreetAddress] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  // When a rejected owner chooses to correct details, force the form view
  const [forceEditForm, setForceEditForm] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  if (!gated) return <>{children}</>

  const pharmacy = user?.pharmacy
  const needsRegistration =
    forceEditForm ||
    !pharmacy?.name ||
    pharmacy?.licenseNumber === 'PENDING' ||
    pharmacy?.address === 'Pending Address'
  const isRejected = pharmacy?.status === 'REJECTED'

  const handleRegisterCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!pharmacyName.trim() || pharmacyName.trim().length < 3) {
      setFormError('Pharmacy Name is required (minimum 3 characters).')
      return
    }
    if (!licenseNumber.trim()) {
      setFormError('MOH Operating License Number is required.')
      return
    }
    if (!category) {
      setFormError('Please select a pharmacy category.')
      return
    }
    if (!ownershipType) {
      setFormError('Please select ownership style.')
      return
    }
    if (!province || !district || !sector || !cell || !village) {
      setFormError('Please complete all administrative location fields.')
      return
    }

    setIsSubmitting(true)
    const formattedAddress = [province, district, sector, cell, village, streetAddress.trim()]
      .filter(Boolean)
      .join(', ')

    try {
      const pharmacyId = user?.pharmacy?.id
      if (!pharmacyId) throw new Error('No pharmacy reference found in your account.')

      await AuthApi.updatePharmacy(pharmacyId, {
        name: pharmacyName,
        address: formattedAddress,
        licenseNumber,
        category,
        ownershipType,
        province,
        district,
      })

      setFormSuccess('Pharmacy details submitted successfully and queued for MOH review!')

      updateProfile({
        pharmacy: {
          ...user?.pharmacy,
          name: pharmacyName,
          address: formattedAddress,
          licenseNumber,
          category,
          ownershipType,
          province,
          district,
          status: 'PENDING',
        },
      })
    } catch (err: any) {
      setFormError(err.message || 'Submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCheckStatus = async () => {
    setStatusLoading(true)
    setFormError(null)
    try {
      const latestUser = await AuthApi.refreshSession()
      updateProfile(latestUser)
      if (isPharmacyGated({ ...latestUser })) {
        setFormSuccess(
          latestUser.pharmacy?.status === 'REJECTED'
            ? 'Your application was rejected. Please review your details and re-apply.'
            : 'Still under review. Please check again later.',
        )
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to refresh status. Please try again.')
    } finally {
      setStatusLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* Greyed-out, non-interactive portal content behind the gate */}
      <div className="filter blur-xs grayscale opacity-35 pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>

      {/* Blocking overlay */}
      <div className="fixed inset-0 z-[90] flex items-start justify-center bg-slate-900/20 backdrop-blur-sm overflow-y-auto p-4 sm:p-6">
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Sign out"
          className="fixed top-4 right-4 z-10 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 shadow-lg transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          <span>Sign out</span>
        </button>
        {needsRegistration ? (
          /* ── Registration form popup ─────────────────────────────────── */
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Register your pharmacy"
            className="bg-white border border-gray-200 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-5 my-6"
          >
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-150">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 flex-shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-gray-900">Activate Your Pharmacy Store</h2>
                <p className="text-xs text-gray-500 font-medium">
                  Please enter your company registration details for MOH authorization. All other
                  portal sections remain locked until your pharmacy is approved.
                </p>
              </div>
            </div>

            {isRejected && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-red-800 text-xs">
                <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="font-semibold">
                  Your previous application was rejected by the Ministry of Health. Please correct
                  your details and submit again.
                </span>
              </div>
            )}

            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-red-800 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="font-semibold">{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start space-x-2 text-emerald-800 text-xs">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="font-semibold">{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRegisterCompany} className="portal-form space-y-4 text-xs font-bold text-gray-700">
              <div>
                <label className="block text-gray-500 uppercase tracking-wider mb-1">Pharmacy Name</label>
                <input
                  type="text"
                  required
                  value={pharmacyName}
                  onChange={(e) => setPharmacyName(e.target.value)}
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
                  placeholder="e.g. Nyarugenge Pharmacy Plaza"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 uppercase tracking-wider mb-1">
                    MOH Operating Licence Number
                  </label>
                  <input
                    type="text"
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-mono font-bold"
                    placeholder="e.g. LIC-KIG-82038"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 uppercase tracking-wider mb-1">Pharmacy Category</label>
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
                  >
                    <option value="">Select...</option>
                    <option value="Retail">Retail Pharmacy</option>
                    <option value="Wholesale">Wholesale Pharmacy</option>
                    <option value="Hospital">Hospital Pharmacy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-500 uppercase tracking-wider mb-1">
                  Pharmacy Ownership Style
                </label>
                <select
                  required
                  value={ownershipType}
                  onChange={(e) => setOwnershipType(e.target.value)}
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
                >
                  <option value="">Select...</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Corporation">Corporation / LLC</option>
                </select>
              </div>

              <div className="border-t border-gray-150 pt-3 space-y-3.5">
                <span className="block text-[10px] tracking-wider text-slate-400 uppercase font-black">
                  Store Location Details
                </span>

                <LocationSelector
                  onLocationChange={(location) => {
                    setProvince(location.province)
                    setDistrict(location.district)
                    setSector(location.sector)
                    setCell(location.cell)
                    setVillage(location.village)
                  }}
                  initialLocation={{
                    province: (user?.pharmacy as any)?.province,
                    district: (user?.pharmacy as any)?.district,
                    sector: (user?.pharmacy as any)?.sector,
                    cell: (user?.pharmacy as any)?.cell,
                    village: (user?.pharmacy as any)?.village,
                  }}
                  disabled={isSubmitting}
                  required={true}
                />

                <div>
                  <label className="block text-gray-500 uppercase tracking-wider mb-1">
                    Street / Landmark Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs text-gray-900 font-bold"
                    placeholder="e.g. KN 27 St, Opp. Nyarugenge Market"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-health-primary hover:bg-health-secondary disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Submitting details...</span>
                  </>
                ) : (
                  <>
                    <span>Submit for MOH Approval</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* ── Pending / Rejected review card ───────────────────────────── */
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Application status"
            className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-6 my-6 text-center"
          >
            <div className="flex flex-col items-center space-y-3">
              {isRejected ? (
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full border border-red-200 flex items-center justify-center">
                  <XCircle className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full border border-amber-200 flex items-center justify-center animate-pulse">
                  <Clock className="w-8 h-8" />
                </div>
              )}
              <h2 className="text-base font-black text-gray-900">
                {isRejected ? 'Application Rejected' : 'Application Pending MOH Review'}
              </h2>
              <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto">
                {isRejected
                  ? 'The Ministry of Health could not verify your pharmacy details. Update your information to resubmit your application.'
                  : 'Your pharmacy registry application has been submitted. Ministry of Health officers are reviewing your operating licence and details. Portal sections will unlock once approved.'}
              </p>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-red-800 text-xs text-left">
                <span className="font-semibold block">{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-emerald-800 text-xs text-left">
                <span className="font-semibold block">{formSuccess}</span>
              </div>
            )}

            {!isRejected && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left text-xs font-semibold text-gray-600 space-y-2">
                <span className="block text-[10px] tracking-wider text-slate-400 uppercase font-black mb-1 border-b border-gray-200 pb-1">
                  Submitted Company Profile
                </span>
                <div className="flex justify-between items-center">
                  <span>Store Name:</span>
                  <span className="text-gray-900 font-bold">{user?.pharmacy?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Licence No.:</span>
                  <span className="text-gray-900 font-bold font-mono">{user?.pharmacy?.licenseNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Category:</span>
                  <span className="text-gray-900 font-bold">{user?.pharmacy?.category || 'Retail'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Ownership Type:</span>
                  <span className="text-gray-900 font-bold">
                    {user?.pharmacy?.ownershipType || 'Sole Proprietorship'}
                  </span>
                </div>
                <div className="pt-1 border-t border-gray-150 flex items-start space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500 text-[11px] font-medium leading-tight">
                    {user?.pharmacy?.address}
                  </span>
                </div>
              </div>
            )}

            {isRejected && (
              <button
                type="button"
                onClick={() => {
                  // Prefill the form with existing values for correction
                  setPharmacyName(user?.pharmacy?.name || '')
                  setLicenseNumber(
                    user?.pharmacy?.licenseNumber === 'PENDING' ? '' : user?.pharmacy?.licenseNumber || '',
                  )
                  setCategory(user?.pharmacy?.category || '')
                  setOwnershipType(user?.pharmacy?.ownershipType || '')
                  setFormSuccess(null)
                  setFormError(null)
                  setForceEditForm(true)
                }}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-health-primary hover:bg-health-secondary transition-colors"
              >
                Edit &amp; Resubmit Application
              </button>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleCheckStatus}
                disabled={statusLoading}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-health-primary hover:bg-health-secondary disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {statusLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    <span>Checking Approval Status...</span>
                  </>
                ) : (
                  <span>Refresh Approval Status</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
