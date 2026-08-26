import React, { useState, useEffect } from 'react'
import { Plus, Search, Shield, X, Check, Key, ClipboardList, Info, HelpCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { validateEmail } from '@/utils/validation'
import { AuthApi } from '@/services/auth-api'
import { PharmacyApi } from '@/services/pharmacy-api'

interface Employee {
  id: string
  name: string
  role: 'Pharmacy Owner' | 'Pharmacy Manager' | 'Pharmacist' | 'Inventory Officer' | 'Cashier'
  email: string
  phone: string
  status: 'Active' | 'Inactive'
  lastLogin: string
}

export default function StaffManagement() {
  const { user } = useAuthStore()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const pharmacyId = user?.pharmacy?.id || user?.pharmacyId
    if (!pharmacyId) return
    PharmacyApi.getDetails(pharmacyId).then((pharmacy: any) => {
      const rows = (pharmacy.employees || []).map((employee: any) => {
        const account = employee.user || {}
        const roleMap: Record<string, Employee['role']> = { PHARMACIST: 'Pharmacist', PHARMACY_OWNER: 'Pharmacy Owner', PHARMACY_MANAGER: 'Pharmacy Manager', INVENTORY_OFFICER: 'Inventory Officer', CASHIER: 'Cashier' }
        return { id: employee.id, name: [account.firstName, account.lastName].filter(Boolean).join(' ') || account.email, role: roleMap[employee.role] || 'Pharmacist', email: account.email || '—', phone: account.phone || '—', status: account.isActive === false ? 'Inactive' : 'Active', lastLogin: account.updatedAt ? new Date(account.updatedAt).toLocaleString() : '—' }
      })
      setEmployees(rows)
    }).catch((err) => setError(err.message || 'Unable to load staff.')).finally(() => setLoading(false))
  }, [user?.pharmacy?.id, user?.pharmacyId])

  // Filter states
  const [searchVal, setSearchVal] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Add staff modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState<'Pharmacist' | 'Inventory Officer' | 'Cashier' | 'Pharmacy Manager'>('Pharmacist')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [tempPassword, setTempPassword] = useState('')
  const [showCredentialsBanner, setShowCredentialsBanner] = useState(false)

  // Generate temporary password automatically when modal opens or fields change
  useEffect(() => {
    if (showAddModal) {
      const generated = 'BralirwaStaff2026!'
      setTempPassword(generated)
    }
  }, [showAddModal])

  // Save new staff member and append action to audit trail logs
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !phone) return

    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Please provide a valid email address.')
      return
    }

    const pharmacyId = user?.pharmacy?.id || user?.pharmacyId
    if (!pharmacyId) return
    const [firstName, ...rest] = name.trim().split(/\s+/)
    const roleValue = role === 'Pharmacist' ? 'PHARMACIST' : 'PHARMACY_OWNER'
    try {
      await AuthApi.createStaff(pharmacyId, { firstName, lastName: rest.join(' ') || firstName, email, phone, role: roleValue, position: role })
      const pharmacy = await PharmacyApi.getDetails(pharmacyId)
      setEmployees((pharmacy.employees || []).map((employee: any) => ({ id: employee.id, name: [employee.user?.firstName, employee.user?.lastName].filter(Boolean).join(' ') || employee.user?.email, role: employee.role === 'PHARMACIST' ? 'Pharmacist' : 'Pharmacy Manager', email: employee.user?.email || '—', phone: employee.user?.phone || '—', status: employee.user?.isActive === false ? 'Inactive' : 'Active', lastLogin: employee.user?.updatedAt ? new Date(employee.user.updatedAt).toLocaleString() : '—' })))
    } catch (err: any) { setError(err.message || 'Unable to create staff member.'); return }
    setShowCredentialsBanner(true)

  }

  const handleCloseAddModal = () => {
    setShowAddModal(false)
    setName('')
    setRole('Pharmacist')
    setEmail('')
    setPhone('')
    setTempPassword('')
    setShowCredentialsBanner(false)
  }

  // Toggle status (Active / Inactive)
  const toggleEmployeeStatus = (id: string) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === id) {
          const nextStatus = emp.status === 'Active' ? 'Inactive' : 'Active'
          return { ...emp, status: nextStatus }
        }
        return emp
      })
    )
  }

  // Apply filters
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchVal.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchVal.toLowerCase()) ||
      emp.phone.includes(searchVal)
    const matchesRole = roleFilter ? emp.role === roleFilter : true
    const matchesStatus = statusFilter ? emp.status === statusFilter : true
    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      {/* Information Header Banner matching layout mockup */}
      <div className="bg-blue-50/60 border border-blue-200 text-blue-800 rounded-xl p-4 flex items-start space-x-3 text-xs shadow-xs">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="leading-normal">
          Every action performed by a staff member is individually recorded. Staff cannot share credentials.
        </div>
      </div>

      {/* Staff Roles & Permissions card summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-gray-900 pb-2 border-b border-gray-150">Staff Roles &amp; Permissions</h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-[11px] leading-relaxed">
          {/* Col 1 */}
          <div className="border border-gray-150 rounded-lg p-3 bg-gray-50/40 space-y-2">
            <span className="font-bold text-gray-950 block">Pharmacy Owner</span>
            <p className="text-gray-500">🟢 Full access — manage pharmacy, staff, inventory, reports, profile</p>
          </div>
          {/* Col 2 */}
          <div className="border border-gray-150 rounded-lg p-3 bg-gray-50/40 space-y-2">
            <span className="font-bold text-gray-950 block">Pharmacy Manager</span>
            <p className="text-gray-500">🟢 Manage inventory, manage reservations, view reports, supervise staff</p>
          </div>
          {/* Col 3 */}
          <div className="border border-gray-150 rounded-lg p-3 bg-gray-50/40 space-y-2">
            <span className="font-bold text-gray-950 block">Pharmacist</span>
            <p className="text-gray-500">🟢 Dispense medicines, process reservations, update stock after dispensing, send reminders</p>
          </div>
          {/* Col 4 */}
          <div className="border border-gray-150 rounded-lg p-3 bg-gray-50/40 space-y-2">
            <span className="font-bold text-gray-950 block">Inventory Officer</span>
            <p className="text-gray-500">🟢 Add/update stock, record expiry dates, manage suppliers</p>
          </div>
          {/* Col 5 */}
          <div className="border border-gray-150 rounded-lg p-3 bg-gray-50/40 space-y-2">
            <span className="font-bold text-gray-950 block">Cashier</span>
            <p className="text-gray-500">🟢 Process payments, generate receipts, view completed reservations</p>
          </div>
        </div>
      </div>

      {/* Filters Search console and staff list table */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">

        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto flex-grow max-w-2xl">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-semibold"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-gray-700 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Roles</option>
              <option value="Pharmacy Manager">Pharmacy Manager</option>
              <option value="Pharmacist">Pharmacist</option>
              <option value="Inventory Officer">Inventory Officer</option>
              <option value="Cashier">Cashier</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-gray-700 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-health-primary hover:bg-health-secondary text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>

        {/* Employees Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-gray-150">
            <thead>
              <tr className="text-[10px] font-black text-slate-450 uppercase tracking-wider">
                <th className="py-2.5">Name</th>
                <th className="py-2.5">Role</th>
                <th className="py-2.5">Email</th>
                <th className="py-2.5">Phone</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5">Last Login</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50/50">
                  <td className="py-3 font-bold text-gray-950 flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-650">
                      {emp.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </span>
                    <span>{emp.name}</span>
                  </td>
                  <td className="py-3">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      {emp.role}
                    </span>
                  </td>
                  <td className="py-3 text-gray-600">{emp.email}</td>
                  <td className="py-3">{emp.phone}</td>
                  <td className="py-3">
                    {emp.status === 'Active' ? (
                      <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.25 rounded border border-emerald-250">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.25 rounded border border-gray-200">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-gray-400 font-mono">{emp.lastLogin}</td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleEmployeeStatus(emp.id)}
                      className={`font-bold px-3 py-1 rounded text-[10px] transition-colors focus:outline-none ${emp.status === 'Active'
                          ? 'border border-red-300 hover:bg-red-50 text-red-700'
                          : 'border border-emerald-300 hover:bg-emerald-50 text-emerald-700'
                        }`}
                    >
                      {emp.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modals component */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
          <div onClick={handleCloseAddModal} className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />

          <div className="relative w-full max-w-md bg-white rounded-2xl border border-gray-250 shadow-2xl overflow-hidden z-[9999] flex flex-col">

            {/* Modal Header */}
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900">
              <div>
                <h3 className="font-black text-sm">Add Staff Member</h3>
                <p className="text-xs text-emerald-300">Set permissions and login credentials</p>
              </div>
              <button onClick={handleCloseAddModal} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveStaff} className="p-6 space-y-4">

              {!showCredentialsBanner ? (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Jean-Paul Kagabo"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Staff Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-bold"
                    >
                      <option value="Pharmacist">Pharmacist (Dispense & Reservations)</option>
                      <option value="Inventory Officer">Inventory Officer (Stock Manage)</option>
                      <option value="Cashier">Cashier (Process Payments)</option>
                      <option value="Pharmacy Manager">Pharmacy Manager (Supervise)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. jp@bralirwa.rw"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +250 788 123 456"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-health-primary hover:bg-health-secondary text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-sm mt-2 focus:outline-none"
                  >
                    Generate Credentials &amp; Add Staff
                  </button>
                </>
              ) : (
                /* Generated default credentials banner */
                <div className="space-y-4 py-2 animate-fadeIn text-center">
                  <div className="w-12 h-12 bg-emerald-50 text-health-primary rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-black text-gray-900 text-sm">Staff Member Registered!</h4>
                    <p className="text-xs text-gray-500">Provide these default login credentials to the user.</p>
                  </div>

                  <div className="border border-gray-250 rounded-xl p-4 bg-gray-50 text-left text-xs space-y-2.5 font-bold max-w-sm mx-auto">
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase tracking-widest">Username / Email</span>
                      <span className="text-gray-900 block font-mono">{email}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase tracking-widest">Temporary Password</span>
                      <span className="text-emerald-800 block font-mono">{tempPassword}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseAddModal}
                    className="w-full bg-health-primary hover:bg-health-secondary text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-sm focus:outline-none"
                  >
                    Done
                  </button>
                </div>
              )}

            </form>

          </div>
        </div>
      )}

    </div>
  )
}
