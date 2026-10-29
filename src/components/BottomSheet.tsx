import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  eyebrow?: string
  children: ReactNode
  panelClassName?: string
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'

export function BottomSheet({
  open,
  onClose,
  title,
  eyebrow,
  children,
  panelClassName = '',
}: BottomSheetProps) {
  const reduce = useReducedMotion()
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const previousActive = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const body = document.body
    const originalOverflow = body.style.overflow
    body.style.overflow = 'hidden'

    const focusTimer = window.setTimeout(() => {
      closeRef.current?.focus()
    }, 30)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => {
          if (element.getAttribute('aria-hidden') === 'true') return false
          if (element.closest('details:not([open])') && !element.closest('summary')) return false
          const style = window.getComputedStyle(element)
          return (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            element.getClientRects().length > 0
          )
        },
      )
      if (focusable.length === 0) {
        event.preventDefault()
        panelRef.current.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const currentIndex = focusable.indexOf(document.activeElement as HTMLElement)
      if (event.shiftKey && currentIndex <= 0) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (currentIndex === -1 || currentIndex === focusable.length - 1)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
      body.style.overflow = originalOverflow
      previousActive?.focus()
    }
  }, [open])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="sheet-root">
          <motion.div
            className="sheet-backdrop"
            aria-hidden="true"
            onClick={onClose}
            initial={reduce ? { opacity: 0 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          />
          <div className="sheet-positioner">
            <motion.div
              ref={panelRef}
              className={`sheet-panel ${panelClassName}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              initial={reduce ? { opacity: 0 } : { y: '100%', opacity: 0.6 }}
              animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { y: '100%', opacity: 0.65 }}
              transition={
                reduce
                  ? { duration: 0.15 }
                  : { type: 'spring', damping: 34, stiffness: 360, mass: 0.8 }
              }
            >
              <div className="sheet-handle" aria-hidden="true" />
              <header className="sheet-header">
                <div>
                  {eyebrow ? <p className="micro-label text-lime">{eyebrow}</p> : null}
                  <h2 id={titleId} className="sheet-title">
                    {title}
                  </h2>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  className="icon-button"
                  onClick={onClose}
                  aria-label="Close panel"
                >
                  <X size={18} strokeWidth={2} aria-hidden="true" />
                </button>
              </header>
              <div className="sheet-content">{children}</div>
            </motion.div>
          </div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
