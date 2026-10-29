import { motion } from 'motion/react'
import { ArrowUpRight, BarChart3, Dumbbell, Home } from 'lucide-react'
import type { RouteName } from '../lib/router'
import { hrefFor, useRoute } from '../lib/router'
import { demoProfile } from '../demo/data'
import { getUpNextProgram } from '../demo/selectors'
import { useDemoState, useElapsedSeconds, useStartTraining } from '../demo/AppState'
import { useI18n } from '../lib/i18n'
import { formatTimer } from '../lib/time'

export function Wordmark({ className = '' }: { className?: string }) {
  const { t } = useI18n()
  return (
    <span className={`wordmark ${className}`}>
      <span aria-hidden="true">
        {t('AMIR’S ', 'باشگاه ')}
        <span className="wordmark__slash">{t('GYM', 'امیر')}</span>
      </span>
      <span className="wordmark__dot" aria-hidden="true" />
    </span>
  )
}

export function LangToggle({ className = '' }: { className?: string }) {
  const { lang, toggleLang, t } = useI18n()
  return (
    <button
      type="button"
      className={`lang-toggle ${className}`}
      onClick={toggleLang}
      aria-label={t('Switch to Persian', 'تغییر به انگلیسی')}
      lang={lang === 'fa' ? 'en' : 'fa'}
    >
      {lang === 'fa' ? 'EN' : 'فا'}
    </button>
  )
}

export function SettingsButton({
  onOpenSettings,
  className = '',
}: {
  onOpenSettings: () => void
  className?: string
}) {
  const { t } = useI18n()
  return (
    <button
      type="button"
      className={`avatar-button ${className}`}
      onClick={onOpenSettings}
      aria-label={t(
        `Open demo settings and credits for ${demoProfile.initials}`,
        `باز کردن تنظیمات دمو برای ${demoProfile.initials}`,
      )}
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
  const { t } = useI18n()
  return (
    <header className={`mobile-header ${variant === 'overlay' ? 'mobile-header--overlay' : ''}`}>
      <a
        href={hrefFor('/')}
        className="brand-link"
        aria-label={t('Amir’s Gym home', 'خانهٔ باشگاه امیر')}
      >
        <Wordmark />
      </a>
      <span className="mobile-header__section" aria-hidden="true">
        {section}
      </span>
      <div className="mobile-header__actions">
        <LangToggle />
        <SettingsButton onOpenSettings={onOpenSettings} />
      </div>
    </header>
  )
}

const primaryLinks: Array<{ name: RouteName; path: '/' | '/workouts' | '/progress' }> = [
  { name: 'home', path: '/' },
  { name: 'workouts', path: '/workouts' },
  { name: 'progress', path: '/progress' },
]

const linkLabels: Record<string, [string, string]> = {
  home: ['Home', 'خانه'],
  workouts: ['Train', 'تمرین'],
  progress: ['Progress', 'پیشرفت'],
}

export function DesktopNav() {
  const route = useRoute()
  const { state } = useDemoState()
  const startTraining = useStartTraining()
  const elapsed = useElapsedSeconds(state.active)
  const nextProgram = getUpNextProgram(state)
  const { t } = useI18n()

  return (
    <header className="desktop-nav">
      <div className="desktop-nav__inner">
        <a
          href={hrefFor('/')}
          className="desktop-nav__brand"
          aria-label={t('Amir’s Gym home', 'خانهٔ باشگاه امیر')}
        >
          <Wordmark />
          <span className="desktop-nav__caption">{t('Strength division', 'بخش قدرت')}</span>
        </a>

        <nav className="desktop-nav__links" aria-label={t('Primary navigation', 'ناوبری اصلی')}>
          {primaryLinks.map((link) => {
            const active = route.name === link.name
            const [en, fa] = linkLabels[link.name]
            return (
              <a
                key={link.path}
                href={hrefFor(link.path)}
                className={`desktop-nav__link ${active ? 'is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {t(en, fa)}
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
            {state.active
              ? `${t('LIVE', 'زنده')} / ${formatTimer(elapsed)}`
              : t('DEMO / LOCAL', 'دمو / محلی')}
          </span>
          <LangToggle />
          <button
            type="button"
            className="btn btn--lime btn--compact"
            onClick={() => startTraining(state.active?.programId ?? nextProgram.id)}
          >
            {state.active
              ? t('Resume session', 'ادامهٔ جلسه')
              : t('Start training', 'شروع تمرین')}
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
  Icon: typeof Home
}> = [
  { name: 'home', path: '/', Icon: Home },
  { name: 'workouts', path: '/workouts', Icon: Dumbbell },
  { name: 'progress', path: '/progress', Icon: BarChart3 },
]

export function MobileBottomNav() {
  const route = useRoute()
  const { state } = useDemoState()
  const hasActiveSession = Boolean(state.active)
  const { t } = useI18n()

  return (
    <nav className="mobile-nav" aria-label={t('Primary mobile navigation', 'ناوبری اصلی موبایل')}>
      <div className="mobile-nav__inner">
        {navItems.map(({ name, path, Icon }) => {
          const active = route.name === name
          const [en, fa] = linkLabels[name]
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
                  <span
                    className="mobile-nav__live-dot"
                    aria-label={t('Workout in progress', 'تمرین در جریان')}
                  />
                ) : null}
              </span>
              <span className="mobile-nav__label">{t(en, fa)}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}
