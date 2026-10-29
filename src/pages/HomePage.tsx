import { useMemo, useRef } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Flame,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import {
  MobilePageHeader,
  Wordmark,
} from '../components/Chrome'
import { ResponsivePhoto } from '../components/ResponsivePhoto'
import { CountUp, ProgressRing, Reveal, Sparkline } from '../components/MotionBits'
import {
  demoProfile,
  getTotalSets,
  motivation,
  programs,
} from '../demo/data'
import {
  getProgramFullStats,
  getUpNextProgram,
  getWeeklyStats,
} from '../demo/selectors'
import { useDemoState, useElapsedSeconds, useStartTraining } from '../demo/AppState'
import { exercisePicture, heroMobile, heroWide, programPicture } from '../lib/media'
import {
  formatHeroDate,
  formatVolumeKg,
  greetingForHour,
} from '../lib/time'
import { hrefFor, navigate } from '../lib/router'
import type { Program } from '../demo/data'

interface HomePageProps {
  onOpenSettings: () => void
}

function OnDeckCard({
  program,
  active,
  onStart,
  onViewAll,
}: {
  program: Program
  active: boolean
  onStart: () => void
  onViewAll: () => void
}) {
  const stats = getProgramFullStats(program)
  const [firstWord, secondWord] = program.headline

  return (
    <article className="on-deck-card">
      <div className="on-deck-card__top">
        <div className="on-deck-card__heading">
          <p className="section-kicker">
            <span className="section-kicker__index">01</span>
            {active ? 'LIVE SESSION' : 'ON DECK / UP NEXT'}
          </p>
          <h2 className="on-deck-title">
            <span>{firstWord}</span>
            <em>{secondWord.toLowerCase()}</em>
          </h2>
          <p className="on-deck-subtitle">{program.kicker}</p>
        </div>

        <motion.button
          type="button"
          className="on-deck-launch"
          onClick={onStart}
          whileTap={{ scale: 0.97 }}
          aria-label={active ? 'Resume active training session' : `Start ${program.label} training`}
        >
          <span className="on-deck-launch__text">{active ? 'Resume' : 'Start'}</span>
          <span className="on-deck-launch__circle">
            <ArrowUpRight size={21} strokeWidth={2.2} aria-hidden="true" />
          </span>
        </motion.button>
      </div>

      <div className="on-deck-meta">
        <span>
          <strong>{program.exercises.length.toString().padStart(2, '0')}</strong> movements
        </span>
        <span>
          <strong>{stats.totalSets.toString().padStart(2, '0')}</strong> working sets
        </span>
        <span>
          <strong>{program.durationMin}</strong> minutes
        </span>
      </div>

      <div className="on-deck-moves">
        {program.exercises.slice(0, 3).map((exercise, index) => (
          <div className="on-deck-move" key={exercise.id}>
            <span className="on-deck-move__index">{String(index + 1).padStart(2, '0')}</span>
            <ResponsivePhoto
              sources={exercisePicture(exercise.image)}
              alt=""
              className="on-deck-move__photo"
              imgClassName="on-deck-move__img"
              sizes="70px"
              loading="lazy"
            />
            <div>
              <p className="on-deck-move__name">{exercise.shortName}</p>
              <p className="on-deck-move__sets">
                {exercise.sets} × {exercise.reps}
              </p>
            </div>
          </div>
        ))}
        <button type="button" className="on-deck-more" onClick={onViewAll}>
          <span>Full split</span>
          <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}

export function HomePage({ onOpenSettings }: HomePageProps) {
  const { state } = useDemoState()
  const startTraining = useStartTraining()
  const reduceMotion = useReducedMotion()
  const now = useMemo(() => Date.now(), [])
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '9%'])
  const active = state.active
  const nextProgram = getUpNextProgram(state)
  const program = active ? programs.find((item) => item.id === active.programId) ?? nextProgram : nextProgram
  const liveElapsed = useElapsedSeconds(active)
  const weekly = getWeeklyStats(state, now)
  const currentHour = new Date(now).getHours()
  const greeting = active ? 'SESSION LIVE' : `${greetingForHour(currentHour)}, ${demoProfile.firstName.toUpperCase()}.`
  const volumeIsTonnes = weekly.volumeKg >= 1000
  const volumeValue = volumeIsTonnes ? weekly.volumeKg / 1000 : weekly.volumeKg
  const weeklyTargetReached = Math.min(1, weekly.sessionsThisWeek / weekly.target)
  const delta = weekly.deltaPct
  const streakTicks = Math.min(10, weekly.streakWeeks)

  const headlineVariants = reduceMotion
    ? undefined
    : {
        hidden: {},
        show: { transition: { staggerChildren: 0.085, delayChildren: 0.38 } },
      }

  const lineVariants = reduceMotion
    ? undefined
    : {
        hidden: { y: '112%' },
        show: {
          y: '0%',
          transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
        },
      }

  return (
    <div className="home-page">
      <section
        className="home-hero"
        ref={heroRef}
        aria-labelledby="home-headline"
      >
        <div className="home-hero__media">
          <motion.div
            className="home-hero__parallax"
            style={reduceMotion ? undefined : { y: imageY }}
          >
            <motion.div
              className="home-hero__entrance"
              initial={reduceMotion ? false : { scale: 1.025 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <picture className="home-hero__picture">
                <source
                  media="(min-width: 768px)"
                  type="image/avif"
                  srcSet={heroWide.avif}
                  sizes="100vw"
                />
                <source
                  media="(min-width: 768px)"
                  type="image/webp"
                  srcSet={heroWide.webp}
                  sizes="100vw"
                />
                <source type="image/avif" srcSet={heroMobile.avif} sizes="100vw" />
                <source type="image/webp" srcSet={heroMobile.webp} sizes="100vw" />
                <img
                  src={heroMobile.fallback}
                  alt="A bodybuilder prepares to pull a loaded barbell in a dark gym."
                  width={heroMobile.width}
                  height={heroMobile.height}
                  fetchPriority="high"
                  decoding="async"
                  className="home-hero__image"
                />
              </picture>
            </motion.div>
          </motion.div>
        </div>
        <div className="home-hero__scrim" aria-hidden="true" />
        <div className="home-hero__grain" aria-hidden="true" />
        <div className="home-hero__number" aria-hidden="true">
          04
        </div>

        <div className="mobile-home-header">
          <MobilePageHeader section="LAB / 04" onOpenSettings={onOpenSettings} variant="overlay" />
        </div>

        <div className="home-hero__inner">
          <div className="home-hero__topline">
            <span>
              <span className="status-dot" aria-hidden="true" />
              CYCLE 04 / STRENGTH BLOCK
            </span>
            <span>{formatHeroDate(now)}</span>
          </div>

          <div className="home-hero__content">
            <div className="home-hero__copy">
              <motion.div
                className="home-hero__eyebrow"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.22 }}
              >
                <span className="eyebrow-rule" aria-hidden="true" />
                {greeting}
              </motion.div>

              <motion.h1
                id="home-headline"
                className="hero-title"
                aria-label="Build beyond limits."
                initial={reduceMotion ? false : 'hidden'}
                animate="show"
                variants={headlineVariants}
              >
                <span className="hero-title__line" aria-hidden="true">
                  <motion.span variants={lineVariants}>BUILD</motion.span>
                </span>
                <span className="hero-title__line hero-title__line--serif" aria-hidden="true">
                  <motion.span variants={lineVariants}>beyond</motion.span>
                </span>
                <span className="hero-title__line" aria-hidden="true">
                  <motion.span variants={lineVariants}>LIMITS.</motion.span>
                </span>
              </motion.h1>

              <motion.div
                className="home-hero__action-block"
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8 }}
              >
                <p className="home-hero__lede">
                  {active
                    ? `Your ${program.label.toLowerCase()} session is still live. Pick up the bar.`
                    : 'The barbell is loaded. The week is yours. Make the next rep count.'}
                </p>
                <div className="home-hero__actions">
                  <motion.button
                    type="button"
                    className="hero-cta"
                    onClick={() => startTraining(program.id)}
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 480, damping: 28 }}
                  >
                    <span className="hero-cta__label">
                      {active ? 'RESUME TRAINING' : 'START TRAINING'}
                    </span>
                    <span className="hero-cta__meta">
                      {active ? `LIVE · ${String(Math.floor(liveElapsed / 60)).padStart(2, '0')}M` : `${program.durationMin} MIN`}
                    </span>
                    <span className="hero-cta__circle" aria-hidden="true">
                      <ArrowUpRight size={21} strokeWidth={2.3} />
                    </span>
                  </motion.button>

                  <a href={hrefFor('/workouts')} className="hero-secondary">
                    <span>View the lab</span>
                    <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
                  </a>
                </div>
              </motion.div>
            </div>

            <motion.aside
              className="hero-aside"
              initial={reduceMotion ? false : { opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.65 }}
              aria-label="This week's training summary"
            >
              <div className="hero-aside__top">
                <span className="micro-label">CURRENT BLOCK</span>
                <span className="hero-aside__live">
                  <span className="status-dot" aria-hidden="true" />
                  {active ? 'LIVE' : 'ON TRACK'}
                </span>
              </div>
              <p className="hero-aside__title">
                PPL / <em>built.</em>
              </p>
              <div className="hero-aside__ring-row">
                <ProgressRing
                  value={weeklyTargetReached}
                  size={88}
                  strokeWidth={3.2}
                  ariaLabel={`${weekly.sessionsThisWeek} of ${weekly.target} weekly sessions complete`}
                >
                  <span className="hero-aside__ring-value">
                    {weekly.sessionsThisWeek}
                    <small>/{weekly.target}</small>
                  </span>
                </ProgressRing>
                <div className="hero-aside__ring-copy">
                  <span>WEEKLY TARGET</span>
                  <strong>{Math.round(weeklyTargetReached * 100)}%</strong>
                  <span>complete</span>
                </div>
              </div>
              <div className="hero-aside__footer">
                <div>
                  <span>VOLUME</span>
                  <strong>{formatVolumeKg(weekly.volumeKg, 1)}</strong>
                </div>
                <div>
                  <span>NEXT</span>
                  <strong>{program.label}</strong>
                </div>
              </div>
            </motion.aside>
          </div>

          <div className="home-hero__bottomline" aria-hidden="true">
            <span className="home-hero__scroll">
              <ArrowDown size={14} strokeWidth={1.7} />
              THE WORK IS BELOW
            </span>
            <span className="home-hero__coords">35.6892° N / 51.3890° E</span>
          </div>
        </div>
      </section>

      <main className="home-main">
        <div className="shell on-deck-shell">
          <Reveal>
            <OnDeckCard
              program={program}
              active={Boolean(active)}
              onStart={() => startTraining(program.id)}
              onViewAll={() => {
                navigate('/workouts')
              }}
            />
          </Reveal>
        </div>

        <section className="home-section shell" aria-labelledby="week-heading">
          <div className="section-heading">
            <p className="section-kicker">
              <span className="section-kicker__index">02</span> WEEK IN REVIEW
            </p>
            <h2 id="week-heading" className="section-title">
              THE WORK <em>adds up.</em>
            </h2>
          </div>

          <div className="home-metrics-grid">
            <Reveal className="panel volume-panel">
              <div className="panel-topline">
                <span className="micro-label">TRAINING VOLUME / THIS WEEK</span>
                <span className={`delta-chip ${delta !== null && delta < 0 ? 'is-down' : ''}`}>
                  {delta === null ? (
                    'FIRST WEEK'
                  ) : (
                    <>
                      {delta < 0 ? (
                        <TrendingDown size={13} strokeWidth={2} aria-hidden="true" />
                      ) : (
                        <TrendingUp size={13} strokeWidth={2} aria-hidden="true" />
                      )}
                      {delta >= 0 ? '+' : ''}
                      {delta.toFixed(1)}%
                    </>
                  )}
                </span>
              </div>

              <div className="volume-panel__value">
                <CountUp value={volumeValue} decimals={volumeIsTonnes ? 1 : 0} suffix={volumeIsTonnes ? 'T' : 'KG'} />
              </div>
              <p className="volume-panel__caption">MOVED ACROSS {weekly.sessionsThisWeek} SESSIONS</p>

              <Sparkline
                values={weekly.days.map((day) => day.volumeKg)}
                labels={weekly.days.map((day) => day.label)}
                height={78}
                ariaLabel={`Daily training volume this week: ${weekly.days
                  .map((day) => `${day.label} ${Math.round(day.volumeKg / 1000)} tonnes`)
                  .join(', ')}`}
              />
              <div className="volume-panel__footer">
                <span>MON</span>
                <span>WEEK {String(weekly.sessionsThisWeek).padStart(2, '0')}</span>
                <span>SUN</span>
              </div>
            </Reveal>

            <Reveal className="panel streak-panel" delay={0.08}>
              <div className="panel-topline">
                <span className="micro-label">TRAINING STREAK</span>
                <Flame size={16} strokeWidth={1.8} className="text-lime" aria-hidden="true" />
              </div>
              <div className="streak-panel__number">
                <CountUp value={weekly.streakWeeks} />
                <span>WK</span>
              </div>
              <p className="streak-panel__label">UNBROKEN CHAIN</p>
              <div className="streak-ticks" aria-hidden="true">
                {Array.from({ length: 10 }, (_, index) => (
                  <motion.span
                    key={index}
                    className={index < streakTicks ? 'is-filled' : ''}
                    initial={reduceMotion ? false : { scaleY: 0.2, opacity: 0.25 }}
                    whileInView={{ scaleY: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 + index * 0.045, duration: 0.4 }}
                  />
                ))}
              </div>
              <p className="streak-panel__note">
                {weekly.sessionsThisWeek >= weekly.target
                  ? 'Target met. Keep the edge.'
                  : `${Math.max(0, weekly.target - weekly.sessionsThisWeek)} session${weekly.target - weekly.sessionsThisWeek === 1 ? '' : 's'} to protect it.`}
              </p>
            </Reveal>
          </div>

          <Reveal className="consistency-panel" delay={0.05}>
            <div className="consistency-panel__head">
              <div>
                <p className="micro-label">CONSISTENCY / THIS WEEK</p>
                <p className="consistency-panel__count">
                  {weekly.activeDays} <span>active days</span>
                </p>
              </div>
              <ProgressRing
                value={weeklyTargetReached}
                size={62}
                strokeWidth={4}
                ariaLabel={`${weekly.sessionsThisWeek} of ${weekly.target} target sessions completed`}
              >
                <span className="consistency-panel__ring-value">
                  {weekly.sessionsThisWeek}/{weekly.target}
                </span>
              </ProgressRing>
            </div>
            <div className="week-rhythm">
              {weekly.days.map((day) => {
                const ratio = Math.max(
                  day.hasTrained ? 0.25 : 0,
                  weekly.volumeKg > 0 ? day.volumeKg / weekly.volumeKg : 0,
                )
                return (
                  <div
                    className={`week-rhythm__day ${day.isToday ? 'is-today' : ''} ${
                      day.hasTrained ? 'has-trained' : ''
                    } ${day.isFuture ? 'is-future' : ''}`}
                    key={day.timestamp}
                  >
                    <div className="week-rhythm__track" aria-hidden="true">
                      <motion.span
                        className="week-rhythm__fill"
                        initial={reduceMotion ? false : { height: '8%' }}
                        whileInView={{ height: `${Math.max(8, ratio * 100)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <span className="week-rhythm__label">{day.label}</span>
                    {day.isToday ? <span className="week-rhythm__dot" aria-hidden="true" /> : null}
                  </div>
                )
              })}
            </div>
            <div className="consistency-panel__footer">
              <span>{weekly.sessionsThisWeek} SESSIONS LOGGED</span>
              <span>{formatVolumeKg(weekly.volumeKg, 1)} MOVED</span>
            </div>
          </Reveal>
        </section>

        <section className="home-section shell" aria-labelledby="programs-heading">
          <div className="section-heading section-heading--row">
            <div>
              <p className="section-kicker">
                <span className="section-kicker__index">03</span> THE PROGRAMMES
              </p>
              <h2 id="programs-heading" className="section-title">
                CHOOSE <em>your split.</em>
              </h2>
            </div>
            <a href={hrefFor('/workouts')} className="text-action desktop-only-flex">
              VIEW ALL
              <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
            </a>
          </div>

          <div className="program-rail">
            {programs.map((item, index) => {
              const isNext = item.id === program.id
              return (
                <motion.button
                  type="button"
                  className="home-program-card"
                  key={item.id}
                  onClick={() => startTraining(item.id)}
                  initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.65, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={reduceMotion ? undefined : { y: -4 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <ResponsivePhoto
                    sources={programPicture(item.image)}
                    alt={`${item.label} training program cover`}
                    className="home-program-card__photo"
                    imgClassName="home-program-card__img"
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 44vw, 78vw"
                    loading="lazy"
                  />
                  <span className="home-program-card__scrim" aria-hidden="true" />
                  <span className="home-program-card__topline">
                    <span className="home-program-card__number">{item.number}</span>
                    {isNext ? <span className="tag tag--lime">{active ? 'LIVE' : 'UP NEXT'}</span> : null}
                  </span>
                  <span className="home-program-card__bottom">
                    <span className="home-program-card__meta">
                      {item.kicker}
                    </span>
                    <span className="home-program-card__name">{item.label}</span>
                    <span className="sr-only">Start the {item.label} protocol</span>
                    <span className="home-program-card__row">
                      <span>
                        {item.exercises.length} MOVES / {getTotalSets(item)} SETS
                      </span>
                      <span className="home-program-card__arrow">
                        <ArrowUpRight size={19} strokeWidth={2} aria-hidden="true" />
                      </span>
                    </span>
                  </span>
                </motion.button>
              )
            })}
          </div>
          <p className="rail-hint">
            <span aria-hidden="true">SWIPE</span>
            <ArrowRight size={14} strokeWidth={1.8} aria-hidden="true" />
            Three ways in. One standard.
          </p>
        </section>

        <section className="home-section shell">
          <Reveal className="field-note">
            <ResponsivePhoto
              sources={programPicture('promo')}
              alt="An athlete's hands gripping a loaded barbell under gym lights."
              className="field-note__photo"
              imgClassName="field-note__img"
              sizes="(min-width: 1024px) 1240px, 100vw"
              loading="lazy"
            />
            <span className="field-note__scrim" aria-hidden="true" />
            <span className="field-note__grain" aria-hidden="true" />
            <div className="field-note__content">
              <p className="section-kicker section-kicker--light">
                <span className="section-kicker__index">04</span> {motivation.note}
              </p>
              <blockquote className="field-note__quote">
                DISCIPLINE
                <br />
                IS A <em>decision.</em>
                <br />
                NOT A MOOD.
              </blockquote>
              <a href={hrefFor('/progress')} className="field-note__link">
                SEE THE PROOF
                <span className="field-note__link-circle">
                  <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
                </span>
              </a>
            </div>
            <div className="field-note__seal" aria-hidden="true">
              <span>REP//LAB</span>
              <span>NO SHORTCUTS</span>
              <span>EST. 2024</span>
            </div>
          </Reveal>
        </section>

        <footer className="site-footer">
          <div className="shell">
            <div className="site-footer__top">
              <div>
                <p className="micro-label">THE STANDARD</p>
                <p className="site-footer__tagline">
                  BUILD BEYOND <em>limits.</em>
                </p>
              </div>
              <div className="site-footer__links">
                <a href={hrefFor('/')}>Home</a>
                <a href={hrefFor('/workouts')}>Training</a>
                <a href={hrefFor('/progress')}>Progress</a>
                <button type="button" onClick={onOpenSettings}>
                  Demo / credits
                </button>
              </div>
            </div>
            <div className="site-footer__mark">
              <Wordmark className="wordmark--footer" />
              <span>The work speaks.</span>
            </div>
            <div className="site-footer__legal">
              <span>© {new Date(now).getFullYear()} REP//LAB — FICTIONAL DEMO</span>
              <span>LOCAL DATA ONLY / NO TRACKING</span>
              <a href="https://unsplash.com/license" target="_blank" rel="noreferrer">
                PHOTOGRAPHY / UNSPLASH
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
