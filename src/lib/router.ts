import { useMemo, useSyncExternalStore } from 'react'

export type RouteName = 'home' | 'workouts' | 'progress' | 'session'
export type RoutePath = '/' | '/workouts' | '/progress' | '/session'

export interface AppRoute {
  name: RouteName
  path: RoutePath
}

const PATH_TO_ROUTE: Record<RoutePath, RouteName> = {
  '/': 'home',
  '/workouts': 'workouts',
  '/progress': 'progress',
  '/session': 'session',
}

const FALLBACK_ROUTE: AppRoute = { name: 'home', path: '/' }

export function normalizePath(hash: string): RoutePath {
  const withoutHash = hash.startsWith('#') ? hash.slice(1) : hash
  const pathOnly = withoutHash.split('?')[0]
  if (pathOnly === '' || pathOnly === '/') return '/'
  const normalized = pathOnly.endsWith('/') ? pathOnly.slice(0, -1) : pathOnly
  if (normalized === '/workouts' || normalized === '/progress' || normalized === '/session') {
    return normalized
  }
  return '/'
}

export function parseRoute(hash: string): AppRoute {
  const path = normalizePath(hash)
  return { name: PATH_TO_ROUTE[path], path }
}

function subscribeToHash(callback: () => void): () => void {
  window.addEventListener('hashchange', callback)
  window.addEventListener('popstate', callback)
  return () => {
    window.removeEventListener('hashchange', callback)
    window.removeEventListener('popstate', callback)
  }
}

function getHashSnapshot(): string {
  return window.location.hash
}

function getServerSnapshot(): string {
  return ''
}

export function useRoute(): AppRoute {
  const hash = useSyncExternalStore(subscribeToHash, getHashSnapshot, getServerSnapshot)
  return useMemo(() => parseRoute(hash), [hash])
}

export function navigate(path: RoutePath): void {
  const nextHash = `#${path}`
  if (window.location.hash === nextHash) return
  window.location.hash = path
}

export function hrefFor(path: RoutePath): string {
  return `#${path}`
}

export { FALLBACK_ROUTE }
