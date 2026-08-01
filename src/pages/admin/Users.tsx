import React, { useState } from 'react'
import {
  Users, Search, Plus, X, Check, AlertTriangle, Shield,
  UserCheck, UserX, RefreshCw, Eye, EyeOff, ChevronDown
} from 'lucide-react'

type UserRole = 'PATIENT' | 'PHARMACY' | 'INSURANCE' | 'GOVERNMENT' | 'ADMIN'
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

const MOCK_USERS: SystemUser[] = [
  { id: 'USR-001', name: 'Marie Uwimana', email: 'marie@gmail.com', phone: '+250 788 001 001', role: 'PATIENT', status: 'Active', createdAt: '2026-01-15', lastLogin: '2026-07-30', nid: '1199780001234567' },
  { id: 'USR-002', name: 'Eric Mugisha', email: 'eric@bralirwa.rw', phone: '+250 782 345 678', role: 'PHARMACY', status: 'Active', createdAt: '2026-02-01', lastLogin: '2026-08-01', nid: '1198580009876543' },
  { id: 'USR-003', name: 'Jean Bosco Gasana', email: 'jb@moh.gov.rw', phone: '+250 788 200 200', role: 'GOVERNMENT', status: 'Active', createdAt: '2026-01-05', lastLogin: '2026-07-31' },
  { id: 'USR-004', name: 'Diane Mukamana', email: 'diane@rssb.rw', phone: '+250 783 300 300', role: 'INSURANCE', status: 'Active', createdAt: '2026-03-10', lastLogin: '2026-07-28' },
  { id: 'USR-005', name: 'Aline Ingabire', email: 'aline@gmail.com', phone: '+250 788 400 400', role: 'PATIENT', status: 'Pending', createdAt: '2026-07-29', lastLogin: '—', nid: '1200180005554321' },
  { id: 'USR-006', name: 'Patrick Habimana', email: 'ph@citymed.rw', phone: '+250 784 500 500', role: 'PHARMACY', status: 'Suspended', createdAt: '2025-11-20', lastLogin: '2026-06-01' },
  { id: 'USR-007', name: 'Claudine Uwera', email: 'claudine@mmi.rw', phone: '+250 786 600 600', role: 'INSURANCE', status: 'Active', createdAt: '2026-04-12', lastLogin: '2026-07-25' },
  { id: 'USR-008', name: 'System Admin', email: 'admin@epharmacy.rw', phone: '+250 787 700 700', role: 'ADMIN', status: 'Active', createdAt: '2025-01-01', lastLogin: '2026-08-01' },
]

const ROLE_COLORS: Record<UserRole, string> = {
  PATIENT: 'bg-sky-50 text-sky-800 border-sky-200',
  PHARMACY: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  INSURANCE: 'bg-purple-50 text-purple-800 border-purple-200',
  GOVERNMENT: 'bg-amber-50 text-amber-800 border-amber-200',
  ADMIN: 'bg-red-50 text-red-800 border-red-200',
}

export default function AdminUsers() {
  const [users, setUsers] = useState<SystemUser[]>(MOCK_USERS)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState<SystemUser | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Add form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<UserRole>('PATIENT')
  const [nid, setNid] = useState('')
  const [tempPass, setTempPass] = useState('Rwanda@2026!')
  const [showPass, setShowPass] = useState(false)

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3200)
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !phone) return
    const newUser: SystemUser = {
      id: `USR-00${users.length + 1}`,
      name,
      email,
      phone,
      role,
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: '—',
      nid: nid || undefined,
    }
    setUsers((prev) => [newUser, ...prev])
    triggerToast(`User ${name} added successfully.`)
    setShowAddModal(false)
    setName(''); setEmail(''); setPhone(''); setNid('')
  }

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u
        const next: UserStatus = u.status === 'Active' ? 'Suspended' : 'Active'
        triggerToast(`${u.name} status changed to ${next}.`)
        return { ...u, status: next }
      })
    )
  }

  const deleteUser = (id: string) => {
    const u = users.find((x) => x.id === id)
    if (!u) return
    if (!window.confirm(`Delete ${u.name}? This action is irreversible.`)) return
    setUsers((prev) => prev.filter((x) => x.id !== id))
    triggerToast(`User ${u.name} deleted.`)
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
    pending: users.filter((u) => u.status === 'Pending').length,
    suspended: users.filter((u) => u.status === 'Suspended').length,
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 relative">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-xl text-xs font-bold flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: counts.total, color: 'text-gray-900', bg: 'bg-gray-50', icon: Users },
          { label: 'Active', value: counts.active, color: 'text-emerald-700', bg: 'bg-emerald-50', icon: UserCheck },
          { label: 'Pending', value: counts.pending, color: 'text-amber-700', bg: 'bg-amber-50', icon: AlertTriangle },
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
              {(['PATIENT', 'PHARMACY', 'INSURANCE', 'GOVERNMENT', 'ADMIN'] as UserRole[]).map((r) => (
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
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Registered</th>
                <th className="px-5 py-3">Last Login</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
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
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                          u.status === 'Active'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-50">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm">Add System User</h3>
                <p className="text-xs text-slate-400">Create a new user account across any portal</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name *</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jean Paul Kagabo"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email *</label>
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.rw"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone *</label>
                  <input required value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+250 788 000 000"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">System Role *</label>
                  <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none font-semibold">
                    {(['PATIENT', 'PHARMACY', 'INSURANCE', 'GOVERNMENT', 'ADMIN'] as UserRole[]).map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">NID (optional)</label>
                  <input value={nid} onChange={(e) => setNid(e.target.value)}
                    placeholder="16-digit NID"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-semibold" />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Temporary Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} value={tempPass} onChange={(e) => setTempPass(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 pr-10 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-semibold" />
                    <button type="button" onClick={() => setShowPass((p) => !p)}
                      className="absolute right-3 top-2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <button type="submit"
                className="w-full bg-health-primary hover:bg-health-secondary text-white font-bold py-2.5 rounded-lg text-xs transition-colors shadow-sm mt-2">
                Create User Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowViewModal(null)} className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-50">
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm">User Profile</h3>
                <p className="text-xs text-emerald-300">{showViewModal.id}</p>
              </div>
              <button onClick={() => setShowViewModal(null)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
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
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                    showViewModal.status === 'Active'
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
