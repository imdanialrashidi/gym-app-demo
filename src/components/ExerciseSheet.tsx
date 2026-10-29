import { ArrowUpRight } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { ResponsivePhoto } from './ResponsivePhoto'
import { exercisePicture } from '../lib/media'
import { useDemoState, useStartTraining } from '../demo/AppState'
import type { Program, ProgramExercise } from '../demo/data'
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
  if (!exercise || !program) return null

  const best = state.records[exercise.id]

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      eyebrow={`${program.label} / EXERCISE INDEX`}
      title={exercise.name}
      panelClassName="exercise-sheet"
    >
      <div className="exercise-sheet__photo">
        <ResponsivePhoto
          sources={exercisePicture(exercise.image)}
          alt={`${exercise.name} training reference`}
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
            <dt>Working sets</dt>
            <dd>{exercise.sets}</dd>
          </div>
          <div>
            <dt>Target reps</dt>
            <dd>{exercise.reps}</dd>
          </div>
          <div>
            <dt>Demo load</dt>
            <dd>{formatWeight(exercise.weight)} kg</dd>
          </div>
          <div>
            <dt>Rest</dt>
            <dd>{exercise.rest}s</dd>
          </div>
        </dl>

        <div className="exercise-sheet__cues">
          <p className="micro-label text-muted">COACHING CUES</p>
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
            <span>ALL-TIME BEST SET</span>
            <strong>{formatWeight(best)} KG</strong>
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
          {state.active ? 'Resume live session' : `Start ${program.label} protocol`}
          <ArrowUpRight size={17} strokeWidth={2.2} aria-hidden="true" />
        </button>
        <p className="exercise-sheet__fineprint">
          Demo programming only. Adjust load and range to your body and experience.
        </p>
      </div>
    </BottomSheet>
  )
}
