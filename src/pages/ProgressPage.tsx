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
import { localizeProgram, localizeRecord } from '../demo/localize'
import { editorialPicture, exercisePicture, gymPicture, programPicture } from '../lib/media'
import { useI18n } from '../lib/i18n'
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

function VolumeTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: ChartPoint; value?: number }>
}) {
  const { lang, t } = useI18n()
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  if (!point) return null
  return (
    <div className="chart-tooltip">
      <span>{point.fullLabel}</span>
      <strong>{formatVolumeKg(point.volumeKg, 0, lang)}</strong>
      <small>
        {point.sessions} {point.sessions === 1 ? t('session', 'جلسه') : t('sessions', 'جلسه')}
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
  const { lang, t } = useI18n()
  const program = localizeProgram(getProgramForSession(session), lang)
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
          {expanded ? t('Collapse', 'بستن') : t('Expand', 'باز کردن')}{' '}
          {t(
            'session details. Press enter to toggle.',
            'جزئیات جلسه. برای باز و بسته کردن، کلید Enter را بزنید.',
          )}
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
          <span className="activity-row__name">
            {t(`${program.label} protocol`, `پروتکل ${program.label}`)}
          </span>
          <span className="activity-row__date">
            {formatRelativeDateTime(session.completedAt, Date.now(), lang)}
          </span>
        </span>
        <span className="activity-row__stats">
          <strong>{formatVolumeKg(session.volumeKg, 1, lang)}</strong>
          <span>
            {formatMinutes(session.durationSec, lang)} / {session.setsCompleted}{' '}
            {session.setsCompleted === 1 ? t('set', 'ست') : t('sets', 'ست')}
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
                    <span>{exerciseDetails?.name ?? exercise.name}</span>
                    <span>
                      {best
                        ? `${formatWeight(best.weight)} ${t('KG', 'کیلوگرم')} × ${best.reps}`
                        : '—'}
                    </span>
                    <span>
                      {exercise.sets.length} {t('logged', 'ثبت‌شده')}
                    </span>
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
  const { lang, t } = useI18n()
  const [range, setRange] = useState<ProgressRange>('4W')
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
  const reduce = useReducedMotion()
  const now = useMemo(() => Date.now(), [])

  const ranges: Array<{ id: ProgressRange; label: string; description: string }> = [
    { id: '7D', label: t('7D', '7 روز'), description: t('Last 7 days', '7 روز اخیر') },
    { id: '4W', label: t('4W', '4 هفته'), description: t('Last 4 weeks', '4 هفتهٔ اخیر') },
    { id: '12W', label: t('12W', '12 هفته'), description: t('Last 12 weeks', '12 هفتهٔ اخیر') },
  ]

  const rangeLabel: Record<ProgressRange, string> = {
    '7D': t('LAST 7 DAYS', '7 روز اخیر'),
    '4W': t('LAST 4 WEEKS', '4 هفتهٔ اخیر'),
    '12W': t('LAST 12 WEEKS', '12 هفتهٔ اخیر'),
  }

  const summary = getProgressSummary(state, range, now, lang)
  const weekly = getWeeklyStats(state, now, 4, lang)
  const recordCards = getRecordCards(state).map((record) => localizeRecord(record, lang))
  const recentSessions = getRecentSessions(state, 5)
  const allTime = getAllTimeStats(state)
  const volumeTonnes = summary.totalVolumeKg / 1000
  const delta = summary.deltaPct
  const chartTickInterval = range === '12W' ? 1 : 0
  const featuredRecord = recordCards[0]
  const secondaryRecords = recordCards.slice(1)
  const totalVolumeLabel = formatVolumeKg(summary.totalVolumeKg, 1, lang)
  const peakVolumeLabel = formatVolumeKg(summary.peakVolumeKg, 1, lang)
  const nowTick = t('NOW', 'اکنون')
  const activeRangeLabel = rangeLabel[range]

  return (
    <div className="progress-page">
      <MobilePageHeader section={t('PROGRESS / 03', 'پیشرفت / 03')} onOpenSettings={onOpenSettings} />
      <main className="page-main">
        <div className="shell">
          <Reveal className="page-intro progress-intro">
            <p className="section-kicker">
              <span className="section-kicker__index">03</span> {t('PERFORMANCE ARCHIVE', 'آرشیو عملکرد')}
            </p>
            <h1 className="page-title">
              {t('THE ', '')}
              <em>{t('proof.', 'مدرک.')}</em>
            </h1>
            <p className="page-lede">
              {t(
                'The scale is noisy. The log isn’t. Track volume, consistency and the lifts that matter — one honest session at a time.',
                'ترازو نویز دارد، دفتر ثبت نه. حجم، ثبات و حرکت‌هایی را که مهم‌اند ثبت کن — هر بار یک جلسهٔ صادقانه.',
              )}
            </p>
            <div className="progress-intro__stamp" aria-hidden="true">
              <span>{t('LOG', 'دفتر')}</span>
              <span>{String(allTime.totalSessions).padStart(2, '0')}</span>
              <span>{t('ENTRIES', 'ثبت')}</span>
            </div>
          </Reveal>
        </div>

        <div className="shell progress-content">
          <section aria-labelledby="volume-heading">
            <div
              className="filter-row progress-ranges"
              role="group"
              aria-label={t('Select progress time range', 'انتخاب بازهٔ زمانی پیشرفت')}
            >
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
              <span className="progress-ranges__label">{activeRangeLabel}</span>
            </div>

            <Reveal className="chart-panel">
              <div className="chart-panel__head">
                <div>
                  <p className="micro-label" id="volume-heading">
                    {t(
                      `TRAINING VOLUME / ${activeRangeLabel}`,
                      `حجم تمرین / ${activeRangeLabel}`,
                    )}
                  </p>
                  <div className="chart-panel__value">
                    <CountUp value={volumeTonnes} decimals={1} suffix={t('T', ' تن')} />
                    <span className="chart-panel__value-label">{t('MOVED', 'جابه‌جا شده')}</span>
                  </div>
                </div>
                <div className="chart-panel__aside">
                  <span className={`delta-chip delta-chip--large ${delta !== null && delta < 0 ? 'is-down' : ''}`}>
                    {delta === null ? (
                      t('BASELINE', 'مبنا')
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
                  <span className="chart-panel__delta-copy">
                    {t('VS MATCHED PRIOR', 'در مقایسه با بازهٔ قبل')}
                  </span>
                  <span className="chart-panel__peak">
                    {t(`PEAK / ${peakVolumeLabel}`, `اوج / ${peakVolumeLabel}`)}
                  </span>
                </div>
              </div>

              <div
                className="volume-chart"
                role="img"
                aria-label={t(
                  `Training volume for the ${activeRangeLabel.toLowerCase()}: ${totalVolumeLabel} across ${summary.sessionCount} sessions.`,
                  `حجم تمرین در ${activeRangeLabel}: ${totalVolumeLabel} در ${summary.sessionCount} جلسه.`,
                )}
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
                        x={nowTick}
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
                  <span className="legend-dot" aria-hidden="true" /> {t('VOLUME / KG', 'حجم / کیلوگرم')}
                </span>
                <span>
                  {summary.sessionCount} {t('SESSIONS', 'جلسه')}
                </span>
                <span>
                  {summary.totalSets} {t('SETS', 'ست')}
                </span>
              </div>
            </Reveal>

            <div className="quick-stats">
              <Reveal className="quick-stat">
                <span>{t('SESSION COUNT', 'تعداد جلسه')}</span>
                <CountUp value={summary.sessionCount} />
                <small>{activeRangeLabel}</small>
              </Reveal>
              <Reveal className="quick-stat" delay={0.06}>
                <span>{t('AVG DURATION', 'میانگین مدت')}</span>
                <CountUp
                  value={Math.round(summary.avgDurationSec / 60)}
                  suffix={t('M', '')}
                />
                <small>{t('PER SESSION', 'دقیقه در هر جلسه')}</small>
              </Reveal>
              <Reveal className="quick-stat" delay={0.12}>
                <span>{t('ALL-TIME HOURS', 'مجموع ساعت')}</span>
                <CountUp value={allTime.totalHours} decimals={1} />
                <small>
                  {allTime.totalSets} {t('SETS LOGGED', 'ست ثبت‌شده')}
                </small>
              </Reveal>
            </div>
          </section>

          <section className="page-section" aria-labelledby="consistency-heading">
            <div className="section-heading section-heading--row">
              <div>
                <p className="section-kicker">
                  <span className="section-kicker__index">01</span> {t('THE RHYTHM', 'ریتم')}
                </p>
                <h2 id="consistency-heading" className="section-title">
                  {t('CONSISTENCY ', 'ثبات ')}
                  <em>{t('compounds.', 'جمع می‌شود.')}</em>
                </h2>
              </div>
              <span className="section-heading__aside">
                {t(`WEEKLY TARGET / ${weekly.target}`, `هدف هفته / ${weekly.target}`)}
              </span>
            </div>

            <Reveal className="consistency-feature">
              <ResponsivePhoto
                sources={gymPicture()}
                alt={t(
                  'A quiet, industrial strength gym floor.',
                  'سالن تمرین خلوت و صنعتی با وزنه‌های آزاد.',
                )}
                className="consistency-feature__photo"
                imgClassName="consistency-feature__img"
                sizes="(min-width: 1024px) 1240px, 100vw"
                loading="lazy"
              />
              <span className="consistency-feature__scrim" aria-hidden="true" />
              <div className="consistency-feature__top">
                <span className="tag tag--lime">{t('CURRENT WEEK', 'هفتهٔ جاری')}</span>
                <span className="consistency-feature__streak">
                  {t(`${weekly.streakWeeks} WEEK STREAK`, `زنجیرهٔ ${weekly.streakWeeks} هفته`)}
                </span>
              </div>
              <div className="consistency-feature__content">
                <div className="consistency-feature__copy">
                  <p className="micro-label">{t('SHOW UP. ADD UP.', 'حاضر شو. جمع کن.')}</p>
                  <p className="consistency-feature__headline">
                    {weekly.activeDays}
                    <span>/7</span> {t('days of work', 'روز کار')}
                  </p>
                  <p className="consistency-feature__sub">
                    {t(
                      `${weekly.sessionsThisWeek} of ${weekly.target} target sessions logged. The repeat is the result.`,
                      `${weekly.sessionsThisWeek} از ${weekly.target} جلسهٔ هدف ثبت شده. تکرار، خودِ نتیجه است.`,
                    )}
                  </p>
                </div>
                <ProgressRing
                  value={Math.min(1, weekly.sessionsThisWeek / weekly.target)}
                  size={96}
                  strokeWidth={4}
                  ariaLabel={t(
                    `${weekly.sessionsThisWeek} of ${weekly.target} target sessions this week`,
                    `${weekly.sessionsThisWeek} از ${weekly.target} جلسهٔ هدف در این هفته`,
                  )}
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
                        {day.volumeKg > 0
                          ? `${Math.round(day.volumeKg / 100) / 10}${t('T', ' تن')}`
                          : '—'}
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
                  <span className="section-kicker__index">02</span> {t('PERSONAL RECORDS', 'رکوردهای شخصی')}
                </p>
                <h2 id="records-heading" className="section-title">
                  {t('BUILT ', 'فرق ')}
                  <em>{t('different.', 'می‌کند.')}</em>
                </h2>
              </div>
              <span className="section-heading__aside">{t('ALL-TIME / KG', 'مجموع / کیلوگرم')}</span>
            </div>

            <div className="records-grid">
              <Reveal className="record-feature">
                <ResponsivePhoto
                  sources={editorialPicture('deadlift')}
                  alt={t(
                    'Athlete preparing a heavy deadlift.',
                    'ورزشکاری در حال آماده شدن برای یک ددلیفت سنگین.',
                  )}
                  className="record-feature__photo"
                  imgClassName="record-feature__img"
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  loading="lazy"
                />
                <span className="record-feature__scrim" aria-hidden="true" />
                <div className="record-feature__content">
                  <span className="tag">{t('BIG THREE / PR', 'سه حرکت اصلی / رکورد')}</span>
                  <p className="record-feature__lift">{featuredRecord.label}</p>
                  <p className="record-feature__value">
                    <CountUp value={featuredRecord.weight} decimals={featuredRecord.weight % 1 === 0 ? 0 : 1} />
                    <span className="record-feature__unit">{t('KG', 'کیلوگرم')}</span>
                  </p>
                  <div className="record-feature__footer">
                    <span>{t('ALL-TIME BEST', 'بهترین رکورد')}</span>
                    <span>
                      {featuredRecord.progress > 0
                        ? t(
                            `+${formatWeight(featuredRecord.progress)} KG THIS DEMO`,
                            `+${formatWeight(featuredRecord.progress)} کیلوگرم در این دمو`,
                          )
                        : t('BASELINE RECORD', 'رکورد مبنا')}
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
                      <span className="record-card__unit">{t('KG', 'کیلوگرم')}</span>
                    </p>
                    <div className="record-card__foot">
                      <span>{t('ALL-TIME', 'مجموع')}</span>
                      <span>
                        {record.progress > 0
                          ? t(
                              `+${formatWeight(record.progress)} THIS DEMO`,
                              `+${formatWeight(record.progress)} در این دمو`,
                            )
                          : t('BASELINE', 'مبنا')}
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
                  <span className="section-kicker__index">03</span> {t('THE LOG', 'دفتر ثبت')}
                </p>
                <h2 id="activity-heading" className="section-title">
                  {t('RECENT ', 'کارهای ')}
                  <em>{t('work.', 'اخیر.')}</em>
                </h2>
              </div>
              <span className="section-heading__aside">
                {t(`${allTime.totalSessions} TOTAL`, `مجموع ${allTime.totalSessions}`)}
              </span>
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
                <p className="empty-state__title">{t('The log is empty.', 'دفتر ثبت خالی است.')}</p>
                <p>
                  {t(
                    'Finish a training session and it will show up here.',
                    'یک جلسهٔ تمرین را تمام کن تا همین‌جا ثبت شود.',
                  )}
                </p>
                <a href="#/workouts" className="btn btn--lime btn--compact">
                  {t('Enter the lab', 'شروع تمرین')}
                </a>
              </div>
            )}
            <p className="activity-footnote">
              <span className="status-dot" aria-hidden="true" />
              {t(
                'SAMPLE DATA + SESSIONS YOU FINISH IN THIS BROWSER.',
                'دادهٔ نمونه + جلسه‌هایی که در همین مرورگر تمام می‌کنی.',
              )}
            </p>
          </section>

          <div className="progress-signoff">
            <div>
              <ArrowDownRight size={18} strokeWidth={1.8} aria-hidden="true" />
              <p>{t('SHOW UP AGAIN.', 'باز هم حاضر شو.')}</p>
            </div>
            <a href="#/workouts" className="text-action">
              {t('BACK TO TRAINING', 'برگشت به تمرین')}
              <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
