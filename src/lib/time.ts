import type { Lang } from './i18n'

export const DAY_MS = 86_400_000

const LOCALES: Record<Lang, string> = { en: 'en-GB', fa: 'fa-IR-u-nu-latn' }

const formatterCache = new Map<string, Intl.DateTimeFormat>()

function dateFormatter(lang: Lang, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${lang}|${JSON.stringify(options)}`
  let formatter = formatterCache.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(LOCALES[lang], options)
    formatterCache.set(key, formatter)
  }
  return formatter
}

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

export function formatMinutes(totalSeconds: number, lang: Lang = 'en'): string {
  const safe = Math.max(0, Math.floor(totalSeconds))
  if (safe < 60) return lang === 'fa' ? 'کمتر از ۱ دقیقه' : '<1 min'
  return lang === 'fa' ? `${Math.round(safe / 60)} دقیقه` : `${Math.round(safe / 60)} min`
}

export function formatVolumeKg(value: number, decimals = 0, lang: Lang = 'en'): string {
  if (!Number.isFinite(value)) return '0'
  if (value >= 1000) {
    const tonnes = value / 1000
    return `${tonnes.toFixed(decimals > 0 ? decimals : 1)}${lang === 'fa' ? ' تن' : 'T'}`
  }
  return `${Math.round(value).toLocaleString('en-US')} ${lang === 'fa' ? 'کیلوگرم' : 'KG'}`
}

export function formatWeight(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function formatShortDate(timestamp: number, lang: Lang = 'en'): string {
  return dateFormatter(lang, { day: '2-digit', month: 'short' }).format(timestamp).toUpperCase()
}

export function formatWeekdayShort(timestamp: number, lang: Lang = 'en'): string {
  return dateFormatter(lang, { weekday: 'short' }).format(timestamp).toUpperCase()
}

export function formatWeekdayNarrow(timestamp: number, lang: Lang = 'en'): string {
  return dateFormatter(lang, { weekday: 'narrow' }).format(timestamp).toUpperCase()
}

export function formatFullDate(timestamp: number, lang: Lang = 'en'): string {
  return dateFormatter(lang, { weekday: 'short', day: '2-digit', month: 'short' })
    .format(timestamp)
    .toUpperCase()
    .replace(',', ' /')
}

export function formatHeroDate(timestamp: number, lang: Lang = 'en'): string {
  return formatFullDate(timestamp, lang)
}

export function relativeSessionDay(timestamp: number, now = Date.now(), lang: Lang = 'en'): string {
  if (isSameDay(timestamp, now)) return lang === 'fa' ? 'امروز' : 'TODAY'
  if (isSameDay(timestamp, addCalendarDays(now, -1))) return lang === 'fa' ? 'دیروز' : 'YESTERDAY'
  return formatShortDate(timestamp, lang)
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return 'MORNING'
  if (hour < 18) return 'AFTERNOON'
  return 'EVENING'
}

export function weekdayLabelsMonday(lang: Lang = 'en'): string[] {
  const monday = startOfWeek(Date.now())
  return Array.from({ length: 7 }, (_, index) =>
    formatWeekdayNarrow(addCalendarDays(monday, index), lang),
  )
}

const relativeTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export function formatRelativeDateTime(
  isoDate: string,
  now = Date.now(),
  lang: Lang = 'en',
): string {
  const timestamp = Date.parse(isoDate)
  if (!Number.isFinite(timestamp)) return lang === 'fa' ? 'تاریخ نامشخص' : 'UNKNOWN DATE'
  const time = relativeTimeFormatter.format(timestamp)
  const today = lang === 'fa' ? 'امروز' : 'TODAY'
  const yesterday = lang === 'fa' ? 'دیروز' : 'YESTERDAY'
  if (isSameDay(timestamp, now)) return `${today} / ${time}`
  if (isSameDay(timestamp, addCalendarDays(now, -1))) return `${yesterday} / ${time}`
  return `${formatWeekdayShort(timestamp, lang)} ${formatShortDate(timestamp, lang)} / ${time}`
}
