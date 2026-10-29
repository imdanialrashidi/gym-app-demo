import { motion } from 'motion/react'
import { ArrowUpRight, BarChart3, Dumbbell, Home } from 'lucide-react'
import type { RouteName } from '../lib/router'
import { hrefFor, useRoute } from '../lib/router'
import { demoProfile } from '../demo/data'
import { getUpNextProgram } from '../demo/selectors'
import { useDemoState, useElapsedSeconds, useStartTraining } from '../demo/AppState'
import { formatTimer } from '../lib/time'

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`}>
      <span aria-hidden="true">
        REP<span className="wordmark__slash">//</span>LAB
      </span>
      <span className="wordmark__dot" aria-hidden="true" />
    </span>
  )
}

export function SettingsButton({
  onOpenSettings,
  className = '',
}: {
  onOpenSettings: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      className={`avatar-button ${className}`}
      onClick={onOpenSettings}
      aria-label="Open demo settings and credits for DR"
    >
      <span className="avatar-button__initials" aria-hidden="true">
        {demoProfile.initials}
      </span>
      <span className="avatar-button__dot" aria-hidden="true" />
    </button>
  )
}

interface MobilePageHeaderProps {
  section: string
  onOpenSettings: () => void
  variant?: 'solid' | 'overlay'
}

export function MobilePageHeader({
  section,
  onOpenSettings,
  variant = 'solid',
}: MobilePageHeaderProps) {
  return (
    <header className={`mobile-header ${variant === 'overlay' ? 'mobile-header--overlay' : ''}`}>
      <a href={hrefFor('/')} className="brand-link" aria-label="REP//LAB home">
        <Wordmark />
      </a>
      <span className="mobile-header__section" aria-hidden="true">
        {section}
      </span>
      <SettingsButton onOpenSettings={onOpenSettings} />
    </header>
  )
}

const primaryLinks: Array<{ name: RouteName; path: '/' | '/workouts' | '/progress'; label: string }> = [
  { name: 'home', path: '/', label: 'Home' },
  { name: 'workouts', path: '/workouts', label: 'Train' },
  { name: 'progress', path: '/progress', label: 'Progress' },
]

export function DesktopNav() {
  const route = useRoute()
  const { state } = useDemoState()
  const startTraining = useStartTraining()
  const elapsed = useElapsedSeconds(state.active)
  const nextProgram = getUpNextProgram(state)

  return (
    <header className="desktop-nav">
      <div className="desktop-nav__inner">
        <a href={hrefFor('/')} className="desktop-nav__brand" aria-label="REP//LAB home">
          <Wordmark />
          <span className="desktop-nav__caption">Strength division</span>
        </a>

        <nav className="desktop-nav__links" aria-label="Primary navigation">
          {primaryLinks.map((link) => {
            const active = route.name === link.name
            return (
              <a
                key={link.path}
                href={hrefFor(link.path)}
                className={`desktop-nav__link ${active ? 'is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
                {active ? (
                  <motion.span
                    className="desktop-nav__indicator"
                    layoutId="desktop-nav-indicator"
                    transition={{ type: 'spring', stiffness: 430, damping: 36 }}
                  />
                ) : null}
              </a>
            )
          })}
        </nav>

        <div className="desktop-nav__actions">
          <span className="desktop-nav__status">
            <span className="status-dot" aria-hidden="true" />
            {state.active ? `LIVE / ${formatTimer(elapsed)}` : 'DEMO / LOCAL'}
          </span>
          <button
            type="button"
            className="btn btn--lime btn--compact"
            onClick={() => startTraining(state.active?.programId ?? nextProgram.id)}
          >
            {state.active ? 'Resume session' : 'Start training'}
            <ArrowUpRight size={15} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}

const navItems: Array<{
  name: RouteName
  path: '/' | '/workouts' | '/progress'
  label: string
  Icon: typeof Home
}> = [
  { name: 'home', path: '/', label: 'Home', Icon: Home },
  { name: 'workouts', path: '/workouts', label: 'Train', Icon: Dumbbell },
  { name: 'progress', path: '/progress', label: 'Progress', Icon: BarChart3 },
]

export function MobileBottomNav() {
  const route = useRoute()
  const { state } = useDemoState()
  const hasActiveSession = Boolean(state.active)

  return (
    <nav className="mobile-nav" aria-label="Primary mobile navigation">
      <div className="mobile-nav__inner">
        {navItems.map(({ name, path, label, Icon }) => {
          const active = route.name === name
          return (
            <a
              key={path}
              href={hrefFor(path)}
              className={`mobile-nav__item ${active ? 'is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {active ? (
                <motion.span
                  className="mobile-nav__active-bar"
                  layoutId="mobile-nav-active"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              ) : null}
              <span className="mobile-nav__icon-wrap">
                <Icon
                  size={20}
                  strokeWidth={active ? 2.4 : 1.8}
                  aria-hidden="true"
                  className="mobile-nav__icon"
                />
                {name === 'workouts' && hasActiveSession ? (
                  <span className="mobile-nav__live-dot" aria-label="Workout in progress" />
                ) : null}
              </span>
              <span className="mobile-nav__label">{label}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}
