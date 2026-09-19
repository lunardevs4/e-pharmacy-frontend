import { useCallback, useEffect, useMemo, useState } from 'react'
import { MedicineApi } from '@/services/medicine-api'

export type AdherenceStatus = 'pending' | 'completed' | 'missed' | 'skipped' | 'failed' | 'cancelled'

export interface AdherenceSchedule {
  id: string
  medicineName: string
  times: string[]
  isActive?: boolean
  startDate?: string
  endDate?: string
}

export interface DoseLog {
  id: string
  scheduleId: string
  medicineName: string
  status: AdherenceStatus
  createdAt: string
  confirmationTime?: string | null
  dosage?: string
}

export interface DoseAlert {
  id: string
  scheduleId: string
  medicineName: string
  time: string
  status: 'pending' | 'missed'
  logId?: string
  createdAt?: string
  source: 'log' | 'schedule'
}

const normalizeStatus = (value: unknown): AdherenceStatus => {
  const status = String(value || 'PENDING').toLowerCase()
  if (status === 'completed') return 'completed'
  if (status === 'missed') return 'missed'
  if (status === 'skipped') return 'skipped'
  if (status === 'failed') return 'failed'
  if (status === 'cancelled') return 'cancelled'
  return 'pending'
}

const dateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const isScheduleActive = (schedule: AdherenceSchedule, now: Date) => {
  if (schedule.isActive === false) return false
  if (schedule.startDate && new Date(schedule.startDate) > now) return false
  if (schedule.endDate && new Date(schedule.endDate) < now) return false
  return true
}

const toDoseTime = (date: Date, time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  const result = new Date(date)
  result.setHours(hours || 0, minutes || 0, 0, 0)
  return result
}

export function useMedicationAdherence(schedules: AdherenceSchedule[]) {
  const [logs, setLogs] = useState<DoseLog[]>([])
  const [summary, setSummary] = useState({
    scheduledDoses: 0,
    completedDoses: 0,
    missedDoses: 0,
    skippedDoses: 0,
    adherencePercentage: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [rawLogs, rawSummary] = await Promise.all([
        MedicineApi.getReminderLogs({ limit: 100 }),
        MedicineApi.getAdherenceSummary(),
      ])
      setLogs(rawLogs.map((log: any) => ({
        id: String(log.id),
        scheduleId: String(log.scheduleId || log.schedule?.id || ''),
        medicineName: log.schedule?.medicine?.tradeName || log.schedule?.medicine?.name || 'Medication',
        status: normalizeStatus(log.status),
        createdAt: log.createdAt || log.sentAt || new Date().toISOString(),
        confirmationTime: log.confirmationTime,
        dosage: log.schedule?.dosage,
      })))
      setSummary({
        scheduledDoses: Number(rawSummary.scheduledDoses || 0),
        completedDoses: Number(rawSummary.completedDoses || 0),
        missedDoses: Number(rawSummary.missedDoses || 0),
        skippedDoses: Number(rawSummary.skippedDoses || 0),
        adherencePercentage: Number(rawSummary.adherencePercentage || 0),
      })
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Unable to load medication adherence data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const timer = window.setInterval(load, 60_000)
    return () => window.clearInterval(timer)
  }, [load])

  const confirmDose = useCallback(async (logId: string) => {
    setConfirmingId(logId)
    try {
      await MedicineApi.markReminderLogTaken(logId)
      await load()
      return true
    } finally {
      setConfirmingId(null)
    }
  }, [load])

  const doseAlerts = useMemo<DoseAlert[]>(() => {
    const now = new Date()
    const today = dateKey(now)
    const alerts: DoseAlert[] = []
    const activeSchedules = schedules.filter((schedule) => isScheduleActive(schedule, now))

    logs
      .filter((log) => log.status === 'pending' || log.status === 'missed')
      .filter((log) => log.status === 'missed' || log.createdAt.slice(0, 10) === today)
      .forEach((log) => {
        const schedule = activeSchedules.find((item) => item.id === log.scheduleId)
        const time = schedule?.times?.[0] || new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        alerts.push({
          id: `log-${log.id}`,
          scheduleId: log.scheduleId,
          medicineName: log.medicineName,
          time,
          status: log.status === 'missed' ? 'missed' : 'pending',
          logId: log.id,
          createdAt: log.createdAt,
          source: 'log',
        })
      })

    // This client-side guard keeps the UI useful between scheduler runs. It never
    // marks a server log missed; the scheduler remains the source of truth.
    activeSchedules.forEach((schedule) => {
      schedule.times.forEach((time) => {
        const scheduledAt = toDoseTime(now, time)
        if (scheduledAt >= now) return
        const hasTodayLog = logs.some((log) => log.scheduleId === schedule.id && log.createdAt.slice(0, 10) === today)
        if (!hasTodayLog) {
          alerts.push({
            id: `schedule-${schedule.id}-${time}-${today}`,
            scheduleId: schedule.id,
            medicineName: schedule.medicineName,
            time,
            status: 'missed',
            source: 'schedule',
          })
        }
      })
    })

    return alerts.filter((alert, index, all) => all.findIndex((item) => item.id === alert.id) === index)
  }, [logs, schedules])

  return {
    logs,
    summary,
    doseAlerts,
    pendingDoses: doseAlerts.filter((dose) => dose.status === 'pending'),
    missedDoses: doseAlerts.filter((dose) => dose.status === 'missed'),
    loading,
    error,
    confirmingId,
    refresh: load,
    confirmDose,
  }
}
