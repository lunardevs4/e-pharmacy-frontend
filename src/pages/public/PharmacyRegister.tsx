import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from '@/layouts/AuthLayout'
import { RWANDA_LOCATIONS } from '@/utils/rwanda-locations'
import { AuthApi } from '@/services/auth-api'
import { 
  AlertCircle, CheckCircle2, Loader2, ArrowRight, ArrowLeft, 
  MapPin, Eye, EyeOff, User, CreditCard, Mail, Lock, Check, 
  Briefcase, FileText, UploadCloud, Trash2, Smartphone, ShieldCheck
} from 'lucide-react'

type RegStep = 1 | 2 | 3 | 4 | 5

interface UploadedFile {
  name: string
  fileType: string
  fileSize: number
  progress: number
  error?: string
}

export default function PharmacyRegister() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<RegStep>(1)

  // Step 1 States (Pharmacy Details)
  const [pharmacyName, setPharmacyName] = useState('')
  const [tradingName, setTradingName] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState('')
  const [tin, setTin] = useState('')
  const [category, setCategory] = useState('')
  const [ownershipType, setOwnershipType] = useState('')

  // Step 2 States (Contact Information)
  const [officialEmail, setOfficialEmail] = useState('')
  const [officialPhone, setOfficialPhone] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Step 3 States (Location)
  const [province, setProvince] = useState('')
  const [district, setDistrict] = useState('')
  const [sector, setSector] = useState('')
  const [cell, setCell] = useState('')
  const [village, setVillage] = useState('')
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)

  // Step 4 States (Responsible Pharmacist)
  const [pharmacistName, setPharmacistName] = useState('')
  const [pharmacistNid, setPharmacistNid] = useState('')
  const [pharmacistLicense, setPharmacistLicense] = useState('')
  const [pharmacistPhone, setPharmacistPhone] = useState('')
  const [pharmacistEmail, setPharmacistEmail] = useState('')

  // Step 5 States (Documents)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile>>({})
  const [acceptDeclaration, setAcceptDeclaration] = useState(false)

  // Feedback states
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Password criteria checks
  const passwordCriteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  }
  const meetsAllCriteria = Object.values(passwordCriteria).every(Boolean)

  const provincesList = Object.keys(RWANDA_LOCATIONS)
  const districtsList = province ? Object.keys(RWANDA_LOCATIONS[province] || {}) : []
  const sectorsList = (province && district) ? Object.keys(RWANDA_LOCATIONS[province][district] || {}) : []
  const cellsList = (province && district && sector) ? Object.keys(RWANDA_LOCATIONS[province][district][sector] || {}) : []
  const villagesList = (province && district && sector && cell) ? (RWANDA_LOCATIONS[province][district][sector][cell] || []) : []

  // Document keys to collect
  const documentKeys = [
    { key: 'pharmacyLicense', label: 'Pharmacy Operating License (MoH)' },
    { key: 'businessReg', label: 'Business Registration Certificate (RDB)' },
    { key: 'pharmacistLicense', label: 'Responsible Pharmacist Professional License' },
    { key: 'taxCertificate', label: 'RRA Tax Clearance Certificate' }
  ]

  // File validator helper
  const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
    const maxSize = 10 * 1024 * 1024 // 10MB

    const newFile: UploadedFile = {
      name: file.name,
      fileType: file.type,
      fileSize: file.size,
      progress: 0
    }

    if (!allowedTypes.includes(file.type)) {
      newFile.error = 'Unsupported format. Please upload PDF, PNG, or JPG only.'
      setUploadedFiles(prev => ({ ...prev, [key]: newFile }))
      return
    }

    if (file.size > maxSize) {
      newFile.error = 'File exceeds maximum size of 10MB.'
      setUploadedFiles(prev => ({ ...prev, [key]: newFile }))
      return
    }

    // Set uploading state and simulate progress bar
    setUploadedFiles(prev => ({ ...prev, [key]: newFile }))

    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadedFiles(prev => {
        if (!prev[key]) {
          clearInterval(interval)
          return prev
        }
        return {
          ...prev,
          [key]: { ...prev[key], progress: Math.min(progress, 100) }
        }
      })
      if (progress >= 100) clearInterval(interval)
    }, 150)
  }

  const deleteFile = (key: string) => {
    setUploadedFiles(prev => {
      const updated = { ...prev }
      delete updated[key]
      return updated
    })
  }

  // GPS lookup
  const handleGpsLookup = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.')
      return
    }

    setGpsLoading(true)
    setErrorMsg(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGpsLoading(false)
      },
      () => {
        setErrorMsg('Failed to determine location. Please verify GPS permissions.')
        setGpsLoading(false)
      },
      { timeout: 10000 }
    )
  }

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    setErrorMsg(null)
    if (!pharmacyName.trim() || pharmacyName.trim().length < 3) {
      setErrorMsg('Pharmacy Name is required (minimum 3 characters).')
      return false
    }
    if (!licenseNumber.trim()) {
      setErrorMsg('Pharmacy License Number is required.')
      return false
    }
    if (!businessRegistrationNumber.trim()) {
      setErrorMsg('Business Registration Number (RDB) is required.')
      return false
    }
    if (!tin.trim() || tin.trim().length < 9) {
      setErrorMsg('A valid Tax Identification Number (TIN) is required.')
      return false
    }
    if (!category) {
      setErrorMsg('Please select your pharmacy category.')
      return false
    }
    if (!ownershipType) {
      setErrorMsg('Please select your ownership type.')
      return false
    }
    return true
  }

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    setErrorMsg(null)
    if (!officialEmail.trim() || !officialEmail.includes('@')) {
      setErrorMsg('Official Email address is required.')
      return false
    }
    if (!officialPhone.trim()) {
      setErrorMsg('Official Phone number is required.')
      return false
    }
    if (!username.trim() || username.trim().length < 4) {
      setErrorMsg('Username must be at least 4 characters long.')
      return false
    }
    if (!meetsAllCriteria) {
      setErrorMsg('Password does not meet the safety requirements.')
      return false
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return false
    }
    return true
  }

  // Step 3 Validation
  const validateStep3 = (): boolean => {
    setErrorMsg(null)
    if (!province || !district || !sector || !cell || !village) {
      setErrorMsg('Please complete all administrative location selectors.')
      return false
    }
    return true
  }

  // Step 4 Validation
  const validateStep4 = (): boolean => {
    setErrorMsg(null)
    if (!pharmacistName.trim()) {
      setErrorMsg('Responsible Pharmacist Full Name is required.')
      return false
    }
    if (!pharmacistNid || !/^\d{16}$/.test(pharmacistNid)) {
      setErrorMsg('Pharmacist National ID must be exactly 16 numeric digits.')
      return false
    }
    if (!pharmacistLicense.trim()) {
      setErrorMsg('Pharmacist Professional License Number is required.')
      return false
    }
    if (!pharmacistPhone.trim()) {
      setErrorMsg('Pharmacist Phone number is required.')
      return false
    }
    if (!pharmacistEmail.trim() || !pharmacistEmail.includes('@')) {
      setErrorMsg('Pharmacist Email address is required.')
      return false
    }
    return true
  }

  // Step 5 Validation
  const validateStep5 = (): boolean => {
    setErrorMsg(null)
    for (const doc of documentKeys) {
      const file = uploadedFiles[doc.key]
      if (!file) {
        setErrorMsg(`Please upload: ${doc.label}.`)
        return false
      }
      if (file.error) {
        setErrorMsg(`Invalid file for: ${doc.label}. ${file.error}`)
        return false
      }
      if (file.progress < 100) {
        setErrorMsg(`File upload is still processing: ${doc.label}.`)
        return false
      }
    }
    if (!acceptDeclaration) {
      setErrorMsg('You must certify the declaration before submission.')
      return false
    }
    return true
  }

  const goNext = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2)
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3)
    else if (currentStep === 3 && validateStep3()) setCurrentStep(4)
    else if (currentStep === 4 && validateStep4()) setCurrentStep(5)
  }

  const goBack = () => {
    setErrorMsg(null)
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as RegStep)
    }
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep5()) return

    setIsLoading(true)
    setErrorMsg(null)

    // Convert dynamic document list into API expected structure
    const documents = documentKeys.map((doc) => ({
      name: uploadedFiles[doc.key].name,
      fileType: uploadedFiles[doc.key].fileType,
      fileSize: uploadedFiles[doc.key].fileSize
    }))

    try {
      await AuthApi.registerPharmacy({
        pharmacyName,
        tradingName: tradingName || undefined,
        licenseNumber,
        businessRegistrationNumber,
        tin,
        category,
        ownershipType,
        officialEmail,
        officialPhone,
        username,
        passwordHash: password,
        province,
        district,
        sector,
        cell,
        village,
        gpsCoords,
        pharmacistName,
        pharmacistNid,
        pharmacistLicense,
        pharmacistPhone,
        pharmacistEmail,
        documents
      })

      setSuccessMsg('Pharmacy onboarding application submitted successfully!')
      setTimeout(() => {
        navigate('/login')
      }, 2500)
    } catch (err: any) {
      setErrorMsg(err.message || 'Onboarding failed. Please review credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="Pharmacy Onboarding" subtitle="MOH National Registry portal for professional pharmacy registration.">
      
      {/* Step Stepper */}
      <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-[10px] font-bold text-gray-500 max-w-lg mx-auto">
        {[
          { step: 1, label: 'Details' },
          { step: 2, label: 'Account' },
          { step: 3, label: 'Location' },
          { step: 4, label: 'Pharmacist' },
          { step: 5, label: 'Documents' }
        ].map((s) => (
          <div key={s.step} className="flex items-center space-x-1">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border transition-all ${
              currentStep === s.step
                ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                : currentStep > s.step
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-white border-gray-300 text-gray-400'
            }`}>
              {currentStep > s.step ? '✓' : s.step}
            </div>
            <span className={currentStep === s.step ? 'text-slate-900 font-extrabold' : 'text-gray-400'}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-red-800 text-xs mb-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-250 rounded-lg p-3 flex items-start space-x-2 text-emerald-805 text-xs mb-4">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Step 1: Pharmacy Details */}
      {currentStep === 1 && (
        <div className="space-y-4 text-xs font-bold text-gray-700">
          <div>
            <label className="block text-gray-500 uppercase tracking-wider mb-1">Pharmacy Name</label>
            <input
              type="text"
              required
              value={pharmacyName}
              onChange={(e) => setPharmacyName(e.target.value)}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
              placeholder="e.g. Gasabo Wellness Pharmacy"
            />
          </div>

          <div>
            <label className="block text-gray-500 uppercase tracking-wider mb-1">Trading Name (Optional)</label>
            <input
              type="text"
              value={tradingName}
              onChange={(e) => setTradingName(e.target.value)}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
              placeholder="e.g. Gasabo Pharma"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 uppercase tracking-wider mb-1">MoH License Number</label>
              <input
                type="text"
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-mono font-bold"
                placeholder="e.g. LIC-GAS-82038"
              />
            </div>

            <div>
              <label className="block text-gray-500 uppercase tracking-wider mb-1">RDB Business Reg Number</label>
              <input
                type="text"
                required
                value={businessRegistrationNumber}
                onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-mono font-bold"
                placeholder="e.g. RDB-82938290"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-500 uppercase tracking-wider mb-1">Tax Identification Number (TIN)</label>
            <input
              type="text"
              required
              maxLength={12}
              value={tin}
              onChange={(e) => setTin(e.target.value.replace(/\D/g, ''))}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-mono font-bold"
              placeholder="9-digit TIN"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label className="block text-gray-500 uppercase tracking-wider mb-1">Ownership Type</label>
              <select
                required
                value={ownershipType}
                onChange={(e) => setOwnershipType(e.target.value)}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
              >
                <option value="">Select...</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="Partnership">Partnership</option>
                <option value="Corporation">Corporation / Limited Liability</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={goNext}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-health-primary hover:bg-health-secondary transition-colors mt-2"
          >
            <span>Continue to Contact Info</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      )}

      {/* Step 2: Contact Information */}
      {currentStep === 2 && (
        <div className="space-y-4 text-xs font-bold text-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 uppercase tracking-wider mb-1">Official Email</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={officialEmail}
                  onChange={(e) => setOfficialEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
                  placeholder="e.g. contact@pharma.rw"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-500 uppercase tracking-wider mb-1">Official Phone</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Smartphone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={officialPhone}
                  onChange={(e) => setOfficialPhone(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
                  placeholder="Official hotline"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-150">
            <label className="block text-gray-500 uppercase tracking-wider mb-1">Portal Login Username</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
                placeholder="e.g. remera_pharma"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-500 uppercase tracking-wider mb-1">Portal Password</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-650"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Validation Checklist */}
            <div className="mt-3 bg-gray-50 border border-gray-250 p-3 rounded-lg text-xs space-y-1.5 font-medium text-gray-600">
              <span className="font-bold text-gray-700 block mb-1">Password Requirements:</span>
              <div className="flex items-center space-x-2">
                <span className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.length ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className={passwordCriteria.length ? 'text-emerald-805 font-bold' : 'text-gray-500'}>Minimum 8 characters</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.uppercase ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className={passwordCriteria.uppercase ? 'text-emerald-805 font-bold' : 'text-gray-500'}>At least one uppercase letter</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.lowercase ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className={passwordCriteria.lowercase ? 'text-emerald-805 font-bold' : 'text-gray-500'}>At least one lowercase letter</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.number ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className={passwordCriteria.number ? 'text-emerald-805 font-bold' : 'text-gray-500'}>At least one number</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.special ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className={passwordCriteria.special ? 'text-emerald-850 font-bold' : 'text-gray-500'}>At least one special character (@$!%*?&)</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-500 uppercase tracking-wider mb-1">Confirm Password</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
                placeholder="••••••••"
              />
            </div>
            {password && confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-xs text-red-655 font-bold">Passwords do not match.</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={goBack}
              className="w-1/3 flex items-center justify-center py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-655 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={goNext}
              className="w-2/3 flex items-center justify-center py-2.5 text-white bg-health-primary hover:bg-health-secondary rounded-lg text-sm font-bold shadow-sm transition-colors"
            >
              <span>Continue to Location</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Location */}
      {currentStep === 3 && (
        <div className="space-y-4 text-xs font-bold text-gray-700">
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-health-primary mt-0.5 flex-shrink-0" />
            <div className="text-xs text-emerald-805 leading-normal font-medium">
              <span className="font-bold block mb-0.5">Physical Store Location</span>
              Must map exactly to your licensed pharmaceutical location in the national land management system.
            </div>
          </div>

          <div>
            <label className="block text-gray-500 uppercase tracking-wider mb-1">Province</label>
            <select
              value={province}
              onChange={(e) => {
                setProvince(e.target.value)
                setDistrict('')
                setSector('')
                setCell('')
                setVillage('')
              }}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
            >
              <option value="">Select Province...</option>
              {provincesList.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-500 uppercase tracking-wider mb-1">District</label>
            <select
              disabled={!province}
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value)
                setSector('')
                setCell('')
                setVillage('')
              }}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 disabled:opacity-50 font-bold"
            >
              <option value="">Select District...</option>
              {districtsList.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-500 uppercase tracking-wider mb-1">Sector</label>
            <select
              disabled={!district}
              value={sector}
              onChange={(e) => {
                setSector(e.target.value)
                setCell('')
                setVillage('')
              }}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 disabled:opacity-50 font-bold"
            >
              <option value="">Select Sector...</option>
              {sectorsList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-500 uppercase tracking-wider mb-1">Cell</label>
            <select
              disabled={!sector}
              value={cell}
              onChange={(e) => {
                setCell(e.target.value)
                setVillage('')
              }}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 disabled:opacity-50 font-bold"
            >
              <option value="">Select Cell...</option>
              {cellsList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-500 uppercase tracking-wider mb-1">Village</label>
            <select
              disabled={!cell}
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 disabled:opacity-50 font-bold"
            >
              <option value="">Select Village...</option>
              {villagesList.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div className="pt-2 border-t border-gray-150">
            <button
              type="button"
              onClick={handleGpsLookup}
              disabled={gpsLoading}
              className="w-full flex items-center justify-center py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 focus:outline-none transition-colors"
            >
              {gpsLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-emerald-650" />
                  <span>Loading GPS coordinates...</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2 text-emerald-650" />
                  <span>{gpsCoords ? 'GPS Captured successfully' : 'Detect Store Coordinates (Optional)'}</span>
                </>
              )}
            </button>
            {gpsCoords && (
              <p className="mt-1 text-center text-[10px] text-emerald-705 font-bold">
                Captured: {gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={goBack}
              className="w-1/3 flex items-center justify-center py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-655 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={goNext}
              className="w-2/3 flex items-center justify-center py-2.5 text-white bg-health-primary hover:bg-health-secondary rounded-lg text-sm font-bold shadow-sm transition-colors"
            >
              <span>Continue to Pharmacist</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Responsible Pharmacist */}
      {currentStep === 4 && (
        <div className="space-y-4 text-xs font-bold text-gray-700">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800 leading-normal font-medium font-sans">
              <span className="font-bold block mb-0.5">Clinical Superintendent Licensing</span>
              The pharmacist in charge must have an active license with the National Pharmacy Council of Rwanda.
            </div>
          </div>

          <div>
            <label className="block text-gray-500 uppercase tracking-wider mb-1">Pharmacist Full Name</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={pharmacistName}
                onChange={(e) => setPharmacistName(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
                placeholder="e.g. Dr. Mugisha Olivier"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-500 uppercase tracking-wider mb-1">National ID (NID)</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                required
                maxLength={16}
                value={pharmacistNid}
                onChange={(e) => setPharmacistNid(e.target.value.replace(/\D/g, ''))}
                className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-mono font-bold"
                placeholder="16-digit Rwandan ID"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-500 uppercase tracking-wider mb-1">Pharmacist Council License Number</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Briefcase className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={pharmacistLicense}
                onChange={(e) => setPharmacistLicense(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-mono font-bold"
                placeholder="e.g. NPC/PH/2026/092"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 uppercase tracking-wider mb-1">Official Phone</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Smartphone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={pharmacistPhone}
                  onChange={(e) => setPharmacistPhone(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
                  placeholder="07XXXXXXXX"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-500 uppercase tracking-wider mb-1">Official Email</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={pharmacistEmail}
                  onChange={(e) => setPharmacistEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
                  placeholder="e.g. pharmacist@gmail.com"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={goBack}
              className="w-1/3 flex items-center justify-center py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-655 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={goNext}
              className="w-2/3 flex items-center justify-center py-2.5 text-white bg-health-primary hover:bg-health-secondary rounded-lg text-sm font-bold shadow-sm transition-colors"
            >
              <span>Continue to Documents</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Document Uploads */}
      {currentStep === 5 && (
        <form onSubmit={handleFinalSubmit} className="space-y-5 text-xs font-bold text-gray-700">
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex items-start space-x-3">
            <FileText className="w-5 h-5 text-health-primary mt-0.5 flex-shrink-0" />
            <div className="text-xs text-emerald-805 leading-normal font-medium">
              <span className="font-bold block mb-0.5">Certificates Auditing</span>
              Supported extensions: **PDF, PNG, JPG** (max **10MB** per file). Upload progress is shown below each field.
            </div>
          </div>

          <div className="space-y-4">
            {documentKeys.map((doc) => {
              const file = uploadedFiles[doc.key]
              return (
                <div key={doc.key} className="border border-gray-200 rounded-xl p-4 bg-white shadow-xs">
                  <div className="flex justify-between items-start mb-2">
                    <span className="block text-gray-700 font-bold">{doc.label}</span>
                    {file && (
                      <button
                        type="button"
                        onClick={() => deleteFile(doc.key)}
                        className="text-red-500 hover:text-red-750 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {!file ? (
                    <label className="flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-health-primary hover:bg-emerald-50/20 rounded-lg p-4 cursor-pointer transition-all">
                      <div className="text-center">
                        <UploadCloud className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
                        <span className="text-[11px] text-gray-500 block font-semibold">Select document file</span>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => handleFileChange(doc.key, e)}
                      />
                    </label>
                  ) : (
                    <div className="space-y-1.5 font-semibold">
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span className="truncate max-w-[200px] block text-gray-850 font-bold">{file.name}</span>
                        <span>{(file.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                      
                      {file.error ? (
                        <p className="text-red-550 text-[10px] font-bold">⚠️ {file.error}</p>
                      ) : (
                        <div className="space-y-1">
                          <div className="w-full bg-gray-150 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-health-primary h-full transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-emerald-700 block font-bold">
                            {file.progress < 100 ? `Uploading: ${file.progress}%` : 'Upload complete'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex items-start pt-3 border-t border-gray-150 font-medium text-gray-650">
            <input
              id="declaration"
              type="checkbox"
              required
              checked={acceptDeclaration}
              onChange={(e) => setAcceptDeclaration(e.target.checked)}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded mt-0.5 cursor-pointer"
            />
            <label htmlFor="declaration" className="ml-2 block text-xs text-gray-650 leading-normal cursor-pointer">
              I hereby certify that all information and uploaded documents provided in this application are genuine, correct, and represent the official credentials of the operating pharmacy under Rwandan MoH laws.
            </label>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={goBack}
              className="w-1/3 flex items-center justify-center py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-655 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </button>
            <button
              type="submit"
              disabled={isLoading || !acceptDeclaration}
              className="w-2/3 flex items-center justify-center py-2.5 text-white bg-health-primary hover:bg-health-secondary rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  <span>Submitting Onboarding...</span>
                </>
              ) : (
                <span>Submit Application</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Footer Link */}
      <div className="text-center text-xs mt-6 pt-4 border-t border-gray-150">
        <span className="text-gray-500 font-semibold">Already registered? </span>
        <Link to="/login" className="font-bold text-health-primary hover:underline">
          Sign In
        </Link>
      </div>
    </AuthLayout>
  )
}
