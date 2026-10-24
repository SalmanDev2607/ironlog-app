// IronLog Exercises Database & Target Proportions

export const DEFAULT_EXERCISES = {
  // ----------------------------------------------------
  // CHEST
  // ----------------------------------------------------
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
  dbp: {
    name: 'Flat Dumbbell Bench Press',
    primary: 'chest',
    secondary: ['shoulders', 'triceps'],
    weightFactor: 0.28, // per dumbbell
    steps: [
      'Sit on flat bench with dumbbells resting vertically on your knees.',
      'Kick knees up as you lie back, positioning dumbbells at outer chest level.',
      'Keep shoulder blades pinched and feet firmly planted.',
      'Press dumbbells up smoothly in a gentle arc without clanking them together.',
      'Lower slowly to chest level for a deep, controlled stretch.'
    ],
    mistakes: 'Colliding dumbbells at top; flaring elbows wide 90°; losing scapular retraction.'
  },
  ibp: {
    name: 'Incline Barbell Bench Press',
    primary: 'chest',
    secondary: ['shoulders', 'triceps'],
    weightFactor: 0.60,
    steps: [
      'Set bench to a 30° incline.',
      'Grip bar slightly wider than shoulder-width with wrists straight.',
      'Unrack bar and lower with control to upper clavicle / upper chest.',
      'Press vertically back up over upper chest to full lockout.'
    ],
    mistakes: 'Bouncing bar off clavicle; setting angle too steep; letting elbows flare wide.'
  },
  dec_bp: {
    name: 'Decline Barbell Bench Press',
    primary: 'chest',
    secondary: ['triceps'],
    weightFactor: 0.70,
    steps: [
      'Secure shins under ankle pads on a decline bench and lie back.',
      'Grip barbell shoulder-width apart and unrack carefully.',
      'Lower bar slowly toward the lower sternum / base of chest.',
      'Press upward in a straight line to full arm lockout.'
    ],
    mistakes: 'Lowering bar too high toward neck; rushing reps; uncontrolled unrack.'
  },
  cfly: {
    name: 'Cable Chest Fly / Crossover',
    primary: 'chest',
    secondary: ['shoulders'],
    weightFactor: 0.15, // per cable
    steps: [
      'Set cable pulleys at chest or shoulder height with single D-handles.',
      'Step one foot forward for balance, keeping a slight forward torso lean.',
      'Maintain a slight, fixed bend in elbows (~15°).',
      'Bring hands together in a wide hugging arc across mid-chest.',
      'Squeeze chest hard for 1 second, then slowly control the stretch backward.'
    ],
    mistakes: 'Bending and straightening elbows into a press; using torso momentum; letting shoulders roll forward.'
  },
  pck: {
    name: 'Pec Deck / Machine Fly',
    primary: 'chest',
    secondary: [],
    weightFactor: 0.40,
    steps: [
      'Adjust seat so handles or arm pads align with mid-chest.',
      'Keep back flat against the backrest with shoulder blades pinned back.',
      'Sweep handles together in front of chest in a smooth arc.',
      'Contract pectorals hard at peak for 1 second, then open slowly.'
    ],
    mistakes: 'Shoulders rolling forward out of the seat; over-extending past comfortable shoulder range.'
  },
  cdp: {
    name: 'Chest Dips',
    primary: 'chest',
    secondary: ['triceps', 'shoulders'],
    weightFactor: 0.0, // bodyweight
    steps: [
      'Grip parallel dip bars with arms straight and shoulders packed down.',
      'Lean torso forward ~30° and tuck knees back to target chest over triceps.',
      'Lower smoothly until elbows reach 90° and chest feels a deep stretch.',
      'Press forcefully through palms back to starting lockout.'
    ],
    mistakes: 'Staying completely vertical (shifts stress to triceps); dropping too deep causing shoulder impingement.'
  },
  cmp: {
    name: 'Chest Press Machine',
    primary: 'chest',
    secondary: ['shoulders', 'triceps'],
    weightFactor: 0.55,
    steps: [
      'Adjust seat height so handles align with mid-chest.',
      'Plant feet flat on floor and press upper back firmly into pad.',
      'Press handles forward until arms are almost fully extended.',
      'Control handles slowly backward until chest is fully stretched.'
    ],
    mistakes: 'Allowing weight stack to slam at bottom; letting shoulders shrug upward.'
  },
  pu: {
    name: 'Push-Ups',
    primary: 'chest',
    secondary: ['triceps', 'shoulders', 'abs'],
    weightFactor: 0.0, // bodyweight
    steps: [
      'Place hands slightly wider than shoulder-width with body in rigid plank.',
      'Squeeze glutes and brace core tight.',
      'Lower chest under control until nose/chest touches ~1 inch off the floor.',
      'Press floor away aggressively back to full arm extension.'
    ],
    mistakes: 'Sagging lower back; neck craning down; elbows flaring 90° wide.'
  },
  dfly: {
    name: 'Flat Dumbbell Fly',
    primary: 'chest',
    secondary: ['shoulders'],
    weightFactor: 0.12, // per dumbbell
    steps: [
      'Lie flat holding dumbbells straight over chest with neutral palms.',
      'Maintain slight elbow bend and open arms outward in a broad arc.',
      'Stop when dumbbells reach chest level and a safe deep stretch is felt.',
      'Bring weights back together in the same hugging arc.'
    ],
    mistakes: 'Turning movement into a bench press; going too heavy; dropping elbows excessively low.'
  },
  lhc: {
    name: 'Low-to-High Cable Crossover',
    primary: 'chest',
    secondary: ['shoulders'],
    weightFactor: 0.12, // per cable
    steps: [
      'Set pulleys to bottom floor position with single handles.',
      'Step slightly forward, palms facing forward and upward.',
      'Scoop hands upward and inward toward upper chest / eye level.',
      'Hold contraction at the top for 1 second, then lower slowly.'
    ],
    mistakes: 'Using hip swing momentum; bending elbows too much.'
  },

  // ----------------------------------------------------
  // BACK
  // ----------------------------------------------------
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
  pu_pull: {
    name: 'Pull-Ups / Chin-Ups',
    primary: 'back',
    secondary: ['biceps'],
    weightFactor: 0.0, // bodyweight
    steps: [
      'Grip pull-up bar slightly wider than shoulder-width (overhand or underhand).',
      'Depress scapulae downward and initiate pull with lats.',
      'Pull chest up toward bar until chin clearly clears the bar.',
      'Lower with strict 3-second eccentric control to a dead hang.'
    ],
    mistakes: 'Kipping or swinging legs; half-reps (not locking out at bottom); chin reaching up without chest rising.'
  },
  dl: {
    name: 'Conventional Barbell Deadlift',
    primary: 'back',
    secondary: ['hamstrings', 'glutes', 'forearms'],
    weightFactor: 1.10,
    steps: [
      'Stand with feet hip-width apart, bar over mid-foot.',
      'Hinge hips back and grip bar just outside knees.',
      'Pull slack out of bar, flatten back, pull chest proud.',
      'Drive through floor with legs, standing tall until hips and knees lock out.',
      'Hinge hips back to lower bar back to floor with strict control.'
    ],
    mistakes: 'Rounding lower back; jerking bar off floor without tension; hyperextending backward at top.'
  },
  tbr: {
    name: 'T-Bar Row',
    primary: 'back',
    secondary: ['biceps'],
    weightFactor: 0.65,
    steps: [
      'Straddle bar with feet shoulder-width, knees softly bent, chest hinged at 45°.',
      'Grip handles firmly and brace core flat.',
      'Pull handle directly toward lower chest/upper abdomen, pinching scapulae.',
      'Lower weight smoothly without letting back round.'
    ],
    mistakes: 'Using hip momentum to bounce weight up; rounding lumbar spine.'
  },
  dbr: {
    name: 'Single-Arm Dumbbell Row',
    primary: 'back',
    secondary: ['biceps', 'forearms'],
    weightFactor: 0.30, // per dumbbell
    steps: [
      'Place one knee and same-side hand flat on a sturdy bench.',
      'Keep back parallel to floor and grip dumbbell in free hand.',
      'Pull dumbbell in a slight arc toward hip, driving elbow back and up.',
      'Pause for a squeeze at top, then lower for a full lat stretch.'
    ],
    mistakes: 'Rotating torso excessively to heave weight; pulling straight up to shoulder instead of hip.'
  },
  sao: {
    name: 'Straight-Arm Cable Pulldown',
    primary: 'back',
    secondary: ['triceps'],
    weightFactor: 0.25,
    steps: [
      'Attach wide bar or rope to high pulley, stand with slight forward hip hinge.',
      'Keep arms extended with a slight soft elbow bend.',
      'Engage lats to pull bar down in an arc to touch upper thighs.',
      'Squeeze lats hard at bottom, then return slowly overhead.'
    ],
    mistakes: 'Bending elbows into a tricep pushdown; using torso rocking momentum.'
  },
  clr: {
    name: 'Close-Grip Cable Row',
    primary: 'back',
    secondary: ['biceps'],
    weightFactor: 0.50,
    steps: [
      'Attach V-bar handle to low row cable.',
      'Sit upright with chest proud and slight knee bend.',
      'Pull V-handle to lower belly button while driving elbows backwards.',
      'Squeeze mid-back tightly, then extend arms forward under full tension.'
    ],
    mistakes: 'Swinging torso forward and back; shrugging shoulders up to ears.'
  },
  csr: {
    name: 'Chest-Supported Machine Row',
    primary: 'back',
    secondary: ['biceps'],
    weightFactor: 0.45,
    steps: [
      'Adjust seat so top of chest pad rests at mid-sternum.',
      'Press chest flush into pad, neutralizing lower back strain.',
      'Grip handles and drive elbows backward as far as possible.',
      'Squeeze shoulder blades together, then release slowly forward.'
    ],
    mistakes: 'Lifting chest off pad to cheat reps; releasing weight stack with a bang.'
  },
  lat_kneel: {
    name: 'Half-Kneeling Single-Arm Lat Pulldown',
    primary: 'back',
    secondary: ['biceps'],
    weightFactor: 0.25,
    steps: [
      'Attach single handle to high pulley and kneel on one knee.',
      'Grip handle with arm fully extended overhead for deep lat stretch.',
      'Pull elbow straight down toward hip with a slight lateral crunch.',
      'Control eccentric ascent until lat is lengthened fully.'
    ],
    mistakes: 'Rotating shoulders; pulling with bicep rather than lat.'
  },

  // ----------------------------------------------------
  // SHOULDERS
  // ----------------------------------------------------
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
  dsp: {
    name: 'Seated Dumbbell Shoulder Press',
    primary: 'shoulders',
    secondary: ['triceps'],
    weightFactor: 0.22, // per dumbbell
    steps: [
      'Sit on bench set to 80-85° (nearly vertical).',
      'Kick dumbbells to shoulder height, elbows angled ~45° forward.',
      'Press dumbbells smoothly straight up overhead until arms extend.',
      'Lower slowly to ear/chin level for full muscular stretch.'
    ],
    mistakes: 'Flaring elbows completely wide to sides; arching lower back severely off pad.'
  },
  cable_lr: {
    name: 'Cable Lateral Raise',
    primary: 'shoulders',
    secondary: [],
    weightFactor: 0.08, // per cable
    steps: [
      'Set cable pulley to lowest or knee height with single handle.',
      'Stand side-on to cable, grip handle across front or behind body.',
      'Raise arm outward in scapular plane until parallel to floor.',
      'Hold top contraction for 1 second, then lower slowly with constant cable tension.'
    ],
    mistakes: 'Using hip sway; shrugging trap instead of lateral delt.'
  },
  ar: {
    name: 'Arnold Press',
    primary: 'shoulders',
    secondary: ['triceps'],
    weightFactor: 0.18, // per dumbbell
    steps: [
      'Hold dumbbells at chin height with palms facing toward your face.',
      'As you press upward, rotate palms outward until facing forward at lockout.',
      'Reverse rotation smoothly as you descend back to chin height.'
    ],
    mistakes: 'Rushing rotation; clanking dumbbells; hyperextending spine.'
  },
  fr: {
    name: 'Dumbbell Front Raise',
    primary: 'shoulders',
    secondary: [],
    weightFactor: 0.10, // per dumbbell
    steps: [
      'Hold dumbbells in front of thighs with overhand or neutral grip.',
      'Raise one or both dumbbells straight forward to eye level.',
      'Pause at top, then lower with strict control.'
    ],
    mistakes: 'Swinging torso; leaning back to hoist weight.'
  },
  rrf: {
    name: 'Reverse Pec Deck / Rear Delt Fly',
    primary: 'shoulders',
    secondary: ['back'],
    weightFactor: 0.30,
    steps: [
      'Sit facing chest pad with handles adjusted to shoulder height.',
      'Grip handles with neutral or overhand palms.',
      'Sweep handles backward using rear delts without pinching traps together.',
      'Hold peak squeeze for 1 second, then return slowly.'
    ],
    mistakes: 'Bending elbows into a row; over-pinching scapulae rather than using rear delts.'
  },
  shrug: {
    name: 'Barbell / Dumbbell Shrug',
    primary: 'shoulders',
    secondary: ['forearms'],
    weightFactor: 0.70,
    steps: [
      'Stand tall holding barbell or heavy dumbbells at sides.',
      'Elevate shoulders straight up toward ears in a pure vertical line.',
      'Hold peak squeeze at the top for 2 full seconds.',
      'Lower under strict control until traps are fully stretched.'
    ],
    mistakes: 'Rolling shoulders in circles (injures rotator cuffs); bending elbows to lift weight.'
  },
  up_row: {
    name: 'Upright Cable / Barbell Row',
    primary: 'shoulders',
    secondary: ['biceps'],
    weightFactor: 0.35,
    steps: [
      'Grip bar with hands shoulder-width apart (avoid narrow grips).',
      'Pull bar up along torso leading with elbows high.',
      'Stop when elbows reach shoulder height.',
      'Lower bar slowly with control.'
    ],
    mistakes: 'Gripping too narrow (causes shoulder impingement); pulling elbows higher than shoulders.'
  },

  // ----------------------------------------------------
  // BICEPS
  // ----------------------------------------------------
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
  inc_curl: {
    name: 'Incline Dumbbell Curl',
    primary: 'biceps',
    secondary: ['forearms'],
    weightFactor: 0.12, // per dumbbell
    steps: [
      'Sit on bench set to 45-60° angle, arms hanging straight down.',
      'Pin shoulders against bench and curl dumbbells up while supinating wrists.',
      'Squeeze biceps hard at top without letting elbows drift forward.',
      'Lower slowly to full bottom hang for extreme long-head stretch.'
    ],
    mistakes: 'Lifting shoulders off pad; swinging elbows forward.'
  },
  preacher: {
    name: 'Preacher Curl (EZ-Bar or Machine)',
    primary: 'biceps',
    secondary: [],
    weightFactor: 0.25,
    steps: [
      'Adjust seat so armpits sit snugly over top of angled preacher pad.',
      'Rest triceps flat on pad and grip bar with underhand grip.',
      'Curl bar up to peak contraction without lifting upper arms off pad.',
      'Lower slowly, stopping just before elbows hyperextend at bottom.'
    ],
    mistakes: 'Snapping elbows into hyperextension at bottom; lifting hips off seat.'
  },
  cable_curl: {
    name: 'Standing Cable Bicep Curl',
    primary: 'biceps',
    secondary: ['forearms'],
    weightFactor: 0.25,
    steps: [
      'Attach straight or EZ-bar to low cable pulley.',
      'Step back, elbows pinned to sides.',
      'Curl cable upward against constant resistance all the way to collarbone.',
      'Lower slowly against cable tension.'
    ],
    mistakes: 'Torso leaning back to initiate curl; letting elbows flare.'
  },
  conc_curl: {
    name: 'Concentration Curl',
    primary: 'biceps',
    secondary: [],
    weightFactor: 0.12, // per dumbbell
    steps: [
      'Sit on bench with legs spread, brace back of tricep against inner thigh.',
      'Curl dumbbell upward toward face in a strict arc.',
      'Squeeze bicep peak hard at top for 1 full second.',
      'Lower slowly to full arm hang.'
    ],
    mistakes: 'Swinging shoulder to lift dumbbell; shifting elbow off inner thigh.'
  },
  spider_curl: {
    name: 'Spider Curl',
    primary: 'biceps',
    secondary: [],
    weightFactor: 0.12, // per dumbbell
    steps: [
      'Lie chest-down on incline bench, arms hanging vertically over straight side.',
      'Grip dumbbells or EZ-bar with palms up.',
      'Curl weight upward toward face while keeping arms strictly perpendicular to floor.',
      'Squeeze hard at peak contraction, then lower slowly.'
    ],
    mistakes: 'Allowing arms to swing backward toward body.'
  },

  // ----------------------------------------------------
  // TRICEPS
  // ----------------------------------------------------
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
  sk_crusher: {
    name: 'Skull Crushers / Lying Triceps Extension',
    primary: 'triceps',
    secondary: [],
    weightFactor: 0.30,
    steps: [
      'Lie flat holding EZ-bar with hands shoulder-width, arms angled slightly back (~75°).',
      'Hinge at elbows only, lowering bar toward forehead or crown of head.',
      'Feel deep stretch in triceps, then press back up to starting angle.'
    ],
    mistakes: 'Moving upper arms back and forth like a pullover; flaring elbows wide.'
  },
  cgbp: {
    name: 'Close-Grip Barbell Bench Press',
    primary: 'triceps',
    secondary: ['chest', 'shoulders'],
    weightFactor: 0.60,
    steps: [
      'Lie on flat bench, grip bar with hands shoulder-width apart (not touching).',
      'Tuck elbows close to ribs (~30° angle).',
      'Lower bar to lower chest with strict control.',
      'Press up explosively through palms, locking out triceps at top.'
    ],
    mistakes: 'Gripping bar with hands touching (wrecks wrists); flaring elbows.'
  },
  tricep_dips: {
    name: 'Triceps Dips / Bench Dips',
    primary: 'triceps',
    secondary: ['chest', 'shoulders'],
    weightFactor: 0.0, // bodyweight
    steps: [
      'Grip parallel bars or edge of bench with arms locked.',
      'Keep torso upright (vertical) to emphasize triceps over chest.',
      'Lower until elbows form a 90° angle, keeping elbows tucked close.',
      'Press straight up to full elbow extension.'
    ],
    mistakes: 'Leaning torso forward (shifts load to chest); letting shoulders roll forward.'
  },
  rope_ext: {
    name: 'Cable Overhead Rope Extension',
    primary: 'triceps',
    secondary: [],
    weightFactor: 0.25,
    steps: [
      'Attach rope to low or mid pulley, turn facing away from stack.',
      'Hold rope behind head with elbows pointed forward.',
      'Extend arms overhead, spreading rope ends apart at full lockout.',
      'Lower slowly back behind head for maximum stretch.'
    ],
    mistakes: 'Flaring elbows outward; arching lower back.'
  },
  kickback: {
    name: 'Cable / Dumbbell Triceps Kickback',
    primary: 'triceps',
    secondary: [],
    weightFactor: 0.10,
    steps: [
      'Hinge torso forward with upper arm pinned parallel to floor.',
      'Starting with forearm perpendicular to floor, extend arm straight back.',
      'Squeeze tricep firmly for 1 second at full extension.',
      'Return forearm slowly to starting 90° angle.'
    ],
    mistakes: 'Dropping upper arm; swinging dumbbell with shoulder momentum.'
  },

  // ----------------------------------------------------
  // QUADS
  // ----------------------------------------------------
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
  fsq: {
    name: 'Barbell Front Squat',
    primary: 'quads',
    secondary: ['glutes', 'abs'],
    weightFactor: 0.65,
    steps: [
      'Rest bar across front deltoids with clean grip or crossed arms; elbows held high.',
      'Keep torso strictly vertical as you sit down into a deep squat.',
      'Descend until thighs break parallel.',
      'Drive up through mid-foot, keeping elbows pointed forward and chest high.'
    ],
    mistakes: 'Dropping elbows (causes bar to roll off shoulders); leaning torso forward.'
  },
  hack_sq: {
    name: 'Hack Squat Machine',
    primary: 'quads',
    secondary: ['glutes'],
    weightFactor: 0.85,
    steps: [
      'Position shoulders and back securely against padded carriage.',
      'Place feet lower on platform for maximal quad loading.',
      'Disengage safety and descend slowly until knees reach full deep flexion (~90°+).',
      'Drive platform upward through mid-foot and heels.'
    ],
    mistakes: 'Lifting lower back off pad; bouncing out of bottom; snapping knees locked.'
  },
  le: {
    name: 'Leg Extension Machine',
    primary: 'quads',
    secondary: [],
    weightFactor: 0.40,
    steps: [
      'Align knee joint with machine pivot axis; pad resting against lower shins.',
      'Grip side handles tightly to anchor hips firmly into seat.',
      'Extend legs upward until quads are fully contracted.',
      'Pause at top for 1 second, then lower under a slow 3-second negative.'
    ],
    mistakes: 'Kicking weight up with hip jerk; letting hips rise off seat.'
  },
  b_split: {
    name: 'Bulgarian Split Squat',
    primary: 'quads',
    secondary: ['glutes', 'hamstrings'],
    weightFactor: 0.15, // per dumbbell
    steps: [
      'Stand ~2 feet in front of a bench, placing top of rear foot on bench pad.',
      'Hold dumbbells at sides, keep torso upright with slight forward lean.',
      'Lower front hip until front thigh is parallel to floor and rear knee hovers.',
      'Drive through front heel to return to standing.'
    ],
    mistakes: 'Front foot too close or too far; knee collapsing inward; pushing off rear leg.'
  },
  goblet: {
    name: 'Goblet Squat',
    primary: 'quads',
    secondary: ['glutes', 'abs'],
    weightFactor: 0.25,
    steps: [
      'Hold a heavy dumbbell vertically against chest with both palms cupping top bell.',
      'Stand with feet shoulder-width, toes angled slightly out.',
      'Squat down between your legs until elbows touch inside of knees.',
      'Stand up tall, driving through mid-foot.'
    ],
    mistakes: 'Letting weight pull chest forward; rounding lumbar spine.'
  },
  lunge: {
    name: 'Walking Lunges',
    primary: 'quads',
    secondary: ['glutes', 'hamstrings'],
    weightFactor: 0.15, // per dumbbell
    steps: [
      'Hold dumbbells at sides and take an exaggerated step forward.',
      'Lower hips until front thigh is parallel to floor and rear knee kisses floor.',
      'Push through front heel to stand up into the next step.',
      'Maintain an upright torso and steady balance.'
    ],
    mistakes: 'Front knee passing excessively beyond toes; torso swaying side to side.'
  },

  // ----------------------------------------------------
  // HAMSTRINGS
  // ----------------------------------------------------
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
  sl_deadlift: {
    name: 'Stiff-Legged Barbell Deadlift',
    primary: 'hamstrings',
    secondary: ['glutes', 'back'],
    weightFactor: 0.75,
    steps: [
      'Start with bar on floor, legs almost completely straight with soft knees.',
      'Hinge at hips with flat back to grip bar.',
      'Pull bar up by driving hips forward and engaging hamstrings.',
      'Lower bar all the way back toward floor, keeping hips high to isolate hamstrings.'
    ],
    mistakes: 'Rounding spine; bending knees too deeply (turns into conventional deadlift).'
  },
  db_rdl: {
    name: 'Dumbbell Romanian Deadlift',
    primary: 'hamstrings',
    secondary: ['glutes'],
    weightFactor: 0.25, // per dumbbell
    steps: [
      'Hold dumbbells at front of thighs, feet hip-width apart.',
      'Push hips backward, tracing dumbbells down shins.',
      'Feel massive hamstring stretch at mid-shin.',
      'Drive hips forward to return to standing.'
    ],
    mistakes: 'Letting dumbbells drift away from legs; losing back arch.'
  },
  nordic: {
    name: 'Nordic Hamstring Curl',
    primary: 'hamstrings',
    secondary: ['glutes'],
    weightFactor: 0.0, // bodyweight
    steps: [
      'Kneel on padded surface with ankles firmly hooked or held down.',
      'Keep hips locked straight in line with torso.',
      'Lower body slowly toward floor resisting with hamstrings as long as possible.',
      'Catch yourself with hands, push lightly off floor, and pull back up with hamstrings.'
    ],
    mistakes: 'Bending at hips (breaking hip extension); dropping uncontrolled.'
  },
  good_morning: {
    name: 'Barbell Good Mornings',
    primary: 'hamstrings',
    secondary: ['glutes', 'back'],
    weightFactor: 0.35,
    steps: [
      'Rest barbell securely across upper traps, feet hip-width.',
      'With soft knees, hinge hips straight back until torso is nearly parallel to floor.',
      'Feel deep hamstring stretch, then contract glutes and hamstrings to stand tall.'
    ],
    mistakes: 'Using too much weight; rounding thoracic or lumbar spine; bending knees into a squat.'
  },

  // ----------------------------------------------------
  // GLUTES
  // ----------------------------------------------------
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
  cable_kick: {
    name: 'Cable Glute Kickback',
    primary: 'glutes',
    secondary: ['hamstrings'],
    weightFactor: 0.12,
    steps: [
      'Attach ankle strap to low cable pulley.',
      'Face machine, holding support frame with slight forward torso hinge.',
      'Kick working leg backward and slightly outward in a 45° angle.',
      'Squeeze glute hard for 1 second at full extension, then return slowly.'
    ],
    mistakes: 'Arching lower back to heave weight; swinging leg rapidly.'
  },
  glute_bridge: {
    name: 'Dumbbell / Bodyweight Glute Bridge',
    primary: 'glutes',
    secondary: ['hamstrings'],
    weightFactor: 0.35,
    steps: [
      'Lie flat on back with knees bent and feet flat on floor hip-width apart.',
      'Hold dumbbell across pelvis if weighted.',
      'Drive through heels to lift hips upward until knees, hips, and shoulders align.',
      'Squeeze glutes tightly at top for 2 seconds, then lower.'
    ],
    mistakes: 'Over-arching lumbar spine; driving through toes instead of heels.'
  },
  abductor: {
    name: 'Seated Hip Abductor Machine',
    primary: 'glutes',
    secondary: [],
    weightFactor: 0.45,
    steps: [
      'Sit with back flat (or lean slightly forward) and pads against outer knees.',
      'Push knees outward against pads as wide as possible.',
      'Hold peak abduction for 1 full second to target gluteus medius.',
      'Return slowly under resistance.'
    ],
    mistakes: 'Letting weights slam together; using torso momentum to swing.'
  },
  step_up: {
    name: 'Dumbbell Box Step-Up',
    primary: 'glutes',
    secondary: ['quads'],
    weightFactor: 0.15, // per dumbbell
    steps: [
      'Stand facing knee-height plyo box or bench holding dumbbells.',
      'Place whole foot on box and lean torso slightly forward.',
      'Drive through lead heel to step straight up without jumping off back foot.',
      'Step down slowly under control.'
    ],
    mistakes: 'Springing off bottom calf; placing only toe on the box.'
  },

  // ----------------------------------------------------
  // CALVES
  // ----------------------------------------------------
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
  seated_cf: {
    name: 'Seated Calf Raise',
    primary: 'calves',
    secondary: [],
    weightFactor: 0.50,
    steps: [
      'Sit with thighs secured snugly under pad, balls of feet on edge of block.',
      'Release safety bar and lower heels down into a deep 2-second stretch.',
      'Press up through balls of feet to maximum peak height to target soleus.',
      'Pause at top for 1 full second, then lower with control.'
    ],
    mistakes: 'Bouncing fast at bottom; setting knee pad too loose.'
  },
  leg_press_cf: {
    name: 'Leg Press Calf Extension',
    primary: 'calves',
    secondary: [],
    weightFactor: 0.90,
    steps: [
      'Sit on leg press and place balls of feet on bottom edge of footplate.',
      'Keep knees almost straight with a micro-bend (never lock out).',
      'Extend ankles forward to push plate away.',
      'Slowly allow plate to push toes back into a deep calf stretch.'
    ],
    mistakes: 'Slipping off plate (ensure dry shoes); hyperextending knees.'
  },
  donkey_cf: {
    name: 'Donkey Calf Raise',
    primary: 'calves',
    secondary: [],
    weightFactor: 0.60,
    steps: [
      'Bend forward at hips (~90°) on donkey calf machine or with pads on lower back.',
      'Place balls of feet on block and lower heels for full gastrocnemius stretch.',
      'Raise up as high as possible on toes, squeezing calves at top.'
    ],
    mistakes: 'Bouncing; bending knees.'
  },

  // ----------------------------------------------------
  // ABS / CORE
  // ----------------------------------------------------
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
  ab_wheel: {
    name: 'Ab Wheel Rollout',
    primary: 'abs',
    secondary: ['shoulders'],
    weightFactor: 0.0, // bodyweight
    steps: [
      'Kneel on mat with hands gripping wheel handles directly below shoulders.',
      'Tuck pelvis and brace abs rock-hard.',
      'Roll wheel slowly forward, extending body as far as possible without lower back sagging.',
      'Pull wheel back toward knees using abdominal contraction.'
    ],
    mistakes: 'Lower back dipping/swaying; leading with hips backward instead of abs.'
  },
  plank: {
    name: 'Core Plank (Timed)',
    primary: 'abs',
    secondary: ['shoulders'],
    weightFactor: 0.0, // bodyweight
    steps: [
      'Rest on forearms with elbows directly under shoulders, feet together.',
      'Keep body in a perfectly straight line from head to heels.',
      'Squeeze glutes, quads, and pull belly button up toward spine.',
      'Hold position with deep rhythmic breathing.'
    ],
    mistakes: 'Sagging hips; hiking butt high in air; holding breath.'
  },
  r_twist: {
    name: 'Russian Twist (Weighted)',
    primary: 'abs',
    secondary: [],
    weightFactor: 0.08,
    steps: [
      'Sit on floor with knees bent and feet hovered slightly off ground.',
      'Lean torso back ~45° holding a weight plate or dumbbell at chest.',
      'Rotate torso from side to side, bringing weight near hip on each turn.',
      'Keep rotation driven by obliques, not arms.'
    ],
    mistakes: 'Moving only arms without torso rotation; rounding lower back excessively.'
  },
  woodchopper: {
    name: 'Cable Woodchopper',
    primary: 'abs',
    secondary: ['shoulders'],
    weightFactor: 0.15,
    steps: [
      'Set cable handle to shoulder or high height, stand side-on.',
      'Grip handle with both hands, arms extended.',
      'Rotate torso diagonally across body down toward opposite knee.',
      'Control rotation back to starting position.'
    ],
    mistakes: 'Bending arms into a pull; twisting knees instead of torso.'
  },
  dec_crunch: {
    name: 'Decline Bench Crunch',
    primary: 'abs',
    secondary: [],
    weightFactor: 0.0, // bodyweight
    steps: [
      'Hook feet under pads of a decline bench and cross hands over chest.',
      'Lower torso back until shoulders almost touch bench.',
      'Curl torso upward by flexing abs, rolling ribs toward pelvis.',
      'Squeeze abs hard at top before slowly lowering.'
    ],
    mistakes: 'Yanking on back of neck; arching lower back.'
  },

  // ----------------------------------------------------
  // FOREARMS
  // ----------------------------------------------------
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
  },
  rev_curl: {
    name: 'Reverse Barbell / EZ-Bar Curl',
    primary: 'forearms',
    secondary: ['biceps'],
    weightFactor: 0.20,
    steps: [
      'Stand tall holding EZ-bar with an overhand (pronated) grip, palms facing down.',
      'Keep elbows pinned tightly to sides.',
      'Curl bar up toward chest using brachioradialis and forearm extensors.',
      'Lower slowly under full negative control.'
    ],
    mistakes: 'Swinging torso; flaring elbows out.'
  },
  rev_wc: {
    name: 'Reverse Wrist Curl (Extension)',
    primary: 'forearms',
    secondary: [],
    weightFactor: 0.08,
    steps: [
      'Rest forearms on thighs with wrists hanging over knees, palms facing down.',
      'Hold light dumbbells or bar and curl wrists straight up toward ceiling.',
      'Hold top contraction for 1 second, then lower.'
    ],
    mistakes: 'Using too heavy weight; bouncing.'
  },
  farmers_walk: {
    name: "Farmer's Walk / Carry",
    primary: 'forearms',
    secondary: ['shoulders', 'back'],
    weightFactor: 0.35, // per dumbbell
    steps: [
      'Pick up two heavy dumbbells or trap bar with tall posture.',
      'Pull shoulders down and back, brace abs, squeeze handles with maximum grip.',
      'Walk forward with steady, deliberate steps for 30-60 seconds.',
      'Set weights down with flat back.'
    ],
    mistakes: 'Slouching shoulders forward; swaying side to side; rushing steps.'
  },
  wrist_roller: {
    name: 'Wrist Roller',
    primary: 'forearms',
    secondary: [],
    weightFactor: 0.08,
    steps: [
      'Hold wrist roller with arms extended at shoulder height.',
      'Roll weight plate up by alternating wrist extensions.',
      'Once weight reaches top, slowly roll it back down under control.'
    ],
    mistakes: 'Dropping arms; letting roller unwind fast.'
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

// Workout Splits & Routine Templates
export const WORKOUT_SPLITS = [
  ['Push A', ['bp', 'sp', 'ip', 'lr', 'pd', 'cc']],
  ['Pull A', ['lt', 'br', 'fp', 'bc', 'hc', 'wc']],
  ['Legs A', ['sq', 'rd', 'lc', 'cf']],
  ['Push B', ['ip', 'sp', 'lr', 'oe', 'pd', 'hl']],
  ['Pull B', ['cr', 'lt', 'fp', 'hc', 'bc', 'wc']],
  ['Legs B', ['lp', 'ht', 'rd', 'cf']],
  ['Upper Body A', ['bp', 'br', 'sp', 'lt', 'sk_crusher', 'bc']],
  ['Lower Body A', ['sq', 'rd', 'lp', 'lc', 'cf', 'hl']],
  ['Upper Body B', ['ibp', 'cr', 'dsp', 'pu_pull', 'pd', 'hc']],
  ['Lower Body B', ['hack_sq', 'ht', 'le', 'db_rdl', 'seated_cf', 'cc']],
  ['Full Body', ['sq', 'bp', 'br', 'sp', 'rd', 'cc']],
  ['Chest & Triceps', ['bp', 'ip', 'cfly', 'cdp', 'pd', 'sk_crusher']],
  ['Back & Biceps', ['dl', 'lt', 'tbr', 'cr', 'bc', 'hc']],
  ['Shoulders & Arms', ['sp', 'lr', 'fp', 'bc', 'pd', 'hc', 'oe']],
  ['Legs & Abs', ['sq', 'lp', 'rd', 'lc', 'cf', 'hl', 'ab_wheel']]
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
