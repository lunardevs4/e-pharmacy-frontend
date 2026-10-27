import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { 
  Pill, ArrowLeft, Building2, Tag, ShieldAlert, CheckCircle2, 
  Thermometer, AlertCircle, RefreshCw, MapPin, Store, ChevronRight,
  Info, ShieldCheck, FileText, Clock
} from 'lucide-react'
import { MedicineApi } from '@/services/medicine-api'
import { Medicine, PharmacyStock } from '@/types'

export default function MedicineDetails() {
  const { id: paramId } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const medicineId = paramId || searchParams.get('id')

  const [medicine, setMedicine] = useState<Medicine | null>(null)
  const [pharmacies, setPharmacies] = useState<PharmacyStock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDetails = useCallback(async () => {
    if (!medicineId) {
      setError('No medicine identifier provided. Please select a medicine from search.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. Fetch medicine monograph & details
      const medData = await MedicineApi.getMedicineDetails(medicineId)
      setMedicine(medData)

      // 2. Fetch stock & availability across pharmacies
      try {
        const avail = await MedicineApi.getMedicineAvailability(medicineId)
        setPharmacies(Array.isArray(avail) ? avail : [])
      } catch {
        // Stock availability is optional
        setPharmacies([])
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError('The requested medicine was not found in the national registry.')
      } else {
        setError(err?.response?.data?.message || err?.message || 'Failed to load medicine details. Please check your connection and retry.')
      }
    } finally {
      setLoading(false)
    }
  }, [medicineId])

  useEffect(() => {
    loadDetails()
  }, [loadDetails])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
        <p className="text-sm font-bold text-gray-700">Loading medicine monograph &amp; availability...</p>
      </div>
    )
  }

  if (error || !medicine) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 shadow-xs text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-600 mx-auto" />
        <h2 className="text-lg font-black text-gray-900">Medicine Not Available</h2>
        <p className="text-xs text-gray-500">{error || 'Unable to display medicine details.'}</p>
        <div className="flex justify-center gap-3 pt-2">
          {medicineId && (
            <button
              onClick={loadDetails}
              className="px-4 py-2 bg-health-primary text-white text-xs font-bold rounded-lg hover:bg-health-secondary"
            >
              Retry
            </button>
          )}
          <Link
            to="/patient/search"
            className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Search</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Navigation Breadcrumb / Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to previous page</span>
        </button>
        <Link
          to="/patient/search"
          className="text-xs font-bold text-health-primary hover:underline"
        >
          Search another medicine
        </Link>
      </div>

      {/* Main Header Monograph Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-emerald-50 text-health-primary rounded-2xl flex-shrink-0">
              <Pill className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-gray-950">{medicine.name}</h1>
                {medicine.prescriptionRequired ? (
                  <span className="text-[10px] font-black text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Prescription Required
                  </span>
                ) : (
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Over The Counter (OTC)
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Generic Name: <strong className="text-gray-800">{medicine.genericName || '—'}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {medicine.category && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 font-bold">
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                {medicine.category}
              </span>
            )}
            {medicine.manufacturer && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 font-bold">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                {medicine.manufacturer}
              </span>
            )}
          </div>
        </div>

        {/* Prescription Warning Alert */}
        {medicine.prescriptionRequired && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Doctor Prescription Required for Dispensing</p>
              <p className="mt-0.5 text-amber-800 text-[11px] leading-relaxed">
                Under Rwanda Ministry of Health regulations, this medicine cannot be dispensed without a valid medical prescription verified by a licensed pharmacist. You can upload your prescription before reservation.
              </p>
            </div>
          </div>
        )}

        {/* Monograph Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Clinical Uses &amp; Indications
              </span>
              <p className="text-xs text-gray-800 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-150">
                {medicine.uses && medicine.uses !== 'Not provided' 
                  ? medicine.uses 
                  : 'Prescribed according to professional medical diagnosis. Consult your healthcare provider for indication guidance.'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Dosage &amp; Administration
              </span>
              <p className="text-xs text-gray-800 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-150">
                {medicine.dosage && medicine.dosage !== 'Not provided'
                  ? medicine.dosage
                  : 'Follow specific dosage directions on prescription or packaging. Take strictly as instructed by your doctor or pharmacist.'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Potential Side Effects
              </span>
              <p className="text-xs text-gray-800 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-150">
                {medicine.sideEffects && medicine.sideEffects !== 'Not provided'
                  ? medicine.sideEffects
                  : 'Inform your doctor if you experience adverse symptoms or unexpected allergic reactions while taking this medication.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Precautions &amp; Warnings
              </span>
              <p className="text-xs text-gray-800 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-150">
                {medicine.warnings && medicine.warnings !== 'Not provided'
                  ? medicine.warnings
                  : 'Keep out of reach of children. Disclose any pre-existing chronic conditions or pregnancy to your pharmacist.'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Storage &amp; Cold Chain Requirements
              </span>
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-150 text-xs text-gray-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold">Conditions:</span>
                  <span>{medicine.storage || 'Store in a cool, dry place away from direct sunlight'}</span>
                </div>
                {(medicine.minTemperature != null || medicine.maxTemperature != null) && (
                  <p className="text-gray-600 text-[11px] pl-6">
                    Temperature Range: {medicine.minTemperature ?? 'N/A'}°C to {medicine.maxTemperature ?? 'N/A'}°C
                  </p>
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Drug Interactions
              </span>
              <p className="text-xs text-gray-800 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-150">
                {medicine.interactions && medicine.interactions !== 'Not provided'
                  ? medicine.interactions
                  : 'Consult your physician before combining with other over-the-counter drugs, herbal supplements, or alcohol.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pharmacy Stock & Availability Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <Store className="w-5 h-5 text-health-primary" />
            <div>
              <h2 className="text-base font-black text-gray-900">Community Pharmacy Stock</h2>
              <p className="text-xs text-gray-500">Live verified inventory across licensed pharmacies in Rwanda</p>
            </div>
          </div>
          <span className="text-xs font-bold text-gray-500">
            {pharmacies.length} {pharmacies.length === 1 ? 'pharmacy' : 'pharmacies'} stocking
          </span>
        </div>

        {pharmacies.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs text-gray-500 font-medium">
              No pharmacies are currently reporting live digital inventory for this medicine.
            </p>
            <Link
              to={`/patient/search?query=${encodeURIComponent(medicine.name)}`}
              className="text-xs font-bold text-health-primary hover:underline inline-block"
            >
              Search alternative pharmacies or generic equivalents
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pharmacies.map((pharm) => (
              <div key={pharm.pharmacyId} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-gray-900">{pharm.pharmacyName}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{pharm.locationText || 'Kigali, Rwanda'}</span>
                    {pharm.distance != null && <span>· {pharm.distance} km</span>}
                  </p>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-700 block">
                      RWF {Number(pharm.price).toLocaleString()}
                    </span>
                    <span className={`text-[10px] font-bold ${pharm.stock > 5 ? 'text-gray-500' : 'text-amber-600'}`}>
                      {pharm.stock > 0 ? `${pharm.stock} units in stock` : 'Out of stock'}
                    </span>
                  </div>

                  <Link
                    to={`/patient/search?query=${encodeURIComponent(medicine.name)}`}
                    className="px-4 py-2 bg-health-primary hover:bg-health-secondary text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    <span>Reserve</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
