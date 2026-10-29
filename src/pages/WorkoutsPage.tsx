import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  ArrowUpRight,
  ChevronDown,
  Search,
  X,
} from 'lucide-react'
import { MobilePageHeader } from '../components/Chrome'
import { ResponsivePhoto } from '../components/ResponsivePhoto'
import { CountUp, Reveal } from '../components/MotionBits'
import { ExerciseSheet } from '../components/ExerciseSheet'
import {
  exerciseById,
  muscleGroups,
} from '../demo/data'
import type { MuscleFilter, Program, ProgramExercise } from '../demo/data'
import {
  getProgramFullStats,
  getUpNextProgram,
} from '../demo/selectors'
import { useDemoState, useElapsedSeconds, useStartTraining } from '../demo/AppState'
import {
  localizeMuscle,
  localizeProgram,
  useExerciseLibrary,
  usePrograms,
} from '../demo/localize'
import { useI18n } from '../lib/i18n'
import { exercisePicture, programPicture } from '../lib/media'
import { formatShortDate, formatTimer, formatWeight } from '../lib/time'
import { hrefFor } from '../lib/router'

interface WorkoutsPageProps {
  onOpenSettings: () => void
}

function SplitCard({
  program,
  index,
  expanded,
  onToggle,
  onOpenExercise,
  onStart,
  isActiveProgram,
  hasActiveSession,
}: {
  program: Program
  index: number
  expanded: boolean
  onToggle: () => void
  onOpenExercise: (exercise: ProgramExercise, program: Program) => void
  onStart: () => void
  isActiveProgram: boolean
  hasActiveSession: boolean
}) {
  const { lang, t } = useI18n()
  const stats = getProgramFullStats(program)
  const reduce = useReducedMotion()
  const panelId = `split-panel-${program.id}`
  const position = String(index + 1).padStart(2, '0')

  return (
    <article className={`split-card ${expanded ? 'is-expanded' : ''}`}>
      <button
        type="button"
        className="split-card__header"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
      >
        <ResponsivePhoto
          sources={programPicture(program.image)}
          alt=""
          className="split-card__photo"
          imgClassName="split-card__img"
          sizes="(min-width: 1024px) 1240px, 100vw"
          loading="lazy"
        />
        <span className="split-card__scrim" aria-hidden="true" />
        <span className="split-card__top">
          <span className="split-card__index">
            {t(`SPLIT ${position} / ${program.number}`, `برنامهٔ ${position} / ${program.number}`)}
          </span>
          {isActiveProgram ? <span className="tag tag--lime">{t('LIVE', 'زنده')}</span> : null}
        </span>
        <span className="split-card__main">
          <span className="split-card__name">{program.label}</span>
          <span className="split-card__focus">{program.kicker}</span>
        </span>
        <span className="split-card__meta">
          <span>
            <strong>{stats.totalSets}</strong> {t('SETS', 'ست')}
          </span>
          <span>
            <strong>{program.durationMin}</strong> {t('MIN', 'دقیقه')}
          </span>
          <span>
            {lang === 'fa' ? (
              <>
                {t('INTENSITY', 'شدت')} <strong>{program.intensity}</strong>
              </>
            ) : (
              <>
                <strong>{program.intensity}</strong> {t('INTENSITY', 'شدت')}
              </>
            )}
          </span>
        </span>
        <span className="split-card__toggle" aria-hidden="true">
          <ChevronDown size={18} strokeWidth={2} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            id={panelId}
            className="split-card__panel"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="split-card__panel-inner">
              <p className="split-card__description">{program.description}</p>

              <div className="split-card__list-heading">
                <span className="micro-label">{t('THE SESSION', 'جلسه')}</span>
                <span className="micro-label">{t('LOAD / REPS / SETS', 'وزن / تکرار / ست')}</span>
              </div>

              <ul className="split-exercise-list">
                {program.exercises.map((exercise, exerciseIndex) => (
                  <li key={exercise.id}>
                    <button
                      type="button"
                      className="split-exercise"
                      onClick={() => onOpenExercise(exercise, program)}
                    >
                      <span className="split-exercise__number">
                        {String(exerciseIndex + 1).padStart(2, '0')}
                      </span>
                      <ResponsivePhoto
                        sources={exercisePicture(exercise.image)}
                        alt=""
                        className="split-exercise__photo"
                        imgClassName="split-exercise__img"
                        sizes="56px"
                        loading="lazy"
                      />
                      <span className="split-exercise__copy">
                        <span className="split-exercise__name">{exercise.name}</span>
                        <span className="split-exercise__meta">
                          {t(
                            `${exercise.equipment} · ${exercise.rest}s rest`,
                            `${exercise.equipment} · ${exercise.rest} ثانیه استراحت`,
                          )}
                        </span>
                      </span>
                      <span className="split-exercise__prescription">
                        <strong>
                          {formatWeight(exercise.weight)} {t('kg', 'کیلوگرم')}
                        </strong>
                        {exercise.sets} × {exercise.reps}
                      </span>
                      <span className="sr-only">{t('View exercise details', 'دیدن جزئیات حرکت')}</span>
                      <ArrowUpRight
                        className="split-exercise__arrow"
                        size={15}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="split-card__cta-row">
                <div>
                  <p className="micro-label">
                    {t('DEMO LOAD / ADJUST AS NEEDED', 'وزنهٔ نمونه / در صورت نیاز تنظیم کن')}
                  </p>
                  <p className="split-card__note">
                    {hasActiveSession
                      ? t(
                          `Your ${program.label.toLowerCase()} plan is saved. Resume to edit, log and finish.`,
                          `برنامهٔ ${program.label} ذخیره شده. برای ویرایش، ثبت و پایان ادامه بده.`,
                        )
                      : t(
                          'Every working set is editable. Own the numbers.',
                          'هر ست کاری قابل ویرایش است. عددها را خودت تعیین کن.',
                        )}
                  </p>
                </div>
                <button type="button" className="btn btn--lime" onClick={onStart}>
                  {hasActiveSession
                    ? t('Resume live session', 'ادامهٔ جلسهٔ زنده')
                    : t(`Start ${program.label}`, `شروع برنامهٔ ${program.label}`)}
                  <ArrowUpRight size={17} strokeWidth={2.2} aria-hidden="true" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  )
}

export function WorkoutsPage({ onOpenSettings }: WorkoutsPageProps) {
  const { lang, t } = useI18n()
  const programs = usePrograms()
  const exerciseLibrary = useExerciseLibrary()
  const { state } = useDemoState()
  const startTraining = useStartTraining()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<ProgramExercise | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [muscle, setMuscle] = useState<MuscleFilter>('All')
  const [query, setQuery] = useState('')
  const now = useMemo(() => Date.now(), [])
  const reduce = useReducedMotion()
  const upNext = localizeProgram(getUpNextProgram(state), lang)
  const activeProgram = state.active
    ? programs.find((program) => program.id === state.active?.programId)
    : null
  const featured = activeProgram ?? upNext
  const featuredStats = getProgramFullStats(featured)
  const elapsed = useElapsedSeconds(state.active)

  const filteredExercises = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return exerciseLibrary.filter((exercise) => {
      const matchesMuscle = muscle === 'All' || exercise.muscle === muscle
      if (!matchesMuscle) return false
      if (needle === '') return true
      const english = exerciseById[exercise.id]
      const haystack = [
        exercise.name,
        exercise.equipment,
        localizeMuscle(exercise.muscle, lang),
        english?.name ?? '',
        english?.equipment ?? '',
        localizeMuscle(exercise.muscle, 'en'),
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(needle)
    })
  }, [exerciseLibrary, lang, muscle, query])

  const openExercise = (exercise: ProgramExercise, program: Program) => {
    setSelectedExercise(exercise)
    setSelectedProgram(program)
    setSheetOpen(true)
  }

  return (
    <div className="workouts-page">
      <MobilePageHeader section={t('TRAIN / 02', 'تمرین / 02')} onOpenSettings={onOpenSettings} />
      <main className="page-main">
        <div className="shell">
          <Reveal className="page-intro">
            <p className="section-kicker">
              <span className="section-kicker__index">02</span> {t('TRAINING DIVISION', 'بخش تمرین')}
            </p>
            <h1 className="page-title">
              {t('THE', '')} <em>{t('lab.', 'سالن.')}</em>
            </h1>
            <p className="page-lede">
              {t(
                'Three splits. No wasted movement. Pick the session that meets the bar today — then take it one honest rep past comfortable.',
                'سه برنامه. هیچ حرکت هدررفته‌ای نیست. جلسه‌ای را انتخاب کن که امروز از عهده‌اش برمی‌آیی — بعد یک تکرار صادقانه از مرز راحتی عبور کن.',
              )}
            </p>
          </Reveal>
        </div>

        <div className="shell">
          <Reveal delay={0.05}>
            <section className="split-hero" aria-labelledby="today-session-heading">
              <ResponsivePhoto
                sources={programPicture(featured.image)}
                alt={t(
                  `${featured.label} training program`,
                  `برنامهٔ تمرینی ${featured.label}`,
                )}
                className="split-hero__photo"
                imgClassName="split-hero__img"
                sizes="(min-width: 1024px) 1240px, 100vw"
                loading="eager"
                fetchPriority="high"
              />
              <span className="split-hero__scrim" aria-hidden="true" />
              <div className="split-hero__top">
                <span className="tag">
                  {state.active ? t('SESSION LIVE', 'جلسهٔ زنده') : t('UP NEXT', 'نوبت بعدی')}
                </span>
                <span className="split-hero__date">{formatShortDate(now, lang)}</span>
              </div>
              <div className="split-hero__content">
                <div>
                  <p className="micro-label">
                    {state.active
                      ? t(`LIVE / ${formatTimer(elapsed)}`, `زنده / ${formatTimer(elapsed)}`)
                      : t('TODAY / SPLIT SELECTED', 'امروز / برنامهٔ انتخاب‌شده')}
                  </p>
                  <h2 id="today-session-heading" className="split-hero__title">
                    {lang === 'fa' ? (
                      <>
                        <em>{t('session.', 'جلسهٔ')}</em> {featured.label}
                      </>
                    ) : (
                      <>
                        {featured.label} <em>{t('session.', 'جلسهٔ')}</em>
                      </>
                    )}
                  </h2>
                  <p className="split-hero__kicker">{featured.kicker}</p>
                </div>
                <div className="split-hero__bottom">
                  <div className="split-hero__stats">
                    <span>
                      <strong>{featured.exercises.length}</strong> {t('moves', 'حرکت')}
                    </span>
                    <span>
                      <strong>{featuredStats.totalSets}</strong> {t('sets', 'ست')}
                    </span>
                    <span>
                      <strong>{featured.durationMin}</strong> {t('min', 'دقیقه')}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn--lime split-hero__cta"
                    onClick={() => startTraining(featured.id)}
                  >
                    {state.active ? t('Resume session', 'ادامهٔ جلسه') : t('Start training', 'شروع تمرین')}
                    <ArrowUpRight size={18} strokeWidth={2.2} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </section>
          </Reveal>
        </div>

        <section className="page-section shell" aria-labelledby="splits-heading">
          <div className="section-heading section-heading--row">
            <div>
              <p className="section-kicker">
                <span className="section-kicker__index">01</span> {t('THE SPLITS', 'برنامه‌ها')}
              </p>
              <h2 id="splits-heading" className="section-title">
                {t('PICK YOUR', 'میدانت را')} <em>{t('battle.', 'انتخاب کن.')}</em>
              </h2>
            </div>
            <span className="section-heading__aside">
              {state.active ? t('ONE LIVE SESSION', 'یک جلسهٔ زنده') : t('3-DAY ROTATION', 'چرخش 3 روزه')}
            </span>
          </div>

          <div className="split-list">
            {programs.map((program, index) => (
              <SplitCard
                key={program.id}
                program={program}
                index={index}
                expanded={expandedId === program.id}
                onToggle={() =>
                  setExpandedId((current) => (current === program.id ? null : program.id))
                }
                onOpenExercise={openExercise}
                onStart={() => startTraining(program.id)}
                isActiveProgram={state.active?.programId === program.id}
                hasActiveSession={Boolean(state.active)}
              />
            ))}
          </div>
        </section>

        <section className="page-section shell" aria-labelledby="library-heading">
          <div className="library-heading">
            <div>
              <p className="section-kicker">
                <span className="section-kicker__index">02</span> {t('THE INDEX', 'فهرست')}
              </p>
              <h2 id="library-heading" className="section-title">
                {t('EXERCISE', 'کتابخانهٔ')} <em>{t('library.', 'حرکات.')}</em>
              </h2>
            </div>
            <p className="library-count" aria-live="polite">
              <CountUp value={filteredExercises.length} /> {t('/', 'از')} {exerciseLibrary.length}{' '}
              {t('shown', 'حرکت')}
            </p>
          </div>

          <div className="library-controls">
            <div className="search-field">
              <Search size={17} strokeWidth={1.9} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('Search movement or equipment', 'جست‌وجوی حرکت یا وسیله')}
                aria-label={t('Search exercises', 'جست‌وجوی حرکات')}
                enterKeyHint="search"
                autoComplete="off"
                spellCheck={false}
              />
              {query ? (
                <button
                  type="button"
                  className="search-field__clear"
                  onClick={() => setQuery('')}
                  aria-label={t('Clear exercise search', 'پاک کردن جست‌وجوی حرکات')}
                >
                  <X size={15} strokeWidth={2} aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <div
              className="filter-row"
              role="group"
              aria-label={t('Filter exercises by muscle group', 'فیلتر حرکات بر اساس گروه عضلانی')}
            >
              {muscleGroups.map((group) => {
                const activeFilter = muscle === group
                return (
                  <button
                    type="button"
                    key={group}
                    className={`filter-chip ${activeFilter ? 'is-active' : ''}`}
                    onClick={() => setMuscle(group)}
                    aria-pressed={activeFilter}
                  >
                    {activeFilter ? (
                      <motion.span
                        className="filter-chip__bg"
                        layoutId="muscle-filter-bg"
                        transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                      />
                    ) : null}
                    <span>{localizeMuscle(group, lang)}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <motion.div
            key={`${muscle}-${query}`}
            className="exercise-grid"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {filteredExercises.map((exercise) => {
              const owningProgram = programs.find((program) =>
                program.exercises.some((item) => item.id === exercise.id),
              )
              const best = state.records[exercise.id]
              return (
                <button
                  type="button"
                  className="exercise-tile"
                  key={exercise.id}
                  onClick={() => {
                    if (owningProgram) openExercise(exercise, owningProgram)
                  }}
                >
                  <ResponsivePhoto
                    sources={exercisePicture(exercise.image)}
                    alt=""
                    className="exercise-tile__photo"
                    imgClassName="exercise-tile__img"
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                    loading="lazy"
                  />
                  <span className="exercise-tile__scrim" aria-hidden="true" />
                  <span className="exercise-tile__top">
                    <span>{localizeMuscle(exercise.muscle, lang)}</span>
                    <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span className="sr-only">
                    {t(`View ${exercise.name} details`, `دیدن جزئیات ${exercise.name}`)}
                  </span>
                  <span className="exercise-tile__bottom">
                    <span className="exercise-tile__name">{exercise.shortName}</span>
                    <span className="exercise-tile__meta">
                      {best
                        ? t(
                            `${formatWeight(best)} KG BEST`,
                            `رکورد ${formatWeight(best)} کیلوگرم`,
                          )
                        : exercise.equipment}
                    </span>
                  </span>
                </button>
              )
            })}
          </motion.div>

          {filteredExercises.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state__title">
                {t('Nothing in that corner of the lab.', 'در این گوشه از سالن چیزی نیست.')}
              </p>
              <p>
                {t(
                  'Try another muscle group or reset the search.',
                  'یک گروه عضلانی دیگر را امتحان کن یا جست‌وجو را از نو شروع کن.',
                )}
              </p>
              <button
                type="button"
                className="btn btn--ghost btn--compact"
                onClick={() => {
                  setQuery('')
                  setMuscle('All')
                }}
              >
                {t('Clear filters', 'پاک کردن فیلترها')}
              </button>
            </div>
          ) : null}
        </section>

        <section className="workouts-footer shell">
          <div>
            <span className="micro-label">{t('THE LAB RULE / 001', 'قانون سالن / 001')}</span>
            <p>
              {t(
                'Never sacrifice a good rep for a heavier number.',
                'هیچ‌وقت یک تکرار خوب را فدای عدد سنگین‌تر نکن.',
              )}
            </p>
          </div>
          <a href={hrefFor('/progress')} className="text-action">
            {t('REVIEW PROGRESS', 'مرور پیشرفت')}
            <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
          </a>
        </section>
      </main>

      <ExerciseSheet
        exercise={selectedExercise}
        program={selectedProgram}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  )
}
