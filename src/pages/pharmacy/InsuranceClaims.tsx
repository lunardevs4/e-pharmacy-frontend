import React, { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { PharmacyApi } from '@/services/pharmacy-api'
import { Shield, Users, Receipt } from 'lucide-react'
export default function PharmacyBilling() {
  const { user } = useAuthStore(); const pharmacyId = user?.pharmacy?.id || user?.pharmacyId
  const [rows, setRows] = useState<any[]>([]); const [error, setError] = useState<string | null>(null)
  useEffect(() => { if (pharmacyId) PharmacyApi.getReservations(pharmacyId).then(setRows).catch((err) => setError(err.message || 'Unable to load claims.')) }, [pharmacyId])
  const claims = rows.filter((row) => row.insuranceProvider || row.insuranceId)
  const metrics = useMemo(() => ({ total: claims.length, pending: claims.filter((r) => r.status === 'PENDING').length, units: claims.reduce((sum, r) => sum + Number(r.quantity || 0), 0) }), [claims])
  return <div className="space-y-6 max-w-7xl mx-auto pb-16">{error && <p className="text-red-600">{error}</p>}<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{[["Insurance Claims", metrics.total, Shield], ["Pending Claims", metrics.pending, Receipt], ["Covered Units", metrics.units, Users]].map(([label, value, Icon]) => <div key={label as string} className="bg-white border rounded-xl p-5"><Icon className="w-4 h-4 text-emerald-700 mb-2" /><span className="text-xs text-gray-500">{label}</span><p className="text-2xl font-black">{value}</p></div>)}</div><div className="bg-white border rounded-xl p-5"><h2 className="font-black mb-4">Insurance-linked Reservations</h2><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="uppercase text-gray-500"><th className="py-2">Patient</th><th>Medicine</th><th>Provider</th><th>Quantity</th><th>Date</th><th>Status</th></tr></thead><tbody className="divide-y">{claims.map((row) => <tr key={row.id}><td className="py-3">{[row.patient?.user?.firstName, row.patient?.user?.lastName].filter(Boolean).join(' ') || 'Patient'}</td><td>{row.medicine?.name || 'Medication'}</td><td>{row.insuranceProvider || row.insuranceId}</td><td>{row.quantity}</td><td>{new Date(row.createdAt).toLocaleDateString()}</td><td>{row.status}</td></tr>)}</tbody></table>{!claims.length && <p className="py-10 text-center text-gray-400">No insurance-linked reservations found.</p>}</div></div></div>
}
