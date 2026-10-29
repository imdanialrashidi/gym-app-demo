import { useEffect, useState } from 'react'
import { ArrowUpRight, RotateCcw } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { demoProfile, photoCredits } from '../demo/data'
import { creditLabelFa, profileFa } from '../demo/fa'
import { getAllTimeStats } from '../demo/selectors'
import { useDemoState } from '../demo/AppState'
import { useI18n } from '../lib/i18n'
import { navigate } from '../lib/router'
import { formatVolumeKg } from '../lib/time'

interface SettingsSheetProps {
  open: boolean
  onClose: () => void
}

export function SettingsSheet({ open, onClose }: SettingsSheetProps) {
  const { state, dispatch } = useDemoState()
  const [confirming, setConfirming] = useState(false)
  const stats = getAllTimeStats(state)
  const { lang, t, setLang } = useI18n()

  useEffect(() => {
    if (!open) setConfirming(false)
  }, [open])

  const resetDemo = () => {
    dispatch({ type: 'RESET_DEMO', now: Date.now() })
    setConfirming(false)
    onClose()
    navigate('/')
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      eyebrow={t('PRIVATE DEMO / LOCAL STATE', 'دموی خصوصی / دادهٔ محلی')}
      title={t('THE DEMO LAB', 'سالن دمو')}
      panelClassName="settings-sheet"
    >
      <div className="settings-intro">
        <p className="settings-lede">
          {t(
            'A front-end training experience. No account. No cloud. Just work.',
            'یک تجربهٔ تمرین تمام‌فرانت‌اند. بدون حساب، بدون ابر. فقط کار.',
          )}
        </p>
        <p className="settings-copy">
          {t(
            'Your completed sessions, active timer, logged sets and personal records live in this browser’s local storage. Closing the tab won’t erase a finished session.',
            'جلسه‌های پایانیافته، تایمر فعال، ست‌های ثبت‌شده و رکوردهای شخصی‌ات در حافظهٔ محلی همین مرورگر می‌مانند. بستن تب، جلسهٔ تمام‌شده را پاک نمی‌کند.',
          )}
        </p>
      </div>

      <div className="settings-lang">
        <p className="micro-label text-muted">{t('LANGUAGE', 'زبان')}</p>
        <div className="lang-switch" role="group" aria-label={t('Choose language', 'انتخاب زبان')}>
          <button type="button" aria-pressed={lang === 'fa'} onClick={() => setLang('fa')} lang="fa">
            فارسی
          </button>
          <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')} lang="en">
            English
          </button>
        </div>
      </div>

      <div className="settings-athlete">
        <div className="settings-athlete__avatar" aria-hidden="true">
          {demoProfile.initials}
        </div>
        <div>
          <p className="micro-label text-muted">{t('DEMO ATHLETE', 'ورزشکار دمو')}</p>
          <p className="settings-athlete__name">
            {t(demoProfile.fullName, profileFa.fullName)}
          </p>
          <p className="settings-athlete__meta">
            {t(demoProfile.goal, profileFa.goal)} · {t(demoProfile.split, profileFa.split)} ·{' '}
            {t(demoProfile.started, profileFa.started)}
          </p>
        </div>
      </div>

      <dl className="settings-stats">
        <div>
          <dt>{t('Sessions', 'جلسه‌ها')}</dt>
          <dd>{stats.totalSessions}</dd>
        </div>
        <div>
          <dt>{t('Volume', 'حجم')}</dt>
          <dd>{formatVolumeKg(stats.totalVolumeKg, 1, lang)}</dd>
        </div>
        <div>
          <dt>{t('Sets', 'ست')}</dt>
          <dd>{stats.totalSets}</dd>
        </div>
        <div>
          <dt>{t('Hours', 'ساعت')}</dt>
          <dd>{stats.totalHours.toFixed(1)}</dd>
        </div>
      </dl>

      <div className="settings-actions">
        {!confirming ? (
          <button
            type="button"
            className="text-action text-action--danger"
            onClick={() => setConfirming(true)}
          >
            <RotateCcw size={16} strokeWidth={2} aria-hidden="true" />
            {t('Reset demo data', 'بازنشانی دادهٔ دمو')}
          </button>
        ) : (
          <div className="reset-confirm">
            <p>
              {t(
                'Reset every completed session and start the demo from its original state?',
                'همهٔ جلسه‌های تمام‌شده پاک شوند و دمو به حالت اولیه برگردد؟',
              )}
            </p>
            <div className="reset-confirm__buttons">
              <button
                type="button"
                className="btn btn--ghost btn--compact"
                onClick={() => setConfirming(false)}
              >
                {t('Cancel', 'انصراف')}
              </button>
              <button type="button" className="btn btn--lime btn--compact" onClick={resetDemo}>
                {t('Reset everything', 'همه را بازنشانی کن')}
              </button>
            </div>
          </div>
        )}
      </div>

      <details className="credits-disclosure">
        <summary>
          <span>
            {t('Photography', 'عکاسی')}
            <span className="credits-disclosure__count">{photoCredits.length}</span>
          </span>
          <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
        </summary>
        <div className="credits-body">
          <p className="settings-copy">
            {t('Fitness photography from ', 'تصاویر ورزشی از ')}
            <a href="https://unsplash.com" target="_blank" rel="noreferrer">
              Unsplash
            </a>
            {t(', used under the ', '، تحت ')}
            <a href="https://unsplash.com/license" target="_blank" rel="noreferrer">
              {t('Unsplash License', 'مجوز Unsplash')}
            </a>
            {t(
              '. Images have been locally cropped and optimized for this demo.',
              '. تصاویر برای این دمو به‌صورت محلی برش خورده و بهینه شده‌اند.',
            )}
          </p>
          <ul className="credits-list">
            {photoCredits.map((credit) => (
              <li key={credit.id}>
                <span className="credits-list__label">
                  {t(credit.label, creditLabelFa[credit.id] ?? credit.label)}
                </span>
                <a href={credit.photoUrl} target="_blank" rel="noreferrer">
                  {credit.author}
                </a>
              </li>
            ))}
          </ul>
          <p className="credits-fonts">
            {t(
              'Type: Anton, Manrope, Instrument Serif and Vazirmatn, self-hosted under the SIL Open Font License.',
              'فونت‌ها: Anton، Manrope، Instrument Serif و وزیرمتن، میزبانی‌شده به‌صورت محلی تحت مجوز SIL Open Font License.',
            )}
          </p>
          <p className="credits-fonts">
            {t(
              'Amir’s Gym is a fictional demo. All training data is sample data.',
              'باشگاه امیر یک دموی خیالی است. همهٔ داده‌های تمرینی نمونه‌اند.',
            )}
          </p>
        </div>
      </details>

      <div className="settings-signoff">
        <span>{t('AMIR’S GYM — BUILD BEYOND LIMITS.', 'باشگاه امیر — فراتر از حدها بساز.')}</span>
        <span>{t('DEMO', 'دمو')} / {new Date().getFullYear()}</span>
      </div>
    </BottomSheet>
  )
}
