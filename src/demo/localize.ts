import { useMemo } from 'react'
import { exerciseLibrary, programs } from './data'
import { exerciseFa, muscleFa, programFa } from './fa'
import { useI18n } from '../lib/i18n'
import type { Lang } from '../lib/i18n'
import type { Exercise, MuscleFilter, Program, ProgramExercise } from './data'

export function localizeMuscle(muscle: string, lang: Lang): string {
  return lang === 'fa' ? (muscleFa[muscle as MuscleFilter] ?? muscle) : muscle
}

export function localizeExercise<T extends Exercise>(exercise: T, lang: Lang): T {
  if (lang !== 'fa') return exercise
  const copy = exerciseFa[exercise.id]
  return copy ? { ...exercise, ...copy } : exercise
}

export function localizeProgram(program: Program, lang: Lang): Program {
  if (lang !== 'fa') return program
  const copy = programFa[program.id]
  if (!copy) return program
  return {
    ...program,
    ...copy,
    exercises: program.exercises.map((exercise) => localizeExercise(exercise, lang)),
  }
}

export function localizeRecord<T extends { exerciseId: string; label: string }>(
  record: T,
  lang: Lang,
): T {
  if (lang !== 'fa') return record
  const copy = exerciseFa[record.exerciseId]
  return copy ? { ...record, label: copy.name } : record
}

/** Programs with Persian copy applied for the active language. */
export function usePrograms(): Program[] {
  const { lang } = useI18n()
  return useMemo(() => programs.map((program) => localizeProgram(program, lang)), [lang])
}

/** Flat exercise index with Persian copy applied for the active language. */
export function useExerciseLibrary(): ProgramExercise[] {
  const { lang } = useI18n()
  return useMemo(
    () => exerciseLibrary.map((exercise) => localizeExercise(exercise, lang)),
    [lang],
  )
}
