// IronLog State Management & Persistence

import { MEASUREMENT_KEYS, MUSCLE_GROUPS, MUSCLE_TO_MEASUREMENT, getMuscleScore } from './exercises.js';

const STORAGE_KEY = 'il';

export const DEFAULT_STATE = {
  p: null, // Profile: { g: 'm', a: 28, h: 178, w: 75, o: 'gain', l: 'i', pri: [] }
  w: [],   // Weight log: [{ d: '2026-10-24', w: 75.0 }]
  m: [],   // Body measurements: [{ d: '2026-10-24', v: { chest: 100, ... } }]
  s: [],   // Completed workouts: [{ d: '2026-10-24', n: 'Push A', start, end, sets: [] }]
  a: null, // Active workout session
  pr: null,// Prediction for next month
  c: null, // Comparison of last month's prediction vs actual
  ov: null,// Day override: { d: '2026-10-24', i: 0 }
  x: null, // Daily exercise modifications: { d: '2026-10-24', rm: [], add: [], fo: [] }
  u: 'cm', // Length unit: 'cm' | 'in'
  wu: 'kg',// Weight unit: 'kg' | 'lbs'
  theme: 'dark', // 'dark' | 'light' | 'system'
  restTimerDuration: 90, // seconds
  soundEnabled: true,
  hapticsEnabled: true,
  customExercises: {}
};

let AppState = { ...DEFAULT_STATE };

/**
 * Returns ISO date string 'YYYY-MM-DD' for today (local time)
 */
export function getTodayDate() {
  return new Date().toLocaleDateString('en-CA');
}

/**
 * Loads state from localStorage
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      AppState = {
        ...DEFAULT_STATE,
        ...parsed,
        // Ensure default settings exist if migrating from old version
        u: parsed.u || 'cm',
        wu: parsed.wu || 'kg',
        theme: parsed.theme || 'dark',
        restTimerDuration: parsed.restTimerDuration || 90,
        soundEnabled: parsed.soundEnabled ?? true,
        hapticsEnabled: parsed.hapticsEnabled ?? true,
        customExercises: parsed.customExercises || {}
      };
    } else {
      AppState = { ...DEFAULT_STATE };
    }
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
    AppState = { ...DEFAULT_STATE };
  }
  return AppState;
}

/**
 * Saves current state to localStorage
 */
export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState));
  } catch (err) {
    console.error('Failed to persist state to localStorage:', err);
  }
}

/**
 * Returns reference to current AppState
 */
export function getState() {
  return AppState;
}

/**
 * Gets the most recent recorded body weight in kg
 */
export function getLatestWeight() {
  if (AppState.w && AppState.w.length > 0) {
    return AppState.w[AppState.w.length - 1].w;
  }
  return AppState.p ? AppState.p.w : 70;
}

/**
 * Unit Conversion Helpers
 */
export function formatWeight(kgVal, unit = AppState.wu) {
  if (kgVal == null || isNaN(kgVal)) return '--';
  if (unit === 'lbs') {
    return (kgVal * 2.20462).toFixed(1);
  }
  return Number(kgVal).toFixed(1);
}

export function parseWeightInput(inputVal, unit = AppState.wu) {
  const val = parseFloat(inputVal);
  if (isNaN(val) || val <= 0) return null;
  if (unit === 'lbs') {
    return +(val / 2.20462).toFixed(2);
  }
  return +val.toFixed(2);
}

export function formatLength(cmVal, unit = AppState.u) {
  if (cmVal == null || isNaN(cmVal)) return '--';
  if (unit === 'in') {
    return (cmVal / 2.54).toFixed(1);
  }
  return Number(cmVal).toFixed(1);
}

export function parseLengthInput(inputVal, unit = AppState.u) {
  const val = parseFloat(inputVal);
  if (isNaN(val) || val <= 0) return null;
  if (unit === 'in') {
    return +(val * 2.54).toFixed(1);
  }
  return +val.toFixed(1);
}

/**
 * Recalculates 1-month future projection based on current measurements, goal, and experience level
 */
export function updateProjection() {
  if (!AppState.p || !AppState.m.length) return;
  const lastM = AppState.m[AppState.m.length - 1].v;
  if (!lastM) return;

  const baseGainRates = { b: 0.006, i: 0.003, a: 0.0015 };
  let rate = (baseGainRates[AppState.p.l] || 0.003) * (AppState.p.o === 'lose' ? 0.5 : 1.0);

  const expected = {};
  MEASUREMENT_KEYS.forEach(k => {
    const muscle = MUSCLE_GROUPS.find(m => MUSCLE_TO_MEASUREMENT[m] === k);
    const score = muscle ? getMuscleScore(muscle, AppState) : 1;
    const isPriority = (AppState.p.pri || []).some(m => MUSCLE_TO_MEASUREMENT[m] === k);
    const lagBoost = (score && score < 0.93) || isPriority ? 1.5 : 1.0;

    if (k === 'waist') {
      expected[k] = +(lastM[k] * (AppState.p.o === 'lose' ? 0.985 : 1.003)).toFixed(2);
    } else {
      expected[k] = +(lastM[k] * (1 + rate * lagBoost)).toFixed(2);
    }
  });

  // Extrapolate weight trend over past 14 days
  const w = AppState.w;
  let weightChangeForecast = 0;
  if (w && w.length >= 7) {
    const diff = w[w.length - 1].w - w[Math.max(0, w.length - 14)].w;
    const days = Math.max(1, Math.min(13, w.length - 1));
    weightChangeForecast = (diff / days) * 30;
  } else {
    weightChangeForecast = { gain: 0.8, lose: -2.0, both: 0.0 }[AppState.p.o] || 0;
  }

  const currentW = getLatestWeight();
  AppState.pr = {
    d: getTodayDate(),
    e: expected,
    wt: +(currentW + weightChangeForecast).toFixed(1)
  };
}

/**
 * Export full state as JSON file
 */
export function exportStateJson() {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(AppState, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `ironlog-backup-${getTodayDate()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Import state from JSON string
 */
export function importStateJson(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid JSON format');
    }
    // Verify core structure
    if (!('p' in parsed) && !('w' in parsed)) {
      throw new Error('File does not appear to be an IronLog backup');
    }
    AppState = {
      ...DEFAULT_STATE,
      ...parsed
    };
    saveState();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Export completed workouts as CSV
 */
export function exportWorkoutsCsv(exercisesDict) {
  if (!AppState.s || !AppState.s.length) {
    return false;
  }

  const rows = [['Date', 'Workout', 'Duration (min)', 'Exercise', 'Weight (kg)', 'Weight (lbs)', 'Reps']];
  AppState.s.forEach(session => {
    const duration = Math.round((session.end - session.start) / 60000);
    session.sets.forEach(set => {
      const exName = exercisesDict[set.ex]?.name || AppState.customExercises?.[set.ex]?.name || set.ex;
      const wKg = set.w;
      const wLbs = +(set.w * 2.20462).toFixed(1);
      rows.push([session.d, `"${session.n}"`, duration, `"${exName}"`, wKg, wLbs, set.r]);
    });
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
  const anchor = document.createElement('a');
  anchor.setAttribute('href', encodeURI(csvContent));
  anchor.setAttribute('download', `ironlog-workouts-${getTodayDate()}.csv`);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  return true;
}

/**
 * Reset all state back to clean slate
 */
export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  AppState = { ...DEFAULT_STATE };
}

