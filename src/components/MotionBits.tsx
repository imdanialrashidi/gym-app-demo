import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
}

export function Reveal({ children, className, delay = 0, y = 26, once = true }: RevealProps) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.16, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

interface CountUpProps {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
  locale?: string
}

export function CountUp({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 900,
  className,
  locale = 'en-US',
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.35 })
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(reduce ? value : 0)
  const currentRef = useRef(reduce ? value : 0)

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      currentRef.current = value
      setDisplay(value)
      return
    }

    const from = currentRef.current
    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = from + (value - from) * eased
      currentRef.current = next
      setDisplay(next)
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        currentRef.current = value
        setDisplay(value)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [duration, inView, reduce, value])

  const finalLabel = `${prefix}${formatter.format(value)}${suffix}`

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      <span aria-hidden="true">
        {prefix}
        {formatter.format(display)}
        {suffix}
      </span>
      <span className="sr-only">{finalLabel}</span>
    </span>
  )
}

interface ProgressRingProps {
  value: number
  size?: number
  strokeWidth?: number
  children?: ReactNode
  className?: string
  ariaLabel?: string
}

export function ProgressRing({
  value,
  size = 96,
  strokeWidth = 3,
  children,
  className = '',
  ariaLabel,
}: ProgressRingProps) {
  const reduce = useReducedMotion()
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0))

  return (
    <div
      className={`progress-ring ${className}`}
      style={{ width: size, height: size } as CSSProperties}
      role="img"
      aria-label={ariaLabel ?? `${Math.round(clamped * 100)} percent`}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className="progress-ring__track" cx="50" cy="50" r="45" strokeWidth={strokeWidth} />
        <motion.circle
          className="progress-ring__value"
          cx="50"
          cy="50"
          r="45"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: clamped }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
        />
      </svg>
      {children ? <div className="progress-ring__content">{children}</div> : null}
    </div>
  )
}

interface SparklineProps {
  values: number[]
  labels?: string[]
  height?: number
  ariaLabel: string
  className?: string
}

function smoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
  let path = `M ${points[0].x} ${points[0].y}`
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index]
    const next = points[index + 1]
    const midX = (current.x + next.x) / 2
    path += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`
  }
  return path
}

export function Sparkline({
  values,
  labels,
  height = 78,
  ariaLabel,
  className = '',
}: SparklineProps) {
  const reduce = useReducedMotion()
  const gradientId = useId().replace(/:/g, '')
  const width = 320
  const padX = 4
  const padTop = 8
  const padBottom = 10
  const max = Math.max(...values, 1)
  const points = values.map((value, index) => ({
    x: padX + (index / Math.max(1, values.length - 1)) * (width - padX * 2),
    y: padTop + (1 - value / max) * (height - padTop - padBottom),
  }))
  const line = smoothPath(points)
  const area = `${line} L ${points[points.length - 1]?.x ?? width} ${height - padBottom} L ${
    points[0]?.x ?? 0
  } ${height - padBottom} Z`

  return (
    <div className={`sparkline ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          <linearGradient id={`spark-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--lime)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--lime)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={area}
          fill={`url(#spark-${gradientId})`}
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.35 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke="var(--lime)"
          strokeWidth="1.6"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        {points.map((point, index) =>
          values[index] > 0 ? (
            <motion.circle
              key={`${point.x}-${index}`}
              cx={point.x}
              cy={point.y}
              r="2.4"
              fill="var(--lime)"
              initial={reduce ? false : { opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 + index * 0.06, duration: 0.3 }}
            />
          ) : null,
        )}
      </svg>
      {labels ? (
        <div className="sparkline__labels" aria-hidden="true">
          {labels.map((label, index) => (
            <span key={`${label}-${index}`} className={values[index] > 0 ? 'is-active' : ''}>
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
