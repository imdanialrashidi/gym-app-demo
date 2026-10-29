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
} from '../demo/data'
import {
  getProgramFullStats,
  getUpNextProgram,
  getWeeklyStats,
} from '../demo/selectors'
import { localizeProgram, usePrograms } from '../demo/localize'
import { useI18n } from '../lib/i18n'
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
  const { t } = useI18n()
  const stats = getProgramFullStats(program)
  const [firstWord, secondWord] = program.headline

  return (
    <article className="on-deck-card">
      <div className="on-deck-card__top">
        <div className="on-deck-card__heading">
          <p className="section-kicker">
            <span className="section-kicker__index">01</span>
            {active ? t('LIVE SESSION', 'جلسهٔ زنده') : t('ON DECK / UP NEXT', 'نوبت بعدی')}
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
          aria-label={
            active
              ? t('Resume active training session', 'ادامهٔ جلسهٔ تمرین در جریان')
              : t(`Start ${program.label} training`, `شروع تمرین ${program.label}`)
          }
        >
          <span className="on-deck-launch__text">
            {active ? t('Resume', 'ادامه') : t('Start', 'شروع')}
          </span>
          <span className="on-deck-launch__circle">
            <ArrowUpRight size={21} strokeWidth={2.2} aria-hidden="true" />
          </span>
        </motion.button>
      </div>

      <div className="on-deck-meta">
        <span>
          <strong>{program.exercises.length.toString().padStart(2, '0')}</strong>{' '}
          {t('movements', 'حرکت')}
        </span>
        <span>
          <strong>{stats.totalSets.toString().padStart(2, '0')}</strong>{' '}
          {t('working sets', 'ست کاری')}
        </span>
        <span>
          <strong>{program.durationMin}</strong> {t('minutes', 'دقیقه')}
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
          <span>{t('Full split', 'برنامهٔ کامل')}</span>
          <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}

export function HomePage({ onOpenSettings }: HomePageProps) {
  const { lang, t, pick } = useI18n()
  const programs = usePrograms()
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
  const nextProgram = localizeProgram(getUpNextProgram(state), lang)
  const program = active ? programs.find((item) => item.id === active.programId) ?? nextProgram : nextProgram
  const liveElapsed = useElapsedSeconds(active)
  const weekly = getWeeklyStats(state, now, 4, lang)
  const weeklyVolume = formatVolumeKg(weekly.volumeKg, 1, lang)
  const currentHour = new Date(now).getHours()
  const greetingWord = greetingForHour(currentHour)
  const greetingFa =
    greetingWord === 'MORNING' ? 'صبح بخیر' : greetingWord === 'AFTERNOON' ? 'عصر بخیر' : 'شب بخیر'
  const greeting = active
    ? t('SESSION LIVE', 'جلسه فعال است')
    : t(
        `${greetingWord}, ${demoProfile.firstName.toUpperCase()}.`,
        `${greetingFa}، ${t(demoProfile.firstName, 'امیر')}.`,
      )
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
                  alt={t(
                    'A bodybuilder prepares to pull a loaded barbell in a dark gym.',
                    'یک بدن‌ساز در سالنی تاریک خود را برای کشیدن هالتر بارگذاری‌شده آماده می‌کند.',
                  )}
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
          <MobilePageHeader
            section={t('LAB / 04', 'سالن / 04')}
            onOpenSettings={onOpenSettings}
            variant="overlay"
          />
        </div>

        <div className="home-hero__inner">
          <div className="home-hero__topline">
            <span>
              <span className="status-dot" aria-hidden="true" />
              {t('CYCLE 04 / STRENGTH BLOCK', 'دورهٔ 04 / بلوک قدرت')}
            </span>
            <span>{formatHeroDate(now, lang)}</span>
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
                aria-label={t('Build beyond limits.', 'فراتر از محدودیت‌ها بساز.')}
                initial={reduceMotion ? false : 'hidden'}
                animate="show"
                variants={headlineVariants}
              >
                <span className="hero-title__line" aria-hidden="true">
                  <motion.span variants={lineVariants}>{t('BUILD', 'بساز')}</motion.span>
                </span>
                <span className="hero-title__line hero-title__line--serif" aria-hidden="true">
                  <motion.span variants={lineVariants}>{t('beyond', 'فراتر از')}</motion.span>
                </span>
                <span className="hero-title__line" aria-hidden="true">
                  <motion.span variants={lineVariants}>{t('LIMITS.', 'محدودیت‌ها.')}</motion.span>
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
                    ? t(
                        `Your ${program.label.toLowerCase()} session is still live. Pick up the bar.`,
                        `جلسهٔ ${program.label} هنوز در جریان است. میله را بردار.`,
                      )
                    : t(
                        'The barbell is loaded. The week is yours. Make the next rep count.',
                        'هالتر بارگذاری شده. هفته مال توست. تکرار بعدی را با تمام وجود بزن.',
                      )}
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
                      {active ? t('RESUME TRAINING', 'ادامهٔ تمرین') : t('START TRAINING', 'شروع تمرین')}
                    </span>
                    <span className="hero-cta__meta">
                      {active
                        ? t(
                            `LIVE · ${String(Math.floor(liveElapsed / 60)).padStart(2, '0')}M`,
                            `زنده · ${String(Math.floor(liveElapsed / 60)).padStart(2, '0')} دقیقه`,
                          )
                        : t(`${program.durationMin} MIN`, `${program.durationMin} دقیقه`)}
                    </span>
                    <span className="hero-cta__circle" aria-hidden="true">
                      <ArrowUpRight size={21} strokeWidth={2.3} />
                    </span>
                  </motion.button>

                  <a href={hrefFor('/workouts')} className="hero-secondary">
                    <span>{t('View the lab', 'دیدن سالن')}</span>
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
              aria-label={t("This week's training summary", 'خلاصهٔ تمرین این هفته')}
            >
              <div className="hero-aside__top">
                <span className="micro-label">{t('CURRENT BLOCK', 'بلوک جاری')}</span>
                <span className="hero-aside__live">
                  <span className="status-dot" aria-hidden="true" />
                  {active ? t('LIVE', 'زنده') : t('ON TRACK', 'طبق برنامه')}
                </span>
              </div>
              <p className="hero-aside__title">
                {t('PPL', 'فشار / کشش / پا')} / <em>{t('built.', 'ساخته‌شده.')}</em>
              </p>
              <div className="hero-aside__ring-row">
                <ProgressRing
                  value={weeklyTargetReached}
                  size={88}
                  strokeWidth={3.2}
                  ariaLabel={t(
                    `${weekly.sessionsThisWeek} of ${weekly.target} weekly sessions complete`,
                    `${weekly.sessionsThisWeek} از ${weekly.target} جلسهٔ هفته انجام شده`,
                  )}
                >
                  <span className="hero-aside__ring-value">
                    {weekly.sessionsThisWeek}
                    <small>/{weekly.target}</small>
                  </span>
                </ProgressRing>
                <div className="hero-aside__ring-copy">
                  <span>{t('WEEKLY TARGET', 'هدف هفته')}</span>
                  <strong>{Math.round(weeklyTargetReached * 100)}%</strong>
                  <span>{t('complete', 'انجام‌شده')}</span>
                </div>
              </div>
              <div className="hero-aside__footer">
                <div>
                  <span>{t('VOLUME', 'حجم')}</span>
                  <strong>{weeklyVolume}</strong>
                </div>
                <div>
                  <span>{t('NEXT', 'بعدی')}</span>
                  <strong>{program.label}</strong>
                </div>
              </div>
            </motion.aside>
          </div>

          <div className="home-hero__bottomline" aria-hidden="true">
            <span className="home-hero__scroll">
              <ArrowDown size={14} strokeWidth={1.7} />
              {t('THE WORK IS BELOW', 'ادامه‌اش پایین است')}
            </span>
            <span className="home-hero__coords" dir="ltr">
              35.6892° N / 51.3890° E
            </span>
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
              <span className="section-kicker__index">02</span> {t('WEEK IN REVIEW', 'مرور هفته')}
            </p>
            <h2 id="week-heading" className="section-title">
              {t('THE WORK', 'تمرین‌ها')} <em>{t('adds up.', 'جمع می‌شوند.')}</em>
            </h2>
          </div>

          <div className="home-metrics-grid">
            <Reveal className="panel volume-panel">
              <div className="panel-topline">
                <span className="micro-label">
                  {t('TRAINING VOLUME / THIS WEEK', 'حجم تمرین / این هفته')}
                </span>
                <span className={`delta-chip ${delta !== null && delta < 0 ? 'is-down' : ''}`}>
                  {delta === null ? (
                    t('FIRST WEEK', 'هفتهٔ اول')
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
                <CountUp
                  value={volumeValue}
                  decimals={volumeIsTonnes ? 1 : 0}
                  suffix={volumeIsTonnes ? pick('T', ' تن') : pick('KG', ' کیلو')}
                />
              </div>
              <p className="volume-panel__caption">
                {t(
                  `MOVED ACROSS ${weekly.sessionsThisWeek} SESSIONS`,
                  `جابه‌جا‌شده در ${weekly.sessionsThisWeek} جلسه`,
                )}
              </p>

              <Sparkline
                values={weekly.days.map((day) => day.volumeKg)}
                labels={weekly.days.map((day) => day.label)}
                height={78}
                ariaLabel={t(
                  `Daily training volume this week: ${weekly.days
                    .map((day) => `${day.label} ${Math.round(day.volumeKg / 1000)} tonnes`)
                    .join(', ')}`,
                  `حجم تمرین روزانهٔ این هفته: ${weekly.days
                    .map((day) => `${day.label} ${Math.round(day.volumeKg / 1000)} تن`)
                    .join('، ')}`,
                )}
              />
              <div className="volume-panel__footer">
                <span>{t('MON', 'دوشنبه')}</span>
                <span>{t(`WEEK ${String(weekly.sessionsThisWeek).padStart(2, '0')}`, `هفته ${String(weekly.sessionsThisWeek).padStart(2, '0')}`)}</span>
                <span>{t('SUN', 'یکشنبه')}</span>
              </div>
            </Reveal>

            <Reveal className="panel streak-panel" delay={0.08}>
              <div className="panel-topline">
                <span className="micro-label">{t('TRAINING STREAK', 'زنجیرهٔ تمرین')}</span>
                <Flame size={16} strokeWidth={1.8} className="text-lime" aria-hidden="true" />
              </div>
              <div className="streak-panel__number">
                <CountUp value={weekly.streakWeeks} />
                <span>{t('WK', 'هفته')}</span>
              </div>
              <p className="streak-panel__label">{t('UNBROKEN CHAIN', 'زنجیرهٔ بی‌وقفه')}</p>
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
                  ? t('Target met. Keep the edge.', 'هدف محقق شد. همین ریتم را نگه دار.')
                  : t(
                      `${Math.max(0, weekly.target - weekly.sessionsThisWeek)} session${weekly.target - weekly.sessionsThisWeek === 1 ? '' : 's'} to protect it.`,
                      `${Math.max(0, weekly.target - weekly.sessionsThisWeek)} جلسه برای حفظ زنجیره باقی مانده.`,
                    )}
              </p>
            </Reveal>
          </div>

          <Reveal className="consistency-panel" delay={0.05}>
            <div className="consistency-panel__head">
              <div>
                <p className="micro-label">{t('CONSISTENCY / THIS WEEK', 'ثبات / این هفته')}</p>
                <p className="consistency-panel__count">
                  {weekly.activeDays} <span>{t('active days', 'روز فعال')}</span>
                </p>
              </div>
              <ProgressRing
                value={weeklyTargetReached}
                size={62}
                strokeWidth={4}
                ariaLabel={t(
                  `${weekly.sessionsThisWeek} of ${weekly.target} target sessions completed`,
                  `${weekly.sessionsThisWeek} از ${weekly.target} جلسهٔ هدف انجام شده`,
                )}
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
              <span>
                {t(
                  `${weekly.sessionsThisWeek} SESSIONS LOGGED`,
                  `${weekly.sessionsThisWeek} جلسه ثبت شده`,
                )}
              </span>
              <span>{t(`${weeklyVolume} MOVED`, `${weeklyVolume} جابه‌جا شد`)}</span>
            </div>
          </Reveal>
        </section>

        <section className="home-section shell" aria-labelledby="programs-heading">
          <div className="section-heading section-heading--row">
            <div>
              <p className="section-kicker">
                <span className="section-kicker__index">03</span> {t('THE PROGRAMMES', 'برنامه‌ها')}
              </p>
              <h2 id="programs-heading" className="section-title">
                {t('CHOOSE', 'انتخاب کن')} <em>{t('your split.', 'برنامه‌ات را.')}</em>
              </h2>
            </div>
            <a href={hrefFor('/workouts')} className="text-action desktop-only-flex">
              {t('VIEW ALL', 'همه را ببین')}
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
                    alt={t(
                      `${item.label} training program cover`,
                      `تصویر برنامهٔ ${item.label}`,
                    )}
                    className="home-program-card__photo"
                    imgClassName="home-program-card__img"
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 44vw, 78vw"
                    loading="lazy"
                  />
                  <span className="home-program-card__scrim" aria-hidden="true" />
                  <span className="home-program-card__topline">
                    <span className="home-program-card__number">{item.number}</span>
                    {isNext ? (
                      <span className="tag tag--lime">
                        {active ? t('LIVE', 'زنده') : t('UP NEXT', 'نوبت بعدی')}
                      </span>
                    ) : null}
                  </span>
                  <span className="home-program-card__bottom">
                    <span className="home-program-card__meta">
                      {item.kicker}
                    </span>
                    <span className="home-program-card__name">{item.label}</span>
                    <span className="sr-only">
                      {t(
                        `Start the ${item.label} protocol`,
                        `شروع برنامهٔ ${item.label}`,
                      )}
                    </span>
                    <span className="home-program-card__row">
                      <span>
                        {t(
                          `${item.exercises.length} MOVES / ${getTotalSets(item)} SETS`,
                          `${item.exercises.length} حرکت / ${getTotalSets(item)} ست`,
                        )}
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
            <span aria-hidden="true">{t('SWIPE', 'سوایپ')}</span>
            <ArrowRight size={14} strokeWidth={1.8} aria-hidden="true" />
            {t('Three ways in. One standard.', 'سه راه ورود. یک استاندارد.')}
          </p>
        </section>

        <section className="home-section shell">
          <Reveal className="field-note">
            <ResponsivePhoto
              sources={programPicture('promo')}
              alt={t(
                "An athlete's hands gripping a loaded barbell under gym lights.",
                'دست‌های یک ورزشکار روی هالتر بارگذاری‌شده زیر نور سالن.',
              )}
              className="field-note__photo"
              imgClassName="field-note__img"
              sizes="(min-width: 1024px) 1240px, 100vw"
              loading="lazy"
            />
            <span className="field-note__scrim" aria-hidden="true" />
            <span className="field-note__grain" aria-hidden="true" />
            <div className="field-note__content">
              <p className="section-kicker section-kicker--light">
                <span className="section-kicker__index">04</span>{' '}
                {t(motivation.note, 'یادداشت میدان / 004')}
              </p>
              <blockquote className="field-note__quote">
                {t('DISCIPLINE', 'نظم')}
                <br />
                {t('IS A', 'یک')} <em>{t('decision.', 'تصمیم است.')}</em>
                <br />
                {t('NOT A MOOD.', 'نه یک حال‌وهوا.')}
              </blockquote>
              <a href={hrefFor('/progress')} className="field-note__link">
                {t('SEE THE PROOF', 'نتیجه را ببین')}
                <span className="field-note__link-circle">
                  <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
                </span>
              </a>
            </div>
            <div className="field-note__seal" aria-hidden="true">
              <span>{t('AMIR’S GYM', 'باشگاه امیر')}</span>
              <span>{t('NO SHORTCUTS', 'بدون میان‌بر')}</span>
              <span>{t('EST. 2024', 'تأسیس 2024')}</span>
            </div>
          </Reveal>
        </section>

        <footer className="site-footer">
          <div className="shell">
            <div className="site-footer__top">
              <div>
                <p className="micro-label">{t('THE STANDARD', 'استاندارد')}</p>
                <p className="site-footer__tagline">
                  {t('BUILD BEYOND', 'فراتر از')} <em>{t('limits.', 'محدودیت‌ها.')}</em>
                </p>
              </div>
              <div className="site-footer__links">
                <a href={hrefFor('/')}>{t('Home', 'خانه')}</a>
                <a href={hrefFor('/workouts')}>{t('Training', 'تمرین')}</a>
                <a href={hrefFor('/progress')}>{t('Progress', 'پیشرفت')}</a>
                <button type="button" onClick={onOpenSettings}>
                  {t('Demo / credits', 'دمو / منابع')}
                </button>
              </div>
            </div>
            <div className="site-footer__mark">
              <Wordmark className="wordmark--footer" />
              <span>{t('The work speaks.', 'تمرین خودش حرف می‌زند.')}</span>
            </div>
            <div className="site-footer__legal">
              <span>
                {t(
                  `© ${new Date(now).getFullYear()} AMIR’S GYM — FICTIONAL DEMO`,
                  `© ${new Date(now).getFullYear()} باشگاه امیر — دموی خیالی`,
                )}
              </span>
              <span>{t('LOCAL DATA ONLY / NO TRACKING', 'فقط دادهٔ محلی / بدون ردیابی')}</span>
              <a href="https://unsplash.com/license" target="_blank" rel="noreferrer">
                {t('PHOTOGRAPHY / UNSPLASH', 'عکس‌ها / Unsplash')}
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
