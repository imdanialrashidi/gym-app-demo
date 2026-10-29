import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Pause,
  Play,
  X,
} from 'lucide-react'
import { BottomSheet } from '../components/BottomSheet'
import { ResponsivePhoto } from '../components/ResponsivePhoto'
import { Wordmark } from '../components/Chrome'
import { getProgram } from '../demo/data'
import { localizeProgram } from '../demo/localize'
import type { Program } from '../demo/data'
import {
  buildSessionRecord,
  completedVolume,
  countCompletedSets,
  countPlannedSets,
  isSetValid,
  parseReps,
  parseWeight,
} from '../demo/state'
import type { SessionRecord } from '../demo/state'
import { useDemoState, useElapsedSeconds } from '../demo/AppState'
import { exercisePicture, programPicture } from '../lib/media'
import {
  formatTimer,
  formatVolumeKg,
  formatWeight,
} from '../lib/time'
import { navigate } from '../lib/router'
import { useI18n } from '../lib/i18n'

const CONFETTI_COLORS = ['#C7FF3C', '#F5F6F2', '#9BA09A', 'rgba(199,255,60,0.28)']

const CONFETTI = Array.from({ length: 34 }, (_, index) => ({
  id: index,
  left: `${(index * 29 + 7) % 100}%`,
  delay: ((index * 7) % 13) * 0.065,
  duration: 1.7 + ((index * 3) % 9) * 0.11,
  size: 4 + ((index * 5) % 7),
  drift: ((index * 13) % 30) - 15,
  rotate: 180 + ((index * 53) % 540),
  color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
}))

function hapticTap() {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(12)
    }
  } catch {
    // Vibration is a progressive enhancement only.
  }
}

interface PRHit {
  name: string
  weight: number
}

function findNewPRs(program: Program, summary: SessionRecord, previous: Record<string, number>): PRHit[] {
  const hits: PRHit[] = []
  for (const exercise of summary.exercises) {
    const template = program.exercises.find((item) => item.id === exercise.exerciseId)
    const best = exercise.sets.reduce((max, set) => Math.max(max, set.weight), 0)
    if (best > 0 && best > (previous[exercise.exerciseId] ?? 0) && template) {
      hits.push({ name: template.shortName, weight: best })
    }
  }
  return hits
}

export function SessionPage() {
  const { lang, t } = useI18n()
  const { state, dispatch } = useDemoState()
  const active = state.active
  const elapsed = useElapsedSeconds(active)
  const reduce = useReducedMotion()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [discardArmed, setDiscardArmed] = useState(false)
  const [invalidRow, setInvalidRow] = useState<string | null>(null)
  const [celebration, setCelebration] = useState<{ session: SessionRecord; prs: PRHit[] } | null>(
    null,
  )

  const activeProgram = active ? localizeProgram(getProgram(active.programId), lang) : null
  const totalSets = active ? countPlannedSets(active) : 0
  const completedSets = active ? countCompletedSets(active) : 0
  const progress = totalSets > 0 ? completedSets / totalSets : 0
  const volumeNow = active ? completedVolume(active) : 0
  const currentIndex = active?.currentExerciseIndex ?? 0
  const currentEntry = active?.entries[currentIndex]
  const currentExercise = activeProgram?.exercises[currentIndex]
  const currentSetCount = currentEntry?.sets.length ?? 0
  const currentDone = currentEntry?.sets.filter((set) => set.done).length ?? 0

  const finishSession = () => {
    if (!active) return
    const now = Date.now()
    const summary = buildSessionRecord(active, now)
    if (!summary) return
    const prs = findNewPRs(
      localizeProgram(getProgram(active.programId), lang),
      summary,
      state.records,
    )
    dispatch({ type: 'FINISH_WORKOUT', session: summary })
    setConfirmOpen(false)
    setCelebration({ session: summary, prs })
  }

  const handleToggleSet = (exerciseIndex: number, setIndex: number) => {
    if (!active) return
    const entry = active.entries[exerciseIndex]
    const set = entry?.sets[setIndex]
    if (!entry || !set) return
    if (!set.done && !isSetValid(set)) {
      setInvalidRow(`${exerciseIndex}-${setIndex}`)
      return
    }
    setInvalidRow(null)
    hapticTap()
    dispatch({
      type: 'TOGGLE_SET',
      exerciseIndex,
      setIndex,
    })
  }

  const goToNextExercise = () => {
    if (!active || !activeProgram) return
    if (currentIndex < active.entries.length - 1) {
      dispatch({ type: 'SET_CURRENT_EXERCISE', exerciseIndex: currentIndex + 1 })
      setInvalidRow(null)
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
    } else {
      setConfirmOpen(true)
    }
  }

  const completedCurrentSets =
    currentEntry?.sets.filter((set) => set.done).length === currentSetCount && currentSetCount > 0
  const allExercisesComplete = totalSets > 0 && completedSets === totalSets

  const currentCues = useMemo(() => currentExercise?.cues ?? [], [currentExercise])

  if (celebration) {
    const sessionProgram = localizeProgram(getProgram(celebration.session.programId), lang)
    return (
      <div className="completion-page">
        <ResponsivePhoto
          sources={programPicture(sessionProgram.image)}
          alt=""
          className="completion-page__photo"
          imgClassName="completion-page__img"
          sizes="100vw"
        />
        <div className="completion-page__scrim" aria-hidden="true" />
        <div className="completion-confetti" aria-hidden="true">
          {!reduce
            ? CONFETTI.map((piece) => (
                <motion.span
                  key={piece.id}
                  style={{
                    left: piece.left,
                    backgroundColor: piece.color,
                    width: piece.size,
                    height: piece.size * (piece.id % 3 === 0 ? 2.8 : 1),
                    borderRadius: piece.id % 4 === 0 ? '50%' : '1px',
                  }}
                  initial={{ y: '-12vh', x: 0, opacity: 0, rotate: 0 }}
                  animate={{
                    y: '110vh',
                    x: piece.drift,
                    opacity: [0, 1, 1, 0],
                    rotate: piece.rotate,
                  }}
                  transition={{
                    duration: piece.duration,
                    delay: piece.delay,
                    ease: 'easeIn',
                  }}
                />
              ))
            : null}
        </div>

        <motion.main
          className="completion-content"
          initial={reduce ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="completion-badge" aria-hidden="true">
            <motion.span
              initial={reduce ? false : { scale: 0.5, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.12 }}
            >
              <Check size={32} strokeWidth={2.4} />
            </motion.span>
          </div>
          <p className="section-kicker section-kicker--light">
            <span className="section-kicker__index">✓</span>{' '}
            {t('SESSION SAVED TO THIS DEVICE', 'جلسه در این دستگاه ذخیره شد')}
          </p>
          <h1 className="completion-title">
            {t('WORK', 'تمرین')}
            <br />
            <em>{t('done.', 'ثبت شد.')}</em>
          </h1>
          <p className="completion-subtitle">
            {sessionProgram.label}{' '}
            {t(
              'protocol complete. The numbers are in. Recovery starts now.',
              'تکمیل شد. اعداد ثبت شدند. بازیابی از همین حالا شروع می‌شود.',
            )}
          </p>

          {celebration.prs.length > 0 ? (
            <div className="completion-prs">
              <span className="micro-label">
                {t('NEW PERSONAL RECORDS', 'رکوردهای شخصی جدید')}
              </span>
              {celebration.prs.map((pr) => (
                <p key={pr.name}>
                  {pr.name}{' '}
                  <strong>
                    {formatWeight(pr.weight)} {t('KG', 'کیلوگرم')}
                  </strong>
                </p>
              ))}
            </div>
          ) : null}

          <dl className="completion-stats">
            <div>
              <dt>{t('Duration', 'مدت')}</dt>
              <dd>{formatTimer(celebration.session.durationSec)}</dd>
            </div>
            <div>
              <dt>{t('Volume', 'حجم')}</dt>
              <dd>{formatVolumeKg(celebration.session.volumeKg, 1, lang)}</dd>
            </div>
            <div>
              <dt>{t('Sets', 'ست')}</dt>
              <dd>
                {celebration.session.setsCompleted}
                <span>/{celebration.session.setsPlanned}</span>
              </dd>
            </div>
          </dl>

          <div className="completion-actions">
            <button
              type="button"
              className="btn btn--lime"
              onClick={() => navigate('/progress')}
            >
              {t('See your progress', 'پیشرفتت را ببین')}
              <ArrowUpRight size={17} strokeWidth={2.2} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => navigate('/workouts')}
            >
              {t('Back to the lab', 'بازگشت به سالن')}
            </button>
          </div>
          <div className="completion-footer">
            <Wordmark />
            <span>{t('BUILD BEYOND LIMITS.', 'فراتر از محدودیت‌ها بساز.')}</span>
          </div>
        </motion.main>
      </div>
    )
  }

  if (!active || !activeProgram || !currentExercise || !currentEntry) {
    return (
      <div className="session-guard">
        <Wordmark />
        <div>
          <p className="micro-label">{t('TRAINING / EMPTY FLOOR', 'تمرین / سالن خالی')}</p>
          <h1>{t('No session running.', 'هیچ جلسه‌ای در جریان نیست.')}</h1>
          <p>
            {t(
              'Start a split from the lab. Your active session will show up here while it’s live.',
              'از سالن یک برنامه شروع کن. تا وقتی جلسه‌ای زنده باشد، همین‌جا نشان داده می‌شود.',
            )}
          </p>
          <div className="session-guard__actions">
            <button
              type="button"
              className="btn btn--lime"
              onClick={() => navigate('/workouts')}
            >
              {t('Choose a split', 'انتخاب برنامه')}
              <ArrowRight size={17} strokeWidth={2.2} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => navigate('/')}
            >
              {t('Back home', 'بازگشت به خانه')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const nextExercise = activeProgram.exercises[currentIndex + 1]
  const isPaused = active.paused

  return (
    <div className="session-page">
      <header className="session-header">
        <div className="session-header__inner">
          <button
            type="button"
            className="session-icon-button"
            onClick={() => navigate('/workouts')}
            aria-label={t(
              'Minimize session and return to training',
              'کوچک کردن جلسه و بازگشت به تمرین',
            )}
          >
            <ArrowLeft size={20} strokeWidth={2} aria-hidden="true" />
          </button>

          <div className="session-timer">
            <span className={`session-live ${isPaused ? 'is-paused' : ''}`}>
              <span className="status-dot" aria-hidden="true" />
              {isPaused ? t('PAUSED', 'متوقف') : t('SESSION LIVE', 'جلسهٔ زنده')}
            </span>
            <time
              className="session-timer__value"
              dateTime={`PT${elapsed}S`}
              aria-label={t(
                `Session time ${formatTimer(elapsed)}`,
                `زمان جلسه ${formatTimer(elapsed)}`,
              )}
            >
              {formatTimer(elapsed)}
            </time>
          </div>

          <button
            type="button"
            className={`session-icon-button session-pause ${isPaused ? 'is-paused' : ''}`}
            onClick={() =>
              dispatch({
                type: isPaused ? 'RESUME_TIMER' : 'PAUSE_TIMER',
                now: Date.now(),
              })
            }
            aria-label={
              isPaused
                ? t('Resume workout timer', 'ادامهٔ زمان‌سنج تمرین')
                : t('Pause workout timer', 'توقف زمان‌سنج تمرین')
            }
            aria-pressed={isPaused}
          >
            {isPaused ? (
              <Play size={17} strokeWidth={2.2} aria-hidden="true" />
            ) : (
              <Pause size={17} strokeWidth={2.2} aria-hidden="true" />
            )}
          </button>
        </div>
        <div
          className="session-header__progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={totalSets}
          aria-valuenow={completedSets}
          aria-label={t(
            `${completedSets} of ${totalSets} sets completed`,
            `${completedSets} از ${totalSets} ست تکمیل شد`,
          )}
        >
          <motion.span
            initial={false}
            animate={{ width: `${Math.max(2, progress * 100)}%` }}
            transition={{ type: 'spring', stiffness: 180, damping: 28 }}
          />
        </div>
        <p className="sr-only" aria-live="polite">
          {completedSets} {t('of', 'از')} {totalSets} {t('sets logged.', 'ست ثبت شده.')}
        </p>
      </header>

      <div className="session-shell">
        <section className="session-visual" aria-labelledby="current-exercise-title">
          <div className="session-visual__media">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentExercise.id}
                className="session-visual__image-wrap"
                initial={reduce ? false : { opacity: 0, scale: 1.025 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <ResponsivePhoto
                  sources={exercisePicture(currentExercise.image)}
                  alt={t(
                    `${currentExercise.name} reference`,
                    `${currentExercise.name} — تصویر مرجع`,
                  )}
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  imgClassName="session-visual__image"
                  loading="eager"
                  fetchPriority="high"
                />
              </motion.div>
            </AnimatePresence>
            <div className="session-visual__scrim" aria-hidden="true" />
            <div className="session-visual__top">
              <span className="tag tag--lime">
                {t('EXERCISE', 'حرکت')} {String(currentIndex + 1).padStart(2, '0')} /{' '}
                {String(activeProgram.exercises.length).padStart(2, '0')}
              </span>
              <span className="session-visual__program">
                {activeProgram.label} / {activeProgram.kicker.split(' · ')[0]}
              </span>
            </div>
            <div className="session-visual__title">
              <p className="micro-label">{currentExercise.muscle} / {currentExercise.equipment}</p>
              <h1 id="current-exercise-title">{currentExercise.name}</h1>
            </div>
          </div>

          <div className="session-cues">
            <span className="micro-label">{t('FORM FOCUS', 'تمرکز فرم')}</span>
            <ul>
              {currentCues.map((cue, index) => (
                <li key={cue}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <p>{cue}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="session-work" aria-label={t('Log your working sets', 'ثبت ست‌های کاری')}>
          <nav
            className="exercise-switcher"
            aria-label={t('Exercises in this session', 'حرکت‌های این جلسه')}
          >
            {activeProgram.exercises.map((exercise, index) => {
              const entry = active.entries[index]
              const doneCount = entry?.sets.filter((set) => set.done).length ?? 0
              const isCurrent = index === currentIndex
              return (
                <button
                  type="button"
                  key={exercise.id}
                  className={`exercise-switcher__item ${isCurrent ? 'is-current' : ''} ${
                    doneCount === entry?.sets.length ? 'is-complete' : ''
                  }`}
                  onClick={() => {
                    dispatch({ type: 'SET_CURRENT_EXERCISE', exerciseIndex: index })
                    setInvalidRow(null)
                  }}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <span className="exercise-switcher__number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="exercise-switcher__copy">
                    <span>{exercise.shortName}</span>
                    <small>
                      {doneCount}/{entry?.sets.length ?? 0} {t('LOGGED', 'ثبت شده')}
                    </small>
                  </span>
                  {doneCount === entry?.sets.length ? (
                    <Check size={13} strokeWidth={2.4} aria-hidden="true" />
                  ) : null}
                  {isCurrent ? (
                    <motion.span
                      className="exercise-switcher__indicator"
                      layoutId="exercise-switcher-active"
                      transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                    />
                  ) : null}
                </button>
              )
            })}
          </nav>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentExercise.id}
              className="session-work__body"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.26, ease: 'easeOut' }}
            >
              <div className="set-panel">
                <div className="set-panel__head">
                  <div>
                    <p className="micro-label">{t('WORKING SETS', 'ست‌های کاری')}</p>
                    <h2>
                      {currentDone}
                      <span>/{currentSetCount}</span> {t('logged', 'ثبت شده')}
                    </h2>
                  </div>
                  <div className="set-panel__prescription">
                    <span>
                      {currentExercise.sets} {t('SETS', 'ست')}
                    </span>
                    <span>
                      {currentExercise.reps} {t('REPS', 'تکرار')}
                    </span>
                    <span>
                      {formatWeight(currentExercise.weight)} {t('KG', 'کیلوگرم')}
                    </span>
                    <span>
                      {t(
                        `${currentExercise.rest}s REST`,
                        `${currentExercise.rest} ثانیه استراحت`,
                      )}
                    </span>
                  </div>
                </div>

                <div
                  className="set-table"
                  role="table"
                  aria-label={t(
                    `${currentExercise.name} sets`,
                    `ست‌های ${currentExercise.name}`,
                  )}
                >
                  <div className="set-table__header" role="row">
                    <span role="columnheader">{t('SET', 'ست')}</span>
                    <span role="columnheader">{t('WEIGHT / KG', 'وزن / کیلوگرم')}</span>
                    <span role="columnheader">{t('REPS', 'تکرار')}</span>
                    <span role="columnheader" className="sr-only">
                      {t('Log set', 'ثبت ست')}
                    </span>
                  </div>

                  {currentEntry.sets.map((set, setIndex) => {
                    const rowKey = `${currentIndex}-${setIndex}`
                    const weightValid = parseWeight(set.weight) !== null
                    const repsValid = parseReps(set.reps) !== null
                    const valid = weightValid && repsValid
                    const isInvalid = invalidRow === rowKey && !set.done
                    return (
                      <motion.div
                        layout="position"
                        key={rowKey}
                        className={`set-row ${set.done ? 'is-done' : ''} ${
                          isInvalid ? 'is-invalid' : ''
                        }`}
                        role="row"
                      >
                        <span className="set-row__number" role="cell">
                          {String(setIndex + 1).padStart(2, '0')}
                        </span>

                        <label className="set-field" role="cell">
                          <span className="sr-only">
                            {t(`Weight for set ${setIndex + 1}`, `وزن ست ${setIndex + 1}`)}
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            enterKeyHint="done"
                            value={set.weight}
                            onChange={(event) =>
                              dispatch({
                                type: 'UPDATE_SET',
                                exerciseIndex: currentIndex,
                                setIndex,
                                field: 'weight',
                                value: event.target.value,
                              })
                            }
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault()
                                handleToggleSet(currentIndex, setIndex)
                              }
                            }}
                            disabled={set.done}
                            aria-invalid={isInvalid && !weightValid}
                            aria-label={t(
                              `Weight in kilograms for set ${setIndex + 1}`,
                              `وزن به کیلوگرم برای ست ${setIndex + 1}`,
                            )}
                            maxLength={6}
                            placeholder="0"
                          />
                          <span className="set-field__unit" aria-hidden="true">
                            {t('KG', 'کیلو')}
                          </span>
                        </label>

                        <label className="set-field set-field--reps" role="cell">
                          <span className="sr-only">
                            {t(
                              `Repetitions for set ${setIndex + 1}`,
                              `تکرارهای ست ${setIndex + 1}`,
                            )}
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            enterKeyHint="done"
                            value={set.reps}
                            onChange={(event) =>
                              dispatch({
                                type: 'UPDATE_SET',
                                exerciseIndex: currentIndex,
                                setIndex,
                                field: 'reps',
                                value: event.target.value,
                              })
                            }
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault()
                                handleToggleSet(currentIndex, setIndex)
                              }
                            }}
                            disabled={set.done}
                            aria-invalid={isInvalid && !repsValid}
                            aria-label={t(
                              `Repetitions for set ${setIndex + 1}`,
                              `تکرارهای ست ${setIndex + 1}`,
                            )}
                            maxLength={3}
                            placeholder="0"
                          />
                        </label>

                        <motion.button
                          type="button"
                          className={`set-log ${set.done ? 'is-done' : ''} ${
                            valid ? 'is-valid' : ''
                          }`}
                          onClick={() => handleToggleSet(currentIndex, setIndex)}
                          whileTap={{ scale: 0.92 }}
                          aria-pressed={set.done}
                          aria-label={
                            set.done
                              ? t(`Undo set ${setIndex + 1}`, `بازگرداندن ست ${setIndex + 1}`)
                              : t(`Log set ${setIndex + 1}`, `ثبت ست ${setIndex + 1}`)
                          }
                        >
                          {set.done ? (
                            <Check size={19} strokeWidth={2.8} aria-hidden="true" />
                          ) : (
                            <span aria-hidden="true" />
                          )}
                        </motion.button>
                      </motion.div>
                    )
                  })}
                </div>

                {invalidRow ? (
                  <p className="set-error" role="alert">
                    {t(
                      'Use a weight from 0–999 kg and 1–100 reps, then log the set.',
                      'وزن بین 0 تا 999 کیلوگرم و تکرار بین 1 تا 100 بگذار، بعد ست را ثبت کن.',
                    )}
                  </p>
                ) : null}

                <p className="set-table__hint">
                  <span className="status-dot" aria-hidden="true" />
                  {t(
                    'Tap the circle to log a set. Tap again to undo.',
                    'برای ثبت ست روی دایره بزن. برای بازگرداندن دوباره بزن.',
                  )}
                </p>
              </div>

              <div className="session-actions">
                {completedCurrentSets ? (
                  <button
                    type="button"
                    className="btn btn--lime btn--block"
                    onClick={goToNextExercise}
                  >
                    {nextExercise
                      ? t(`Next: ${nextExercise.shortName}`, `بعدی: ${nextExercise.shortName}`)
                      : t('Finish session', 'پایان جلسه')}
                    <ArrowRight size={18} strokeWidth={2.2} aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn--ghost btn--block"
                    onClick={() =>
                      dispatch({
                        type: 'SET_CURRENT_EXERCISE',
                        exerciseIndex: Math.min(
                          active.entries.length - 1,
                          currentIndex + 1,
                        ),
                      })
                    }
                    disabled={currentIndex === active.entries.length - 1}
                  >
                    {t('Skip ahead', 'رد کردن')}
                    <ArrowRight size={17} strokeWidth={2} aria-hidden="true" />
                  </button>
                )}

                <div className="session-meta-row">
                  <span>
                    {formatVolumeKg(volumeNow, 1, lang)} {t('logged', 'ثبت شده')}
                  </span>
                  <span>
                    {percentageLabel(progress)} {t('complete', 'تکمیل شده')}
                  </span>
                </div>

                <button
                  type="button"
                  className="session-finish"
                  onClick={() => setConfirmOpen(true)}
                >
                  <span>{t('Finish session', 'پایان جلسه')}</span>
                  <X size={16} strokeWidth={1.8} aria-hidden="true" />
                </button>

                {allExercisesComplete ? (
                  <p className="session-complete-note">
                    {t(
                      'Every set logged. End the session and take the win.',
                      'همهٔ ست‌ها ثبت شد. جلسه را تمام کن و این برد را مال خودت کن.',
                    )}
                  </p>
                ) : null}
              </div>
            </motion.div>
          </AnimatePresence>
        </section>
      </div>

      <BottomSheet
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false)
          setDiscardArmed(false)
        }}
        eyebrow={t('SESSION REVIEW', 'مرور جلسه')}
        title={t('Finish the work?', 'کار را تمام کنیم؟')}
        panelClassName="finish-sheet"
      >
        <div className="finish-summary">
          <div className="finish-summary__headline">
            <span className="micro-label">
              {t(`${activeProgram.label} PROTOCOL`, `پروتکل ${activeProgram.label}`)}
            </span>
            <p>
              {allExercisesComplete
                ? t('Every rep is in the books.', 'همهٔ تکرارها ثبت شد.')
                : t('Some sets are still on the table.', 'چند ست هنوز باقی مانده.')}
            </p>
          </div>
          <dl className="finish-summary__stats">
            <div>
              <dt>{t('Logged', 'ثبت شده')}</dt>
              <dd>
                {completedSets}
                <span>
                  /{totalSets} {t('sets', 'ست')}
                </span>
              </dd>
            </div>
            <div>
              <dt>{t('Volume', 'حجم')}</dt>
              <dd>{formatVolumeKg(volumeNow, 1, lang)}</dd>
            </div>
            <div>
              <dt>{t('Time', 'زمان')}</dt>
              <dd>{formatTimer(elapsed)}</dd>
            </div>
          </dl>
          <p className="finish-summary__note">
            {t(
              'Completed sets will be saved to this browser and added to your progress. Unlogged sets are not recorded.',
              'ست‌های تکمیل‌شده در این مرورگر ذخیره و به پیشرفتت اضافه می‌شوند. ست‌های ثبت‌نشده ذخیره نمی‌شوند.',
            )}
          </p>
        </div>
        <div className="finish-actions">
          <button
            type="button"
            className="btn btn--lime btn--block"
            onClick={finishSession}
            disabled={completedSets === 0}
          >
            {t('Finish & save session', 'پایان و ذخیرهٔ جلسه')}
            <Check size={17} strokeWidth={2.4} aria-hidden="true" />
          </button>
          {completedSets === 0 ? (
            <p className="finish-actions__hint">
              {t('Log at least one set to save the session.', 'برای ذخیرهٔ جلسه حداقل یک ست ثبت کن.')}
            </p>
          ) : null}
          <button
            type="button"
            className="btn btn--ghost btn--block"
            onClick={() => setConfirmOpen(false)}
          >
            {t('Keep training', 'ادامهٔ تمرین')}
          </button>
          <div className="discard-area">
            {!discardArmed ? (
              <button
                type="button"
                className="session-discard"
                onClick={() => setDiscardArmed(true)}
              >
                {t('Discard this session', 'دور انداختن این جلسه')}
              </button>
            ) : (
              <div className="discard-confirm">
                <p>
                  {t(
                    'Discard the session and all unsaved sets?',
                    'جلسه و همهٔ ست‌های ذخیره‌نشده دور انداخته شود؟',
                  )}
                </p>
                <div className="discard-confirm__actions">
                  <button
                    type="button"
                    className="btn btn--ghost btn--compact"
                    onClick={() => setDiscardArmed(false)}
                  >
                    {t('Keep it', 'نگه‌ش دار')}
                  </button>
                  <button
                    type="button"
                    className="btn btn--danger btn--compact"
                    onClick={() => {
                      dispatch({ type: 'CANCEL_WORKOUT' })
                      setConfirmOpen(false)
                      setDiscardArmed(false)
                      navigate('/workouts')
                    }}
                  >
                    {t('Discard session', 'دور انداختن جلسه')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}

function percentageLabel(value: number): string {
  if (!Number.isFinite(value)) return '0%'
  return `${Math.round(value * 100)}%`
}
