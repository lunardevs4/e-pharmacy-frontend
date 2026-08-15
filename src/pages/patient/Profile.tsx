import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { AuthApi } from '@/services/auth-api'
import { validateEmail } from '@/utils/validation'
import PasswordStrengthMeter from '@/components/patient/PasswordStrengthMeter'
import LocationSelector from '@/components/LocationSelector'
import { User, Shield, Key, Eye, EyeOff, Save, RefreshCw, CheckCircle, AlertCircle, Camera } from 'lucide-react'

export default function PatientProfile() {
  const { user, updateProfile } = useAuthStore()

  // Profile forms states
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [nid] = useState(user?.nid || '1199580048123984') // Read-only National ID
  const [insuranceProvider, setInsuranceProvider] = useState(user?.insuranceProvider || 'RSSB')
  
  // Cascading location states
  const [province, setProvince] = useState(user?.province || '')
  const [district, setDistrict] = useState(user?.district || '')
  const [sector, setSector] = useState(user?.sector || '')
  const [cell, setCell] = useState(user?.cell || '')
  const [village, setVillage] = useState(user?.village || '')
  
  // Extra fields
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || '')
  const [preferredPharmacy, setPreferredPharmacy] = useState(user?.preferredPharmacy || 'Kigali National Pharmacy')
  const [medicalNotes, setMedicalNotes] = useState(user?.medicalNotes || '')
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '')

  // Security password states
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  
  // Status states
  const [profileLoading, setProfileLoading] = useState(false)
  const [securityLoading, setSecurityLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Unsaved changes check helper
  const hasUnsavedChanges = 
    name !== (user?.name || '') ||
    email !== (user?.email || '') ||
    phone !== (user?.phone || '') ||
    insuranceProvider !== (user?.insuranceProvider || '') ||
    province !== (user?.province || '') ||
    district !== (user?.district || '') ||
    sector !== (user?.sector || '') ||
    cell !== (user?.cell || '') ||
    village !== (user?.village || '') ||
    emergencyContact !== (user?.emergencyContact || '') ||
    preferredPharmacy !== (user?.preferredPharmacy || '') ||
    medicalNotes !== (user?.medicalNotes || '') ||
    profilePhoto !== (user?.profilePhoto || '')

  // Display timed status toasts
  const triggerToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text })
    setTimeout(() => setToastMsg(null), 3000)
  }

  // Location selector triggers
  const handleProvinceChange = (e: string) => {
    setProvince(e)
  }

  const handleDistrictChange = (d: string) => {
    setDistrict(d)
  }

  const handleSectorChange = (s: string) => {
    setSector(s)
  }

  const handleCellChange = (c: string) => {
    setCell(c)
  }

  const handleVillageChange = (v: string) => {
    setVillage(v)
  }

  // Handle saving demographic profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      triggerToast('error', emailValidation.error || 'Please enter a valid email address.')
      return
    }
    
    setProfileLoading(true)
    try {
      const updated = await AuthApi.updateProfile(user?.username || 'patient', {
        firstName: name,
        email,
        phone,
        insuranceProvider,
        province,
        district,
        sector,
        cell,
        village,
        emergencyContact,
        preferredPharmacy,
        medicalNotes
      })
      updateProfile(updated)
      triggerToast('success', 'Profile updated successfully!')
    } catch (err: any) {
      triggerToast('error', err.message || 'Failed to update profile.')
    } finally {
      setProfileLoading(false)
    }
  }

  // Handle password submission logic
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPass !== confirmPass) {
      triggerToast('error', 'New passwords do not match.')
      return
    }
    if (newPass.length < 8) {
      triggerToast('error', 'Password must satisfy security length constraints.')
      return
    }

    setSecurityLoading(true)
    try {
      await AuthApi.changePassword(user?.username || 'patient', currentPass, newPass)
      
      // Seed security log action to Notification logs too
      const notKey = 'epharmacy_notifications_mock'
      const rawNot = localStorage.getItem(notKey)
      const list = rawNot ? JSON.parse(rawNot) : []
      const newAlert = {
        id: `not-${Math.random().toString(36).substring(2, 9)}`,
        title: 'Password Changed',
        message: 'Your portal login password was changed successfully.',
        type: 'SECURITY',
        read: false,
        createdAt: new Date().toISOString()
      }
      localStorage.setItem(notKey, JSON.stringify([newAlert, ...list]))

      triggerToast('success', 'Password updated successfully!')
      setCurrentPass('')
      setNewPass('')
      setConfirmPass('')
    } catch (err: any) {
      triggerToast('error', err.message || 'Change password failed.')
    } finally {
      setSecurityLoading(false)
    }
  }

  // Simulate Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      try {
        const res = await AuthApi.uploadProfilePhoto(file)
        setProfilePhoto(res.profilePhoto)
        triggerToast('success', 'Photo pre-loaded successfully! Save profile to persist changes.')
      } catch (err: any) {
        triggerToast('error', 'Failed to upload photo.')
      }
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 relative">
      
      {/* Toast popup */}
      {toastMsg && (
        <div className={`fixed top-20 right-6 z-55 flex items-center space-x-2 px-4.5 py-3 rounded-lg border shadow-xl animate-fadeIn ${
          toastMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-250' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-xs font-bold">{toastMsg.text}</span>
        </div>
      )}

      {/* Unsaved changes alert top status banner */}
      {hasUnsavedChanges && (
        <div className="bg-amber-50 border border-amber-250 text-amber-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs animate-fadeIn shadow-xs">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-700" />
            <span className="font-bold">You have unsaved changes in your profile. Click Save below to persist.</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Health Profile Form (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile} className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-gray-150 gap-4">
              <div className="flex items-center space-x-4">
                {/* Photo Selector */}
                <div className="relative w-16 h-16 rounded-full bg-slate-100 flex-shrink-0 group overflow-hidden border border-gray-250">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-xl text-slate-550">
                      {name[0] || 'P'}
                    </div>
                  )}
                  <label className="absolute inset-0 bg-gray-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                    <Camera className="w-5 h-5" />
                    <input type="file" onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                  </label>
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900">{name || 'Patient Profile'}</h2>
                  <p className="text-[11px] text-gray-400 font-bold uppercase mt-0.5">National ID Registered</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={profileLoading || !hasUnsavedChanges}
                className="bg-health-primary hover:bg-health-secondary text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
              >
                {profileLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Profile</span>
              </button>
            </div>

            {/* Core demographics grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
              
              <div className="space-y-1.5">
                <label className="block text-gray-400 uppercase tracking-wider text-[10px]">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-gray-950 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-400 uppercase tracking-wider text-[10px]">National ID (Read-only)</label>
                <input
                  type="text"
                  readOnly
                  value={nid}
                  className="w-full bg-gray-100 border border-gray-250 rounded-lg px-3 py-2 text-gray-450 font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-400 uppercase tracking-wider text-[10px]">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-gray-950 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-400 uppercase tracking-wider text-[10px]">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-gray-950 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-400 uppercase tracking-wider text-[10px]">Insurance Provider</label>
                <select
                  value={insuranceProvider}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-2 text-gray-950 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="None">Private Patient</option>
                  <option value="RSSB">Mutuelle de Santé (RSSB)</option>
                  <option value="MMI">Military Medical Insurance (MMI)</option>
                  <option value="SANLAM">SANLAM Healthcare</option>
                  <option value="Radiant">Radiant Insurance</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-400 uppercase tracking-wider text-[10px]">Preferred Pharmacy</label>
                <select
                  value={preferredPharmacy}
                  onChange={(e) => setPreferredPharmacy(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-2 text-gray-950 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Kigali National Pharmacy">Kigali National Pharmacy</option>
                  <option value="Remera City Medical">Remera City Medical</option>
                  <option value="Nyarugenge Health Pharmacy">Nyarugenge Health Pharmacy</option>
                  <option value="Gikondo District Pharmacy">Gikondo District Pharmacy</option>
                  <option value="MedPlus Kigali Heights">MedPlus Kigali Heights</option>
                </select>
              </div>

            </div>

            {/* Cascading Location Selectors */}
            <div className="space-y-3.5 pt-2 border-t border-gray-150">
              <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Demographic Location details</span>
              
              <LocationSelector
                onLocationChange={(location) => {
                  setProvince(location.province)
                  setDistrict(location.district)
                  setSector(location.sector)
                  setCell(location.cell)
                  setVillage(location.village)
                }}
                initialLocation={{
                  province: (user as any)?.province,
                  district: (user as any)?.district,
                  sector: (user as any)?.sector,
                  cell: (user as any)?.cell,
                  village: (user as any)?.village,
                }}
                disabled={profileLoading}
                required={true}
              />
            </div>

            {/* Extra details */}
            <div className="space-y-4 pt-2 border-t border-gray-150 text-xs font-bold text-gray-700">
              
              <div className="space-y-1.5">
                <label className="block text-gray-400 uppercase tracking-wider text-[10px]">Emergency Contact (Name &amp; Phone)</label>
                <input
                  type="text"
                  placeholder="e.g. Marie Habimana (+250 788 000 111)"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-gray-950 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-400 uppercase tracking-wider text-[10px]">Medical Notes &amp; Allergies (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Enter chronic diseases, drug allergies, or other warnings for the pharmacist..."
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-gray-950 font-bold leading-normal"
                />
              </div>

            </div>

          </form>
        </div>

        {/* Right Column: Security Section (1/3 width) */}
        <div className="space-y-6">
          <form onSubmit={handleSavePassword} className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-150 text-gray-900">
              <Shield className="w-5 h-5 text-health-primary" />
              <h3 className="font-black text-sm">Security &amp; Password</h3>
            </div>

            <div className="space-y-3.5 text-xs font-bold text-gray-700">
              
              <div className="space-y-1.5">
                <label className="block text-gray-400 uppercase tracking-wider text-[10px]">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    required
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-3 pr-9 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-gray-950 font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-2.5 text-gray-450 hover:text-gray-700"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-400 uppercase tracking-wider text-[10px]">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-3 pr-9 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-gray-950 font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-2.5 text-gray-450 hover:text-gray-700"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-400 uppercase tracking-wider text-[10px]">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-gray-950 font-bold"
                />
              </div>

              {/* Strength Meter widget */}
              <PasswordStrengthMeter pass={newPass} />

              <button
                type="submit"
                disabled={securityLoading || !currentPass || !newPass || !confirmPass}
                className="w-full bg-health-primary hover:bg-health-secondary text-white font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm disabled:opacity-50 mt-2 focus:outline-none"
              >
                {securityLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                <span>Change Password</span>
              </button>

            </div>

          </form>
        </div>

      </div>

    </div>
  )
}
