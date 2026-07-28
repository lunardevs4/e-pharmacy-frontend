import React from 'react'
import { Settings, Shield } from 'lucide-react'

export default function PharmacySettings() {
  return (
    <div className="bg-white border border-gray-250 rounded-xl p-5 max-w-2xl mx-auto shadow-xs space-y-4">
      <div className="flex items-center space-x-2 pb-2 border-b border-gray-150 text-gray-900">
        <Settings className="w-5 h-5" />
        <h2 className="text-sm font-black">Pharmacy Store Settings</h2>
      </div>

      <div className="space-y-4 text-xs">
        <div className="space-y-1">
          <span className="font-bold text-gray-800 block">Store Name</span>
          <input
            type="text"
            readOnly
            value="Bralirwa Pharmacy, Gasabo"
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-500 font-bold focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <span className="font-bold text-gray-800 block">Licence Reference Key</span>
          <input
            type="text"
            readOnly
            value="LIC-KIG-48293-2026"
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-500 font-mono font-bold focus:outline-none"
          />
        </div>

        <div className="border-t border-gray-150 pt-4 flex items-center space-x-2 text-emerald-800">
          <Shield className="w-4 h-4" />
          <span className="font-bold">Security Protocols Active</span>
        </div>
      </div>
    </div>
  )
}
