import React, { useState, useEffect, useMemo } from 'react'
import { MedicineApi } from '@/services/medicine-api'
import {
  CheckCircle2, XCircle, Clock, TrendingUp, TrendingDown,
  Calendar, Pill, RefreshCw, AlertCircle, ChevronDown, ChevronUp,
  BarChart2, Activity
} from 'lucide-react'

interface AdherenceRecord {
  reminderId: string
  medicineName: string
  date: string
  scheduledTime: string
  takenAt: string | null
  status: 'taken' | 'missed' | 'late'
  notes?: string
}

interface AdherenceSummary {
  medicineName: string
  reminderId: string
  totalDoses: number
  takenOnTime: number
  takenLate: number
  missed: number
  adherenceRate: number
  streak: number
}

function buildAdherenceFromReminders(reminders: any[]): { records: AdherenceRecord[]; summaries: AdherenceSummary[] } {
  const records: AdherenceRecord[] = []
  const summaries: AdherenceSummary[] = []

  for (const r of reminders) {
    const history: Array<{ time: string; date: string }> = r.takenHistory || []
    const startDate = new Date(r.startDate || Date.now() - 30 * 86400000)
    const endDate = r.endDate ? new Date(r.endDate) : new Date()
    const days = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000))
    const times: string[] = r.times || ['08:00']

    let takenOnTime = 0, takenLate = 0, missed = 0, streak = 0, streakActive = true

    for (let d = 0; d < days; d++) {
      const date = new Date(startDate.getTime() + d * 86400000)
      const dateStr = date.toISOString().split('T')[0]

      for (const t of times) {
        const taken = history.find(h => h.date === dateStr)
        let status: 'taken' | 'missed' | 'late' = 'missed'
        let takenAt: string | null = null

        if (taken) {
          const scheduledHour = parseInt(t.split(':')[0])
          const takenHour = parseInt(taken.time.split(':')[0])
          status = Math.abs(takenHour - scheduledHour) <= 1 ? 'taken' : 'late'
          takenAt = taken.time
          if (status === 'taken') takenOnTime++
          else takenLate++
          if (streakActive) streak++
        } else {
          missed++
          streakActive = false
        }

        records.push({
          reminderId: r.id,
          medicineName: r.medicineName,
          date: dateStr,
          scheduledTime: t,
          takenAt,
          status,
          notes: r.notes,
        })
      }
    }

    const totalDoses = takenOnTime + takenLate + missed
    summaries.push({
      reminderId: r.id,
      medicineName: r.medicineName,
      totalDoses,
      takenOnTime,
      takenLate,
      missed,
      adherenceRate: totalDoses > 0 ? Math.round(((takenOnTime + takenLate) / totalDoses) * 100) : 0,
      streak,
    })
  }

  return { records, summaries }
}

export default function AdherenceHistory() {
  const [reminders, setReminders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedMed, setExpandedMed] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30')

  useEffect(() => {
    setLoading(true)
    MedicineApi.getReminders()
      .then(setReminders)
      .catch(err => setError(err.message || 'Failed to load adherence data'))
      .finally(() => setLoading(false))
  }, [])

  const { records, summaries } = useMemo(
    () => buildAdherenceFromReminders(reminders),
    [reminders]
  )

  const filteredRecords = useMemo(() => {
    const cutoff = new Date(Date.now() - parseInt(dateRange) * 86400000).toISOString().split('T')[0]
    return records.filter(r => r.date >= cutoff)
  }, [records, dateRange])

  const overallRate = summaries.length > 0
    ? Math.round(summaries.reduce((s, m) => s + m.adherenceRate, 0) / summaries.length)
    : 0

  const rateColor = overallRate >= 80 ? 'text-emerald-600' : overallRate >= 60 ? 'text-amber-600' : 'text-red-600'
  const rateBg = overallRate >= 80 ? 'bg-emerald-50 border-emerald-200' : overallRate >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
      <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
      <span className="text-sm">Loading adherence data…</span>
    </div>
  )

  if (error) return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800 text-sm">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    </div>
  )

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto pb-16">

      {/* ── Header ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-lg text-health-primary">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-black text-gray-900">Adherence History</h1>
              <p className="text-xs text-gray-500 mt-0.5">Track how consistently you take your medications.</p>
            </div>
          </div>

          {/* Date range filter */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {(['7', '30', '90'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDateRange(d)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                  dateRange === d
                    ? 'bg-health-primary text-white border-health-primary'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {summaries.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl py-16 text-center text-gray-400 space-y-3">
          <Pill className="w-10 h-10 text-gray-200 mx-auto" />
          <p className="text-sm font-bold text-gray-500">No adherence data yet</p>
          <p className="text-xs">Set up medication reminders to start tracking.</p>
        </div>
      ) : (
        <>
          {/* ── Overall score ── */}
          <div className={`border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${rateBg}`}>
            <div className="flex-shrink-0">
              <div className={`text-4xl sm:text-5xl font-black ${rateColor}`}>{overallRate}%</div>
              <div className="text-xs font-bold text-gray-500 mt-0.5 uppercase tracking-wider">Overall Rate</div>
            </div>
            <div className="flex-grow grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'On Time', value: summaries.reduce((s, m) => s + m.takenOnTime, 0), color: 'text-emerald-600' },
                { label: 'Late', value: summaries.reduce((s, m) => s + m.takenLate, 0), color: 'text-amber-600' },
                { label: 'Missed', value: summaries.reduce((s, m) => s + m.missed, 0), color: 'text-red-600' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/60 rounded-lg p-2.5">
                  <div className={`text-lg sm:text-2xl font-black ${stat.color}`}>{stat.value}</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Per-medicine summaries ── */}
          <div className="space-y-3">
            {summaries.map(med => {
              const isOpen = expandedMed === med.reminderId
              const medRecords = filteredRecords.filter(r => r.reminderId === med.reminderId).slice(-14).reverse()
              const barColor = med.adherenceRate >= 80 ? 'bg-emerald-500' : med.adherenceRate >= 60 ? 'bg-amber-500' : 'bg-red-500'

              return (
                <div key={med.reminderId} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => setExpandedMed(isOpen ? null : med.reminderId)}
                    className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-emerald-50 rounded-lg flex-shrink-0">
                        <Pill className="w-4 h-4 text-health-primary" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-gray-900 text-sm block truncate">{med.medicineName}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">
                          {med.takenOnTime + med.takenLate}/{med.totalDoses} doses • {med.streak} day streak
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      <div className="text-right">
                        <span className={`text-sm font-black ${med.adherenceRate >= 80 ? 'text-emerald-600' : med.adherenceRate >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                          {med.adherenceRate}%
                        </span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1">
                          <div className={`h-1.5 rounded-full transition-all ${barColor}`} style={{ width: `${med.adherenceRate}%` }} />
                        </div>
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100 px-4 sm:px-5 py-4">
                      {medRecords.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-3">No records in selected range.</p>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Recent Doses</p>
                          {medRecords.map((rec, i) => (
                            <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                              <div className="flex items-center gap-2.5">
                                {rec.status === 'taken' ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                ) : rec.status === 'late' ? (
                                  <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                )}
                                <div>
                                  <span className="text-xs font-bold text-gray-800">{rec.date}</span>
                                  <span className="text-[10px] text-gray-400 ml-2">@ {rec.scheduledTime}</span>
                                </div>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                rec.status === 'taken' ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                : rec.status === 'late' ? 'text-amber-700 bg-amber-50 border-amber-200'
                                : 'text-red-700 bg-red-50 border-red-200'
                              }`}>
                                {rec.status === 'taken' ? 'On time' : rec.status === 'late' ? `Taken late${rec.takenAt ? ` (${rec.takenAt})` : ''}` : 'Missed'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
