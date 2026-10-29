export const DAY_MS = 86_400_000

export function startOfDay(timestamp: number): number {
  const date = new Date(timestamp)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export function addCalendarDays(timestamp: number, days: number): number {
  const date = new Date(timestamp)
  date.setDate(date.getDate() + days)
  return date.getTime()
}

/** Monday-first week start in the visitor's local time. */
export function startOfWeek(timestamp: number): number {
  const date = new Date(timestamp)
  date.setHours(0, 0, 0, 0)
  const daysSinceMonday = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - daysSinceMonday)
  return date.getTime()
}

export function isSameDay(a: number, b: number): boolean {
  const first = new Date(a)
  const second = new Date(b)
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  )
}

export function isSameWeek(a: number, b: number): boolean {
  return startOfWeek(a) === startOfWeek(b)
}

export function formatTimer(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function formatMinutes(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds))
  if (safe < 60) return '<1 min'
  return `${Math.round(safe / 60)} min`
}

export function formatVolumeKg(value: number, decimals = 0): string {
  if (!Number.isFinite(value)) return '0'
  if (value >= 1000) {
    const tonnes = value / 1000
    return `${tonnes.toFixed(decimals > 0 ? decimals : 1)}T`
  }
  return `${Math.round(value).toLocaleString('en-US')} KG`
}

export function formatWeight(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

const shortDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
})

const weekdayShortFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
})

const weekdayNarrowFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'narrow',
})

const fullDateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
})

export function formatShortDate(timestamp: number): string {
  return shortDateFormatter.format(timestamp).toUpperCase()
}

export function formatWeekdayShort(timestamp: number): string {
  return weekdayShortFormatter.format(timestamp).toUpperCase()
}

export function formatWeekdayNarrow(timestamp: number): string {
  return weekdayNarrowFormatter.format(timestamp).toUpperCase()
}

export function formatFullDate(timestamp: number): string {
  return fullDateFormatter.format(timestamp).toUpperCase().replace(',', ' /')
}

export function formatHeroDate(timestamp: number): string {
  return formatFullDate(timestamp)
}

export function relativeSessionDay(timestamp: number, now = Date.now()): string {
  if (isSameDay(timestamp, now)) return 'TODAY'
  if (isSameDay(timestamp, addCalendarDays(now, -1))) return 'YESTERDAY'
  return formatShortDate(timestamp)
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return 'MORNING'
  if (hour < 18) return 'AFTERNOON'
  return 'EVENING'
}

export function weekdayLabelsMonday(): string[] {
  const monday = startOfWeek(Date.now())
  return Array.from({ length: 7 }, (_, index) => formatWeekdayNarrow(addCalendarDays(monday, index)))
}

const relativeTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export function formatRelativeDateTime(isoDate: string, now = Date.now()): string {
  const timestamp = Date.parse(isoDate)
  if (!Number.isFinite(timestamp)) return 'UNKNOWN DATE'
  const time = relativeTimeFormatter.format(timestamp)
  if (isSameDay(timestamp, now)) return `TODAY / ${time}`
  if (isSameDay(timestamp, addCalendarDays(now, -1))) return `YESTERDAY / ${time}`
  return `${formatWeekdayShort(timestamp)} ${formatShortDate(timestamp)} / ${time}`
}
