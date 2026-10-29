import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import type { Dispatch, ReactNode } from 'react'
import type { ProgramId } from './data'
import {
  appReducer,
  getBrowserStorage,
  getElapsedSeconds,
  loadState,
  saveState,
} from './state'
import type { ActiveSession, AppAction, AppState, StorageLike } from './state'
import { navigate } from '../lib/router'

interface DemoStateValue {
  state: AppState
  dispatch: Dispatch<AppAction>
}

const DemoStateContext = createContext<DemoStateValue | null>(null)

export function DemoStateProvider({ children }: { children: ReactNode }) {
  const storageRef = useRef<StorageLike | null>(null)
  const [state, dispatch] = useReducer(
    appReducer,
    null,
    () => {
      storageRef.current = getBrowserStorage()
      return loadState(storageRef.current, Date.now())
    },
  )

  useEffect(() => {
    saveState(storageRef.current, state)
  }, [state])

  const value = useMemo(() => ({ state, dispatch }), [state])

  return <DemoStateContext.Provider value={value}>{children}</DemoStateContext.Provider>
}

export function useDemoState(): DemoStateValue {
  const context = useContext(DemoStateContext)
  if (!context) {
    throw new Error('useDemoState must be used inside DemoStateProvider')
  }
  return context
}

export function useElapsedSeconds(active: ActiveSession | null): number {
  const [now, setNow] = useState(() => Date.now())
  const paused = active?.paused ?? true
  const startedAt = active?.startedAt
  const pausedAt = active?.pausedAt
  const pausedMs = active?.pausedMs

  useEffect(() => {
    if (!active || paused) {
      setNow(Date.now())
      return
    }
    setNow(Date.now())
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [active, paused, startedAt, pausedAt, pausedMs])

  return useMemo(() => (active ? getElapsedSeconds(active, now) : 0), [active, now])
}

export function useStartTraining() {
  const { state, dispatch } = useDemoState()
  return useCallback(
    (programId: ProgramId) => {
      if (!state.active) {
        dispatch({ type: 'START_WORKOUT', programId, now: Date.now() })
      }
      navigate('/session')
    },
    [dispatch, state.active],
  )
}
