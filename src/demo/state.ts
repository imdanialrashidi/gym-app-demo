import { getProgram, exerciseById, initialRecords, programOrder } from './data'
import type { ProgramId } from './data'
import { addCalendarDays, startOfDay, startOfWeek } from '../lib/time'

export const STORAGE_KEY = 'rep-lab-demo-v1'
const STATE_VERSION = 1

export interface ActiveSetState {
  weight: string
  reps: string
  done: boolean
}

export interface ActiveExerciseState {
  exerciseId: string
  sets: ActiveSetState[]
}

export interface ActiveSession {
  programId: ProgramId
  startedAt: number
  paused: boolean
  pausedAt: number | null
  pausedMs: number
  currentExerciseIndex: number
  entries: ActiveExerciseState[]
}

export interface SessionSetRecord {
  weight: number
  reps: number
}

export interface SessionExerciseRecord {
  exerciseId: string
  name: string
  sets: SessionSetRecord[]
}

export interface SessionRecord {
  id: string
  programId: ProgramId
  completedAt: string
  durationSec: number
  volumeKg: number
  setsCompleted: number
  setsPlanned: number
  exercises: SessionExerciseRecord[]
}

export interface AppState {
  version: number
  sessions: SessionRecord[]
  active: ActiveSession | null
  records: Record<string, number>
}

export type SetField = 'weight' | 'reps'

export type AppAction =
  | { type: 'START_WORKOUT'; programId: ProgramId; now: number }
  | { type: 'UPDATE_SET'; exerciseIndex: number; setIndex: number; field: SetField; value: string }
  | { type: 'TOGGLE_SET'; exerciseIndex: number; setIndex: number }
  | { type: 'SET_CURRENT_EXERCISE'; exerciseIndex: number }
  | { type: 'PAUSE_TIMER'; now: number }
  | { type: 'RESUME_TIMER'; now: number }
  | { type: 'FINISH_WORKOUT'; session: SessionRecord }
  | { type: 'CANCEL_WORKOUT' }
  | { type: 'RESET_DEMO'; now: number }

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export function parseWeight(value: string): number | null {
  const normalized = value.trim().replace(',', '.')
  if (normalized === '' || !/^\d{1,3}(\.\d{1,2})?$/.test(normalized)) return null
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 999) return null
  return parsed
}

export function parseReps(value: string): number | null {
  const normalized = value.trim()
  if (normalized === '' || !/^\d{1,3}$/.test(normalized)) return null
  const parsed = Number(normalized)
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) return null
  return parsed
}

export function isSetValid(set: Pick<ActiveSetState, 'weight' | 'reps'>): boolean {
  return parseWeight(set.weight) !== null && parseReps(set.reps) !== null
}

export function getElapsedSeconds(active: ActiveSession, now = Date.now()): number {
  const effectiveNow = active.paused && active.pausedAt !== null ? active.pausedAt : now
  const pausedTime = active.pausedMs + (active.paused ? 0 : 0)
  return Math.max(0, Math.floor((effectiveNow - active.startedAt - pausedTime) / 1000))
}

function createActiveSession(programId: ProgramId, now: number): ActiveSession {
  const program = getProgram(programId)
  return {
    programId,
    startedAt: now,
    paused: false,
    pausedAt: null,
    pausedMs: 0,
    currentExerciseIndex: 0,
    entries: program.exercises.map((exercise) => ({
      exerciseId: exercise.id,
      sets: Array.from({ length: exercise.sets }, () => ({
        weight: String(exercise.weight),
        reps: String(exercise.reps),
        done: false,
      })),
    })),
  }
}

export function countCompletedSets(active: ActiveSession): number {
  return active.entries.reduce(
    (total, entry) => total + entry.sets.filter((set) => set.done).length,
    0,
  )
}

export function countPlannedSets(active: ActiveSession): number {
  return active.entries.reduce((total, entry) => total + entry.sets.length, 0)
}

export function completedVolume(active: ActiveSession): number {
  return Math.round(
    active.entries.reduce(
      (total, entry) =>
        total +
        entry.sets.reduce((sum, set) => {
          if (!set.done) return sum
          const weight = parseWeight(set.weight)
          const reps = parseReps(set.reps)
          return weight !== null && reps !== null ? sum + weight * reps : sum
        }, 0),
      0,
    ),
  )
}

export function buildSessionRecord(active: ActiveSession, now = Date.now()): SessionRecord | null {
  const setsCompleted = countCompletedSets(active)
  if (setsCompleted === 0) return null

  const exercises: SessionExerciseRecord[] = []
  for (const entry of active.entries) {
    const exercise = exerciseById[entry.exerciseId]
    const completedSets: SessionSetRecord[] = []
    for (const set of entry.sets) {
      if (!set.done) continue
      const weight = parseWeight(set.weight)
      const reps = parseReps(set.reps)
      if (weight !== null && reps !== null) completedSets.push({ weight, reps })
    }
    if (completedSets.length > 0) {
      exercises.push({
        exerciseId: entry.exerciseId,
        name: exercise?.name ?? 'Exercise',
        sets: completedSets,
      })
    }
  }

  if (exercises.length === 0) return null

  const volumeKg = Math.round(
    exercises.reduce(
      (total, exercise) =>
        total + exercise.sets.reduce((sum, set) => sum + set.weight * set.reps, 0),
      0,
    ),
  )

  return {
    id:
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `session-${now}-${Math.random().toString(36).slice(2, 8)}`,
    programId: active.programId,
    completedAt: new Date(now).toISOString(),
    durationSec: getElapsedSeconds(active, now),
    volumeKg,
    setsCompleted,
    setsPlanned: countPlannedSets(active),
    exercises,
  }
}

function applyRecords(records: Record<string, number>, session: SessionRecord): Record<string, number> {
  const next = { ...records }
  for (const exercise of session.exercises) {
    let best = next[exercise.exerciseId] ?? 0
    for (const set of exercise.sets) {
      best = Math.max(best, set.weight)
    }
    if (Number.isFinite(best)) next[exercise.exerciseId] = best
  }
  return next
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'START_WORKOUT': {
      if (state.active) return state
      return { ...state, active: createActiveSession(action.programId, action.now) }
    }

    case 'UPDATE_SET': {
      if (!state.active) return state
      const entry = state.active.entries[action.exerciseIndex]
      const set = entry?.sets[action.setIndex]
      if (!entry || !set || set.done) return state
      const value = action.value.slice(0, 8)
      if (value !== '' && !/^\d*[.,]?\d{0,2}$/.test(value)) return state
      return {
        ...state,
        active: {
          ...state.active,
          entries: state.active.entries.map((currentEntry, entryIndex) => {
            if (entryIndex !== action.exerciseIndex) return currentEntry
            return {
              ...currentEntry,
              sets: currentEntry.sets.map((currentSet, setIndex) => {
                if (setIndex !== action.setIndex) return currentSet
                return { ...currentSet, [action.field]: value }
              }),
            }
          }),
        },
      }
    }

    case 'TOGGLE_SET': {
      if (!state.active) return state
      const entry = state.active.entries[action.exerciseIndex]
      const set = entry?.sets[action.setIndex]
      if (!entry || !set) return state
      if (!set.done && !isSetValid(set)) return state
      return {
        ...state,
        active: {
          ...state.active,
          entries: state.active.entries.map((currentEntry, entryIndex) => {
            if (entryIndex !== action.exerciseIndex) return currentEntry
            return {
              ...currentEntry,
              sets: currentEntry.sets.map((currentSet, setIndex) => {
                if (setIndex !== action.setIndex) return currentSet
                return { ...currentSet, done: !currentSet.done }
              }),
            }
          }),
        },
      }
    }

    case 'SET_CURRENT_EXERCISE': {
      if (!state.active) return state
      const maxIndex = state.active.entries.length - 1
      const index = Math.max(0, Math.min(maxIndex, action.exerciseIndex))
      return { ...state, active: { ...state.active, currentExerciseIndex: index } }
    }

    case 'PAUSE_TIMER': {
      if (!state.active || state.active.paused) return state
      return {
        ...state,
        active: { ...state.active, paused: true, pausedAt: action.now },
      }
    }

    case 'RESUME_TIMER': {
      if (!state.active || !state.active.paused) return state
      const pausedFor = state.active.pausedAt ? Math.max(0, action.now - state.active.pausedAt) : 0
      return {
        ...state,
        active: {
          ...state.active,
          paused: false,
          pausedAt: null,
          pausedMs: state.active.pausedMs + pausedFor,
        },
      }
    }

    case 'FINISH_WORKOUT': {
      if (!state.active) return state
      if (action.session.programId !== state.active.programId) return state
      return {
        ...state,
        active: null,
        sessions: [action.session, ...state.sessions].sort(
          (a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt),
        ),
        records: applyRecords(state.records, action.session),
      }
    }

    case 'CANCEL_WORKOUT':
      if (!state.active) return state
      return { ...state, active: null }

    case 'RESET_DEMO':
      return createSeedState(action.now)

    default:
      return state
  }
}

function roundTo(value: number, step = 0.5): number {
  return Math.round(value / step) * step
}

function createSeedSessions(now: number): SessionRecord[] {
  const sessions: SessionRecord[] = []
  const currentWeekStart = startOfWeek(now)
  const seedStartProgramIndex = 1 // Oldest session starts on pull; this makes push 'up next'.
  let counter = 0

  for (let weeksAgo = 11; weeksAgo >= 0; weeksAgo -= 1) {
    const weekStart = addCalendarDays(currentWeekStart, -weeksAgo * 7)
    for (const dayIndex of [0, 2, 4]) {
      // One honest missed session every third week keeps the demo history believable.
      if (weeksAgo % 3 === 2 && dayIndex === 4) continue
      const date = new Date(addCalendarDays(weekStart, dayIndex))
      date.setHours(7, 10, 0, 0)
      const completedAtMs = date.getTime()
      if (completedAtMs > now) continue

      const programId = programOrder[(seedStartProgramIndex + counter) % programOrder.length]
      const program = getProgram(programId)
      const progression = 0.84 + ((11 - weeksAgo) / 11) * 0.16
      const exercises = program.exercises.map((exercise) => ({
        exerciseId: exercise.id,
        name: exercise.name,
        sets: Array.from({ length: exercise.sets }, () => ({
          weight: roundTo(exercise.weight * progression),
          reps: exercise.reps,
        })),
      }))
      const volumeKg = Math.round(
        exercises.reduce(
          (total, exercise) =>
            total + exercise.sets.reduce((sum, set) => sum + set.weight * set.reps, 0),
          0,
        ),
      )
      const durationVariation = ((counter * 7) % 9) - 4
      sessions.push({
        id: `seed-${programId}-${completedAtMs}`,
        programId,
        completedAt: new Date(completedAtMs).toISOString(),
        durationSec: (program.durationMin + durationVariation) * 60,
        volumeKg,
        setsCompleted: exercises.reduce((total, exercise) => total + exercise.sets.length, 0),
        setsPlanned: exercises.reduce((total, exercise) => total + exercise.sets.length, 0),
        exercises,
      })
      counter += 1
    }
  }

  return sessions.sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))
}

export function createSeedState(now = Date.now()): AppState {
  return {
    version: STATE_VERSION,
    sessions: createSeedSessions(now),
    active: null,
    records: { ...initialRecords },
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function finiteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function safeString(value: unknown, max = 160): value is string {
  return typeof value === 'string' && value.length <= max
}

function sanitizeSession(value: unknown): SessionRecord | null {
  if (!isObject(value)) return null
  const programId = value.programId
  if (programId !== 'push' && programId !== 'pull' && programId !== 'legs') return null
  if (!safeString(value.id, 120)) return null
  if (!safeString(value.completedAt, 60) || Number.isNaN(Date.parse(value.completedAt))) return null
  if (!finiteNumber(value.durationSec) || value.durationSec < 0 || value.durationSec > 86_400) return null
  if (!finiteNumber(value.setsPlanned) || value.setsPlanned < 0 || value.setsPlanned > 200) return null
  if (!Array.isArray(value.exercises) || value.exercises.length === 0 || value.exercises.length > 20) {
    return null
  }

  const exercises: SessionExerciseRecord[] = []
  for (const rawExercise of value.exercises) {
    if (!isObject(rawExercise) || !safeString(rawExercise.exerciseId, 80)) continue
    if (!Array.isArray(rawExercise.sets) || rawExercise.sets.length > 20) continue
    const known = exerciseById[rawExercise.exerciseId]
    if (!known) continue
    const sets: SessionSetRecord[] = []
    for (const rawSet of rawExercise.sets) {
      if (!isObject(rawSet)) continue
      if (!finiteNumber(rawSet.weight) || rawSet.weight < 0 || rawSet.weight > 999) continue
      if (!finiteNumber(rawSet.reps) || !Number.isInteger(rawSet.reps) || rawSet.reps < 1 || rawSet.reps > 100) {
        continue
      }
      sets.push({ weight: rawSet.weight, reps: rawSet.reps })
    }
    if (sets.length > 0) {
      exercises.push({ exerciseId: known.id, name: known.name, sets })
    }
  }
  if (exercises.length === 0) return null

  const setsCompleted = exercises.reduce((total, exercise) => total + exercise.sets.length, 0)
  const volumeKg = Math.round(
    exercises.reduce(
      (total, exercise) =>
        total + exercise.sets.reduce((sum, set) => sum + set.weight * set.reps, 0),
      0,
    ),
  )

  return {
    id: value.id,
    programId,
    completedAt: value.completedAt,
    durationSec: Math.floor(value.durationSec),
    volumeKg,
    setsCompleted,
    setsPlanned: Math.max(setsCompleted, Math.floor(value.setsPlanned)),
    exercises,
  }
}

function sanitizeActive(value: unknown): ActiveSession | null {
  if (!isObject(value)) return null
  const programId = value.programId
  if (programId !== 'push' && programId !== 'pull' && programId !== 'legs') return null
  if (!finiteNumber(value.startedAt) || value.startedAt <= 0) return null
  if (!finiteNumber(value.pausedMs) || value.pausedMs < 0) return null
  if (typeof value.paused !== 'boolean') return null
  if (value.pausedAt !== null && !finiteNumber(value.pausedAt)) return null
  if (!Array.isArray(value.entries)) return null

  const program = getProgram(programId)
  if (value.entries.length !== program.exercises.length) return null

  const entries: ActiveExerciseState[] = []
  for (let index = 0; index < program.exercises.length; index += 1) {
    const rawEntry = value.entries[index]
    if (!isObject(rawEntry) || rawEntry.exerciseId !== program.exercises[index].id) return null
    if (!Array.isArray(rawEntry.sets) || rawEntry.sets.length !== program.exercises[index].sets) return null
    const sets: ActiveSetState[] = []
    for (const rawSet of rawEntry.sets) {
      if (!isObject(rawSet)) return null
      if (typeof rawSet.weight !== 'string' || rawSet.weight.length > 8) return null
      if (typeof rawSet.reps !== 'string' || rawSet.reps.length > 8) return null
      if (typeof rawSet.done !== 'boolean') return null
      sets.push({ weight: rawSet.weight, reps: rawSet.reps, done: rawSet.done })
    }
    entries.push({ exerciseId: program.exercises[index].id, sets })
  }

  const currentIndex = Number.isInteger(value.currentExerciseIndex)
    ? Math.max(0, Math.min(entries.length - 1, value.currentExerciseIndex as number))
    : 0

  return {
    programId,
    startedAt: value.startedAt,
    paused: value.paused,
    pausedAt: value.pausedAt as number | null,
    pausedMs: value.pausedMs,
    currentExerciseIndex: currentIndex,
    entries,
  }
}

/** Exported for persistence tests and defensive loading. */
export function sanitizeState(value: unknown): AppState | null {
  if (!isObject(value) || value.version !== STATE_VERSION) return null
  if (!Array.isArray(value.sessions)) return null

  const sessions = value.sessions
    .slice(0, 500)
    .map(sanitizeSession)
    .filter((session): session is SessionRecord => session !== null)
    .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))

  const active = value.active === null ? null : sanitizeActive(value.active)

  const records: Record<string, number> = { ...initialRecords }
  if (isObject(value.records)) {
    for (const [key, record] of Object.entries(value.records)) {
      if (exerciseById[key] && finiteNumber(record) && record >= 0 && record <= 2000) {
        records[key] = record
      }
    }
  }

  return { version: STATE_VERSION, sessions, active, records }
}

export function loadState(storage: StorageLike | null, now = Date.now()): AppState {
  if (!storage) return createSeedState(now)
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return createSeedState(now)
    const parsed: unknown = JSON.parse(raw)
    const sanitized = sanitizeState(parsed)
    return sanitized ?? createSeedState(now)
  } catch (error) {
    console.warn('Amir’s Gym: stored demo data was unreadable; starting a clean demo.', error)
    return createSeedState(now)
  }
}

export function saveState(storage: StorageLike | null, state: AppState): void {
  if (!storage) return
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.warn('Amir’s Gym: could not persist demo data in this browser.', error)
  }
}

export function resetStoredDemo(storage: StorageLike | null, now = Date.now()): AppState {
  const next = createSeedState(now)
  if (storage) {
    try {
      storage.removeItem(STORAGE_KEY)
    } catch {
      // The reducer reset still works for this session.
    }
  }
  saveState(storage, next)
  return next
}

export function getBrowserStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null
  try {
    const storage = window.localStorage
    const probe = '__rep_lab_probe__'
    storage.setItem(probe, '1')
    storage.removeItem(probe)
    return storage
  } catch {
    return null
  }
}

export function isSameCalendarDay(a: number, b: number): boolean {
  return startOfDay(a) === startOfDay(b)
}
