import React, { useState, useEffect } from 'react'
import { MedicineApi } from '@/services/medicine-api'
import { 
  Bell, Plus, Clock, Calendar, Trash2, CheckCircle2, 
  Edit, X, AlertCircle, Pill, Info, Save, RefreshCw 
} from 'lucide-react'

interface Reminder {
  id: string
  medicineId: string
  medicineName: string
  times: string[] // Array of time strings like ["08:00", "12:00", "20:00"]
  frequency: 'daily' | 'weekly' | 'as_needed'
  startDate: string
  endDate?: string
  notes: string
  pharmacistInstructions: string
  isActive: boolean
  lastTaken: string | null
  nextDose: string | null
  takenHistory?: Array<{ time: string; date: string }>
}

export default function PatientReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Add reminder form state
  const [medicineName, setMedicineName] = useState('')
  const [medicineId, setMedicineId] = useState('')
  const [times, setTimes] = useState<string[]>(['08:00'])
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'as_needed'>('daily')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')
  const [pharmacistInstructions, setPharmacistInstructions] = useState('')

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  useEffect(() => {
    loadReminders()
  }, [])

  const loadReminders = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await MedicineApi.getReminders()
      setReminders(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load reminders')
    } finally {
      setLoading(false)
    }
  }

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!medicineName.trim() || times.length === 0) {
      triggerToast('Please fill in medicine name and at least one time')
      return
    }

    try {
      await MedicineApi.createReminder({
        medicineId: medicineId || undefined,
        medicineName: medicineName.trim(),
        times: times.sort(),
        frequency,
        startDate,
        endDate: endDate || undefined,
        notes: notes.trim(),
        pharmacistInstructions: pharmacistInstructions.trim(),
      })
      triggerToast('Reminder created successfully!')
      setShowAddModal(false)
      resetForm()
      loadReminders()
    } catch (err: any) {
      triggerToast(err.message || 'Failed to create reminder')
    }
  }

  const handleDeleteReminder = async (id: string) => {
    try {
      await MedicineApi.deleteReminder(id)
      triggerToast('Reminder deleted successfully!')
      loadReminders()
    } catch (err: any) {
      triggerToast(err.message || 'Failed to delete reminder')
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await MedicineApi.updateReminder(id, { isActive: !isActive })
      triggerToast(`Reminder ${!isActive ? 'activated' : 'deactivated'}!`)
      loadReminders()
    } catch (err: any) {
      triggerToast(err.message || 'Failed to update reminder')
    }
  }

  const handleMarkTaken = async (id: string, time: string) => {
    try {
      await MedicineApi.markReminderTaken(id, time)
      triggerToast('Medicine marked as taken!')
      loadReminders()
    } catch (err: any) {
      triggerToast(err.message || 'Failed to mark as taken')
    }
  }

  const addTimeSlot = () => {
    if (times.length < 6) {
      setTimes([...times, '12:00'])
    } else {
      triggerToast('Maximum 6 time slots allowed')
    }
  }

  const removeTimeSlot = (index: number) => {
    if (times.length > 1) {
      setTimes(times.filter((_, i) => i !== index))
    } else {
      triggerToast('At least one time slot is required')
    }
  }

  const updateTimeSlot = (index: number, value: string) => {
    const updated = [...times]
    updated[index] = value
    setTimes(updated)
  }

  const resetForm = () => {
    setMedicineName('')
    setMedicineId('')
    setTimes(['08:00'])
    setFrequency('daily')
    setStartDate(new Date().toISOString().split('T')[0])
    setEndDate('')
    setNotes('')
    setPharmacistInstructions('')
  }

  const getNextDoseInfo = (reminder: Reminder) => {
    if (!reminder.isActive || !reminder.nextDose) return null
    
    const now = new Date()
    const [hours, minutes] = reminder.nextDose.split(':').map(Number)
    const nextDoseTime = new Date()
    nextDoseTime.setHours(hours, minutes, 0, 0)
    
    if (nextDoseTime <= now) {
      nextDoseTime.setDate(nextDoseTime.getDate() + 1)
    }
    
    const diffMs = nextDoseTime.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    return {
      time: reminder.nextDose,
      hoursLeft: diffHours,
      minutesLeft: diffMinutes,
      isDue: diffHours === 0 && diffMinutes <= 5
    }
  }

  // Get active reminders count
  const activeCount = reminders.filter(r => r.isActive).length
  const dueCount = reminders.filter(r => {
    const nextDose = getNextDoseInfo(r)
    return nextDose?.isDue
  }).length

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 relative">
      
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-3">
            <Bell className="w-6 h-6 text-health-primary" />
            <div>
              <h1 className="text-2xl font-black text-gray-900">Medicine Reminders</h1>
              <p className="text-gray-500 text-xs mt-1">Never miss a dose - set up personalized medication schedules</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-health-primary hover:bg-health-secondary text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reminder</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 rounded-lg text-health-primary">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Active Reminders</span>
            <span className="text-lg font-black text-gray-950">{activeCount}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center space-x-3">
          <div className="p-2.5 bg-amber-50 rounded-lg text-amber-700">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Due Soon</span>
            <span className="text-lg font-black text-gray-950">{dueCount}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 rounded-lg text-blue-700">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Total Doses Today</span>
            <span className="text-lg font-black text-gray-950">
              {reminders.filter(r => r.isActive).reduce((sum, r) => sum + r.times.length, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Reminders List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400 flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Loading reminders...</span>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-600 text-xs">{error}</div>
        ) : reminders.length === 0 ? (
          <div className="py-16 text-center text-gray-400 space-y-3">
            <Bell className="w-12 h-12 text-gray-200 mx-auto" />
            <p className="text-xs">No reminders set up yet. Create your first reminder to stay on track with your medications.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reminders.map((reminder) => {
              const nextDose = getNextDoseInfo(reminder)
              return (
                <div key={reminder.id} className={`p-5 ${!reminder.isActive ? 'opacity-50' : ''}`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* Medicine Info */}
                    <div className="flex-grow space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-gray-900 text-base">{reminder.medicineName}</h3>
                        {!reminder.isActive && (
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            Inactive
                          </span>
                        )}
                        {nextDose?.isDue && (
                          <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 animate-pulse">
                            Due Now!
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{reminder.frequency === 'daily' ? 'Daily' : reminder.frequency}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Since {new Date(reminder.startDate).toLocaleDateString()}</span>
                        </span>
                      </div>

                      {/* Time Slots */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {reminder.times.map((time, idx) => {
                          const isDue = nextDose?.time === time && nextDose?.isDue
                          return (
                            <div
                              key={idx}
                              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${
                                isDue 
                                  ? 'bg-red-50 border-red-200 text-red-700' 
                                  : 'bg-gray-50 border-gray-200 text-gray-700'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              <span>{time}</span>
                              {reminder.isActive && (
                                <button
                                  onClick={() => handleMarkTaken(reminder.id, time)}
                                  className="hover:text-emerald-600 transition-colors"
                                  title="Mark as taken"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {reminder.pharmacistInstructions && (
                        <div className="flex items-start space-x-2 text-xs text-gray-600 bg-blue-50 p-2 rounded mt-2">
                          <Info className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className="font-medium">{reminder.pharmacistInstructions}</span>
                        </div>
                      )}
                    </div>

                    {/* Next Dose Info & Actions */}
                    <div className="flex items-center space-x-3">
                      {nextDose && reminder.isActive && (
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 block uppercase font-bold">Next Dose</span>
                          <span className="text-sm font-black text-gray-900">{nextDose.time}</span>
                          <span className="text-[10px] text-gray-500 block">
                            {nextDose.hoursLeft > 0 && `in ${nextDose.hoursLeft}h ${nextDose.minutesLeft}m`}
                            {nextDose.hoursLeft === 0 && nextDose.minutesLeft > 0 && `in ${nextDose.minutesLeft}m`}
                            {nextDose.hoursLeft === 0 && nextDose.minutesLeft === 0 && 'now'}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleActive(reminder.id, reminder.isActive)}
                          className={`p-2 rounded-lg transition-colors ${
                            reminder.isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                          }`}
                          title={reminder.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {reminder.isActive ? <Bell className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Delete reminder"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div className="portal-modal-backdrop absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="portal-modal-panel relative w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-10">
            <div className="bg-white text-gray-900 px-6 py-5 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                  <Pill className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-black text-base">Add Medicine Reminder</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">Set up your medication schedule</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} aria-label="Close reminder dialog" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReminder} className="portal-form p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  placeholder="e.g. Amoxicillin 500mg"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Dosage Times *</label>
                <div className="space-y-2">
                  {times.map((time, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="time"
                        required
                        value={time}
                        onChange={(e) => updateTimeSlot(idx, e.target.value)}
                        className="flex-grow bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-bold"
                      />
                      {times.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(idx)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {times.length < 6 && (
                    <button
                      type="button"
                      onClick={addTimeSlot}
                      className="text-xs text-health-primary font-bold hover:underline flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add another time</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-950 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="as_needed">As Needed</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">End Date (Optional)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Pharmacist Instructions</label>
                <textarea
                  rows={2}
                  value={pharmacistInstructions}
                  onChange={(e) => setPharmacistInstructions(e.target.value)}
                  placeholder="e.g. Take with food, avoid dairy products..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-bold leading-normal"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Personal Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-bold leading-normal"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2 rounded-lg text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-health-primary hover:bg-health-secondary text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Create Reminder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
