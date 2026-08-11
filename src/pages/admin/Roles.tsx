import React from 'react'
import { ShieldCheck } from 'lucide-react'

const ROLES = [
  {
    role: 'PATIENT',
    color: 'bg-sky-50 border-sky-200 text-sky-800',
    dot: 'bg-sky-500',
    description: 'Registered citizens using the platform to search medicines and manage reservations.',
    permissions: [
      'Search national medicine catalogue',
      'View pharmacy availability & pricing',
      'Create and cancel reservations',
      'Upload prescription documents',
      'View own reservation history',
      'Manage notification preferences',
      'Update personal health profile',
    ],
  },
  {
    role: 'PHARMACY',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    dot: 'bg-emerald-500',
    description: 'Licensed pharmacy staff managing inventory, reservations, and billing.',
    permissions: [
      'Manage pharmacy inventory (add, edit, archive)',
      'View and fulfill incoming reservations',
      'Process insurance billing & co-payments',
      'Manage staff accounts within own pharmacy',
      'View pharmacy-level audit trail',
      'Generate pharmacy sales reports',
      'Update pharmacy profile & settings',
    ],
  },

  {
    role: 'GOVERNMENT',
    color: 'bg-amber-50 border-amber-200 text-amber-800',
    dot: 'bg-amber-500',
    description: 'Ministry of Health regulators overseeing compliance and national analytics.',
    permissions: [
      'View national drug availability analytics',
      'Approve, reject, suspend pharmacy licences',
      'Manage national medicine catalogue',
      'Generate MOH compliance reports',
      'View district and province-level heatmaps',
      'Record compliance inspection audits',
    ],
  },
  {
    role: 'ADMIN',
    color: 'bg-red-50 border-red-200 text-red-800',
    dot: 'bg-red-500',
    description: 'Platform system administrators with full access to all configuration and security controls.',
    permissions: [
      'Full CRUD on all user accounts',
      'Manage medicine catalogue',
      'Configure role-based access policies',
      'View system-wide security audit logs',
      'Manage platform settings & API config',
      'Monitor system health and performance',
      'Export any system data',
    ],
  },
]

export default function AdminRoles() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center space-x-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          <h1 className="text-xl font-black text-gray-900">Roles & Permissions</h1>
        </div>
        <p className="text-xs text-gray-500 font-medium">
          Role-based access control matrix for all five system portals. Permissions are enforced server-side.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {ROLES.map(r => (
          <div key={r.role} className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
            <div className={`px-5 py-3 border-b ${r.color} flex items-center space-x-2`}>
              <span className={`w-2.5 h-2.5 rounded-full ${r.dot}`} aria-hidden="true" />
              <span className="font-black text-sm tracking-wide">{r.role}</span>
            </div>
            <div className="p-5 flex-grow space-y-3">
              <p className="text-xs text-gray-500 leading-relaxed">{r.description}</p>
              <ul className="space-y-1.5" aria-label={`${r.role} permissions`}>
                {r.permissions.map(p => (
                  <li key={p} className="flex items-start space-x-2 text-xs text-gray-700">
                    <span className="text-emerald-600 mt-0.5 flex-shrink-0" aria-hidden="true">✓</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Permission changes require an admin account and are logged in the Security Audit Log.
      </p>
    </div>
  )
}
