import { useEffect, useState } from 'react'
import { ArrowUpRight, RotateCcw } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { demoProfile, photoCredits } from '../demo/data'
import { getAllTimeStats } from '../demo/selectors'
import { useDemoState } from '../demo/AppState'
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
      eyebrow="PRIVATE DEMO / LOCAL STATE"
      title="THE DEMO LAB"
      panelClassName="settings-sheet"
    >
      <div className="settings-intro">
        <p className="settings-lede">A front-end training experience. No account. No cloud. Just work.</p>
        <p className="settings-copy">
          Your completed sessions, active timer, logged sets and personal records live in this
          browser’s local storage. Closing the tab won’t erase a finished session.
        </p>
      </div>

      <div className="settings-athlete">
        <div className="settings-athlete__avatar" aria-hidden="true">
          {demoProfile.initials}
        </div>
        <div>
          <p className="micro-label text-muted">DEMO ATHLETE</p>
          <p className="settings-athlete__name">{demoProfile.fullName}</p>
          <p className="settings-athlete__meta">
            {demoProfile.goal} · {demoProfile.split} · {demoProfile.started}
          </p>
        </div>
      </div>

      <dl className="settings-stats">
        <div>
          <dt>Sessions</dt>
          <dd>{stats.totalSessions}</dd>
        </div>
        <div>
          <dt>Volume</dt>
          <dd>{formatVolumeKg(stats.totalVolumeKg, 1)}</dd>
        </div>
        <div>
          <dt>Sets</dt>
          <dd>{stats.totalSets}</dd>
        </div>
        <div>
          <dt>Hours</dt>
          <dd>{stats.totalHours.toFixed(1)}</dd>
        </div>
      </dl>

      <div className="settings-actions">
        {!confirming ? (
          <button type="button" className="text-action text-action--danger" onClick={() => setConfirming(true)}>
            <RotateCcw size={16} strokeWidth={2} aria-hidden="true" />
            Reset demo data
          </button>
        ) : (
          <div className="reset-confirm">
            <p>Reset every completed session and start the demo from its original state?</p>
            <div className="reset-confirm__buttons">
              <button type="button" className="btn btn--ghost btn--compact" onClick={() => setConfirming(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn--lime btn--compact" onClick={resetDemo}>
                Reset everything
              </button>
            </div>
          </div>
        )}
      </div>

      <details className="credits-disclosure">
        <summary>
          <span>
            Photography
            <span className="credits-disclosure__count">{photoCredits.length}</span>
          </span>
          <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
        </summary>
        <div className="credits-body">
          <p className="settings-copy">
            Fitness photography from{' '}
            <a href="https://unsplash.com" target="_blank" rel="noreferrer">
              Unsplash
            </a>
            , used under the{' '}
            <a href="https://unsplash.com/license" target="_blank" rel="noreferrer">
              Unsplash License
            </a>
            . Images have been locally cropped and optimized for this demo.
          </p>
          <ul className="credits-list">
            {photoCredits.map((credit) => (
              <li key={credit.id}>
                <span className="credits-list__label">{credit.label}</span>
                <a href={credit.photoUrl} target="_blank" rel="noreferrer">
                  {credit.author}
                </a>
              </li>
            ))}
          </ul>
          <p className="credits-fonts">
            Type: Anton, Manrope and Instrument Serif, self-hosted under the SIL Open Font License.
          </p>
          <p className="credits-fonts">REP//LAB is a fictional demo. All training data is sample data.</p>
        </div>
      </details>

      <div className="settings-signoff">
        <span>REP//LAB — BUILD BEYOND LIMITS.</span>
        <span>DEMO / {new Date().getFullYear()}</span>
      </div>
    </BottomSheet>
  )
}
