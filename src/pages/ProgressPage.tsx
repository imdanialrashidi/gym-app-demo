import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { MobilePageHeader } from '../components/Chrome'
import { ResponsivePhoto } from '../components/ResponsivePhoto'
import { CountUp, ProgressRing, Reveal } from '../components/MotionBits'
import {
  getAllTimeStats,
  getProgramForSession,
  getProgressSummary,
  getRecentSessions,
  getRecordCards,
  getWeeklyStats,
} from '../demo/selectors'
import type { ChartPoint, ProgressRange } from '../demo/selectors'
import { useDemoState } from '../demo/AppState'
import { editorialPicture, exercisePicture, gymPicture, programPicture } from '../lib/media'
import {
  formatMinutes,
  formatRelativeDateTime,
  formatVolumeKg,
  formatWeight,
} from '../lib/time'
import type { SessionRecord } from '../demo/state'

interface ProgressPageProps {
  onOpenSettings: () => void
}

const ranges: Array<{ id: ProgressRange; label: string; description: string }> = [
  { id: '7D', label: '7D', description: 'Last 7 days' },
  { id: '4W', label: '4W', description: 'Last 4 weeks' },
  { id: '12W', label: '12W', description: 'Last 12 weeks' },
]

const RANGE_LABEL: Record<ProgressRange, string> = {
  '7D': 'LAST 7 DAYS',
  '4W': 'LAST 4 WEEKS',
  '12W': 'LAST 12 WEEKS',
}

function VolumeTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: ChartPoint; value?: number }>
}) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  if (!point) return null
  return (
    <div className="chart-tooltip">
      <span>{point.fullLabel}</span>
      <strong>{formatVolumeKg(point.volumeKg)}</strong>
      <small>
        {point.sessions} session{point.sessions === 1 ? '' : 's'}
      </small>
    </div>
  )
}

function RecentSessionRow({
  session,
  index,
  expanded,
  onToggle,
}: {
  session: SessionRecord
  index: number
  expanded: boolean
  onToggle: () => void
}) {
  const program = getProgramForSession(session)
  const reduce = useReducedMotion()
  return (
    <article className={`activity-row ${expanded ? 'is-expanded' : ''}`}>
      <button
        type="button"
        className="activity-row__button"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="sr-only">
          {expanded ? 'Collapse' : 'Expand'} session details. Press enter to toggle.
        </span>
        <span className="activity-row__index">{String(index + 1).padStart(2, '0')}</span>
        <ResponsivePhoto
          sources={programPicture(program.image)}
          alt=""
          className="activity-row__photo"
          imgClassName="activity-row__img"
          sizes="64px"
          loading="lazy"
        />
        <span className="activity-row__main">
          <span className="activity-row__name">{program.label} protocol</span>
          <span className="activity-row__date">{formatRelativeDateTime(session.completedAt)}</span>
        </span>
        <span className="activity-row__stats">
          <strong>{formatVolumeKg(session.volumeKg, 1)}</strong>
          <span>
            {formatMinutes(session.durationSec)} / {session.setsCompleted}{' '}
            {session.setsCompleted === 1 ? 'set' : 'sets'}
          </span>
        </span>
        <ChevronDown
          className="activity-row__chevron"
          size={16}
          strokeWidth={1.9}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            className="activity-row__panel"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="activity-row__panel-inner">
              {session.exercises.map((exercise) => {
                const exerciseDetails = program.exercises.find(
                  (item) => item.id === exercise.exerciseId,
                )
                const best = exercise.sets.reduce(
                  (current, set) => (set.weight > current.weight ? set : current),
                  exercise.sets[0],
                )
                return (
                  <div className="activity-exercise" key={exercise.exerciseId}>
                    <span>{exercise.name}</span>
                    <span>
                      {best ? `${formatWeight(best.weight)} KG × ${best.reps}` : '—'}
                    </span>
                    <span>{exercise.sets.length} logged</span>
                    {exerciseDetails ? (
                      <ResponsivePhoto
                        sources={exercisePicture(exerciseDetails.image)}
                        alt=""
                        className="activity-exercise__thumb"
                        imgClassName="activity-exercise__img"
                        sizes="36px"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                )
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  )
}

export function ProgressPage({ onOpenSettings }: ProgressPageProps) {
  const { state } = useDemoState()
  const [range, setRange] = useState<ProgressRange>('4W')
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
  const reduce = useReducedMotion()
  const now = useMemo(() => Date.now(), [])

  const summary = getProgressSummary(state, range, now)
  const weekly = getWeeklyStats(state, now)
  const recordCards = getRecordCards(state)
  const recentSessions = getRecentSessions(state, 5)
  const allTime = getAllTimeStats(state)
  const volumeTonnes = summary.totalVolumeKg / 1000
  const delta = summary.deltaPct
  const chartTickInterval = range === '12W' ? 1 : 0
  const featuredRecord = recordCards[0]
  const secondaryRecords = recordCards.slice(1)

  return (
    <div className="progress-page">
      <MobilePageHeader section="PROGRESS / 03" onOpenSettings={onOpenSettings} />
      <main className="page-main">
        <div className="shell">
          <Reveal className="page-intro progress-intro">
            <p className="section-kicker">
              <span className="section-kicker__index">03</span> PERFORMANCE ARCHIVE
            </p>
            <h1 className="page-title">
              THE <em>proof.</em>
            </h1>
            <p className="page-lede">
              The scale is noisy. The log isn’t. Track volume, consistency and the lifts that
              matter — one honest session at a time.
            </p>
            <div className="progress-intro__stamp" aria-hidden="true">
              <span>LOG</span>
              <span>{String(allTime.totalSessions).padStart(2, '0')}</span>
              <span>ENTRIES</span>
            </div>
          </Reveal>
        </div>

        <div className="shell progress-content">
          <section aria-labelledby="volume-heading">
            <div className="filter-row progress-ranges" role="group" aria-label="Select progress time range">
              {ranges.map((option) => {
                const active = option.id === range
                return (
                  <button
                    type="button"
                    key={option.id}
                    className={`range-chip ${active ? 'is-active' : ''}`}
                    onClick={() => setRange(option.id)}
                    aria-pressed={active}
                  >
                    {active ? (
                      <motion.span
                        className="range-chip__bg"
                        layoutId="progress-range-bg"
                        transition={{ type: 'spring', stiffness: 460, damping: 38 }}
                      />
                    ) : null}
                    <span>{option.label}</span>
                    <span className="sr-only"> — {option.description}</span>
                  </button>
                )
              })}
              <span className="progress-ranges__label">{RANGE_LABEL[range]}</span>
            </div>

            <Reveal className="chart-panel">
              <div className="chart-panel__head">
                <div>
                  <p className="micro-label" id="volume-heading">
                    TRAINING VOLUME / {RANGE_LABEL[range]}
                  </p>
                  <div className="chart-panel__value">
                    <CountUp value={volumeTonnes} decimals={1} suffix="T" />
                    <span className="chart-panel__value-label">MOVED</span>
                  </div>
                </div>
                <div className="chart-panel__aside">
                  <span className={`delta-chip delta-chip--large ${delta !== null && delta < 0 ? 'is-down' : ''}`}>
                    {delta === null ? (
                      'BASELINE'
                    ) : (
                      <>
                        {delta >= 0 ? (
                          <TrendingUp size={14} strokeWidth={2} aria-hidden="true" />
                        ) : (
                          <TrendingDown size={14} strokeWidth={2} aria-hidden="true" />
                        )}
                        {delta >= 0 ? '+' : ''}
                        {delta.toFixed(1)}%
                      </>
                    )}
                  </span>
                  <span className="chart-panel__delta-copy">VS MATCHED PRIOR</span>
                  <span className="chart-panel__peak">
                    PEAK / {formatVolumeKg(summary.peakVolumeKg, 1)}
                  </span>
                </div>
              </div>

              <div
                className="volume-chart"
                role="img"
                aria-label={`Training volume for the ${RANGE_LABEL[range].toLowerCase()}: ${formatVolumeKg(
                  summary.totalVolumeKg,
                  1,
                )} across ${summary.sessionCount} sessions.`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    key={`${range}-${summary.totalVolumeKg}`}
                    data={summary.points}
                    margin={{ top: 16, right: 20, left: -16, bottom: 2 }}
                  >
                    <defs>
                      <linearGradient id="volume-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C7FF3C" stopOpacity={0.32} />
                        <stop offset="65%" stopColor="#C7FF3C" stopOpacity={0.07} />
                        <stop offset="100%" stopColor="#C7FF3C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      vertical={false}
                      stroke="rgba(245,246,242,0.08)"
                      strokeDasharray="3 5"
                    />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      interval={chartTickInterval}
                      tickMargin={14}
                      tick={{ fill: '#8E958D', fontSize: 9, letterSpacing: '0.1em' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      width={56}
                      tickMargin={2}
                      tick={{ fill: '#6D746C', fontSize: 9, letterSpacing: '0.06em' }}
                      tickFormatter={(value: number) =>
                        value === 0 ? '0' : `${Math.round(value / 1000)}K`
                      }
                    />
                    {range !== '7D' ? (
                      <ReferenceLine
                        x="NOW"
                        stroke="rgba(199,255,60,0.28)"
                        strokeDasharray="3 5"
                      />
                    ) : null}
                    <Tooltip
                      content={<VolumeTooltip />}
                      cursor={{ stroke: 'rgba(199,255,60,0.35)', strokeDasharray: '3 4' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="volumeKg"
                      stroke="#C7FF3C"
                      strokeWidth={2}
                      fill="url(#volume-fill)"
                      activeDot={{
                        r: 4,
                        fill: '#C7FF3C',
                        stroke: '#090B0A',
                        strokeWidth: 3,
                      }}
                      dot={false}
                      isAnimationActive={!reduce}
                      animationDuration={900}
                      animationEasing="ease-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-panel__legend">
                <span>
                  <span className="legend-dot" aria-hidden="true" /> VOLUME / KG
                </span>
                <span>{summary.sessionCount} SESSIONS</span>
                <span>{summary.totalSets} SETS</span>
              </div>
            </Reveal>

            <div className="quick-stats">
              <Reveal className="quick-stat">
                <span>SESSION COUNT</span>
                <CountUp value={summary.sessionCount} />
                <small>{RANGE_LABEL[range]}</small>
              </Reveal>
              <Reveal className="quick-stat" delay={0.06}>
                <span>AVG DURATION</span>
                <CountUp value={Math.round(summary.avgDurationSec / 60)} suffix="M" />
                <small>PER SESSION</small>
              </Reveal>
              <Reveal className="quick-stat" delay={0.12}>
                <span>ALL-TIME HOURS</span>
                <CountUp value={allTime.totalHours} decimals={1} />
                <small>{allTime.totalSets} SETS LOGGED</small>
              </Reveal>
            </div>
          </section>

          <section className="page-section" aria-labelledby="consistency-heading">
            <div className="section-heading section-heading--row">
              <div>
                <p className="section-kicker">
                  <span className="section-kicker__index">01</span> THE RHYTHM
                </p>
                <h2 id="consistency-heading" className="section-title">
                  CONSISTENCY <em>compounds.</em>
                </h2>
              </div>
              <span className="section-heading__aside">WEEKLY TARGET / {weekly.target}</span>
            </div>

            <Reveal className="consistency-feature">
              <ResponsivePhoto
                sources={gymPicture()}
                alt="A quiet, industrial strength gym floor."
                className="consistency-feature__photo"
                imgClassName="consistency-feature__img"
                sizes="(min-width: 1024px) 1240px, 100vw"
                loading="lazy"
              />
              <span className="consistency-feature__scrim" aria-hidden="true" />
              <div className="consistency-feature__top">
                <span className="tag tag--lime">CURRENT WEEK</span>
                <span className="consistency-feature__streak">
                  {weekly.streakWeeks} WEEK STREAK
                </span>
              </div>
              <div className="consistency-feature__content">
                <div className="consistency-feature__copy">
                  <p className="micro-label">SHOW UP. ADD UP.</p>
                  <p className="consistency-feature__headline">
                    {weekly.activeDays}
                    <span>/7</span> days of work
                  </p>
                  <p className="consistency-feature__sub">
                    {weekly.sessionsThisWeek} of {weekly.target} target sessions logged. The repeat
                    is the result.
                  </p>
                </div>
                <ProgressRing
                  value={Math.min(1, weekly.sessionsThisWeek / weekly.target)}
                  size={96}
                  strokeWidth={4}
                  ariaLabel={`${weekly.sessionsThisWeek} of ${weekly.target} target sessions this week`}
                >
                  <span className="consistency-feature__ring">
                    {Math.round(Math.min(1, weekly.sessionsThisWeek / weekly.target) * 100)}
                    <small>%</small>
                  </span>
                </ProgressRing>
              </div>
              <div className="consistency-bars">
                {weekly.days.map((day) => {
                  const ratio = Math.max(
                    day.hasTrained ? 0.22 : 0,
                    weekly.volumeKg > 0 ? day.volumeKg / weekly.volumeKg : 0,
                  )
                  return (
                    <div
                      key={day.timestamp}
                      className={`consistency-bar ${day.hasTrained ? 'has-trained' : ''} ${
                        day.isToday ? 'is-today' : ''
                      } ${day.isFuture ? 'is-future' : ''}`}
                    >
                      <span className="consistency-bar__volume">
                        {day.volumeKg > 0 ? `${Math.round(day.volumeKg / 100) / 10}T` : '—'}
                      </span>
                      <span className="consistency-bar__track" aria-hidden="true">
                        <motion.span
                          initial={reduce ? false : { height: '6%' }}
                          whileInView={{ height: `${Math.max(6, ratio * 100)}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </span>
                      <span className="consistency-bar__label">{day.label}</span>
                    </div>
                  )
                })}
              </div>
            </Reveal>
          </section>

          <section className="page-section" aria-labelledby="records-heading">
            <div className="section-heading section-heading--row">
              <div>
                <p className="section-kicker">
                  <span className="section-kicker__index">02</span> PERSONAL RECORDS
                </p>
                <h2 id="records-heading" className="section-title">
                  BUILT <em>different.</em>
                </h2>
              </div>
              <span className="section-heading__aside">ALL-TIME / KG</span>
            </div>

            <div className="records-grid">
              <Reveal className="record-feature">
                <ResponsivePhoto
                  sources={editorialPicture('deadlift')}
                  alt="Athlete preparing a heavy deadlift."
                  className="record-feature__photo"
                  imgClassName="record-feature__img"
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  loading="lazy"
                />
                <span className="record-feature__scrim" aria-hidden="true" />
                <div className="record-feature__content">
                  <span className="tag">BIG THREE / PR</span>
                  <p className="record-feature__lift">{featuredRecord.label}</p>
                  <p className="record-feature__value">
                    <CountUp value={featuredRecord.weight} decimals={featuredRecord.weight % 1 === 0 ? 0 : 1} />
                    <span className="record-feature__unit">KG</span>
                  </p>
                  <div className="record-feature__footer">
                    <span>ALL-TIME BEST</span>
                    <span>
                      {featuredRecord.progress > 0
                        ? `+${formatWeight(featuredRecord.progress)} KG THIS DEMO`
                        : 'BASELINE RECORD'}
                    </span>
                  </div>
                </div>
              </Reveal>

              <div className="record-secondary">
                {secondaryRecords.map((record, index) => (
                  <Reveal className="record-card" delay={0.06 + index * 0.05} key={record.exerciseId}>
                    <div className="record-card__top">
                      <span className="record-card__code">{record.code}</span>
                      <span className="record-card__label">{record.label}</span>
                    </div>
                    <p className="record-card__value">
                      <CountUp
                        value={record.weight}
                        decimals={record.weight % 1 === 0 ? 0 : 1}
                      />
                      <span className="record-card__unit">KG</span>
                    </p>
                    <div className="record-card__foot">
                      <span>ALL-TIME</span>
                      <span>
                        {record.progress > 0
                          ? `+${formatWeight(record.progress)} THIS DEMO`
                          : 'BASELINE'}
                      </span>
                    </div>
                    <div className="record-card__line" aria-hidden="true" />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section className="page-section" aria-labelledby="activity-heading">
            <div className="section-heading section-heading--row">
              <div>
                <p className="section-kicker">
                  <span className="section-kicker__index">03</span> THE LOG
                </p>
                <h2 id="activity-heading" className="section-title">
                  RECENT <em>work.</em>
                </h2>
              </div>
              <span className="section-heading__aside">{allTime.totalSessions} TOTAL</span>
            </div>

            {recentSessions.length > 0 ? (
              <div className="activity-list">
                {recentSessions.map((session, index) => (
                  <RecentSessionRow
                    key={session.id}
                    session={session}
                    index={index}
                    expanded={expandedSession === session.id}
                    onToggle={() =>
                      setExpandedSession((current) => (current === session.id ? null : session.id))
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-state__title">The log is empty.</p>
                <p>Finish a training session and it will show up here.</p>
                <a href="#/workouts" className="btn btn--lime btn--compact">
                  Enter the lab
                </a>
              </div>
            )}
            <p className="activity-footnote">
              <span className="status-dot" aria-hidden="true" />
              SAMPLE DATA + SESSIONS YOU FINISH IN THIS BROWSER.
            </p>
          </section>

          <div className="progress-signoff">
            <div>
              <ArrowDownRight size={18} strokeWidth={1.8} aria-hidden="true" />
              <p>SHOW UP AGAIN.</p>
            </div>
            <a href="#/workouts" className="text-action">
              BACK TO TRAINING
              <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
