// IronLog Exercises Database & Target Proportions

export const DEFAULT_EXERCISES = {
  bp: {
    name: 'Barbell Bench Press',
    primary: 'chest',
    secondary: ['shoulders', 'triceps'],
    weightFactor: 0.75,
    steps: [
      'Lie flat on the bench with eyes directly under the bar.',
      'Pinch shoulder blades back and down into the pad.',
      'Grip the bar slightly wider than shoulder-width.',
      'Unrack and lower with control to mid-chest, keeping elbows tucked ~45°.',
      'Drive feet into the floor and press up explosively until arms lock out.'
    ],
    mistakes: 'Bouncing the bar off the ribcage; flaring elbows wide at 90°; lifting hips off bench.'
  },
  ip: {
    name: 'Incline Dumbbell Press',
    primary: 'chest',
    secondary: ['shoulders', 'triceps'],
    weightFactor: 0.25, // per dumbbell
    steps: [
      'Set incline bench to 30° (higher turns it into a shoulder press).',
      'Kick dumbbells to shoulder level and plant feet firmly.',
      'Press dumbbells up and slightly together in an arc.',
      'Lower slowly until you feel a deep stretch across upper chest.'
    ],
    mistakes: 'Bench angled too high (>45°); clanking dumbbells at the top; cutting bottom range.'
  },
  sp: {
    name: 'Overhead Press (OHP)',
    primary: 'shoulders',
    secondary: ['triceps'],
    weightFactor: 0.45,
    steps: [
      'Rest bar at upper collarbone, hands just outside shoulders.',
      'Squeeze glutes and brace abs tight.',
      'Press straight up; tuck chin slightly as bar passes your nose, then push head forward under the bar.',
      'Lock out overhead with shrug at top; lower under full control.'
    ],
    mistakes: 'Excessive lower back arching; pushing bar forward instead of vertical; loose core.'
  },
  lr: {
    name: 'Dumbbell Lateral Raise',
    primary: 'shoulders',
    secondary: [],
    weightFactor: 0.08,
    steps: [
      'Stand with slight forward torso hinge, dumbbells resting at sides.',
      'Maintain slight bend at elbows (about 15°).',
      'Raise dumbbells outward leading with elbows until parallel to floor.',
      'Pause for a split second, then lower under a slow 2-second tempo.'
    ],
    mistakes: 'Swinging the torso for momentum; shrugging traps to lift weight; raising hands higher than elbows.'
  },
  pd: {
    name: 'Triceps Cable Pushdown',
    primary: 'triceps',
    secondary: [],
    weightFactor: 0.35,
    steps: [
      'Attach rope or straight bar to high pulley.',
      'Pin elbows firmly to your ribs with slight forward lean.',
      'Push handle straight down until arms are fully locked out.',
      'Control the eccentric return until forearms are past parallel.'
    ],
    mistakes: 'Elbows drifting forward and back; using body weight to lean onto bar; incomplete lockout.'
  },
  oe: {
    name: 'Overhead Triceps Extension',
    primary: 'triceps',
    secondary: [],
    weightFactor: 0.3,
    steps: [
      'Grip one heavy dumbbell with both hands cupped under top plate.',
      'Press overhead; keep elbows pointing forward and tucked close to head.',
      'Lower weight behind head until forearms touch biceps for a deep triceps stretch.',
      'Extend forearms straight overhead to lock out.'
    ],
    mistakes: 'Elbows flaring excessively wide; hyperextending lower back; rushing bottom turnaround.'
  },
  lt: {
    name: 'Lat Pulldown',
    primary: 'back',
    secondary: ['biceps'],
    weightFactor: 0.6,
    steps: [
      'Grip bar slightly wider than shoulders with overhand grip.',
      'Lock thighs under pads, puff chest up toward the ceiling.',
      'Drive elbows down and back, pulling bar to your upper chest / clavicle.',
      'Squeeze lats at bottom, then let bar return slowly for a full stretch overhead.'
    ],
    mistakes: 'Pulling behind the neck; swinging body backwards; pulling with biceps instead of lats.'
  },
  br: {
    name: 'Barbell Bent-Over Row',
    primary: 'back',
    secondary: ['biceps'],
    weightFactor: 0.6,
    steps: [
      'Hinge at hips with a flat back at roughly 45° angle, knees slightly soft.',
      'Grip bar slightly wider than shoulder width.',
      'Pull bar toward lower abdomen/belly button, driving elbows back.',
      'Pinch shoulder blades together at top, lower slowly with control.'
    ],
    mistakes: 'Jerking hips and standing upright to yank weight; rounding spinal column; short reps.'
  },
  cr: {
    name: 'Seated Cable Row',
    primary: 'back',
    secondary: ['biceps'],
    weightFactor: 0.5,
    steps: [
      'Sit tall with knees slightly bent and feet firmly braced on footplates.',
      'Pull attachment toward lower stomach while driving shoulders back and down.',
      'Squeeze mid-back at contraction.',
      'Extend arms forward slowly, allowing shoulder blades to open up for full lat stretch.'
    ],
    mistakes: 'Rocking torso back and forth excessively; hunching shoulders; rushing return.'
  },
  fp: {
    name: 'Face Pull',
    primary: 'shoulders',
    secondary: ['back'],
    weightFactor: 0.25,
    steps: [
      'Set cable pulley to upper chest or eye level with rope attachment.',
      'Grip rope with thumbs pointed toward you.',
      'Step back, pull rope directly toward bridge of nose while externally rotating hands outward.',
      'Hold peak squeeze for 1 full second with elbows high and wide, then return smoothly.'
    ],
    mistakes: 'Using too much weight; dropping elbows below wrists; leaning back to swing.'
  },
  bc: {
    name: 'Barbell / EZ-Bar Curl',
    primary: 'biceps',
    secondary: [],
    weightFactor: 0.3,
    steps: [
      'Stand upright, feet shoulder-width, gripping bar with palms up.',
      'Keep elbows pinned near waistline.',
      'Curl bar up toward collarbone while contracting biceps.',
      'Lower bar slowly all the way down until elbows are fully extended.'
    ],
    mistakes: 'Swinging torso or thrusting hips; elbows kicking forward 6 inches; cutting bottom lockout.'
  },
  hc: {
    name: 'Dumbbell Hammer Curl',
    primary: 'biceps',
    secondary: ['forearms'],
    weightFactor: 0.12, // per dumbbell
    steps: [
      'Hold dumbbells at sides with neutral grip (palms facing each other).',
      'Keep upper arms stationary; curl dumbbells up toward shoulders.',
      'Squeeze brachialis and forearms at the top.',
      'Lower under 2-3 seconds of constant tension.'
    ],
    mistakes: 'Swinging weights; rushing eccentric; moving elbows out of position.'
  },
  sq: {
    name: 'Barbell Back Squat',
    primary: 'quads',
    secondary: ['glutes', 'hamstrings'],
    weightFactor: 0.9,
    steps: [
      'Rest bar securely on upper traps (high bar) or rear delts (low bar).',
      'Feet shoulder-width apart, toes flared out ~15-30°.',
      'Brace core with Valsalva breath, sit back and down between knees.',
      'Descend until hip crease is below top of knees (parallel or deeper).',
      'Drive forcefully up through mid-foot, knees tracking over toes.'
    ],
    mistakes: 'Knees caving inward (valgus collapse); heels lifting off ground; chest collapsing forward.'
  },
  lp: {
    name: 'Leg Press',
    primary: 'quads',
    secondary: ['glutes'],
    weightFactor: 1.5,
    steps: [
      'Sit deep in seat with lower back and tailbone pressed flush against backrest.',
      'Place feet shoulder-width in center of plate.',
      'Lower platform until knees reach 90° angle without butt lifting.',
      'Press sled up through whole foot, stopping just short of hyperextending knees.'
    ],
    mistakes: 'Lower back curling off seat at the bottom; forcefully locking/snapping knees straight.'
  },
  rd: {
    name: 'Romanian Deadlift (RDL)',
    primary: 'hamstrings',
    secondary: ['glutes'],
    weightFactor: 0.8,
    steps: [
      'Stand tall holding bar at hips with overhand grip.',
      'Keep knees softly unlocked (15° bend) and static.',
      'Push hips straight backward as if touching a wall behind you.',
      'Slide bar close along thighs down to mid-shin until hamstrings are fully loaded.',
      'Drive hips forward and squeeze glutes to lock out.'
    ],
    mistakes: 'Rounding the lower back; bending knees into a conventional squat; looking up into mirror.'
  },
  lc: {
    name: 'Lying or Seated Leg Curl',
    primary: 'hamstrings',
    secondary: [],
    weightFactor: 0.4,
    steps: [
      'Adjust pad so it rests right behind Achilles tendon / lower calves.',
      'Grip handles to stabilize pelvis and prevent hips from rising.',
      'Curl heels actively toward glutes with strong contraction.',
      'Control the negative back down until legs are almost straight.'
    ],
    mistakes: 'Lifting hips off the bench during the squeeze; dropping weight quickly.'
  },
  ht: {
    name: 'Barbell Hip Thrust',
    primary: 'glutes',
    secondary: ['hamstrings'],
    weightFactor: 1.0,
    steps: [
      'Position shoulder blades across the edge of a sturdy bench.',
      'Place padded barbell over hip crease; feet flat on floor shoulder-width apart.',
      'Drive through heels to push hips up until torso and thighs form a straight line.',
      'Tuck chin looking forward, squeeze glutes hard at the top for 1 second, then lower with control.'
    ],
    mistakes: 'Hyperextending lower back at top; placing feet too far out or too close; looking up at ceiling.'
  },
  cf: {
    name: 'Standing Calf Raise',
    primary: 'calves',
    secondary: [],
    weightFactor: 0.8,
    steps: [
      'Place balls of feet on elevated block or machine step.',
      'Lower heels slowly into a deep stretch and hold for 1 full second.',
      'Explode onto balls of toes and big toe joint to peak height.',
      'Pause at maximum peak contraction for 1 second before lowering.'
    ],
    mistakes: 'Bouncing using Achilles tendon spring reflex; bending knees; cutting range of motion.'
  },
  cc: {
    name: 'Cable Kneeling Crunch',
    primary: 'abs',
    secondary: [],
    weightFactor: 0.25,
    steps: [
      'Kneel facing cable stack with rope held tightly beside ears/temples.',
      'Keep hips locked still; curl spine downward by flexing abs.',
      'Bring elbows down toward knees, rounding upper and mid back.',
      'Contract abs hard at bottom, then slowly unroll spine.'
    ],
    mistakes: 'Sitting back onto heels (using hip flexors); pulling with arms instead of spinal flexion.'
  },
  hl: {
    name: 'Hanging Leg / Knee Raise',
    primary: 'abs',
    secondary: [],
    weightFactor: 0.0, // bodyweight
    steps: [
      'Hang from pull-up bar with active engaged shoulders.',
      'Posteriorly tilt pelvis to engage lower abdomen.',
      'Raise knees or straight legs up until thighs pass parallel to floor and pelvis curls up.',
      'Lower legs slowly without letting body swing.'
    ],
    mistakes: 'Swinging legs with momentum; arching lower back; dead hang without core tension.'
  },
  wc: {
    name: 'Dumbbell Wrist Curl',
    primary: 'forearms',
    secondary: [],
    weightFactor: 0.1,
    steps: [
      'Sit on bench with forearms resting flat on thighs, wrists hanging slightly off knees, palms facing up.',
      'Lower dumbbell down fingers to open hand slightly.',
      'Curl fingers and wrist upward as high as possible.',
      'Pause for peak forearm squeeze, then lower smoothly.'
    ],
    mistakes: 'Lifting forearms off thighs; jerky wrist movement; using too heavy weight.'
  }
};

// Muscle group definitions
export const MUSCLE_GROUPS = [
  'chest', 'shoulders', 'triceps', 'back', 'biceps',
  'quads', 'hamstrings', 'glutes', 'calves', 'abs', 'forearms'
];

// Mapping from muscle group to Golden Ratio body part measurement key
export const MUSCLE_TO_MEASUREMENT = {
  chest: 'chest',
  shoulders: 'shoulders',
  back: 'shoulders',
  triceps: 'bicep',
  biceps: 'bicep',
  quads: 'thigh',
  hamstrings: 'thigh',
  glutes: 'hips',
  calves: 'calf'
};

// Target Golden-era aesthetic proportions relative to standing height (height * ratio)
export const GOLDEN_RATIOS = {
  m: {
    chest: 0.53,
    shoulders: 0.62,
    bicep: 0.19,
    hips: 0.54,
    thigh: 0.32,
    calf: 0.21
  },
  f: {
    chest: 0.50,
    shoulders: 0.55,
    bicep: 0.16,
    hips: 0.58,
    thigh: 0.33,
    calf: 0.21
  }
};

export const MEASUREMENT_KEYS = ['chest', 'shoulders', 'bicep', 'waist', 'hips', 'thigh', 'calf'];

// Push-Pull-Legs Routine Splits (6-day PPL)
export const WORKOUT_SPLITS = [
  ['Push A', ['bp', 'sp', 'ip', 'lr', 'pd', 'cc']],
  ['Pull A', ['lt', 'br', 'fp', 'bc', 'hc', 'wc']],
  ['Legs A', ['sq', 'rd', 'lc', 'cf']],
  ['Push B', ['ip', 'sp', 'lr', 'oe', 'pd', 'hl']],
  ['Pull B', ['cr', 'lt', 'fp', 'hc', 'bc', 'wc']],
  ['Legs B', ['lp', 'ht', 'rd', 'cf']]
];

/**
 * Calculates current proportion score (ratio of actual to golden target)
 */
export function getMuscleScore(muscle, state) {
  if (!state || !state.p || !state.m || !state.m.length) return null;
  const lastM = state.m[state.m.length - 1].v;
  if (!lastM) return null;
  const k = MUSCLE_TO_MEASUREMENT[muscle];
  if (!k) return null;
  const gender = state.p.g === 'f' ? 'f' : 'm';
  const ratio = GOLDEN_RATIOS[gender][k];
  if (!ratio || !state.p.h) return null;
  const target = state.p.h * ratio;
  return lastM[k] / target;
}

/**
 * Calculates recovery status of a muscle group based on hours since last intense session (>=3 sets)
 * Returns { status: 'red'|'yellow'|'green', label: 'Recovering'|'Almost ready'|'Ready', hours: number }
 */
export function getMuscleRecovery(muscle, state, exercisesDict = DEFAULT_EXERCISES) {
  if (!state || !state.s || !state.s.length) {
    return { status: 'green', label: 'Ready', hours: 999 };
  }

  for (let i = state.s.length - 1; i >= 0; i--) {
    const session = state.s[i];
    if (!session || !session.sets) continue;
    const setsForMuscle = session.sets.filter(s => {
      const ex = exercisesDict[s.ex] || state.customExercises?.[s.ex];
      return ex && ex.primary === muscle;
    });

    if (setsForMuscle.length >= 3) {
      const hours = (Date.now() - session.end) / (3600 * 1000);
      if (hours < 36) {
        return { status: 'red', label: 'Recovering', hours: Math.round(hours) };
      } else if (hours < 56) {
        return { status: 'yellow', label: 'Almost ready', hours: Math.round(hours) };
      } else {
        return { status: 'green', label: 'Ready', hours: Math.round(hours) };
      }
    }
  }

  return { status: 'green', label: 'Ready', hours: 999 };
}

/**
 * Determines target sets for today based on lag status & priority
 */
export function getTargetSets(muscle, state) {
  const score = getMuscleScore(muscle, state);
  let baseSets = 3;
  if (score !== null) {
    if (score < 0.93) {
      baseSets = 4; // Below golden target: overload volume
    } else if (score >= 1.02) {
      baseSets = 2; // At or above target: maintenance volume
    } else {
      baseSets = 3;
    }
  }

  const priorityList = state?.p?.pri || [];
  if (priorityList.includes(muscle)) {
    baseSets += 1; // User selected priority muscle
  }

  return baseSets;
}

/**
 * Calculates suggested starting weight for an exercise
 */
export function getSuggestedWeight(exId, state, exercisesDict = DEFAULT_EXERCISES) {
  if (!state) return 0;
  // Check previous logged sets for this exercise
  if (state.s && state.s.length) {
    for (let i = state.s.length - 1; i >= 0; i--) {
      const match = state.s[i].sets?.filter(s => s.ex === exId).pop();
      if (match && match.w) return match.w;
    }
  }

  // Fallback to bodyweight formula
  const ex = exercisesDict[exId] || state.customExercises?.[exId];
  if (!ex || !ex.weightFactor) return 0;

  const latestWeight = state.w && state.w.length ? state.w[state.w.length - 1].w : (state.p?.w || 70);
  const genderMultiplier = state.p?.g === 'f' ? 0.65 : 1.0;
  const estimated = latestWeight * ex.weightFactor * genderMultiplier;
  
  // Round to nearest 1.25kg, minimum 2.5kg
  return Math.max(2.5, Math.round(estimated / 1.25) * 1.25);
}
