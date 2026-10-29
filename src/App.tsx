import { lazy, Suspense, useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { DemoStateProvider } from './demo/AppState'
import { DesktopNav, MobileBottomNav, Wordmark } from './components/Chrome'
import { SettingsSheet } from './components/SettingsSheet'
import { HomePage } from './pages/HomePage'
import { I18nProvider, useI18n } from './lib/i18n'
import { useRoute } from './lib/router'
import type { RouteName } from './lib/router'

const WorkoutsPage = lazy(() =>
  import('./pages/WorkoutsPage').then((module) => ({ default: module.WorkoutsPage })),
)
const ProgressPage = lazy(() =>
  import('./pages/ProgressPage').then((module) => ({ default: module.ProgressPage })),
)
const SessionPage = lazy(() =>
  import('./pages/SessionPage').then((module) => ({ default: module.SessionPage })),
)

const PAGE_TITLES: Record<RouteName, [string, string]> = {
  home: ['Amir’s Gym — Build Beyond Limits.', 'باشگاه امیر — فراتر از حدها بساز.'],
  workouts: ['Training — Amir’s Gym', 'تمرین — باشگاه امیر'],
  progress: ['Progress — Amir’s Gym', 'پیشرفت — باشگاه امیر'],
  session: ['Live Session — Amir’s Gym', 'جلسهٔ زنده — باشگاه امیر'],
}

function RouteLoader() {
  const { t } = useI18n()
  return (
    <div className="route-loader" role="status" aria-label={t('Loading', 'در حال بارگذاری')}>
      <Wordmark />
      <span className="route-loader__line" aria-hidden="true" />
    </div>
  )
}

function AppFrame() {
  const route = useRoute()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const showNavigation = route.name !== 'session'
  const { lang, t } = useI18n()

  useEffect(() => {
    const [en, fa] = PAGE_TITLES[route.name]
    document.title = lang === 'fa' ? fa : en
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [route.name, lang])

  return (
    <div className={`app app--${route.name}`}>
      <a className="skip-link" href="#main-content">
        {t('Skip to content', 'رفتن به محتوا')}
      </a>
      {showNavigation ? <DesktopNav /> : null}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={route.name}
          id="main-content"
          tabIndex={-1}
          className="route-transition"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <Suspense fallback={<RouteLoader />}>
            {route.name === 'home' ? (
              <HomePage onOpenSettings={() => setSettingsOpen(true)} />
            ) : null}
            {route.name === 'workouts' ? (
              <WorkoutsPage onOpenSettings={() => setSettingsOpen(true)} />
            ) : null}
            {route.name === 'progress' ? (
              <ProgressPage onOpenSettings={() => setSettingsOpen(true)} />
            ) : null}
            {route.name === 'session' ? <SessionPage /> : null}
          </Suspense>
        </motion.div>
      </AnimatePresence>

      {showNavigation ? <MobileBottomNav /> : null}
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <I18nProvider>
        <DemoStateProvider>
          <AppFrame />
        </DemoStateProvider>
      </I18nProvider>
    </MotionConfig>
  )
}
