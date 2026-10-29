import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type Lang = 'fa' | 'en'
export type Dir = 'rtl' | 'ltr'

const LANG_KEY = 'amirs-gym-lang-v1'

interface I18nValue {
  lang: Lang
  dir: Dir
  isFa: boolean
  setLang: (lang: Lang) => void
  toggleLang: () => void
  /** English copy is the source string; Persian is the translation. */
  t: (en: string, fa: string) => string
  /** Same as `t`, for non-string values such as tuples. */
  pick: <T>(en: T, fa: T) => T
}

const I18nContext = createContext<I18nValue | null>(null)

function readStoredLang(): Lang {
  try {
    return window.localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'fa'
  } catch {
    return 'fa'
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readStoredLang)
  const dir: Dir = lang === 'fa' ? 'rtl' : 'ltr'

  useEffect(() => {
    const root = document.documentElement
    root.lang = lang
    root.dir = dir
    try {
      window.localStorage.setItem(LANG_KEY, lang)
    } catch {
      // Storage can be blocked; the choice still holds for this tab.
    }
  }, [lang, dir])

  const toggleLang = useCallback(() => {
    setLang((current) => (current === 'fa' ? 'en' : 'fa'))
  }, [])

  const t = useCallback((en: string, fa: string) => (lang === 'fa' ? fa : en), [lang])
  const pick = useCallback(<T,>(en: T, fa: T) => (lang === 'fa' ? fa : en), [lang])

  const value = useMemo<I18nValue>(
    () => ({ lang, dir, isFa: lang === 'fa', setLang, toggleLang, t, pick }),
    [lang, dir, toggleLang, t, pick],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used inside I18nProvider')
  return value
}

export { LANG_KEY }
