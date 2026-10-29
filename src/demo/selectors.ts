import {
  exerciseById,
  featuredRecords,
  getProgram,
  initialRecords,
  nextProgramInRotation,
  programById,
} from './data'
import type { Program, ProgramId } from './data'
import type { AppState, SessionRecord } from './state'
import {
  addCalendarDays,
  formatShortDate,
  formatWeekdayNarrow,
  isSameDay,
  startOfDay,
  startOfWeek,
} from '../lib/time'

export type ProgressRange = '7D' | '4W' | '12W'

export interface WeekDay {
  timestamp: number
  label: string
  volumeKg: number
  sessions: number
  isToday: boolean
  isFuture: boolean
  hasTrained: boolean
}

export interface WeeklyStats {
  weekStart: number
  sessionsThisWeek: number
  volumeKg: number
  previousVolumeKg: number
  deltaPct: number | null
  activeDays: number
  target: number
  days: WeekDay[]
  streakWeeks: number
}

export interface ChartPoint {
  key: string
  label: string
  fullLabel: string
  volumeKg: number
  sessions: number
}

export interface ProgressSummary {
  range: ProgressRange
  points: ChartPoint[]
  sessions: SessionRecord[]
  totalVolumeKg: number
  sessionCount: number
  avgDurationSec: number
  totalSets: number
  deltaPct: number | null
  peakVolumeKg: number
}

function sessionsInRange(
  sessions: SessionRecord[],
  start: number,
  endExclusive: number,
): SessionRecord[] {
  return sessions.filter((session) => {
    const time = Date.parse(session.completedAt)
    return Number.isFinite(time) && time >= start && time < endExclusive
  })
}

export function getWeekStreak(sessions: SessionRecord[], now = Date.now()): number {
  const weekKeys = new Set(
    sessions.map((session) => startOfWeek(Date.parse(session.completedAt))).filter(Number.isFinite),
  )
  let cursor = startOfWeek(now)
  if (!weekKeys.has(cursor)) {
    cursor = addCalendarDays(cursor, -7)
  }
  let streak = 0
  while (weekKeys.has(cursor) && streak < 260) {
    streak += 1
    cursor = addCalendarDays(cursor, -7)
  }
  return streak
}

export function getWeeklyStats(state: AppState, now = Date.now(), target = 4): WeeklyStats {
  const weekStart = startOfWeek(now)
  const weekEnd = addCalendarDays(weekStart, 7)
  const previousStart = addCalendarDays(weekStart, -7)
  const current = sessionsInRange(state.sessions, weekStart, weekEnd)
  // Compare like-for-like: the same elapsed portion of last week, not a full week.
  const previousSamePoint = addCalendarDays(now, -7)
  const previous = sessionsInRange(state.sessions, previousStart, Math.max(previousStart, previousSamePoint))
  const currentVolume = current.reduce((total, session) => total + session.volumeKg, 0)
  const previousVolume = previous.reduce((total, session) => total + session.volumeKg, 0)
  const deltaPct = previousVolume > 0 ? ((currentVolume - previousVolume) / previousVolume) * 100 : null

  const todayStart = startOfDay(now)
  const days = Array.from({ length: 7 }, (_, index) => {
    const dayStart = addCalendarDays(weekStart, index)
    const dayEnd = addCalendarDays(dayStart, 1)
    const daySessions = sessionsInRange(state.sessions, dayStart, dayEnd)
    return {
      timestamp: dayStart,
      label: formatWeekdayNarrow(dayStart),
      volumeKg: daySessions.reduce((total, session) => total + session.volumeKg, 0),
      sessions: daySessions.length,
      isToday: isSameDay(dayStart, now),
      isFuture: dayStart > todayStart,
      hasTrained: daySessions.length > 0,
    }
  })

  return {
    weekStart,
    sessionsThisWeek: current.length,
    volumeKg: currentVolume,
    previousVolumeKg: previousVolume,
    deltaPct,
    activeDays: days.filter((day) => day.hasTrained).length,
    target,
    days,
    streakWeeks: getWeekStreak(state.sessions, now),
  }
}

function makeRangePoints(
  sessions: SessionRecord[],
  range: ProgressRange,
  now: number,
): ChartPoint[] {
  if (range === '7D') {
    const today = startOfDay(now)
    return Array.from({ length: 7 }, (_, index) => {
      const start = addCalendarDays(today, index - 6)
      const end = addCalendarDays(start, 1)
      const bucket = sessionsInRange(sessions, start, end)
      return {
        key: `day-${start}`,
        label: formatWeekdayNarrow(start),
        fullLabel: formatShortDate(start),
        volumeKg: Math.round(bucket.reduce((total, session) => total + session.volumeKg, 0)),
        sessions: bucket.length,
      }
    })
  }

  const count = range === '4W' ? 4 : 12
  const currentWeekStart = startOfWeek(now)
  return Array.from({ length: count }, (_, index) => {
    const start = addCalendarDays(currentWeekStart, -(count - 1 - index) * 7)
    const end = addCalendarDays(start, 7)
    const bucket = sessionsInRange(sessions, start, end)
    return {
      key: `week-${start}`,
      label:
        index === count - 1
          ? 'NOW'
          : range === '4W'
            ? formatShortDate(start)
            : `W${String(index + 1).padStart(2, '0')}`,
      fullLabel:
        index === count - 1
          ? 'CURRENT WEEK / IN PROGRESS'
          : `WEEK OF ${formatShortDate(start)}`,
      volumeKg: Math.round(bucket.reduce((total, session) => total + session.volumeKg, 0)),
      sessions: bucket.length,
    }
  })
}

export function getProgressSummary(
  state: AppState,
  range: ProgressRange,
  now = Date.now(),
): ProgressSummary {
  const points = makeRangePoints(state.sessions, range, now)
  const start =
    range === '7D'
      ? addCalendarDays(startOfDay(now), -6)
      : addCalendarDays(startOfWeek(now), -(range === '4W' ? 3 : 11) * 7)
  const end = addCalendarDays(
    range === '7D' ? addCalendarDays(startOfDay(now), 1) : addCalendarDays(startOfWeek(now), 7),
    0,
  )
  const sessions = sessionsInRange(state.sessions, start, end)
  const previousSpan = range === '7D' ? 7 : range === '4W' ? 28 : 84
  const previousStart = addCalendarDays(start, -previousSpan)
  const currentSpanMs = Math.max(0, now - start)
  const previousSessions = sessionsInRange(
    state.sessions,
    previousStart,
    Math.min(start, previousStart + currentSpanMs),
  )
  const totalVolumeKg = sessions.reduce((total, session) => total + session.volumeKg, 0)
  const previousVolume = previousSessions.reduce((total, session) => total + session.volumeKg, 0)
  const durationTotal = sessions.reduce((total, session) => total + session.durationSec, 0)
  const totalSets = sessions.reduce((total, session) => total + session.setsCompleted, 0)

  return {
    range,
    points,
    sessions,
    totalVolumeKg,
    sessionCount: sessions.length,
    avgDurationSec: sessions.length > 0 ? durationTotal / sessions.length : 0,
    totalSets,
    deltaPct: previousVolume > 0 ? ((totalVolumeKg - previousVolume) / previousVolume) * 100 : null,
    peakVolumeKg: points.reduce((peak, point) => Math.max(peak, point.volumeKg), 0),
  }
}

export function getNextProgramId(state: AppState): ProgramId {
  if (state.active) return state.active.programId
  const latest = [...state.sessions].sort(
    (a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt),
  )[0]
  if (!latest) return 'push'
  return nextProgramInRotation(latest.programId)
}

export function getUpNextProgram(state: AppState): Program {
  return getProgram(getNextProgramId(state))
}

export function getRecentSessions(state: AppState, limit = 5): SessionRecord[] {
  return [...state.sessions]
    .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))
    .slice(0, limit)
}

export function getProgramForSession(session: SessionRecord): Program {
  return programById[session.programId]
}

export function getRecordCards(state: AppState) {
  return featuredRecords.map((record) => {
    const current = state.records[record.exerciseId] ?? initialRecords[record.exerciseId] ?? 0
    const baseline = initialRecords[record.exerciseId] ?? 0
    const exercise = exerciseById[record.exerciseId]
    return {
      ...record,
      weight: current,
      progress: Math.max(0, current - baseline),
      exerciseName: exercise?.name ?? record.label,
    }
  })
}

export function getAllTimeStats(state: AppState) {
  const totalVolumeKg = state.sessions.reduce((total, session) => total + session.volumeKg, 0)
  const totalSets = state.sessions.reduce((total, session) => total + session.setsCompleted, 0)
  const totalSeconds = state.sessions.reduce((total, session) => total + session.durationSec, 0)
  return {
    totalVolumeKg,
    totalSets,
    totalSessions: state.sessions.length,
    totalHours: totalSeconds / 3600,
  }
}

export function getProgramFullStats(program: Program) {
  const totalSets = program.exercises.reduce((total, exercise) => total + exercise.sets, 0)
  const totalReps = program.exercises.reduce(
    (total, exercise) => total + exercise.sets * exercise.reps,
    0,
  )
  return { totalSets, totalReps }
}
