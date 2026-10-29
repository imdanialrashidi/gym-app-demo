import { ArrowUpRight } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { ResponsivePhoto } from './ResponsivePhoto'
import { exercisePicture } from '../lib/media'
import { useDemoState, useStartTraining } from '../demo/AppState'
import type { Program, ProgramExercise } from '../demo/data'
import { useI18n } from '../lib/i18n'
import { formatWeight } from '../lib/time'

interface ExerciseSheetProps {
  exercise: ProgramExercise | null
  program: Program | null
  open: boolean
  onClose: () => void
}

export function ExerciseSheet({ exercise, program, open, onClose }: ExerciseSheetProps) {
  const { state } = useDemoState()
  const startTraining = useStartTraining()
  const { t } = useI18n()
  if (!exercise || !program) return null

  const best = state.records[exercise.id]

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      eyebrow={`${program.label} / ${t('EXERCISE INDEX', 'فهرست حرکات')}`}
      title={exercise.name}
      panelClassName="exercise-sheet"
    >
      <div className="exercise-sheet__photo">
        <ResponsivePhoto
          sources={exercisePicture(exercise.image)}
          alt={`${exercise.name} ${t('training reference', 'مرجع تمرین')}`}
          sizes="(min-width: 768px) 560px, 100vw"
          imgClassName="exercise-sheet__image"
          loading="lazy"
        />
        <div className="exercise-sheet__photo-scrim" aria-hidden="true" />
        <div className="exercise-sheet__photo-meta">
          <span>{exercise.muscle}</span>
          <span>{exercise.equipment}</span>
        </div>
      </div>

      <div className="exercise-sheet__body">
        <p className="exercise-sheet__blurb">{exercise.blurb}</p>

        <dl className="exercise-sheet__stats">
          <div>
            <dt>{t('Working sets', 'ست‌های کاری')}</dt>
            <dd>{exercise.sets}</dd>
          </div>
          <div>
            <dt>{t('Target reps', 'تکرار هدف')}</dt>
            <dd>{exercise.reps}</dd>
          </div>
          <div>
            <dt>{t('Demo load', 'وزنهٔ نمونه')}</dt>
            <dd>
              {formatWeight(exercise.weight)} {t('kg', 'کیلوگرم')}
            </dd>
          </div>
          <div>
            <dt>{t('Rest', 'استراحت')}</dt>
            <dd>{t(`${exercise.rest}s`, `${exercise.rest} ثانیه`)}</dd>
          </div>
        </dl>

        <div className="exercise-sheet__cues">
          <p className="micro-label text-muted">{t('COACHING CUES', 'نکات فرم')}</p>
          <ol>
            {exercise.cues.map((cue, index) => (
              <li key={cue}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{cue}</p>
              </li>
            ))}
          </ol>
        </div>

        {best ? (
          <div className="exercise-sheet__record">
            <span>{t('ALL-TIME BEST SET', 'بهترین ست تا امروز')}</span>
            <strong>
              {formatWeight(best)} {t('KG', 'کیلوگرم')}
            </strong>
          </div>
        ) : null}

        <button
          type="button"
          className="btn btn--lime btn--block"
          onClick={() => {
            onClose()
            startTraining(program.id)
          }}
        >
          {state.active
            ? t('Resume live session', 'ادامهٔ جلسهٔ زنده')
            : t(`Start ${program.label} protocol`, `شروع برنامهٔ ${program.label}`)}
          <ArrowUpRight size={17} strokeWidth={2.2} aria-hidden="true" />
        </button>
        <p className="exercise-sheet__fineprint">
          {t(
            'Demo programming only. Adjust load and range to your body and experience.',
            'این برنامه فقط برای دمو است. بار و دامنهٔ حرکت را با بدن و تجربهٔ خودت تنظیم کن.',
          )}
        </p>
      </div>
    </BottomSheet>
  )
}
