import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuthStore } from '@/store/authStore'
import { PharmacyApi } from '@/services/pharmacy-api'
import { MedicineApi } from '@/services/medicine-api'
import { INSURANCE_COVERAGE_RATES } from '@/config/insurance-rates'
import { AlertCircle, CheckCircle2, FileText, Info, Loader2, Percent, Receipt, ShieldCheck, Users } from 'lucide-react'

interface InventoryItem {
  medicineId?: string
  quantity?: number
  price?: number
  medicine?: { id?: string; name?: string; tradeName?: string }
}

interface ReservationItem {
  id: string
  medicineId?: string
  status?: string
  quantity?: number
  createdAt?: string
  insuranceProvider?: string
  insuranceId?: string
  totalPrice?: number
  price?: number
  patientPays?: number
  insurancePays?: number
  patient?: { user?: { firstName?: string; lastName?: string } }
  medicine?: { name?: string; tradeName?: string }
}

const money = (value: number) => `RWF ${Math.round(value).toLocaleString()}`
const statusStyles: Record<string, string> = {
  APPROVED: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  CONFIRMED: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  PAID: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  COLLECTED: 'text-slate-700 bg-slate-50 border-slate-200',
  PENDING: 'text-amber-700 bg-amber-50 border-amber-200',
  REJECTED: 'text-red-700 bg-red-50 border-red-200',
}

export default function PharmacyBilling() {
  const { user } = useAuthStore()
  const pharmacyId = user?.pharmacy?.id || user?.pharmacyId
  const [reservations, setReservations] = useState<ReservationItem[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [selectedReservation, setSelectedReservation] = useState<ReservationItem | null>(null)
  const [medicineId, setMedicineId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [insurance, setInsurance] = useState('Private')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)

  useEffect(() => {
    if (!pharmacyId) {
      setIsLoading(false)
      setError('No pharmacy is linked to your account.')
      return
    }
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [reservationData, inventoryData] = await Promise.all([
          PharmacyApi.getReservations(pharmacyId),
          MedicineApi.getPharmacyInventory(pharmacyId),
        ])
        setReservations(Array.isArray(reservationData) ? reservationData : [])
        const availableInventory = Array.isArray(inventoryData) ? inventoryData : []
        setInventory(availableInventory)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unable to load billing data.')
      } finally {
        setIsLoading(false)
      }
    }
    void load()
  }, [pharmacyId])

  const claims = useMemo(() => reservations.filter((row) => row.insuranceProvider || row.insuranceId), [reservations])
  const selectedInventory = inventory.find((item) => item.medicineId === medicineId || item.medicine?.id === medicineId)
  const selectedReservationQuantity = Number(selectedReservation?.quantity || 0)
  const unitPrice = Number(selectedReservation?.price || selectedInventory?.price || (selectedReservation?.totalPrice && selectedReservationQuantity ? selectedReservation.totalPrice / selectedReservationQuantity : 0))
  const total = unitPrice * Math.max(1, quantity)
  const coverageRate = INSURANCE_COVERAGE_RATES[insurance] ?? 0
  const insurancePays = Math.round(total * coverageRate)
  const patientPays = total - insurancePays

  const metrics = useMemo(() => {
    const today = new Date().toDateString()
    const todayClaims = claims.filter((row) => row.createdAt && new Date(row.createdAt).toDateString() === today)
    const amountFor = (row: ReservationItem) => Number(row.totalPrice || row.price || 0)
    return {
      revenue: todayClaims.reduce((sum, row) => sum + amountFor(row), 0),
      transactions: todayClaims.length,
      claims: claims.length,
      covered: claims.reduce((sum, row) => sum + Number(row.insurancePays || 0), 0),
      contributions: claims.reduce((sum, row) => sum + Number(row.patientPays || 0), 0),
      pending: claims.filter((row) => ['PENDING', 'RESERVED'].includes(String(row.status).toUpperCase())).length,
    }
  }, [claims])

  const selectReservation = (reservation: ReservationItem) => {
    setSelectedReservation(reservation)
    const matchingInventory = inventory.find((item) => item.medicineId === reservation.medicineId || item.medicine?.id === reservation.medicineId || item.medicine?.name === reservation.medicine?.name || item.medicine?.tradeName === reservation.medicine?.tradeName)
    setMedicineId(reservation.medicineId || matchingInventory?.medicineId || matchingInventory?.medicine?.id || '')
    setQuantity(Math.max(1, Number(reservation.quantity || 1)))
    const existingInsurance = reservation.insuranceProvider || reservation.insuranceId
    setInsurance(existingInsurance && INSURANCE_COVERAGE_RATES[existingInsurance] !== undefined ? existingInsurance : 'Private')
    setNotice(null)
  }

  const completeSale = async () => {
    if (!selectedReservation) {
      setNotice('Select a reservation before generating a receipt.')
      return
    }
    if (!pharmacyId) {
      setError('No pharmacy is linked to your account.')
      return
    }
    try {
      await PharmacyApi.updateReservationStatus(pharmacyId, selectedReservation.id, 'COLLECTED')
      setReservations((current) => current.map((reservation) => reservation.id === selectedReservation.id ? { ...reservation, status: 'COLLECTED' } : reservation))
      setSelectedReservation((current) => current ? { ...current, status: 'COLLECTED' } : current)
      setNotice('Receipt generated and medicine pickup marked as collected.')
      setShowReceipt(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to complete the medicine pickup.')
    }
  }
  const patientName = (row: ReservationItem) => [row.patient?.user?.firstName, row.patient?.user?.lastName].filter(Boolean).join(' ') || 'Patient'
  const medicineName = (row: ReservationItem) => row.medicine?.name || row.medicine?.tradeName || 'Medication'

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {error && <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs font-semibold text-red-800 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
      {notice && <div role="status" className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{notice}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Today's Revenue", value: money(metrics.revenue), detail: `${metrics.transactions} transactions`, Icon: Receipt, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Insurance Claims', value: metrics.claims, detail: `${money(metrics.covered)} covered`, Icon: ShieldCheck, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Patient Contributions', value: money(metrics.contributions), detail: 'From linked claims', Icon: Users, color: 'text-violet-700', bg: 'bg-violet-50' },
          { label: 'Pending Claims', value: metrics.pending, detail: 'Awaiting approval', Icon: Info, color: 'text-amber-700', bg: 'bg-amber-50' },
        ].map((card) => <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-start justify-between"><div><span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{card.label}</span><p className="text-2xl font-black text-gray-900 mt-2">{isLoading ? '—' : card.value}</p><span className="text-[11px] text-gray-500 block mt-2 font-medium">{card.detail}</span></div><div className={`p-2 rounded-lg border border-gray-200 ${card.bg} ${card.color}`}><card.Icon className="w-4 h-4" /></div></div>)}
      </div>

      <section className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-sm font-black text-gray-900">Reservations</h2>
          <p className="text-xs text-gray-500 mt-1">Select a reservation to fill the billing form automatically.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200"><tr className="text-[10px] font-black text-slate-500 uppercase tracking-wider"><th className="px-5 py-3">Patient</th><th className="px-5 py-3">Medicine</th><th className="px-5 py-3">Quantity</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Action</th></tr></thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {isLoading && <tr><td colSpan={5} className="py-10 text-center text-gray-400">Loading reservations...</td></tr>}
              {!isLoading && reservations.map((reservation) => {
                const status = String(reservation.status || 'PENDING').toUpperCase()
                const isSelected = selectedReservation?.id === reservation.id
                return <tr key={reservation.id} className={`${isSelected ? 'bg-emerald-50/60' : 'hover:bg-gray-50/50'} transition-colors`}>
                  <td className="px-5 py-3 font-bold text-gray-900">{patientName(reservation)}</td>
                  <td className="px-5 py-3">{medicineName(reservation)}</td>
                  <td className="px-5 py-3">{reservation.quantity || 0}</td>
                  <td className="px-5 py-3"><span className={`inline-flex text-[10px] font-bold border px-2 py-1 rounded ${statusStyles[status] || 'text-gray-600 bg-gray-50 border-gray-200'}`}>{status}</span></td>
                  <td className="px-5 py-3 text-right"><button type="button" onClick={() => selectReservation(reservation)} disabled={status === 'COLLECTED'} className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-health-primary hover:bg-health-secondary text-white disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">{isSelected ? 'Selected' : status === 'COLLECTED' ? 'Completed' : 'Bill Reservation'}</button></td>
                </tr>
              })}
              {!isLoading && reservations.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-gray-400">No reservations found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5"><h2 className="text-sm font-black text-gray-900">Billing Calculator</h2><button type="button" onClick={() => selectedReservation ? setShowReceipt(true) : setNotice('Select and complete a reservation before printing a receipt.')} aria-label="View billing receipt" className="p-2 rounded-full border border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition-colors"><FileText className="w-4 h-4" /></button></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div><label className="block text-xs font-bold text-gray-500 mb-1.5">Medicine</label><select value={medicineId} onChange={(event) => setMedicineId(event.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"><option value="">Select medicine</option>{inventory.map((item) => { const id = item.medicineId || item.medicine?.id || ''; return <option key={id} value={id}>{item.medicine?.name || item.medicine?.tradeName || 'Medicine'} — {money(Number(item.price || 0))}</option> })}</select></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-gray-500 mb-1.5">Quantity</label><input type="number" min={1} value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))} className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div><div><label className="block text-xs font-bold text-gray-500 mb-1.5">Insurance</label><select value={insurance} onChange={(event) => setInsurance(event.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500">{Object.entries(INSURANCE_COVERAGE_RATES).map(([provider, rate]) => <option key={provider} value={provider}>{provider} ({Math.round(rate * 100)}%)</option>)}</select></div></div>
            <p className="text-[11px] text-gray-400 flex items-center gap-1"><Percent className="w-3 h-3" /> Coverage is calculated using the application insurance rates.</p>
          </div>
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-5 space-y-3"><h3 className="text-sm font-black text-gray-900">Invoice Summary</h3><div className="space-y-2 text-xs"><div className="flex justify-between"><span className="text-gray-600">Patient</span><span className="font-bold text-gray-900">{selectedReservation ? patientName(selectedReservation) : '—'}</span></div><div className="flex justify-between"><span className="text-gray-600">Medicine</span><span className="font-bold text-gray-900">{selectedReservation ? medicineName(selectedReservation) : selectedInventory?.medicine?.name || selectedInventory?.medicine?.tradeName || '—'}</span></div><div className="flex justify-between"><span className="text-gray-600">Quantity</span><span className="font-bold text-gray-900">{quantity}</span></div><div className="flex justify-between"><span className="text-gray-600">Unit price</span><span className="font-bold text-gray-900">{money(unitPrice)}</span></div><div className="border-t border-emerald-100 pt-3 flex justify-between font-black"><span>Total</span><span>{money(total)}</span></div><div className="flex justify-between text-blue-700"><span>Insurance pays ({Math.round(coverageRate * 100)}%)</span><span className="font-bold">{money(insurancePays)}</span></div><div className="flex justify-between text-emerald-800"><span>Patient pays</span><span className="font-black">{money(patientPays)}</span></div></div><button type="button" onClick={completeSale} disabled={!selectedReservation || selectedReservation.status === 'COLLECTED'} className="w-full bg-health-primary hover:bg-health-secondary text-white font-bold text-xs py-2.5 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">Complete Sale &amp; Generate Receipt</button></div>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden"><div className="p-5 flex items-center justify-between border-b border-gray-100"><div><h2 className="text-sm font-black text-gray-900">Insurance Claims</h2><p className="text-xs text-gray-500 mt-1">Insurance-linked pharmacy reservations and payments.</p></div>{isLoading && <Loader2 className="w-4 h-4 text-emerald-700 animate-spin" />}</div><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-gray-50 border-b border-gray-200"><tr className="text-[10px] font-black text-slate-500 uppercase tracking-wider"><th className="px-5 py-3">Patient</th><th className="px-5 py-3">Medicine</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Insurance Pays</th><th className="px-5 py-3">Patient Pays</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-gray-100 font-medium text-gray-700">{isLoading && <tr><td colSpan={7} className="py-10 text-center text-gray-400">Loading claims...</td></tr>}{!isLoading && claims.map((row) => { const status = String(row.status || 'PENDING').toUpperCase(); return <tr key={row.id} className="hover:bg-gray-50/50"><td className="px-5 py-3 font-bold text-gray-900">{patientName(row)}</td><td className="px-5 py-3">{medicineName(row)}</td><td className="px-5 py-3 font-bold">{money(Number(row.totalPrice || row.price || 0))}</td><td className="px-5 py-3">{money(Number(row.insurancePays || 0))}</td><td className="px-5 py-3">{money(Number(row.patientPays || 0))}</td><td className="px-5 py-3 text-gray-500">{row.createdAt ? new Date(row.createdAt).toISOString().split('T')[0] : '—'}</td><td className="px-5 py-3"><span className={`inline-flex text-[10px] font-bold border px-2 py-1 rounded ${statusStyles[status] || 'text-gray-600 bg-gray-50 border-gray-200'}`}>{status}</span></td></tr> })}{!isLoading && claims.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-gray-400">No insurance claims found.</td></tr>}</tbody></table></div></section>

      {showReceipt && selectedReservation && createPortal(
        (
        <div className="receipt-backdrop fixed inset-0 z-[9999] bg-transparent backdrop-blur-xl p-4 sm:p-8 overflow-y-auto flex items-start justify-center">
          <div className="receipt-print-root w-full max-w-xl bg-white shadow-2xl my-4">
            <div className="relative min-h-[180px] overflow-hidden bg-health-secondary text-white px-6 py-8 sm:px-8 sm:py-9">
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                <div><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl bg-emerald-400 text-health-secondary flex items-center justify-center font-black text-lg">EP</div><div><p className="text-lg font-black tracking-wide">E-PHARMACY</p><p className="text-[10px] uppercase tracking-[0.2em] text-emerald-100">Health &amp; medicine services</p></div></div></div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[10px] text-emerald-100"><div><strong className="block text-white">Phone</strong>{user?.phone || '—'}</div><div><strong className="block text-white">Pharmacy</strong>{user?.pharmacy?.name || '—'}</div><div><strong className="block text-white">Location</strong>{user?.pharmacy?.district || '—'}</div><div><strong className="block text-white">Status</strong>PAID / COLLECTED</div></div>
              </div>
              <div className="absolute -bottom-12 -left-8 h-24 w-[115%] rounded-[50%] bg-emerald-50/95" />
              <div className="absolute -bottom-[4.5rem] -left-12 h-24 w-[120%] rounded-[50%] border-t-8 border-emerald-300/50" />
            </div>

            <div className="px-6 py-6 sm:px-8 sm:py-7 text-gray-900">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6"><div><p className="text-[11px] text-gray-500 mb-1">Billed to</p><h3 className="text-sm font-black">{patientName(selectedReservation)}</h3><p className="text-[11px] text-gray-500 mt-1">Insurance: {insurance}</p></div><div className="sm:text-right"><h1 className="text-2xl font-black tracking-[0.12em] text-health-secondary">RECEIPT</h1><p className="text-[11px] text-gray-500 mt-1">Receipt date: {new Date().toLocaleDateString()}</p><p className="text-[11px] text-gray-500">Pickup status: <span className="font-bold text-emerald-700">COLLECTED</span></p></div></div>
              <table className="w-full text-left text-[11px] mb-6"><thead><tr className="bg-health-primary text-white uppercase text-[9px] tracking-wider"><th className="px-3 py-2">Item description</th><th className="px-3 py-2 text-right">Price</th><th className="px-3 py-2 text-center">Qty</th><th className="px-3 py-2 text-right">Total</th></tr></thead><tbody><tr className="bg-gray-50 border-b border-gray-200"><td className="px-3 py-3"><p className="font-black">{medicineName(selectedReservation)}</p><p className="text-[9px] text-gray-500 mt-1">Medicine reservation pickup</p></td><td className="px-3 py-3 text-right">{money(unitPrice)}</td><td className="px-3 py-3 text-center">{quantity}</td><td className="px-3 py-3 text-right font-bold">{money(total)}</td></tr></tbody></table>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6"><div className="text-[11px] text-gray-600"><h4 className="font-black text-gray-900 uppercase tracking-wider mb-1.5">Payment information</h4><p>Insurance provider: <span className="font-bold">{insurance}</span></p><p>Insurance contribution: <span className="font-bold text-blue-700">{money(insurancePays)}</span></p><p>Patient payment: <span className="font-bold text-emerald-700">{money(patientPays)}</span></p></div><div className="text-[11px] space-y-1.5 sm:text-right"><div className="flex justify-between sm:justify-end sm:gap-8"><span>Subtotal</span><span className="font-bold">{money(total)}</span></div><div className="flex justify-between sm:justify-end sm:gap-8"><span>Insurance</span><span className="font-bold text-blue-700">- {money(insurancePays)}</span></div><div className="flex justify-between sm:justify-end sm:gap-8 bg-emerald-100 text-health-secondary px-3 py-2 font-black text-xs"><span>Grand total</span><span>{money(patientPays)}</span></div></div></div>
              <div className="mt-8 border-t border-gray-200 pt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"><div><h4 className="text-sm font-black text-gray-900">Thank you for choosing us!</h4><p className="text-[9px] text-gray-500 mt-1">Please retain this receipt for your records.</p></div><div className="text-left sm:text-right text-[10px] text-gray-500"><p className="font-bold text-gray-900">{user?.name || 'Pharmacy staff'}</p><p>Authorized pharmacy representative</p></div></div>
            </div>
          </div>
          <div className="receipt-actions fixed bottom-5 right-5 flex gap-2"><button type="button" onClick={() => window.print()} className="bg-health-primary hover:bg-health-secondary text-white px-4 py-2.5 rounded-lg text-xs font-bold shadow-xl">Print Receipt</button><button type="button" onClick={() => setShowReceipt(false)} className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-xs font-bold shadow-xl">Close</button></div>
        </div>
        ),
        document.body,
      )}
    </div>
  )
}
