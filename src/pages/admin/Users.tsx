import React, { useState, useEffect } from 'react'
import {
  Users, Search, Plus, X, Check, AlertTriangle,
  UserCheck, UserX, Eye, EyeOff
} from 'lucide-react'
import { validateEmail } from '@/utils/validation'
import { UserApi } from '@/services/user-api'

type UserRole = 'PATIENT' | 'PHARMACY' | 'GOVERNMENT' | 'INSURANCE' | 'ADMIN'
type UserStatus = 'Active' | 'Suspended' | 'Pending'

interface SystemUser {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  status: UserStatus
  createdAt: string
  lastLogin: string
  nid?: string
}



const ROLE_COLORS: Record<UserRole, string> = {
  PATIENT: 'bg-sky-50 text-sky-800 border-sky-200',
  PHARMACY: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  GOVERNMENT: 'bg-amber-50 text-amber-800 border-amber-200',
  INSURANCE: 'bg-purple-50 text-purple-800 border-purple-200',
  ADMIN: 'bg-red-50 text-red-800 border-red-200',
}

export default function AdminUsers() {
  const [users, setUsers] = useState<SystemUser[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState<SystemUser | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)

  // Add form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<UserRole>('PATIENT')

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3200)
  }

  const loadUsers = async () => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const result = await UserApi.getUsers(1, 100)
      setUsers(result.map((user) => ({
        id: user.id,
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || user.id,
        email: user.email || '—',
        phone: user.phone || '—',
        role: user.role as UserRole,
        status: user.isActive ? 'Active' : 'Suspended',
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '—',
        lastLogin: '—',
      })))
    } catch (error: any) {
      setErrorMsg(error?.message || 'Unable to load users from backend.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)
    if (!name || !email || !phone) return

    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      setModalError(emailValidation.error || 'Please provide a valid email address.')
      return
    }

    const [firstName, ...rest] = name.trim().split(/\s+/)
    const lastName = rest.join(' ') || ''

    try {
      await UserApi.createUser({
        firstName,
        lastName,
        email,
        phone,
        role,
      })
      triggerToast(`User ${name} added successfully.`)
      setShowAddModal(false)
      setName('')
      setEmail('')
      setPhone('')
      setRole('PATIENT')
      await loadUsers()
    } catch (error: any) {
      setModalError(error?.message || 'Unable to create user.')
    }
  }

  const toggleStatus = async (id: string) => {
    const u = users.find((x) => x.id === id)
    if (!u) return

    try {
      const nextStatus = u.status !== 'Active'
      await UserApi.updateUserStatus(id, nextStatus)
      triggerToast(`${u.name} ${nextStatus ? 'activated' : 'suspended'} successfully.`)
      await loadUsers()
      if (showViewModal?.id === id) {
        setShowViewModal(null)
      }
    } catch (error: any) {
      triggerToast(error?.message || 'Unable to update user status.')
    }
  }

  const deleteUser = async (id: string) => {
    const u = users.find((x) => x.id === id)
    if (!u) return
    if (!window.confirm(`Delete ${u.name}? This action is irreversible.`)) return

    try {
      await UserApi.deleteUser(id)
      triggerToast(`User ${u.name} deleted.`)
      await loadUsers()
      if (showViewModal?.id === id) {
        setShowViewModal(null)
      }
    } catch (error: any) {
      triggerToast(error?.message || 'Unable to delete user.')
    }
  }

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter ? u.role === roleFilter : true
    const matchStatus = statusFilter ? u.status === statusFilter : true
    return matchSearch && matchRole && matchStatus
  })

  const counts = {
    total: users.length,
    active: users.filter((u) => u.status === 'Active').length,
    suspended: users.filter((u) => u.status === 'Suspended').length,
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-16 pt-8">
        <div className="h-10 bg-gray-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 relative">
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMsg}
        </div>
      )}
      {/* Toast */}
      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-6 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-xl text-xs font-bold flex items-center space-x-2"
        >
          <Check className="w-4 h-4" aria-hidden="true" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: counts.total, color: 'text-gray-900', bg: 'bg-gray-50', icon: Users },
          { label: 'Active', value: counts.active, color: 'text-emerald-700', bg: 'bg-emerald-50', icon: UserCheck },
          { label: 'Suspended', value: counts.suspended, color: 'text-red-700', bg: 'bg-red-50', icon: UserX },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center space-x-3 shadow-xs">
            <div className={`p-2.5 rounded-lg ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-bold">{s.label}</span>
              <span className={`text-xl font-black ${s.color}`}>{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row gap-2 flex-grow max-w-2xl">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
              className="bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-gray-700 font-bold focus:outline-none"
            >
              <option value="">All Roles</option>
              {(['PATIENT', 'PHARMACY', 'GOVERNMENT', 'INSURANCE', 'ADMIN'] as UserRole[]).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as UserStatus | '')}
              className="bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-gray-700 font-bold focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-health-primary hover:bg-health-secondary text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" aria-label="System users">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th scope="col" className="px-5 py-3">User</th>
                <th scope="col" className="px-5 py-3">Role</th>
                <th scope="col" className="px-5 py-3">Contact</th>
                <th scope="col" className="px-5 py-3">Registered</th>
                <th scope="col" className="px-5 py-3">Last Login</th>
                <th scope="col" className="px-5 py-3">Status</th>
                <th scope="col" className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 flex-shrink-0">
                        {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">{u.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{u.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center text-[10px] font-bold border px-2 py-0.5 rounded uppercase ${ROLE_COLORS[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="block text-gray-800">{u.email}</span>
                    <span className="block text-[10px] text-gray-400">{u.phone}</span>
                  </td>
                  <td className="px-5 py-3 font-mono text-gray-500">{u.createdAt}</td>
                  <td className="px-5 py-3 font-mono text-gray-500">{u.lastLogin}</td>
                  <td className="px-5 py-3">
                    {u.status === 'Active' && (
                      <span className="inline-flex text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">Active</span>
                    )}
                    {u.status === 'Pending' && (
                      <span className="inline-flex text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">Pending</span>
                    )}
                    {u.status === 'Suspended' && (
                      <span className="inline-flex text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">Suspended</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => setShowViewModal(u)}
                        className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-health-primary transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleStatus(u.id)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${u.status === 'Active'
                          ? 'border-red-200 text-red-700 hover:bg-red-50'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                      >
                        {u.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400 text-xs">No users match the current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-user-title"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onKeyDown={(e) => { if (e.key === 'Escape') setShowAddModal(false) }}
        >
          <div onClick={() => setShowAddModal(false)} aria-hidden="true" className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-[9999]">
            <div className="bg-emerald-950 text-white px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300 mb-1">User management</p>
                <h3 id="add-user-title" className="font-black text-lg tracking-tight">Add System User</h3>
                <p className="text-xs text-emerald-100/70 mt-1">Create a new account for any portal</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                aria-label="Close add user modal"
                className="p-1.5 text-emerald-200/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 sm:p-7 space-y-5 text-xs">
              {modalError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-red-700 font-medium leading-relaxed">
                  {modalError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name <span className="text-emerald-600">*</span></label>
                  <input required value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jean Paul Kagabo"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-medium transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email <span className="text-emerald-600">*</span></label>
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.rw"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-medium transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone <span className="text-emerald-600">*</span></label>
                  <input required value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+250 788 000 000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-medium transition-colors" />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">System Role <span className="text-emerald-600">*</span></label>
                  <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-semibold transition-colors">
                    {(['PATIENT', 'PHARMACY', 'GOVERNMENT', 'INSURANCE', 'ADMIN'] as UserRole[]).map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit"
                className="w-full bg-health-primary hover:bg-health-secondary text-white font-bold py-3 rounded-lg text-sm transition-all shadow-sm hover:shadow-md mt-1 focus:outline-none focus:ring-4 focus:ring-emerald-500/20">
                Create User Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="view-user-title"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onKeyDown={(e) => { if (e.key === 'Escape') setShowViewModal(null) }}
        >
          <div onClick={() => setShowViewModal(null)} aria-hidden="true" className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-[9999]">
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 id="view-user-title" className="font-black text-sm">User Profile</h3>
                <p className="text-xs text-emerald-300">{showViewModal.id}</p>
              </div>
              <button
                onClick={() => setShowViewModal(null)}
                aria-label="Close user profile modal"
                className="text-emerald-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 rounded"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-lg font-black text-slate-600">
                  {showViewModal.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <span className="font-black text-gray-900 text-base block">{showViewModal.name}</span>
                  <span className={`inline-flex text-[10px] font-bold border px-2 py-0.5 rounded uppercase mt-1 ${ROLE_COLORS[showViewModal.role]}`}>
                    {showViewModal.role}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                {[
                  ['Email', showViewModal.email],
                  ['Phone', showViewModal.phone],
                  ['NID', showViewModal.nid || '—'],
                  ['Status', showViewModal.status],
                  ['Registered', showViewModal.createdAt],
                  ['Last Login', showViewModal.lastLogin],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">{label}</span>
                    <span className="font-bold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex space-x-3 pt-2 border-t border-gray-100">
                <button
                  onClick={() => { toggleStatus(showViewModal.id); setShowViewModal(null) }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${showViewModal.status === 'Active'
                    ? 'border-red-200 text-red-700 hover:bg-red-50'
                    : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    }`}
                >
                  {showViewModal.status === 'Active' ? 'Suspend User' : 'Activate User'}
                </button>
                <button
                  onClick={() => setShowViewModal(null)}
                  className="flex-1 py-2 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
