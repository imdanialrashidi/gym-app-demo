export type ProgramId = 'push' | 'pull' | 'legs'

export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms'

export type ImageKey =
  | 'bench'
  | 'incline'
  | 'cable'
  | 'shoulder'
  | 'pushdown'
  | 'deadlift'
  | 'pullup'
  | 'row'
  | 'facepull'
  | 'curl'
  | 'squat'
  | 'rdl'
  | 'legpress'
  | 'lunge'
  | 'calf'

export interface Exercise {
  id: string
  name: string
  shortName: string
  muscle: MuscleGroup
  equipment: string
  blurb: string
  cues: [string, string, string]
  image: ImageKey
}

export interface ProgramExercise extends Exercise {
  sets: number
  reps: number
  weight: number
  rest: number
}

export interface Program {
  id: ProgramId
  number: string
  label: string
  headline: [string, string]
  kicker: string
  description: string
  intensity: 'HIGH' | 'MAX' | 'BUILD'
  durationMin: number
  image: 'push' | 'pull' | 'legs'
  exercises: ProgramExercise[]
}

export const muscleGroups = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms'] as const
export type MuscleFilter = (typeof muscleGroups)[number]

export const programs: Program[] = [
  {
    id: 'push',
    number: '01',
    label: 'PUSH',
    headline: ['PRESS', 'HEAVY.'],
    kicker: 'CHEST · DELTS · TRICEPS',
    description:
      'A dense pressing block built on clean reps and long eccentrics. One honest top set, then earn every inch of the pump.',
    intensity: 'HIGH',
    durationMin: 52,
    image: 'push',
    exercises: [
      {
        id: 'bench-press',
        name: 'Barbell Bench Press',
        shortName: 'Bench Press',
        muscle: 'Chest',
        equipment: 'Barbell',
        blurb: 'The benchmark lift. Build tension from the floor up, then move the bar like you mean it.',
        cues: [
          'Plant both feet and pull your shoulder blades down into the bench.',
          'Touch the sternum, not the throat. Keep the wrists stacked over the elbows.',
          'Leave two reps in the tank. Clean reps compound.',
        ],
        image: 'bench',
        sets: 4,
        reps: 8,
        weight: 82.5,
        rest: 150,
      },
      {
        id: 'incline-db-press',
        name: 'Incline Dumbbell Press',
        shortName: 'Incline Press',
        muscle: 'Chest',
        equipment: 'Dumbbells',
        blurb: 'Load the upper chest without hiding behind a bar. Slow down and own the stretch.',
        cues: [
          'Set the bench to 30°. Higher turns this into a shoulder press.',
          'Let the dumbbells descend until you feel the chest stretch.',
          'Press slightly inward without clanging the weights together.',
        ],
        image: 'incline',
        sets: 3,
        reps: 10,
        weight: 30,
        rest: 90,
      },
      {
        id: 'cable-fly',
        name: 'Low-to-High Cable Fly',
        shortName: 'Cable Fly',
        muscle: 'Chest',
        equipment: 'Cable',
        blurb: 'A controlled squeeze for the upper chest. Leave the momentum at the stack.',
        cues: [
          'Start at hip height with a soft bend in the elbows.',
          'Bring the handles together at collarbone height.',
          'Hold the peak for one full breath before returning.',
        ],
        image: 'cable',
        sets: 3,
        reps: 12,
        weight: 17.5,
        rest: 75,
      },
      {
        id: 'db-shoulder-press',
        name: 'Seated Dumbbell Shoulder Press',
        shortName: 'Shoulder Press',
        muscle: 'Shoulders',
        equipment: 'Dumbbells',
        blurb: 'A strict vertical press for fuller delts. Ribs down, head through at the top.',
        cues: [
          'Set the backrest just past upright and brace hard.',
          'Stop the elbows just below shoulder height.',
          'Drive the bells up and slightly together at the top.',
        ],
        image: 'shoulder',
        sets: 3,
        reps: 10,
        weight: 22.5,
        rest: 90,
      },
      {
        id: 'cable-pushdown',
        name: 'Cable Triceps Pushdown',
        shortName: 'Pushdown',
        muscle: 'Arms',
        equipment: 'Cable',
        blurb: 'Finish the arms with a hard contraction. Elbows stay pinned; hands do the work.',
        cues: [
          'Pin the elbows at your sides before the first rep.',
          'Extend fully, then pause for a beat.',
          'Control the return until the forearms pass 90°.',
        ],
        image: 'pushdown',
        sets: 3,
        reps: 12,
        weight: 32.5,
        rest: 60,
      },
    ],
  },
  {
    id: 'pull',
    number: '02',
    label: 'PULL',
    headline: ['PULL', 'DEEP.'],
    kicker: 'BACK · REAR DELTS · BICEPS',
    description:
      'Heavy hinge work, vertical pulls, and controlled rows. Build a back that looks as strong as it pulls.',
    intensity: 'MAX',
    durationMin: 57,
    image: 'pull',
    exercises: [
      {
        id: 'conventional-deadlift',
        name: 'Conventional Deadlift',
        shortName: 'Deadlift',
        muscle: 'Back',
        equipment: 'Barbell',
        blurb: 'The whole-body hinge. Every rep starts from a braced, deliberate setup.',
        cues: [
          'Bar over mid-foot. Shins close, lats locked, spine long.',
          'Push the floor away instead of yanking the bar.',
          'Lock the hips and knees together, then lower with control.',
        ],
        image: 'deadlift',
        sets: 4,
        reps: 5,
        weight: 162.5,
        rest: 180,
      },
      {
        id: 'weighted-pull-up',
        name: 'Weighted Pull-Up',
        shortName: 'Pull-Up',
        muscle: 'Back',
        equipment: 'Bodyweight + belt',
        blurb: 'Strict reps, full range. The back sets the tempo and the biceps finish the story.',
        cues: [
          'Start from a dead hang with the ribs stacked over the pelvis.',
          'Drive the elbows toward your back pockets.',
          'Chin clears the bar without inviting the neck to help.',
        ],
        image: 'pullup',
        sets: 4,
        reps: 6,
        weight: 10,
        rest: 120,
      },
      {
        id: 'barbell-row',
        name: 'Barbell Row',
        shortName: 'Barbell Row',
        muscle: 'Back',
        equipment: 'Barbell',
        blurb: 'Build the mid-back with a torso that stays honest and a bar that meets you.',
        cues: [
          'Hinge to roughly 45° and brace in a neutral spine.',
          'Pull the bar toward the lower ribs, not the sternum.',
          'Pause at the top. No body English.',
        ],
        image: 'row',
        sets: 3,
        reps: 8,
        weight: 77.5,
        rest: 120,
      },
      {
        id: 'face-pull',
        name: 'Cable Face Pull',
        shortName: 'Face Pull',
        muscle: 'Shoulders',
        equipment: 'Cable',
        blurb: 'Small movement, big return. Own it for healthier shoulders and a thicker upper back.',
        cues: [
          'Set the pulley above eye level with a rope attachment.',
          'Pull the rope apart toward your forehead.',
          'Finish with the thumbs back and elbows high.',
        ],
        image: 'facepull',
        sets: 3,
        reps: 15,
        weight: 25,
        rest: 60,
      },
      {
        id: 'hammer-curl',
        name: 'Hammer Curl',
        shortName: 'Hammer Curl',
        muscle: 'Arms',
        equipment: 'Dumbbells',
        blurb: 'Neutral-grip curls for brachialis thickness and a stronger-looking arm from every angle.',
        cues: [
          'Keep the elbows close and the wrists straight.',
          'Curl without rocking the torso.',
          'Lower until the arm is straight; don’t cut the range.',
        ],
        image: 'curl',
        sets: 3,
        reps: 12,
        weight: 18,
        rest: 60,
      },
    ],
  },
  {
    id: 'legs',
    number: '03',
    label: 'LEGS',
    headline: ['BUILD', 'THE BASE.'],
    kicker: 'QUADS · HAMSTRINGS · GLUTES · CALVES',
    description:
      'Squat, hinge, press, repeat. A high-output lower session with a simple rule: no sloppy reps.',
    intensity: 'BUILD',
    durationMin: 61,
    image: 'legs',
    exercises: [
      {
        id: 'back-squat',
        name: 'Back Squat',
        shortName: 'Back Squat',
        muscle: 'Legs',
        equipment: 'Barbell',
        blurb: 'The foundation. Brace, sit between the hips, and stand up with intent.',
        cues: [
          'Brace as if bracing for a punch. Keep the bar over mid-foot.',
          'Let the knees track over the toes; don’t fight the depth.',
          'Drive up through the whole foot at the same tempo you descended.',
        ],
        image: 'squat',
        sets: 5,
        reps: 5,
        weight: 132.5,
        rest: 180,
      },
      {
        id: 'romanian-deadlift',
        name: 'Romanian Deadlift',
        shortName: 'RDL',
        muscle: 'Legs',
        equipment: 'Barbell',
        blurb: 'Load the hamstrings where they grow: under a long, unhurried stretch.',
        cues: [
          'Soften the knees and push the hips straight back.',
          'Keep the bar close enough to drag up the thighs.',
          'Stop when the hamstrings tell you to. The floor can wait.',
        ],
        image: 'rdl',
        sets: 4,
        reps: 8,
        weight: 102.5,
        rest: 120,
      },
      {
        id: 'leg-press',
        name: 'Leg Press',
        shortName: 'Leg Press',
        muscle: 'Legs',
        equipment: 'Machine',
        blurb: 'A controlled quad block. The machine guides the path; your control earns the result.',
        cues: [
          'Keep the lower back glued to the pad.',
          'Descend until the hips are just about to tuck.',
          'Press through the mid-foot without snapping the knees straight.',
        ],
        image: 'legpress',
        sets: 3,
        reps: 10,
        weight: 200,
        rest: 120,
      },
      {
        id: 'walking-lunge',
        name: 'Walking Lunge',
        shortName: 'Walking Lunge',
        muscle: 'Legs',
        equipment: 'Dumbbells',
        blurb: 'Single-leg strength and control with nowhere to hide. Long steps, quiet feet.',
        cues: [
          'Take a long step and land with a flat mid-foot.',
          'Let the back knee brush the floor under control.',
          'Push the floor away and step through without leaning forward.',
        ],
        image: 'lunge',
        sets: 3,
        reps: 12,
        weight: 24,
        rest: 90,
      },
      {
        id: 'standing-calf-raise',
        name: 'Standing Calf Raise',
        shortName: 'Calf Raise',
        muscle: 'Legs',
        equipment: 'Machine',
        blurb: 'Full range, hard pause, honest reps. Calves don’t respond to shortcuts.',
        cues: [
          'Pause at the bottom for a count of one.',
          'Rise as high as the ankles allow.',
          'Keep the knees straight but not locked.',
        ],
        image: 'calf',
        sets: 4,
        reps: 15,
        weight: 60,
        rest: 45,
      },
    ],
  },
]

export const programById = Object.fromEntries(programs.map((program) => [program.id, program])) as Record<
  ProgramId,
  Program
>

const seenExercises = new Set<string>()
export const exerciseLibrary = programs
  .flatMap((program) => program.exercises)
  .filter((exercise) => {
    if (seenExercises.has(exercise.id)) return false
    seenExercises.add(exercise.id)
    return true
  })

export const exerciseById = Object.fromEntries(
  exerciseLibrary.map((exercise) => [exercise.id, exercise]),
) as Record<string, ProgramExercise>

export const programOrder: ProgramId[] = ['push', 'pull', 'legs']

export function getProgram(id: ProgramId): Program {
  return programById[id]
}

export function nextProgramInRotation(id: ProgramId | undefined): ProgramId {
  if (!id) return 'push'
  const index = programOrder.indexOf(id)
  return programOrder[(index + 1) % programOrder.length]
}

export function getProgramDuration(program: Program): number {
  return program.durationMin
}

export function getTotalSets(program: Program): number {
  return program.exercises.reduce((total, exercise) => total + exercise.sets, 0)
}

export const featuredRecords = [
  {
    exerciseId: 'conventional-deadlift',
    label: 'Deadlift',
    code: 'DL',
    image: 'deadlift' as ImageKey,
  },
  {
    exerciseId: 'back-squat',
    label: 'Back Squat',
    code: 'SQ',
    image: 'squat' as ImageKey,
  },
  {
    exerciseId: 'bench-press',
    label: 'Bench Press',
    code: 'BP',
    image: 'bench' as ImageKey,
  },
] as const

export const initialRecords: Record<string, number> = {
  'conventional-deadlift': 185,
  'back-squat': 152.5,
  'bench-press': 112.5,
  'weighted-pull-up': 20,
  'db-shoulder-press': 30,
}

export const demoProfile = {
  firstName: 'Dani',
  fullName: 'Dani Rivera',
  initials: 'DR',
  goal: 'Build lean mass',
  split: 'Push / Pull / Legs',
  started: 'Cycle 04',
}

export interface PhotoCredit {
  id: string
  label: string
  author: string
  username: string
  photoUrl: string
  source: string
}

export const photoCredits: PhotoCredit[] = [
  {
    id: 'hero',
    label: 'Hero — deadlift',
    author: 'Anastase Maragos',
    username: 'visualsbyroyalz',
    photoUrl: 'https://unsplash.com/photos/shirtless-man-lifting-barbell-in-gym-9dzWZQWZMdE',
    source: 'Unsplash',
  },
  {
    id: 'push',
    label: 'Push program',
    author: 'Anastase Maragos',
    username: 'visualsbyroyalz',
    photoUrl: 'https://unsplash.com/photos/topless-man-in-black-shorts-carrying-black-dumbbell-7kEpUPB8vNk',
    source: 'Unsplash',
  },
  {
    id: 'pull',
    label: 'Pull program',
    author: 'Richard R',
    username: 'sepro',
    photoUrl: 'https://unsplash.com/photos/a-man-with-a-barbell-in-a-gym--jdfUP2N7Os',
    source: 'Unsplash',
  },
  {
    id: 'legs',
    label: 'Legs program',
    author: 'Alora Griffiths',
    username: 'aloragriffiths',
    photoUrl: 'https://unsplash.com/photos/man-weightlifting-TuzrzArccvc',
    source: 'Unsplash',
  },
  {
    id: 'promo',
    label: 'Field note',
    author: 'Tyler Raye',
    username: 'tcraye',
    photoUrl: 'https://unsplash.com/photos/a-woman-lifting-a-barbell-in-a-gym-Xb1d-N04Quc',
    source: 'Unsplash',
  },
  {
    id: 'bench',
    label: 'Bench press',
    author: 'Shoham Avisrur',
    username: 'shoham_avisrur',
    photoUrl: 'https://unsplash.com/photos/a-man-doing-a-bench-press-with-a-barbell-Dueawl5Q75s',
    source: 'Unsplash',
  },
  {
    id: 'incline',
    label: 'Incline press',
    author: 'Anastase Maragos',
    username: 'visualsbyroyalz',
    photoUrl: 'https://unsplash.com/photos/topless-man-in-black-shorts-carrying-black-dumbbell-7kEpUPB8vNk',
    source: 'Unsplash',
  },
  {
    id: 'cable',
    label: 'Cable fly',
    author: 'Ramy Mamdouh',
    username: 'romba100',
    photoUrl: 'https://unsplash.com/photos/man-performing-tricep-extension-workout-BXB1_nm7NYM',
    source: 'Unsplash',
  },
  {
    id: 'shoulder',
    label: 'Shoulder press',
    author: 'Samuel Girven',
    username: 'samuelgirven',
    photoUrl: 'https://unsplash.com/photos/a-man-in-a-gym-lifting-a-pair-of-dumbbells-Pv97-3sdjdY',
    source: 'Unsplash',
  },
  {
    id: 'pushdown',
    label: 'Triceps pushdown',
    author: 'Mehedi Hasan',
    username: 'mehedi',
    photoUrl: 'https://unsplash.com/photos/man-performing-tricep-cable-workout-UAqIYlM8bTY',
    source: 'Unsplash',
  },
  {
    id: 'deadlift',
    label: 'Deadlift',
    author: 'Victor Freitas',
    username: 'victorfreitas',
    photoUrl: 'https://unsplash.com/photos/person-about-to-lift-the-barbel-WvDYdXDzkhs',
    source: 'Unsplash',
  },
  {
    id: 'pullup',
    label: 'Pull-up',
    author: 'Edgar Chaparro',
    username: 'echaparro',
    photoUrl: 'https://unsplash.com/photos/grayscale-photo-of-man-working-out-sHfo3WOgGTU',
    source: 'Unsplash',
  },
  {
    id: 'row',
    label: 'Barbell row',
    author: 'Richard R',
    username: 'sepro',
    photoUrl: 'https://unsplash.com/photos/a-man-with-a-barbell-in-a-gym--jdfUP2N7Os',
    source: 'Unsplash',
  },
  {
    id: 'facepull',
    label: 'Face pull',
    author: 'Stefan Vibes',
    username: 'eusuntvibes',
    photoUrl: 'https://unsplash.com/photos/seated-row-machine-in-gym-ktT4AX6j9uY',
    source: 'Unsplash',
  },
  {
    id: 'curl',
    label: 'Hammer curl',
    author: 'Anastase Maragos',
    username: 'visualsbyroyalz',
    photoUrl: 'https://unsplash.com/photos/person-in-gray-shirt-holding-black-dumbbell-FP7cfYPPUKM',
    source: 'Unsplash',
  },
  {
    id: 'squat',
    label: 'Back squat',
    author: 'Alora Griffiths',
    username: 'aloragriffiths',
    photoUrl: 'https://unsplash.com/photos/man-weightlifting-TuzrzArccvc',
    source: 'Unsplash',
  },
  {
    id: 'rdl',
    label: 'Romanian deadlift',
    author: 'Victor Freitas',
    username: 'victorfreitas',
    photoUrl: 'https://unsplash.com/photos/man-holding-black-barbell-hOuJYX2K5DA',
    source: 'Unsplash',
  },
  {
    id: 'legpress',
    label: 'Leg press',
    author: 'Shan A. Rajpoot',
    username: 'shanalirajpoot',
    photoUrl: 'https://unsplash.com/photos/man-is-working-out-on-a-leg-press-machine-bWxf0-B_Hao',
    source: 'Unsplash',
  },
  {
    id: 'lunge',
    label: 'Walking lunge',
    author: 'Ambitious Studio* | Rick Barrett',
    username: 'ambitiousstudio',
    photoUrl: 'https://unsplash.com/photos/a-man-lifting-two-dumbs-in-a-gym-WH-RyVhNEes',
    source: 'Unsplash',
  },
  {
    id: 'calf',
    label: 'Calf raise',
    author: 'Victor Freitas',
    username: 'victorfreitas',
    photoUrl: 'https://unsplash.com/photos/person-lifting-barbell-in-gym-vqDAUejnwKw',
    source: 'Unsplash',
  },
  {
    id: 'gym',
    label: 'Training floor',
    author: 'Danielle Cerullo',
    username: 'dncerullo',
    photoUrl: 'https://unsplash.com/photos/woman-standing-surrounded-by-exercise-equipment-CQfNt66ttZM',
    source: 'Unsplash',
  },
]

export const motivation = {
  quote: 'Discipline is a decision. Not a mood.',
  note: 'FIELD NOTE / 004',
}
