import React, { useState } from 'react'
import { RWANDA_LOCATIONS } from '@/utils/rwanda-locations'
import { Users, Search, Plus, X, Check, Eye, Trash2, ShieldAlert, CheckCircle2 } from 'lucide-react'

interface Pharmacy {
  id: string
  name: string
  licenseNumber: string
  province: string
  district: string
  sector: string
  rating: number
  isOpen: boolean
  distance: number
  status: 'Approved' | 'Pending Approval' | 'Suspended'
}

export default function PharmacyRegistry() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([
    { id: 'ph-001', name: 'Kigali National Pharmacy', licenseNumber: 'LIC-KIG-48293-2026', province: 'Kigali City', district: 'Nyarugenge', sector: 'Kiyovu', rating: 4.8, isOpen: true, distance: 1.2, status: 'Approved' },
    { id: 'ph-002', name: 'Remera City Medical', licenseNumber: 'LIC-GAS-90238-2026', province: 'Kigali City', district: 'Gasabo', sector: 'Remera', rating: 4.5, isOpen: true, distance: 2.1, status: 'Approved' },
    { id: 'ph-003', name: 'Nyarugenge Health Pharmacy', licenseNumber: 'LIC-NYA-72819-2026', province: 'Kigali City', district: 'Nyarugenge', sector: 'Muhima', rating: 4.2, isOpen: true, distance: 3.4, status: 'Approved' },
    { id: 'ph-004', name: 'Gikondo District Pharmacy', licenseNumber: 'LIC-KIC-19238-2026', province: 'Kigali City', district: 'Kicukiro', sector: 'Gikondo', rating: 4.0, isOpen: false, distance: 4.5, status: 'Suspended' },
    { id: 'ph-005', name: 'MedPlus Kigali Heights', licenseNumber: 'LIC-GAS-78901-2026', province: 'Kigali City', district: 'Gasabo', sector: 'Kacyiru', rating: 4.9, isOpen: true, distance: 0.8, status: 'Pending Approval' }
  ])

  // Filters
  const [searchVal, setSearchVal] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Register Pharmacy Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [province, setProvince] = useState('Kigali City')
  const [district, setDistrict] = useState('Gasabo')
  const [sector, setSector] = useState('Remera')
  
  // Manager account states
  const [managerName, setManagerName] = useState('')
  const [managerEmail, setManagerEmail] = useState('')
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [generatedCredentials, setGeneratedCredentials] = useState<{ username: string; tempPass: string } | null>(null)
  
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  // Location selector cascading triggers
  const handleProvinceChange = (e: string) => {
    setProvince(e)
    const districts = Object.keys(RWANDA_LOCATIONS[e] || {})
    if (districts.length > 0) {
      setDistrict(districts[0])
      const sectors = Object.keys(RWANDA_LOCATIONS[e]?.[districts[0]] || {})
      if (sectors.length > 0) {
        setSector(sectors[0])
      }
    }
  }

  const handleDistrictChange = (d: string) => {
    setDistrict(d)
    const sectors = Object.keys(RWANDA_LOCATIONS[province]?.[d] || {})
    if (sectors.length > 0) {
      setSector(sectors[0])
    }
  }

  // Save new pharmacy
  const handleRegisterPharmacy = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !licenseNumber || !managerName || !managerEmail) return

    const newPharmId = `ph-00${pharmacies.length + 1}`
    const newPharm: Pharmacy = {
      id: newPharmId,
      name,
      licenseNumber,
      province,
      district,
      sector,
      rating: 5.0,
      isOpen: true,
      distance: 1.5,
      status: 'Approved'
    }

    // Generate credentials
    const cleanEmail = managerEmail.toLowerCase().trim()
    const tempPass = 'ManagerRw2026!'

    // Register Pharmacy Manager mock user account in dynamic users DB
    const dynamicUsersKey = 'epharmacy_registered_users'
    const storedUsers = localStorage.getItem(dynamicUsersKey)
    const usersMap = storedUsers ? JSON.parse(storedUsers) : {}

    const newManagerAccount = {
      id: `usr_man_${Date.now()}`,
      username: cleanEmail,
      email: cleanEmail,
      name: managerName,
      role: 'PHARMACY',
      position: 'Pharmacy Manager',
      permissions: ['MANAGE_INVENTORY', 'UPDATE_PRICING', 'MANAGE_STAFF', 'VIEW_PHARMACY_REPORTS', 'VIEW_RESERVATIONS', 'CONFIRM_RESERVATION', 'DISPENSE_MEDICINE', 'VIEW_INVENTORY'],
      pharmacyId: newPharmId,
      pharmacyName: name,
      firstLogin: true, // Force password reset at first sign in
      passwordHash: tempPass
    }

    usersMap[cleanEmail] = newManagerAccount
    localStorage.setItem(dynamicUsersKey, JSON.stringify(usersMap))

    setPharmacies((prev) => [...prev, newPharm])
    setShowAddModal(false)
    
    // Save to show credentials modal popup
    setGeneratedCredentials({ username: cleanEmail, tempPass })
    setShowCredentialsModal(true)

    triggerToast('New pharmacy store registered and licensed successfully.')
    
    // Clear inputs
    setName('')
    setLicenseNumber('')
    setManagerName('')
    setManagerEmail('')
  }

  // Status updates
  const handleApprove = (id: string) => {
    setPharmacies((prev) => 
      prev.map((p) => p.id === id ? { ...p, status: 'Approved' } : p)
    )
    triggerToast('Pharmacy licence approved.')
  }

  const handleSuspend = (id: string) => {
    setPharmacies((prev) => 
      prev.map((p) => p.id === id ? { ...p, status: 'Suspended' } : p)
    )
    triggerToast('Pharmacy licence suspended.')
  }

  // Filter listings
  const filteredPharmacies = pharmacies.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchVal.toLowerCase()) || 
                          p.licenseNumber.toLowerCase().includes(searchVal.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 relative">
      
      {/* Toast alert popup */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-55 bg-emerald-50 border border-emerald-250 text-emerald-800 px-4.5 py-3 rounded-lg shadow-xl animate-fadeIn flex items-center space-x-2 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Directory table card list */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
        
        <div className="flex justify-between items-center pb-2 border-b border-gray-150">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-black text-gray-900">Pharmacy Registry Console</h3>
          </div>
          <span className="text-xs text-slate-500 font-bold">{filteredPharmacies.length} Total Verified Stores</span>
        </div>

        {/* Filters console and Add store button */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto flex-grow max-w-2xl">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search store name or licence ref key..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-semibold"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-gray-700 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending Approval">Pending Review</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-health-primary hover:bg-health-secondary text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm focus:outline-none"
          >
            <Plus className="w-4 h-4" />
            <span>Register Pharmacy</span>
          </button>
        </div>

        {/* Pharmacies table grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-gray-150">
            <thead>
              <tr className="text-[10px] font-black text-slate-450 uppercase tracking-wider">
                <th className="py-2.5">Store Name</th>
                <th className="py-2.5">Licence Key</th>
                <th className="py-2.5">Province</th>
                <th className="py-2.5">District</th>
                <th className="py-2.5">Sector</th>
                <th className="py-2.5">Rating</th>
                <th className="py-2.5">Licence Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredPharmacies.map((pharm) => (
                <tr key={pharm.id} className="hover:bg-gray-50/50">
                  <td className="py-3 font-bold text-gray-950 flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-650">
                      {pharm.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </span>
                    <span>{pharm.name}</span>
                  </td>
                  <td className="py-3 font-mono text-gray-550 font-bold">{pharm.licenseNumber}</td>
                  <td className="py-3">{pharm.province}</td>
                  <td className="py-3">{pharm.district}</td>
                  <td className="py-3">{pharm.sector}</td>
                  <td className="py-3 font-bold">{pharm.rating} ★</td>
                  <td className="py-3">
                    {pharm.status === 'Approved' ? (
                      <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-250">
                        Approved
                      </span>
                    ) : pharm.status === 'Pending Approval' ? (
                      <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-255">
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <div className="inline-flex space-x-1 justify-end">
                      {pharm.status !== 'Approved' && (
                        <button
                          type="button"
                          onClick={() => handleApprove(pharm.id)}
                          className="border border-emerald-350 hover:bg-emerald-50 text-health-primary font-bold px-2 py-1 rounded text-[10px] transition-colors focus:outline-none"
                        >
                          Approve
                        </button>
                      )}
                      {pharm.status !== 'Suspended' && (
                        <button
                          type="button"
                          onClick={() => handleSuspend(pharm.id)}
                          className="border border-red-300 hover:bg-red-50 text-red-700 font-bold px-2 py-1 rounded text-[10px] transition-colors focus:outline-none"
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add Pharmacy Modal Wizard */}
      {showAddModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center px-4 py-6">
          <div onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-gray-900/50 backdrop-blur-xs" />
          
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-gray-250 shadow-2xl overflow-hidden z-55 flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900">
              <div>
                <h3 className="font-black text-sm">Register New Pharmacy</h3>
                <p className="text-xs text-emerald-300">Grant MOH operating licence keys</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRegisterPharmacy} className="p-6 space-y-4 text-xs font-bold text-gray-700">
              
              <div className="space-y-1.5">
                <label className="block text-gray-400 uppercase tracking-wider text-[10px]">Pharmacy Name</label>
                <input
                  type="text"
                  placeholder="e.g. Nyarugenge Wellness Pharmacy"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-400 uppercase tracking-wider text-[10px]">Licence Reference Number</label>
                <input
                  type="text"
                  placeholder="e.g. LIC-NYA-12893-2026"
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-mono font-bold"
                />
              </div>

              {/* Manager credentials section */}
              <div className="space-y-3 pt-2 border-t border-gray-150">
                <span className="text-[10px] text-gray-450 uppercase block">Assign Pharmacy Manager</span>
                
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-405">Manager Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Marie Grace Ineza"
                      required
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-bold"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-405">Manager Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. manager@remerawellness.rw"
                      required
                      value={managerEmail}
                      onChange={(e) => setManagerEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Location fields */}
              <div className="space-y-3 pt-2 border-t border-gray-150">
                <span className="text-[10px] text-gray-450 uppercase block">Licencing Jurisdiction</span>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-450">Province</label>
                    <select
                      value={province}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-1.5 focus:outline-none text-gray-950 font-bold"
                    >
                      {Object.keys(RWANDA_LOCATIONS).map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-450">District</label>
                    <select
                      value={district}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-1.5 focus:outline-none text-gray-950 font-bold"
                    >
                      {Object.keys(RWANDA_LOCATIONS[province] || {}).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-450">Sector</label>
                    <select
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-1.5 focus:outline-none text-gray-950 font-bold"
                    >
                      {Object.keys(RWANDA_LOCATIONS[province]?.[district] || {}).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-health-primary hover:bg-health-secondary text-white font-bold py-2.5 rounded-lg text-xs transition-colors shadow-sm focus:outline-none mt-2"
              >
                Approve &amp; Activate Licence
              </button>

            </form>

          </div>
        </div>
      )}

      {/* Generated credentials success modal */}
      {showCredentialsModal && generatedCredentials && (
        <div className="fixed inset-0 z-55 flex items-center justify-center px-4 py-6">
          <div onClick={() => setShowCredentialsModal(false)} className="absolute inset-0 bg-gray-900/50 backdrop-blur-xs" />
          
          <div className="relative w-full max-w-sm bg-white rounded-2xl border border-gray-250 shadow-2xl overflow-hidden z-55 flex flex-col">
            
            {/* Header */}
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900">
              <div>
                <h3 className="font-black text-sm">Manager Credentials</h3>
                <p className="text-xs text-emerald-300">Share default logins with the manager</p>
              </div>
              <button onClick={() => setShowCredentialsModal(false)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contents */}
            <div className="p-6 space-y-4 text-xs font-bold text-gray-700">
              <p className="text-gray-500 font-medium leading-normal">
                Pharmacy Manager account created. Give these credentials to the manager to access the **Pharmacy Portal**.
              </p>

              <div className="bg-slate-50 border border-gray-250 p-4 rounded-xl space-y-2.5">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Login Username</span>
                  <span className="text-xs text-gray-950 block font-mono bg-white border border-gray-200 px-2.5 py-1.5 rounded">{generatedCredentials.username}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Temporary Password</span>
                  <span className="text-xs text-gray-950 block font-mono bg-white border border-gray-200 px-2.5 py-1.5 rounded">{generatedCredentials.tempPass}</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-250 text-amber-850 p-3 rounded-lg flex items-start space-x-2 text-[10px] font-medium leading-normal">
                <span>⚠️ The manager will be forced to change this password during their initial login session.</span>
              </div>

              <button
                type="button"
                onClick={() => setShowCredentialsModal(false)}
                className="w-full bg-health-primary hover:bg-health-secondary text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-sm focus:outline-none"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
