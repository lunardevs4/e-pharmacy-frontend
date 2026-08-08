import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { PharmacyApi } from '@/services/pharmacy-api'

export default function PharmacyReservations() {
  const { user } = useAuthStore()
  const [rows, setRows] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const pharmacyId = user?.pharmacy?.id || user?.pharmacyId
  const load = () => { if (pharmacyId) PharmacyApi.getReservations(pharmacyId).then(setRows).catch((err) => setError(err.message || 'Unable to load reservations.')) }
  useEffect(load, [pharmacyId])
  const update = async (id: string, status: string) => { if (!pharmacyId) return; try { await PharmacyApi.updateReservationStatus(pharmacyId, id, status); load() } catch (err: any) { setError(err.message || 'Unable to update reservation.') } }
  return <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4"><div><h1 className="text-2xl font-bold text-gray-900">Incoming Reservations</h1><p className="text-gray-600">Fulfill prescription pickups and verify national IDs.</p></div>{error && <div className="text-sm text-red-600">{error}</div>}<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="text-xs uppercase text-gray-500"><th className="py-2">Patient</th><th>Medicine</th><th>Quantity</th><th>Date</th><th>Status</th><th /></tr></thead><tbody className="divide-y">{rows.map((row) => <tr key={row.id}><td className="py-3">{[row.patient?.user?.firstName, row.patient?.user?.lastName].filter(Boolean).join(' ') || 'Patient'}</td><td>{row.medicine?.name || 'Medication'}</td><td>{row.quantity}</td><td>{new Date(row.createdAt).toLocaleDateString()}</td><td>{row.status}</td><td className="text-right">{row.status === 'PENDING' && <button onClick={() => update(row.id, 'CONFIRMED')} className="rounded bg-emerald-700 px-3 py-1 text-xs font-bold text-white">Confirm</button>}{row.status === 'CONFIRMED' && <button onClick={() => update(row.id, 'COLLECTED')} className="rounded bg-blue-700 px-3 py-1 text-xs font-bold text-white">Collect</button>}</td></tr>)}</tbody></table>{!rows.length && <p className="py-10 text-center text-gray-400">No reservations found.</p>}</div></div>
}
