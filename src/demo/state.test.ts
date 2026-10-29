import { describe, expect, it, vi } from 'vitest'
import {
  STORAGE_KEY,
  appReducer,
  buildSessionRecord,
  countCompletedSets,
  createSeedState,
  getElapsedSeconds,
  isSetValid,
  loadState,
  parseReps,
  parseWeight,
  sanitizeState,
  saveState,
} from './state'
import type { AppState, StorageLike } from './state'
import { getProgram, programOrder } from './data'
import {
  getProgressSummary,
  getWeekStreak,
  getWeeklyStats,
} from './selectors'

class MemoryStorage implements StorageLike {
  data = new Map<string, string>()

  getItem(key: string): string | null {
    return this.data.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value)
  }

  removeItem(key: string): void {
    this.data.delete(key)
  }
}

const NOW = new Date(2026, 9, 29, 12, 0, 0, 0).getTime()
const LATER = NOW + 4 * 60 * 1000

function startPush(state = createSeedState(NOW)): AppState {
  return appReducer(state, { type: 'START_WORKOUT', programId: 'push', now: NOW })
}

describe('demo training state', () => {
  it('seeds a believable and stable training history', () => {
    const state = createSeedState(NOW)
    expect(state.sessions.length).toBeGreaterThan(20)
    expect(state.active).toBeNull()
    expect(Object.keys(state.records).length).toBeGreaterThan(0)
    for (const session of state.sessions) {
      expect(Date.parse(session.completedAt)).toBeLessThanOrEqual(NOW)
      expect(programOrder).toContain(session.programId)
      expect(session.volumeKg).toBeGreaterThan(0)
      expect(session.setsCompleted).toBeGreaterThan(0)
    }
    expect(getWeekStreak(state.sessions, NOW)).toBeGreaterThanOrEqual(8)
  })

  it('starts a session with editable plan sets', () => {
    const state = startPush()
    expect(state.active?.programId).toBe('push')
    expect(state.active?.entries).toHaveLength(getProgram('push').exercises.length)
    expect(state.active?.entries[0].sets).toHaveLength(4)
    expect(state.active?.entries[0].sets[0]).toEqual({
      weight: '82.5',
      reps: '8',
      done: false,
    })
  })

  it('edits values, rejects invalid sets, and logs completed sets', () => {
    let state = startPush()

    state = appReducer(state, {
      type: 'UPDATE_SET',
      exerciseIndex: 0,
      setIndex: 0,
      field: 'weight',
      value: '90.5',
    })
    state = appReducer(state, {
      type: 'UPDATE_SET',
      exerciseIndex: 0,
      setIndex: 0,
      field: 'reps',
      value: '10',
    })
    state = appReducer(state, {
      type: 'UPDATE_SET',
      exerciseIndex: 0,
      setIndex: 0,
      field: 'reps',
      value: '0',
    })
    expect(isSetValid(state.active!.entries[0].sets[0])).toBe(false)

    const rejected = appReducer(state, { type: 'TOGGLE_SET', exerciseIndex: 0, setIndex: 0 })
    expect(rejected.active?.entries[0].sets[0].done).toBe(false)

    state = appReducer(state, {
      type: 'UPDATE_SET',
      exerciseIndex: 0,
      setIndex: 0,
      field: 'reps',
      value: '10',
    })
    state = appReducer(state, { type: 'TOGGLE_SET', exerciseIndex: 0, setIndex: 0 })
    expect(state.active?.entries[0].sets[0].done).toBe(true)
    expect(countCompletedSets(state.active!)).toBe(1)

    state = appReducer(state, { type: 'TOGGLE_SET', exerciseIndex: 0, setIndex: 0 })
    expect(state.active?.entries[0].sets[0].done).toBe(false)
  })

  it('freezes elapsed time while paused and resumes accurately', () => {
    const state = startPush()
    expect(getElapsedSeconds(state.active!, NOW + 65_000)).toBe(65)

    const paused = appReducer(state, { type: 'PAUSE_TIMER', now: NOW + 10_000 })
    expect(getElapsedSeconds(paused.active!, NOW + 25_000)).toBe(10)

    const resumed = appReducer(paused, { type: 'RESUME_TIMER', now: NOW + 30_000 })
    expect(resumed.active?.pausedMs).toBe(20_000)
    expect(getElapsedSeconds(resumed.active!, NOW + 40_000)).toBe(20)
  })

  it('finishes a workout, updates records, and clears the active session', () => {
    let state = startPush()
    state = appReducer(state, {
      type: 'UPDATE_SET',
      exerciseIndex: 0,
      setIndex: 0,
      field: 'weight',
      value: '120',
    })
    state = appReducer(state, {
      type: 'UPDATE_SET',
      exerciseIndex: 0,
      setIndex: 0,
      field: 'reps',
      value: '8',
    })
    state = appReducer(state, { type: 'TOGGLE_SET', exerciseIndex: 0, setIndex: 0 })

    const active = state.active!
    const summary = buildSessionRecord(active, LATER)
    expect(summary).not.toBeNull()
    expect(summary?.volumeKg).toBe(960)
    expect(summary?.setsCompleted).toBe(1)

    const finished = appReducer(state, { type: 'FINISH_WORKOUT', session: summary! })
    expect(finished.active).toBeNull()
    expect(finished.records['bench-press']).toBe(120)
    expect(finished.sessions[0].id).toBe(summary!.id)
    expect(finished.sessions.length).toBe(state.sessions.length + 1)
  })

  it('does not build an empty session', () => {
    const state = startPush()
    expect(buildSessionRecord(state.active!, LATER)).toBeNull()
  })

  it('can discard an active session without adding history', () => {
    const state = startPush()
    const discarded = appReducer(state, { type: 'CANCEL_WORKOUT' })
    expect(discarded.active).toBeNull()
    expect(discarded.sessions).toHaveLength(state.sessions.length)
  })

  it('persists completed sessions across reloads', () => {
    const storage = new MemoryStorage()
    let state = startPush()
    state = appReducer(state, { type: 'TOGGLE_SET', exerciseIndex: 0, setIndex: 0 })
    const summary = buildSessionRecord(state.active!, LATER)
    state = appReducer(state, { type: 'FINISH_WORKOUT', session: summary! })
    saveState(storage, state)

    const restored = loadState(storage, LATER + 1000)
    expect(restored.sessions[0].id).toBe(summary!.id)
    expect(restored.records['bench-press']).toBe(112.5)
    expect(restored.active).toBeNull()
  })

  it('resets to demo seed data', () => {
    let state = startPush()
    state = appReducer(state, { type: 'TOGGLE_SET', exerciseIndex: 0, setIndex: 0 })
    const reset = appReducer(state, { type: 'RESET_DEMO', now: NOW })
    expect(reset.active).toBeNull()
    expect(reset.sessions).toHaveLength(createSeedState(NOW).sessions.length)
  })
})

describe('input and storage resilience', () => {
  it('validates weight and rep input boundaries', () => {
    expect(parseWeight('82.5')).toBe(82.5)
    expect(parseWeight('82,5')).toBe(82.5)
    expect(parseWeight('')).toBeNull()
    expect(parseWeight('-5')).toBeNull()
    expect(parseWeight('1000')).toBeNull()
    expect(parseWeight('abc')).toBeNull()

    expect(parseReps('8')).toBe(8)
    expect(parseReps('0')).toBeNull()
    expect(parseReps('101')).toBeNull()
    expect(parseReps('8.5')).toBeNull()
  })

  it('starts clean when stored data is corrupt JSON', () => {
    const storage = new MemoryStorage()
    storage.setItem(STORAGE_KEY, '{this is not json')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const state = loadState(storage, NOW)
    expect(state.active).toBeNull()
    expect(state.sessions.length).toBeGreaterThan(0)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('starts clean when the stored schema is wrong', () => {
    const storage = new MemoryStorage()
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, sessions: 'nope' }))
    const state = loadState(storage, NOW)
    expect(Array.isArray(state.sessions)).toBe(true)
    expect(state.sessions.length).toBeGreaterThan(0)
  })

  it('ignores an invalid active session while preserving valid sessions', () => {
    const storage = new MemoryStorage()
    const state = startPush()
    const serialized = JSON.parse(JSON.stringify(state))
    serialized.active.entries = []
    storage.setItem(STORAGE_KEY, JSON.stringify(serialized))

    const restored = loadState(storage, NOW)
    expect(restored.active).toBeNull()
    expect(restored.sessions.length).toBe(state.sessions.length)
  })

  it('filters malformed session records without crashing', () => {
    const valid = createSeedState(NOW).sessions[0]
    const sanitized = sanitizeState({
      version: 1,
      active: null,
      records: { 'bench-press': 300, nonsense: 'x' },
      sessions: [
        valid,
        { ...valid, id: 'bad-date', completedAt: 'not-a-date' },
        { ...valid, programId: 'unknown' },
        { ...valid, exercises: [{ exerciseId: 'not-real', name: 'X', sets: [] }] },
      ],
    })
    expect(sanitized?.sessions).toHaveLength(1)
    expect(sanitized?.records['bench-press']).toBe(300)
    expect(sanitized?.records.nonsense).toBeUndefined()
  })

  it('does not throw if browser storage access fails', () => {
    const failing: StorageLike = {
      getItem: () => {
        throw new Error('denied')
      },
      setItem: () => {
        throw new Error('denied')
      },
      removeItem: () => {
        throw new Error('denied')
      },
    }
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    expect(() => loadState(failing, NOW)).not.toThrow()
    expect(() => saveState(failing, createSeedState(NOW))).not.toThrow()
    warn.mockRestore()
  })
})

describe('progress selectors', () => {
  it('builds the right number of chart points for each time filter', () => {
    const state = createSeedState(NOW)
    expect(getProgressSummary(state, '7D', NOW).points).toHaveLength(7)
    expect(getProgressSummary(state, '4W', NOW).points).toHaveLength(4)
    expect(getProgressSummary(state, '12W', NOW).points).toHaveLength(12)
  })

  it('creates varying weekly volume for an editorial chart', () => {
    const state = createSeedState(NOW)
    const volumes = getProgressSummary(state, '4W', NOW).points.map((point) => point.volumeKg)
    expect(new Set(volumes).size).toBeGreaterThan(1)
    expect(volumes.every((volume) => Number.isFinite(volume) && volume >= 0)).toBe(true)
  })

  it('reports this week’s sessions and a streak from local data', () => {
    const state = createSeedState(NOW)
    const weekly = getWeeklyStats(state, NOW)
    expect(weekly.sessionsThisWeek).toBeGreaterThan(0)
    expect(weekly.activeDays).toBeGreaterThan(0)
    expect(weekly.days).toHaveLength(7)
    expect(weekly.days.filter((day) => day.hasTrained)).toHaveLength(weekly.activeDays)
  })
})
