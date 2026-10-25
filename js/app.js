// IronLog Main Application Controller

import { 
  DEFAULT_EXERCISES, 
  MUSCLE_GROUPS, 
  MUSCLE_TO_MEASUREMENT, 
  GOLDEN_RATIOS, 
  MEASUREMENT_KEYS, 
  WORKOUT_SPLITS,
  getMuscleScore,
  getMuscleRecovery,
  getTargetSets,
  getSuggestedWeight
} from './exercises.js';

import {
  loadState,
  saveState,
  getState,
  getTodayDate,
  getLatestWeight,
  formatWeight,
  parseWeightInput,
  formatLength,
  parseLengthInput,
  updateProjection,
  exportStateJson,
  importStateJson,
  exportWorkoutsCsv,
  resetState
} from './state.js';

import {
  startRestTimer,
  togglePauseRestTimer,
  adjustRestTimer,
  stopRestTimer,
  isRestTimerRunning,
  getRestTimeRemaining,
  formatTime,
  triggerHaptic
} from './timer.js';

import { ICONS } from './icons.js';

import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  getSupabaseConfig,
  setSupabaseConfig,
  isSupabaseConfigured,
  resetPasswordForEmail,
  updatePassword
} from './supabase.js';

import {
  initSync,
  pullFromCloud,
  pushToCloud,
  getSyncStatus,
  SYNC_STATUS
} from './sync.js';

// DOM Element shortcuts
const $ = (id) => document.getElementById(id);

let currentTab = 'today';
let bodyView = 'f'; // 'f' for front, 'b' for back
let bodyPointerX = 0;
let exerciseSearchQuery = '';
let exerciseFilterMuscle = 'all';

// Initialize App
export function initApp() {
  loadState();
  applyTheme();
  renderApp();
  setupTimerInterval();
  initSync(
    () => { applyTheme(); renderApp(); },
    () => {
      // PASSWORD_RECOVERY event fired: user clicked the reset link in their email.
      // Supabase has granted a temporary session — show the set-new-password form.
      history.replaceState(null, '', window.location.pathname);
      IronLog.showPasswordResetForm();
    }
  );
}

/**
 * Apply theme to document
 */
function applyTheme() {
  const state = getState();
  const theme = state.theme || 'dark';
  const root = document.documentElement;

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

/**
 * Toast Notification
 */
export function showToast(message) {
  const existing = document.querySelector('.toast-notice');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notice';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

/**
 * Open Modal
 */
export function openModal(htmlContent) {
  const md = $('md');
  const mb = $('mb');
  mb.innerHTML = htmlContent;
  md.style.display = 'flex';
  setTimeout(() => md.classList.add('show'), 10);
}

/**
 * Close Modal
 */
export function closeModal() {
  const md = $('md');
  md.classList.remove('show');
  setTimeout(() => {
    md.style.display = 'none';
    $('mb').innerHTML = '';
  }, 200);
}

/**
 * Format date for header
 */
function getFormattedHeaderDate() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

/**
 * Get active workout today
 */
function getTodayWorkout() {
  const state = getState();
  const todayStr = getTodayDate();
  if (state.ov && state.ov.d === todayStr) {
    return state.ov.i < 0 ? null : WORKOUT_SPLITS[state.ov.i];
  }
  const dayIndex = (new Date().getDay() + 6) % 7; // Monday=0 ... Sunday=6
  return dayIndex > 5 ? null : WORKOUT_SPLITS[dayIndex];
}

/**
 * Daily exercise modifications list
 */
function getDailyMods() {
  const state = getState();
  const todayStr = getTodayDate();
  if (!state.x || state.x.d !== todayStr) {
    state.x = { d: todayStr, rm: [], add: [], fo: [] };
  }
  return state.x;
}

/**
 * Helper to get combined exercises dict (default + custom)
 */
function getAllExercises() {
  const state = getState();
  return { ...DEFAULT_EXERCISES, ...(state.customExercises || {}) };
}

/**
 * Renders Top Header
 */
function renderHeader() {
  const state = getState();
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const syncInfo = getSyncStatus();

  let syncLabel = 'Sync';
  let syncDotClass = 'guest';
  let syncTooltip = 'Sign in to sync your workouts across devices';

  if (syncInfo.status === SYNC_STATUS.SYNCING) {
    syncLabel = 'Syncing...';
    syncDotClass = 'syncing';
    syncTooltip = 'Uploading changes to cloud...';
  } else if (syncInfo.status === SYNC_STATUS.SYNCED && syncInfo.user) {
    const emailPrefix = syncInfo.user.email ? syncInfo.user.email.split('@')[0] : 'Synced';
    syncLabel = emailPrefix;
    syncDotClass = 'synced';
    syncTooltip = `Signed in as ${syncInfo.user.email}. Workouts are backed up.`;
  } else if (syncInfo.status === SYNC_STATUS.OFFLINE) {
    syncLabel = 'Offline';
    syncDotClass = 'offline';
    syncTooltip = 'Offline mode. Changes are saved locally.';
  } else if (syncInfo.status === SYNC_STATUS.UNCONFIGURED) {
    syncLabel = 'Cloud Setup';
    syncDotClass = 'guest';
    syncTooltip = 'Connect Supabase in Settings to enable cloud backup';
  }
  
  return `
    <header class="app-header">
      <div class="app-brand">
        <img src="./icons/icon.svg" alt="IronLog Logo" class="app-logo">
        <div>
          <h1 style="font-size:24px;letter-spacing:1px">IRONLOG</h1>
          <div class="mu-sm">${getFormattedHeaderDate()}</div>
        </div>
      </div>
      <div class="app-actions">
        <button class="sync-pill" onclick="IronLog.openAuthModal()" title="${syncTooltip}">
          <span class="sync-dot ${syncDotClass}"></span>
          <span>${syncLabel}</span>
        </button>
        <button class="icon-btn" onclick="IronLog.toggleTheme()" title="Toggle Theme">
          ${isDark ? ICONS.sun : ICONS.moon}
        </button>
        <button class="icon-btn" onclick="IronLog.setTab('settings')" title="Settings">
          ${ICONS.settings}
        </button>
      </div>
    </header>
  `;
}

/**
 * Renders Bottom Navigation
 */
function renderNavigation() {
  const state = getState();
  if (!state.p) return '';

  const tabs = [
    { id: 'today', label: 'Today', icon: ICONS.today },
    { id: 'weight', label: 'Weight', icon: ICONS.weight },
    { id: 'body', label: 'Body', icon: ICONS.body },
    { id: 'progress', label: 'Progress', icon: ICONS.progress },
    { id: 'exercises', label: 'Exercises', icon: ICONS.exercises }
  ];

  return tabs.map(t => `
    <button class="${currentTab === t.id ? 'on' : ''}" onclick="IronLog.setTab('${t.id}')">
      ${t.icon}
      <span>${t.label}</span>
    </button>
  `).join('');
}

/**
 * Render Rest Timer Floating Bar if active
 */
function renderRestTimerBar() {
  if (!isRestTimerRunning()) return '';
  const remaining = getRestTimeRemaining();
  
  return `
    <div class="rest-timer-bar">
      <span style="display:flex;align-items:center;color:var(--ac)">${ICONS.timer}</span>
      <div style="flex:1">
        <div class="mu-sm" style="font-weight:700;text-transform:uppercase">Resting</div>
        <div class="rest-timer-time" id="restTimerDisplay">${formatTime(remaining)}</div>
      </div>
      <button class="icon-btn sm" onclick="IronLog.adjustRest(-15)" title="Minus 15s">-15s</button>
      <button class="icon-btn sm" onclick="IronLog.adjustRest(30)" title="Plus 30s">+30s</button>
      <button class="icon-btn sm" onclick="IronLog.toggleRestPause()" id="restPauseBtn">
        ${ICONS.pause}
      </button>
      <button class="icon-btn sm" onclick="IronLog.dismissRest()" style="color:var(--rd)">
        ${ICONS.close}
      </button>
    </div>
  `;
}

/**
 * Quick Weight Input Widget
 */
function renderQuickWeightWidget() {
  const state = getState();
  const currentKg = getLatestWeight();
  const unit = state.wu;
  const displayVal = formatWeight(currentKg, unit);

  return `
    <div class="c">
      <div class="r sb">
        <div>
          <b>Today’s Weight (${unit})</b>
          <div class="mu-sm">Last: ${displayVal} ${unit}</div>
        </div>
      </div>
      <div class="r" style="margin-top:10px">
        <input id="quickWeightInput" type="number" step="${unit === 'lbs' ? '0.2' : '0.1'}" 
               placeholder="${displayVal}" value="${displayVal}" style="flex:1">
        <button onclick="IronLog.saveQuickWeight()">Save</button>
      </div>
    </div>
  `;
}

/**
 * VIEW: Authentication Landing (Initial Website Open)
 */
function renderAuthLandingView() {
  return `
    <div style="min-height:92vh;display:flex;flex-direction:column;justify-content:center;padding:20px;max-width:460px;margin:auto">
      <div style="text-align:center;margin-bottom:20px">
        <img src="./icons/icon.svg" alt="IronLog Logo" style="width:64px;height:64px;border-radius:14px;margin-bottom:10px;box-shadow:0 8px 24px rgba(228,83,26,0.3)">
        <h1 style="font-size:32px;letter-spacing:1.5px;margin:0">IRONLOG</h1>
        <div class="mu-sm" style="font-size:13px;margin-top:4px">Hypertrophy Tracker & Aesthetic Engine</div>
      </div>

      <div class="c" style="margin:0;padding:20px">
        <div class="auth-tabs">
          <div id="tab_signin" class="auth-tab ${IronLog.currentAuthTab === 'signin' ? 'active' : ''}" onclick="IronLog.switchAuthTab('signin')">Sign In</div>
          <div id="tab_signup" class="auth-tab ${IronLog.currentAuthTab === 'signup' ? 'active' : ''}" onclick="IronLog.switchAuthTab('signup')">Create Account</div>
        </div>

        <div id="auth_error" style="display:none;color:var(--rd);font-size:13px;margin-bottom:12px;padding:8px 10px;background:rgba(239,68,68,0.1);border-radius:6px"></div>

        <label>Email Address</label>
        <input id="auth_email" type="email" placeholder="you@example.com" autocomplete="email" required>

        <label>Password</label>
        <input id="auth_password" type="password" placeholder="At least 6 characters" autocomplete="current-password" required>

        <button id="auth_submit_btn" class="w" style="margin-top:14px" onclick="IronLog.submitAuth()">
          ${IronLog.currentAuthTab === 'signup' ? 'Create Account' : 'Sign In'}
        </button>

        <div style="text-align:right;margin-top:8px">
          <button type="button" class="link-btn" onclick="IronLog.handleForgotPassword()" style="background:none;border:none;color:var(--mu);font-size:12px;cursor:pointer;padding:0;text-decoration:underline">
            Forgot password?
          </button>
        </div>

        <div style="display:flex;align-items:center;margin:16px 0;gap:10px">
          <div style="flex:1;height:1px;background:var(--bd)"></div>
          <span class="mu-sm" style="font-size:11px;text-transform:uppercase">Or</span>
          <div style="flex:1;height:1px;background:var(--bd)"></div>
        </div>

        <button type="button" class="btn-google" onclick="IronLog.handleGoogleSignIn()">
          ${ICONS.google}
          <span>Continue with Google</span>
        </button>
      </div>

      <div style="margin-top:16px;text-align:center">
        <button class="g" style="width:100%;padding:12px;font-size:15px;background:var(--cd)" onclick="IronLog.enterAsGuest()">
          Continue as Guest (Enter without login) →
        </button>
        <div class="mu-sm" style="margin-top:8px;font-size:12px;line-height:1.4">
          Browse all exercises and training routines as a guest.<br>
          <span style="color:var(--ac);font-weight:600">Note: Account is required to check in and record workouts.</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * VIEW: Onboarding / Profile Setup
 */
function renderOnboardingView() {
  return `
    ${renderHeader()}
    <div class="c c-highlight">
      <h2>Welcome to IronLog</h2>
      <p class="mu">Adaptive Push-Pull-Legs training with Golden-era aesthetic targets, muscle recovery tracking, and smart progressive overload.</p>
      
      <label>Gender</label>
      <select id="ob_gender">
        <option value="m">Male (Target Golden Ratios)</option>
        <option value="f">Female (Target Golden Ratios)</option>
        <option value="o">Other</option>
      </select>

      <div class="gr">
        <div>
          <label>Age</label>
          <input id="ob_age" type="number" value="26">
        </div>
        <div>
          <label>Height (cm)</label>
          <input id="ob_height" type="number" value="178">
        </div>
      </div>

      <div class="gr">
        <div>
          <label>Weight (kg)</label>
          <input id="ob_weight" type="number" step="0.1" value="75">
        </div>
        <div>
          <label>Primary Goal</label>
          <select id="ob_goal">
            <option value="gain">Build Muscle</option>
            <option value="lose">Lose Fat</option>
            <option value="both">Recomposition</option>
          </select>
        </div>
      </div>

      <label>Experience Level</label>
      <select id="ob_level">
        <option value="b">Beginner (&lt; 1 year lifting)</option>
        <option value="i" selected>Intermediate (1–3 years lifting)</option>
        <option value="a">Advanced (3+ years lifting)</option>
      </select>

      <div class="mu-sm" style="margin-top:12px">
        Schedule: 6-day Push-Pull-Legs split (Monday to Saturday), Sunday Rest. You can customize daily workouts anytime.
      </div>

      <button class="w" style="margin-top:16px" onclick="IronLog.saveOnboarding()">
        Start Tracking
      </button>
    </div>
  `;
}

/**
 * VIEW: Today's Workout
 */
function renderTodayView() {
  const state = getState();
  const allEx = getAllExercises();
  const todayWorkout = getTodayWorkout();
  const todayStr = getTodayDate();
  const mods = getDailyMods();
  const unit = state.wu;
  const syncInfo = getSyncStatus();
  const isLoggedIn = Boolean(syncInfo.user);

  let html = renderHeader();

  // Active workout or Check-in status
  if (state.a) {
    const elapsedSecs = Math.floor((Date.now() - state.a.start) / 1000);
    html += `
      <div class="c c-highlight">
        <div class="r sb">
          <div>
            <div class="mu-sm" style="text-transform:uppercase;font-weight:700;color:var(--ac)">● Workout In Progress</div>
            <h2 id="activeTimer" style="font-size:32px;letter-spacing:1px">${formatTime(elapsedSecs)}</h2>
          </div>
          <button onclick="IronLog.checkoutWorkout()" style="background:var(--gn);color:#fff">
            Finish Workout
          </button>
        </div>
      </div>
    `;
  } else {
    html += `
      <div class="c">
        <div class="r sb">
          <div>
            <div class="mu-sm" style="text-transform:uppercase;font-weight:700">Scheduled Today</div>
            <h2>${todayWorkout ? todayWorkout[0] : 'Rest Day'}</h2>
          </div>
          ${todayWorkout ? `
            <div style="text-align:right">
              <button onclick="IronLog.checkinWorkout()">${isLoggedIn ? ICONS.play : '🔒'} Start Workout</button>
              ${!isLoggedIn ? `<div class="mu-sm" style="font-size:11px;margin-top:3px">Login to check in</div>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // Day selector override
  const currentOverrideVal = state.ov && state.ov.d === todayStr ? state.ov.i : 'auto';
  html += `
    <div class="c" style="padding:12px 16px">
      <div class="r sb">
        <label style="margin:0">Change Workout</label>
        <select onchange="IronLog.setDayOverride(this.value)" style="width:auto;min-width:180px;padding:6px 10px">
          <option value="auto" ${currentOverrideVal === 'auto' ? 'selected' : ''}>Automatic (by weekday)</option>
          ${WORKOUT_SPLITS.map((s, idx) => `
            <option value="${idx}" ${currentOverrideVal === idx ? 'selected' : ''}>${s[0]}</option>
          `).join('')}
          <option value="-1" ${currentOverrideVal === -1 ? 'selected' : ''}>Rest Day</option>
        </select>
      </div>
    </div>
  `;

  if (todayWorkout) {
    let exerciseIds = [...todayWorkout[1]];
    // Auto-add hip thrust for female legs A
    if (state.p.g === 'f' && todayWorkout[0] === 'Legs A' && !exerciseIds.includes('ht')) {
      exerciseIds.push('ht');
    }
    // Add custom additions
    exerciseIds = exerciseIds.concat(mods.add).filter((id, pos, arr) => !mods.rm.includes(id) && arr.indexOf(id) === pos);

    const readyExercises = [];
    const recoveringExercises = [];

    exerciseIds.forEach(id => {
      const ex = allEx[id];
      if (!ex) return;
      const rec = getMuscleRecovery(ex.primary, state, allEx);
      if (rec.status === 'red' && !mods.fo.includes(id)) {
        recoveringExercises.push(id);
      } else {
        readyExercises.push(id);
      }
    });

    // Prioritize lagging muscles
    readyExercises.sort((a, b) => {
      const scoreA = getMuscleScore(allEx[a].primary, state) ?? 1;
      const scoreB = getMuscleScore(allEx[b].primary, state) ?? 1;
      return scoreA - scoreB;
    });

    // Render Ready Exercises
    readyExercises.forEach(id => {
      const ex = allEx[id];
      const targetSetsCount = getTargetSets(ex.primary, state);
      const loggedSets = state.a ? state.a.sets.filter(s => s.ex === id) : [];
      const score = getMuscleScore(ex.primary, state);
      const isPriority = (state.p.pri || []).includes(ex.primary);
      const repRange = state.p.g === 'f' ? '8–15' : '6–12';

      // Suggested weight
      const lastSuggestedKg = loggedSets.length ? loggedSets[loggedSets.length - 1].w : getSuggestedWeight(id, state, allEx);
      const suggestedDisplayVal = formatWeight(lastSuggestedKg, unit);
      const stepVal = unit === 'lbs' ? '5' : '1.25';

      html += `
        <div class="c">
          <div class="r sb">
            <h3 style="cursor:pointer" onclick="IronLog.showExerciseGuide('${id}')">${ex.name}</h3>
            <div class="r">
              <button class="g sm" onclick="IronLog.showExerciseGuide('${id}')">Guide</button>
              <button class="g sm" onclick="IronLog.skipExercise('${id}')" title="Skip this exercise">Skip</button>
            </div>
          </div>

          <div class="r" style="margin:6px 0;flex-wrap:wrap">
            <span class="t">${ex.primary}</span>
            ${score && score < 0.93 ? '<span class="t t-ac">Below Target (+1 set)</span>' : ''}
            ${score && score >= 1.02 ? '<span class="t">At Target (2 sets)</span>' : ''}
            ${isPriority ? '<span class="t t-ac">Priority Focus (+1 set)</span>' : ''}
          </div>

          <div class="mu-sm" style="margin-bottom:8px">
            Target: <b>${targetSetsCount} sets</b> · <b>${repRange} reps</b>
          </div>

          <!-- Logged Sets Chips -->
          <div>
            ${loggedSets.map((s, sIdx) => `
              <span class="ch">
                <b>${formatWeight(s.w, unit)} ${unit}</b> × ${s.r} reps
                ${state.a ? `<span class="del-set" onclick="IronLog.deleteSet('${id}', ${sIdx})" title="Remove set">×</span>` : ''}
              </span>
            `).join('')}
          </div>

          <!-- Active Set Logger -->
          ${state.a ? (
            loggedSets.length < targetSetsCount ? `
              <div class="r" style="margin-top:12px;align-items:flex-end">
                <div style="flex:1">
                  <label>Weight (${unit})</label>
                  <div class="input-stepper">
                    <button type="button" onclick="IronLog.stepInput('w_${id}', -${stepVal})">-</button>
                    <input id="w_${id}" type="number" step="${stepVal}" value="${suggestedDisplayVal}">
                    <button type="button" onclick="IronLog.stepInput('w_${id}', ${stepVal})">+</button>
                  </div>
                </div>
                <div style="flex:1">
                  <label>Reps</label>
                  <div class="input-stepper">
                    <button type="button" onclick="IronLog.stepInput('r_${id}', -1)">-</button>
                    <input id="r_${id}" type="number" value="10">
                    <button type="button" onclick="IronLog.stepInput('r_${id}', 1)">+</button>
                  </div>
                </div>
                <button onclick="IronLog.logSet('${id}')" style="height:42px">
                  Log Set
                </button>
              </div>
            ` : `
              <div class="r sb" style="margin-top:10px;padding-top:6px;border-top:1px dashed var(--bd)">
                <span class="t t-gn">Completed ✓ (${loggedSets.length}/${targetSetsCount} sets)</span>
                <button class="g sm" onclick="IronLog.logExtraSet('${id}')">+ Extra Set</button>
              </div>
            `
          ) : `
            <div class="mu-sm" style="margin-top:8px">Start workout above to log sets.</div>
          `}
        </div>
      `;
    });

    // Recovering Exercises Card
    if (recoveringExercises.length > 0) {
      html += `
        <div class="c" style="border-left:3px solid var(--rd)">
          <b>Omitted: Muscle Still Recovering</b>
          <div class="mu-sm">These exercises were filtered to allow adequate muscle protein synthesis & recovery (&lt; 36h).</div>
          <div style="margin-top:8px">
            ${recoveringExercises.map(id => {
              const ex = allEx[id];
              const rec = getMuscleRecovery(ex.primary, state, allEx);
              return `
                <div class="r sb" style="margin:6px 0;padding:6px 0;border-bottom:1px solid var(--bd)">
                  <span class="mu">${ex.name} (${ex.primary} - ${rec.hours}h ago)</span>
                  <button class="g sm" onclick="IronLog.forceExercise('${id}')">Do Anyway</button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // Add Any Exercise dropdown
    const availableToAdd = Object.keys(allEx).filter(i => !exerciseIds.includes(i));
    availableToAdd.sort((a, b) => (allEx[a]?.name || '').localeCompare(allEx[b]?.name || ''));
    html += `
      <div class="c">
        <b>Customize Workout</b>
        <div class="mu-sm">Want to perform another movement? Select any exercise from your library:</div>
        <select onchange="IronLog.addExerciseToToday(this.value); this.value='';" style="margin-top:8px">
          <option value="">+ Add Exercise to Today...</option>
          ${availableToAdd.map(i => `<option value="${i}">${allEx[i].name} (${allEx[i].primary})</option>`).join('')}
        </select>
      </div>
    `;
  }

  html += renderQuickWeightWidget();
  return html;
}

/**
 * VIEW: Weight Tracking & SVG Chart
 */
function renderWeightView() {
  const state = getState();
  const unit = state.wu;
  const weights = state.w || [];
  
  // Calculate 7-day rolling average
  const rollingAverages = weights.map((entry, idx) => {
    const window = weights.slice(Math.max(0, idx - 6), idx + 1);
    const avg = window.reduce((sum, item) => sum + item.w, 0) / window.length;
    return avg;
  });

  const recentWeights = weights.slice(-30);
  const recentAverages = rollingAverages.slice(-30);

  let html = renderHeader();
  html += renderQuickWeightWidget();

  if (recentWeights.length > 1) {
    const vals = recentWeights.map(x => unit === 'lbs' ? x.w * 2.20462 : x.w);
    const avgVals = recentAverages.map(x => unit === 'lbs' ? x * 2.20462 : x);
    const allVals = vals.concat(avgVals);
    const minVal = Math.min(...allVals) - 1.0;
    const maxVal = Math.max(...allVals) + 1.0;

    const getX = (idx) => 15 + (idx * 290) / (vals.length - 1);
    const getY = (val) => 110 - ((val - minVal) / (maxVal - minVal)) * 95;
    const pointsStr = (arr) => arr.map((y, i) => `${getX(i).toFixed(1)},${getY(y).toFixed(1)}`).join(' ');

    const diff7 = weights.length >= 2 
      ? (weights[weights.length - 1].w - weights[Math.max(0, weights.length - 8)].w)
      : 0;
    const diff7Display = formatWeight(Math.abs(diff7), unit);
    const sign = diff7 >= 0 ? '+' : '-';

    html += `
      <div class="c">
        <h3>Weight Trend (Past ${vals.length} Entries)</h3>
        <div style="margin:12px 0">
          <svg viewBox="0 0 320 120" style="width:100%;height:auto;overflow:visible">
            <!-- Grid lines -->
            <line x1="15" y1="15" x2="305" y2="15" stroke="var(--bd)" stroke-dasharray="2 2"/>
            <line x1="15" y1="62" x2="305" y2="62" stroke="var(--bd)" stroke-dasharray="2 2"/>
            <line x1="15" y1="110" x2="305" y2="110" stroke="var(--bd)" stroke-dasharray="2 2"/>

            <!-- Daily Line -->
            <polyline points="${pointsStr(vals)}" fill="none" stroke="var(--mu)" stroke-width="1.5" stroke-dasharray="3 3"/>
            <!-- 7-Day Moving Avg Line -->
            <polyline points="${pointsStr(avgVals)}" fill="none" stroke="var(--ac)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- Latest Point Dot -->
            <circle cx="${getX(vals.length - 1)}" cy="${getY(vals[vals.length - 1])}" r="4" fill="var(--ac)"/>
          </svg>
        </div>
        <div class="r sb mu-sm">
          <span>Min: ${minVal.toFixed(1)} ${unit}</span>
          <span style="color:var(--ac)">● Orange: 7-day average</span>
          <span>Max: ${maxVal.toFixed(1)} ${unit}</span>
        </div>
      </div>

      <div class="c">
        <div class="gr">
          <div>
            <div class="mu-sm">Current Weight</div>
            <h2>${formatWeight(getLatestWeight(), unit)} ${unit}</h2>
          </div>
          <div>
            <div class="mu-sm">Past 7 Entries Trend</div>
            <h2 style="color:${diff7 > 0 ? 'var(--yl)' : 'var(--gn)'}">${sign}${diff7Display} ${unit}</h2>
          </div>
        </div>
      </div>
    `;
  } else {
    html += `
      <div class="c">
        <p class="mu">Log your weight on two or more days to generate your rolling 7-day trend chart.</p>
      </div>
    `;
  }

  // Weight History Table
  if (weights.length > 0) {
    html += `
      <div class="c">
        <div class="r sb">
          <h3>Weight History</h3>
          <span class="mu-sm">${weights.length} entries</span>
        </div>
        <table>
          <tr>
            <th>Date</th>
            <th>Weight (${unit})</th>
            <th>Action</th>
          </tr>
          ${weights.slice(-10).reverse().map((entry, idx) => `
            <tr>
              <td>${entry.d}</td>
              <td><b>${formatWeight(entry.w, unit)} ${unit}</b></td>
              <td>
                <button class="g sm" style="color:var(--rd);padding:2px 8px" onclick="IronLog.deleteWeightEntry('${entry.d}')">
                  Delete
                </button>
              </td>
            </tr>
          `).join('')}
        </table>
      </div>
    `;
  }

  return html;
}

/**
 * VIEW: Body Measurements & Golden Ratios
 */
function renderBodyView() {
  const state = getState();
  const unit = state.u;
  const lastEntry = state.m.length ? state.m[state.m.length - 1] : null;
  const daysSinceLast = lastEntry ? (Date.now() - new Date(lastEntry.d)) / (86400 * 1000) : 999;
  const isDue = !lastEntry || daysSinceLast >= 28;

  let html = renderHeader();

  html += `
    <div class="c c-highlight">
      <div class="r sb">
        <h2>Monthly Body Check</h2>
        <div class="r">
          <button class="${unit === 'cm' ? '' : 'g'} sm" onclick="IronLog.setLengthUnit('cm')">cm</button>
          <button class="${unit === 'in' ? '' : 'g'} sm" onclick="IronLog.setLengthUnit('in')">in</button>
        </div>
      </div>

      <div class="mu" style="margin:8px 0">
        ${lastEntry 
          ? (isDue 
              ? `<b style="color:var(--ac)">Measurements Due Now.</b> Last recorded ${lastEntry.d}.`
              : `Last recorded ${lastEntry.d}. Next check in ~${Math.max(1, Math.ceil(28 - daysSinceLast))} days.`)
          : 'Record your baseline measurements to calculate Golden Ratio proportions and next-month projections.'}
      </div>

      <div class="gr" style="margin-top:12px">
        ${MEASUREMENT_KEYS.map(k => `
          <div>
            <label>${k} (${unit})</label>
            <input id="bm_${k}" type="number" step="0.1" 
                   value="${lastEntry && lastEntry.v[k] ? formatLength(lastEntry.v[k], unit) : ''}" 
                   placeholder="0.0">
          </div>
        `).join('')}
      </div>

      <div class="r sb" style="margin-top:12px">
        <button class="g sm" onclick="IronLog.showMeasureGuide()">How to Measure</button>
        <span class="mu-sm">Measure relaxed in morning</span>
      </div>

      <button class="w" style="margin-top:14px" onclick="IronLog.saveMeasurements()">
        Save & Update Plan
      </button>
    </div>
  `;

  // Priority Muscles Selector
  const currentPri = state.p?.pri || [];
  html += `
    <div class="c">
      <h3>Target Muscle Focus</h3>
      <div class="mu-sm" style="margin-bottom:8px">
        Tap to toggle priority muscles. Selected muscles receive <b>+1 extra set</b> in every workout and accelerated monthly growth projections:
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${MUSCLE_GROUPS.map(m => `
          <button class="${currentPri.includes(m) ? '' : 'g'} sm" onclick="IronLog.toggleMusclePriority('${m}')">
            ${currentPri.includes(m) ? '★ ' : ''}${m}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  // Golden Ratios vs Actual
  if (lastEntry) {
    const gender = state.p.g === 'f' ? 'f' : 'm';
    const ratios = GOLDEN_RATIOS[gender];
    const userH = state.p.h;

    html += `
      <div class="c">
        <h3>Golden-Era Proportion Analysis</h3>
        <div class="mu-sm" style="margin-bottom:12px">
          Compares your measurements against classic bodybuilding aesthetic proportions based on height (${userH} cm).
          Tap any bar to expand details.
        </div>

        ${MUSCLE_GROUPS.filter(m => getMuscleScore(m, state) !== null).map(m => {
          const score = getMuscleScore(m, state);
          const barColor = score < 0.93 ? 'var(--ac)' : 'var(--gn)';
          const key = MUSCLE_TO_MEASUREMENT[m];
          const ratioVal = ratios[key];
          const targetCm = userH * ratioVal;
          const userMeasureCm = lastEntry.v[key];
          const pct = Math.round(score * 100);

          let statusText = 'Close to Target (3 sets)';
          if (score < 0.93) statusText = 'Below Target (+1 set volume)';
          else if (score >= 1.02) statusText = 'At Target (2 sets maintenance)';

          return `
            <div class="rw" style="margin-top:10px;cursor:pointer" onclick="this.classList.toggle('o')">
              <div class="r sb">
                <span style="text-transform:capitalize;font-weight:600">${m}</span>
                <span class="mu-sm">${pct}% · ${statusText}</span>
              </div>
              <div class="bar">
                <i style="width:${Math.min(100, pct)}%;background:${barColor}"></i>
              </div>
              <div class="cl">
                <b>Formula breakdown:</b><br>
                Your ${key}: ${formatLength(userMeasureCm, unit)} ${unit}<br>
                Target: ${formatLength(targetCm, unit)} ${unit} (${ratioVal} × height ${formatLength(userH, unit)} ${unit}) = <b>${pct}%</b><br>
                &bull; &lt;93%: 4 sets (lagging)<br>
                &bull; 93–102%: 3 sets (optimal)<br>
                &bull; &ge;102%: 2 sets (maintenance)
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  return html;
}

/**
 * VIEW: Progress & Interactive 3D SVG Recovery Body
 */
function renderProgressView() {
  const state = getState();
  const sessions = state.s || [];
  const currentMonthStr = getTodayDate().slice(0, 7);
  const thisMonthSessions = sessions.filter(s => s.d.slice(0, 7) === currentMonthStr);
  const avgDurationMin = thisMonthSessions.length 
    ? Math.round(thisMonthSessions.reduce((acc, s) => acc + (s.end - s.start) / 60000, 0) / thisMonthSessions.length)
    : 0;

  let html = renderHeader();

  // Summary Metrics
  html += `
    <div class="c">
      <div class="gr">
        <div>
          <div class="mu-sm">Sessions This Month</div>
          <h2>${thisMonthSessions.length} / 24</h2>
        </div>
        <div>
          <div class="mu-sm">Avg Workout Time</div>
          <h2>${avgDurationMin} min</h2>
        </div>
      </div>
    </div>
  `;

  // Interactive Muscle Recovery Model
  html += `
    <div class="c">
      <div class="r sb">
        <h3>Muscle Recovery Map</h3>
        <button class="g sm" onclick="IronLog.rotateBodyView()">Rotate ${bodyView === 'f' ? 'Back' : 'Front'} ↻</button>
      </div>

      <div id="bodyFigureContainer" 
           onpointerdown="IronLog.onBodyPointerDown(event)" 
           onpointerup="IronLog.onBodyPointerUp(event)"
           style="touch-action:pan-y;transition:transform 0.2s;margin:12px 0">
        ${renderBodySvg()}
      </div>

      <div class="r" style="justify-content:center;gap:12px;margin:8px 0">
        <span class="mu-sm">${bodyView === 'f' ? '● Front View' : '● Back View'} (Swipe or Tap Rotate)</span>
      </div>

      <!-- Recovery Status Pills -->
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">
        ${MUSCLE_GROUPS.map(m => {
          const rec = getMuscleRecovery(m, state, getAllExercises());
          const colorVar = rec.status === 'red' ? 'var(--rd)' : rec.status === 'yellow' ? 'var(--yl)' : 'var(--gn)';
          return `
            <span class="ch" style="font-size:13px">
              <span class="dot" style="background:${colorVar}"></span>
              <b>${m}:</b>&nbsp;${rec.label} ${rec.hours < 100 ? `(${rec.hours}h)` : ''}
            </span>
          `;
        }).join('')}
      </div>
      <div class="mu-sm" style="margin-top:8px">
        <span style="color:var(--rd)">● Red:</span> Recovering (&lt;36h). 
        <span style="color:var(--yl)">● Yellow:</span> Near ready (36–56h). 
        <span style="color:var(--gn)">● Green:</span> Ready (&gt;56h).
      </div>
    </div>
  `;

  // Next Month Projection Card
  if (state.pr) {
    const unit = state.u;
    const wUnit = state.wu;
    const lastM = state.m.length ? state.m[state.m.length - 1].v : {};

    html += `
      <div class="c">
        <h3>1-Month Growth Forecast</h3>
        <div class="mu-sm" style="margin-bottom:8px">
          Calculated on ${state.pr.d} based on training frequency, goal (${state.p.o}), and golden proportion gaps:
        </div>
        <table>
          <tr>
            <th>Measurement</th>
            <th>Current → Projected</th>
          </tr>
          ${MEASUREMENT_KEYS.map(k => {
            const currentVal = lastM[k] || 0;
            const projectedVal = state.pr.e[k] || currentVal;
            const diff = +(projectedVal - currentVal).toFixed(2);
            const diffSign = diff >= 0 ? '+' : '';
            return `
              <tr>
                <td style="text-transform:capitalize">${k}</td>
                <td>
                  ${formatLength(currentVal, unit)} → <b>${formatLength(projectedVal, unit)} ${unit}</b>
                  <span class="mu-sm">(${diffSign}${formatLength(diff, unit)})</span>
                </td>
              </tr>
            `;
          }).join('')}
          <tr>
            <td>Body Weight</td>
            <td>${formatWeight(getLatestWeight(), wUnit)} → <b>${formatWeight(state.pr.wt, wUnit)} ${wUnit}</b></td>
          </tr>
        </table>
      </div>
    `;
  }

  // Previous Month Comparison Card (Predicted vs Actual)
  if (state.c) {
    const unit = state.u;
    const wUnit = state.wu;
    html += `
      <div class="c">
        <h3>Last Month: Predicted vs Actual</h3>
        <table>
          <tr>
            <th>Metric</th>
            <th>Predicted</th>
            <th>Actual</th>
          </tr>
          ${MEASUREMENT_KEYS.map(k => `
            <tr>
              <td style="text-transform:capitalize">${k}</td>
              <td>${formatLength(state.c.pred[k], unit)} ${unit}</td>
              <td><b>${formatLength(state.c.act[k], unit)} ${unit}</b></td>
            </tr>
          `).join('')}
          <tr>
            <td>Weight</td>
            <td>${formatWeight(state.c.wp, wUnit)} ${wUnit}</td>
            <td><b>${formatWeight(state.c.wa, wUnit)} ${wUnit}</b></td>
          </tr>
        </table>
      </div>
    `;
  }

  // Recent Workouts Log
  html += `
    <div class="c">
      <h3>Workout History</h3>
      ${sessions.length > 0 ? (
        sessions.slice(-8).reverse().map((session, sIdx) => {
          const duration = Math.round((session.end - session.start) / 60000);
          return `
            <div style="padding:8px 0;border-bottom:1px solid var(--bd)">
              <div class="r sb">
                <b>${session.d} · ${session.n}</b>
                <span class="mu-sm">${duration} min · ${session.sets.length} sets</span>
              </div>
              <div class="mu-sm" style="margin-top:4px">
                ${session.sets.map(s => {
                  const ex = getAllExercises()[s.ex];
                  return `${ex ? ex.name : s.ex} (${formatWeight(s.w, state.wu)}${state.wu}×${s.r})`;
                }).slice(0, 4).join(', ')}${session.sets.length > 4 ? '...' : ''}
              </div>
            </div>
          `;
        }).join('')
      ) : `
        <div class="mu-sm" style="margin-top:8px">No completed workouts recorded yet. Check in on the Today tab!</div>
      `}
    </div>
  `;

  return html;
}

/**
 * VIEW: Exercise Library Browser
 */
function renderExercisesView() {
  const allEx = getAllExercises();
  let html = renderHeader();

  const muscleFilters = ['all', ...MUSCLE_GROUPS];

  html += `
    <div class="c">
      <div class="r sb">
        <h2>Exercise Library</h2>
        <button class="g sm" onclick="IronLog.showAddCustomExerciseModal()">+ Custom</button>
      </div>

      <div style="margin:10px 0">
        <input type="text" placeholder="Search exercises..." value="${exerciseSearchQuery}"
               oninput="IronLog.onSearchExercise(this.value)">
      </div>

      <div style="display:flex;overflow-x:auto;gap:6px;padding-bottom:6px">
        ${muscleFilters.map(m => `
          <button class="${exerciseFilterMuscle === m ? '' : 'g'} sm" 
                  style="white-space:nowrap;text-transform:capitalize"
                  onclick="IronLog.setExerciseFilter('${m}')">
            ${m}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  const filteredKeys = Object.keys(allEx).filter(id => {
    const ex = allEx[id];
    const matchesSearch = ex.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) ||
                          ex.primary.toLowerCase().includes(exerciseSearchQuery.toLowerCase());
    const matchesMuscle = exerciseFilterMuscle === 'all' || ex.primary === exerciseFilterMuscle || ex.secondary.includes(exerciseFilterMuscle);
    return matchesSearch && matchesMuscle;
  });

  filteredKeys.sort((a, b) => (allEx[a]?.name || '').localeCompare(allEx[b]?.name || ''));

  html += `
    <div style="margin-top:10px">
      ${filteredKeys.map(id => {
        const ex = allEx[id];
        return `
          <div class="ex-card" onclick="IronLog.showExerciseGuide('${id}')">
            <div class="r sb">
              <b>${ex.name}</b>
              <span class="t">${ex.primary}</span>
            </div>
            <div class="mu-sm" style="margin-top:4px">
              ${ex.steps ? ex.steps[0] : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  return html;
}

/**
 * VIEW: Settings & Data Management
 */
function renderSettingsView() {
  const state = getState();
  const syncInfo = getSyncStatus();
  const supabaseConfig = getSupabaseConfig();
  let html = renderHeader();

  html += `
    <div class="c">
      <h2>App Settings & Profile</h2>

      <label>Display Theme</label>
      <select onchange="IronLog.updateSetting('theme', this.value)">
        <option value="dark" ${state.theme === 'dark' ? 'selected' : ''}>Dark Athletic</option>
        <option value="light" ${state.theme === 'light' ? 'selected' : ''}>Clean Light</option>
        <option value="system" ${state.theme === 'system' ? 'selected' : ''}>System Default</option>
      </select>

      <div class="gr">
        <div>
          <label>Weight Unit</label>
          <select onchange="IronLog.updateSetting('wu', this.value)">
            <option value="kg" ${state.wu === 'kg' ? 'selected' : ''}>Kilograms (kg)</option>
            <option value="lbs" ${state.wu === 'lbs' ? 'selected' : ''}>Pounds (lbs)</option>
          </select>
        </div>
        <div>
          <label>Length Unit</label>
          <select onchange="IronLog.updateSetting('u', this.value)">
            <option value="cm" ${state.u === 'cm' ? 'selected' : ''}>Centimeters (cm)</option>
            <option value="in" ${state.u === 'in' ? 'selected' : ''}>Inches (in)</option>
          </select>
        </div>
      </div>

      <div class="gr">
        <div>
          <label>Rest Timer (sec)</label>
          <input type="number" step="15" value="${state.restTimerDuration || 90}"
                 onchange="IronLog.updateSetting('restTimerDuration', +this.value)">
        </div>
        <div>
          <label>Sound & Chimes</label>
          <select onchange="IronLog.updateSetting('soundEnabled', this.value === 'true')">
            <option value="true" ${state.soundEnabled ? 'selected' : ''}>Enabled</option>
            <option value="false" ${!state.soundEnabled ? 'selected' : ''}>Muted</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Cloud Account & Cross-Device Sync -->
    <div class="c">
      <div class="r sb">
        <h3>Cloud Sync & Account</h3>
        <button class="sync-pill" onclick="IronLog.openAuthModal()">
          <span class="sync-dot ${syncInfo.user ? 'synced' : 'guest'}"></span>
          <span>${syncInfo.user ? (syncInfo.user.email ? syncInfo.user.email.split('@')[0] : 'Synced') : 'Sync / Log In'}</span>
        </button>
      </div>
      <p class="mu-sm">Log in with Email or Google to automatically sync workouts, body measurements, and custom routines across all your browsers and devices.</p>

      ${syncInfo.user ? `
        <div style="background:var(--bg);padding:12px;border-radius:var(--radius-sm);margin:10px 0">
          <div>Signed in as: <b>${syncInfo.user.email}</b></div>
          <div class="mu-sm" style="margin-top:4px">Status: ${syncInfo.status === SYNC_STATUS.SYNCED ? 'All changes saved to cloud' : syncInfo.status}</div>
          ${syncInfo.lastSynced ? `<div class="mu-sm">Last Synced: ${new Date(syncInfo.lastSynced).toLocaleTimeString()}</div>` : ''}
        </div>
        <div class="r" style="gap:8px;margin-top:10px">
          <button class="g" onclick="IronLog.handleManualSync()">${ICONS.sync} Sync Now</button>
          <button class="g danger-outline" onclick="IronLog.handleSignOut()">Log Out</button>
        </div>
      ` : `
        <div style="margin-top:10px">
          <button class="g" style="width:100%" onclick="IronLog.openAuthModal('signin')">
            ${ICONS.user} Sign In or Create Account
          </button>
        </div>
      `}

    </div>

    <!-- Profile Editor Card -->
    ${state.p ? `
      <div class="c">
        <h3>Edit Profile</h3>
        <div class="gr">
          <div>
            <label>Gender</label>
            <select id="ed_gender">
              <option value="m" ${state.p.g === 'm' ? 'selected' : ''}>Male</option>
              <option value="f" ${state.p.g === 'f' ? 'selected' : ''}>Female</option>
              <option value="o" ${state.p.g === 'o' ? 'selected' : ''}>Other</option>
            </select>
          </div>
          <div>
            <label>Age</label>
            <input id="ed_age" type="number" value="${state.p.a}">
          </div>
        </div>

        <div class="gr">
          <div>
            <label>Height (cm)</label>
            <input id="ed_height" type="number" value="${state.p.h}">
          </div>
          <div>
            <label>Weight (kg)</label>
            <input id="ed_weight" type="number" step="0.1" value="${state.p.w}">
          </div>
        </div>

        <div class="gr">
          <div>
            <label>Primary Goal</label>
            <select id="ed_goal">
              <option value="gain" ${state.p.o === 'gain' ? 'selected' : ''}>Build Muscle</option>
              <option value="lose" ${state.p.o === 'lose' ? 'selected' : ''}>Lose Fat</option>
              <option value="both" ${state.p.o === 'both' ? 'selected' : ''}>Recomposition</option>
            </select>
          </div>
          <div>
            <label>Experience</label>
            <select id="ed_level">
              <option value="b" ${state.p.l === 'b' ? 'selected' : ''}>Beginner</option>
              <option value="i" ${state.p.l === 'i' ? 'selected' : ''}>Intermediate</option>
              <option value="a" ${state.p.l === 'a' ? 'selected' : ''}>Advanced</option>
            </select>
          </div>
        </div>

        <button class="g" style="margin-top:14px;width:100%" onclick="IronLog.saveProfileEdit()">
          Save Profile Updates
        </button>
      </div>
    ` : ''}

  `;

  return html;
}

/**
 * Interactive SVG Recovery Body Model Builder
 */
function renderBodySvg() {
  const state = getState();
  const allEx = getAllExercises();

  const getMuscleColor = (muscle) => {
    const rec = getMuscleRecovery(muscle, state, allEx);
    if (rec.status === 'red') return 'var(--rd)';
    if (rec.status === 'yellow') return 'var(--yl)';
    return 'var(--gn)';
  };

  const createPath = (d, fill) => 
    `<path d="${d}" fill="${fill}" stroke="var(--cd)" stroke-width="1.3" stroke-linejoin="round"/>`;

  const mirrorPath = (d) => 
    d.replace(/(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)/g, (match, x, a, y) => `${200 - parseFloat(x)},${y}`);

  const createMirroredMuscle = (d, muscle) => {
    const color = muscle ? getMuscleColor(muscle) : 'var(--bd)';
    return createPath(d, color) + createPath(mirrorPath(d), color);
  };

  const createStaticBone = (d) => 
    createPath(d, '#2b3038') + createPath(mirrorPath(d), '#2b3038');

  const arm = createMirroredMuscle(
    'M56,82Q66,80 70,90Q68,106 62,116Q52,112 52,98Q52,88 56,82Z', 
    bodyView === 'f' ? 'biceps' : 'triceps'
  );

  const legs = createMirroredMuscle(
    'M76,148Q92,150 99,150L97,206Q86,222 76,208Q68,176 76,148Z', 
    bodyView === 'f' ? 'quads' : 'hamstrings'
  );

  const calf = createMirroredMuscle(
    'M78,228Q92,230 96,230Q96,258 90,282Q80,282 76,256Q74,240 78,228Z', 
    'calves'
  );

  const shoulders = createMirroredMuscle(
    'M74,52Q56,54 52,72Q54,80 62,82Q70,66 82,60Z', 
    'shoulders'
  );

  let svgContent = `
    <svg viewBox="0 0 200 316" style="max-width:240px;display:block;margin:auto">
      <ellipse cx="100" cy="22" rx="11" ry="14" fill="var(--mu)"/>
      <path d="M93,34L93,46L107,46L107,34Z" fill="var(--mu)"/>
  `;

  if (bodyView === 'f') {
    // Front View
    svgContent += legs;
    svgContent += createStaticBone('M82,212Q90,222 97,210L97,224Q88,230 82,224Z');
    svgContent += calf;
    svgContent += createStaticBone('M82,284Q92,284 94,284L96,300Q86,306 80,300Z');
    svgContent += createMirroredMuscle('M74,128Q88,140 99,140L99,150Q84,150 76,144Z');
    svgContent += createMirroredMuscle('M72,88Q80,96 86,92L86,132Q78,130 74,120Q70,104 72,88Z', 'abs');
    svgContent += [
      'M88,92L99,92L99,102L88,102Z',
      'M88,104L99,104L99,114L88,114Z',
      'M89,116L99,116L99,126L89,126Z',
      'M90,128L99,128L99,138L90,138Z'
    ].map(d => createMirroredMuscle(d, 'abs')).join('');
    svgContent += createMirroredMuscle('M82,60Q92,56 99,62L99,88Q84,94 72,84Q70,68 82,60Z', 'chest');
    svgContent += createMirroredMuscle('M94,44L74,52L84,58L97,52Z', 'back');
  } else {
    // Back View
    svgContent += createMirroredMuscle('M76,138Q90,132 99,138L99,166Q84,172 74,160Q72,148 76,138Z', 'glutes');
    svgContent += legs;
    svgContent += createStaticBone('M82,212Q90,222 97,210L97,224Q88,230 82,224Z');
    svgContent += calf;
    svgContent += createStaticBone('M82,284Q92,284 94,284L96,300Q86,306 80,300Z');
    svgContent += createMirroredMuscle('M76,62Q72,88 80,114Q90,126 99,128L99,98Q86,82 76,62Z', 'back');
    svgContent += createMirroredMuscle('M100,44L74,54Q84,64 100,96Q116,64 126,54Z', 'back');
  }

  svgContent += arm;
  svgContent += createMirroredMuscle('M50,118Q60,116 62,122Q58,150 46,172Q36,160 40,140Q44,126 50,118Z', 'forearms');
  svgContent += createStaticBone('M46,172Q36,174 30,186Q34,196 40,190Q44,200 50,192Q52,184 48,174Z');
  svgContent += shoulders;
  svgContent += '</svg>';

  return svgContent;
}

/**
 * Main Render Dispatcher
 */
export function renderApp() {
  const state = getState();
  const appContainer = $('app');
  const navContainer = $('nv');
  if (!appContainer) return;

  const syncInfo = getSyncStatus();
  const hasGuestPass = sessionStorage.getItem('il_guest_pass') === 'true';

  // 1. Initial website open: show Auth Landing view if not logged in and hasn't chosen guest pass
  if (!syncInfo.user && !hasGuestPass) {
    if (navContainer) navContainer.style.display = 'none';
    appContainer.innerHTML = renderAuthLandingView();
    return;
  }

  // 2. Initial profile setup if not completed
  if (!state.p) {
    if (navContainer) navContainer.style.display = 'none';
    appContainer.innerHTML = renderOnboardingView();
    return;
  }

  if (navContainer) {
    navContainer.style.display = 'flex';
    navContainer.innerHTML = renderNavigation();
  }

  const viewRenderers = {
    today: renderTodayView,
    weight: renderWeightView,
    body: renderBodyView,
    progress: renderProgressView,
    exercises: renderExercisesView,
    settings: renderSettingsView
  };

  const renderer = viewRenderers[currentTab] || renderTodayView;
  appContainer.innerHTML = renderer() + renderRestTimerBar();
}

/**
 * Active Workout Timer Interval
 */
function setupTimerInterval() {
  setInterval(() => {
    const state = getState();
    const activeTimerEl = $('activeTimer');
    if (activeTimerEl && state.a) {
      const elapsed = Math.floor((Date.now() - state.a.start) / 1000);
      activeTimerEl.textContent = formatTime(elapsed);
    }
  }, 1000);
}

// Global actions namespace
window.IronLog = {
  setTab(tabId) {
    currentTab = tabId;
    renderApp();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  toggleTheme() {
    const state = getState();
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    state.theme = nextTheme;
    saveState();
    applyTheme();
    renderApp();
  },

  updateSetting(key, val) {
    const state = getState();
    state[key] = val;
    saveState();
    if (key === 'theme') applyTheme();
    renderApp();
  },

  setLengthUnit(unit) {
    const state = getState();
    state.u = unit;
    saveState();
    renderApp();
  },

  stepInput(inputId, delta) {
    const el = $(inputId);
    if (!el) return;
    const current = parseFloat(el.value) || 0;
    const step = delta;
    const updated = Math.max(0, current + step);
    el.value = updated % 1 === 0 ? updated : updated.toFixed(2).replace(/\.00$/, '');
  },

  saveOnboarding() {
    const g = $('ob_gender').value;
    const a = +$('ob_age').value;
    const h = +$('ob_height').value;
    const w = +$('ob_weight').value;
    const o = $('ob_goal').value;
    const l = $('ob_level').value;

    if (!a || !h || !w) {
      return showToast('Please enter your age, height, and weight.');
    }

    const state = getState();
    state.p = { g, a, h, w, o, l, pri: [] };
    state.w = [{ d: getTodayDate(), w }];
    saveState();
    currentTab = 'body';
    renderApp();
    showToast('Profile created! Now enter your initial measurements.');
  },

  saveProfileEdit() {
    const state = getState();
    state.p.g = $('ed_gender').value;
    state.p.a = +$('ed_age').value;
    state.p.h = +$('ed_height').value;
    state.p.w = +$('ed_weight').value;
    state.p.o = $('ed_goal').value;
    state.p.l = $('ed_level').value;
    saveState();
    showToast('Profile saved successfully.');
    renderApp();
  },

  saveQuickWeight() {
    const input = $('quickWeightInput');
    if (!input) return;
    const state = getState();
    const parsedKg = parseWeightInput(input.value, state.wu);
    if (!parsedKg) return showToast('Please enter a valid weight.');

    const todayStr = getTodayDate();
    const lastEntry = state.w[state.w.length - 1];
    if (lastEntry && lastEntry.d === todayStr) {
      lastEntry.w = parsedKg;
    } else {
      state.w.push({ d: todayStr, w: parsedKg });
    }

    saveState();
    showToast('Weight recorded.');
    renderApp();
  },

  deleteWeightEntry(dateStr) {
    const state = getState();
    state.w = state.w.filter(e => e.d !== dateStr);
    saveState();
    showToast('Weight entry removed.');
    renderApp();
  },

  checkinWorkout() {
    const syncInfo = getSyncStatus();
    if (!syncInfo.user) {
      showToast('Account required to check in and record workouts.');
      IronLog.openAuthModal('signin', { requiredForCheckin: true });
      return;
    }

    const state = getState();
    state.a = { start: Date.now(), sets: [] };
    saveState();
    triggerHaptic([100]);
    renderApp();
    showToast('Workout started! Have a great session.');
  },

  checkoutWorkout() {
    const state = getState();
    if (!state.a) return;

    const todayWorkout = getTodayWorkout();
    const workoutName = todayWorkout ? todayWorkout[0] : 'Extra Session';

    state.s.push({
      d: getTodayDate(),
      n: workoutName,
      start: state.a.start,
      end: Date.now(),
      sets: state.a.sets
    });

    state.a = null;
    stopRestTimer();
    saveState();
    triggerHaptic([150, 100, 250]);
    renderApp();
    showToast('Workout completed and saved!');
  },

  setDayOverride(val) {
    const state = getState();
    const todayStr = getTodayDate();
    state.ov = val === 'auto' ? null : { d: todayStr, i: +val };
    state.x = null; // reset daily mods on schedule switch
    saveState();
    renderApp();
  },

  skipExercise(id) {
    const mods = getDailyMods();
    mods.rm.push(id);
    saveState();
    renderApp();
    showToast('Exercise skipped for today.');
  },

  forceExercise(id) {
    const mods = getDailyMods();
    mods.fo.push(id);
    saveState();
    renderApp();
  },

  addExerciseToToday(id) {
    if (!id) return;
    const mods = getDailyMods();
    mods.add.push(id);
    mods.rm = mods.rm.filter(x => x !== id);
    saveState();
    renderApp();
    showToast('Exercise added to today’s workout.');
  },

  logSet(exId) {
    const state = getState();
    if (!state.a) return;

    const wInput = $('w_' + exId);
    const rInput = $('r_' + exId);
    if (!wInput || !rInput) return;

    const wVal = parseWeightInput(wInput.value, state.wu);
    const rVal = parseInt(rInput.value, 10);

    if (wVal == null || isNaN(rVal) || rVal <= 0) {
      return showToast('Please enter valid weight and reps.');
    }

    state.a.sets.push({ ex: exId, w: wVal, r: rVal });
    saveState();
    triggerHaptic([80]);

    // Kick off rest timer
    const restSecs = state.restTimerDuration || 90;
    startRestTimer(
      restSecs,
      (remaining) => {
        const displayEl = $('restTimerDisplay');
        if (displayEl) displayEl.textContent = formatTime(remaining);
      },
      () => {
        renderApp();
      }
    );

    renderApp();
    showToast(`Set logged: ${formatWeight(wVal, state.wu)} ${state.wu} × ${rVal} reps`);
  },

  logExtraSet(exId) {
    const state = getState();
    const allEx = getAllExercises();
    const logged = state.a.sets.filter(s => s.ex === exId);
    const last = logged.length ? logged[logged.length - 1] : { w: getSuggestedWeight(exId, state, allEx), r: 10 };

    state.a.sets.push({ ex: exId, w: last.w, r: last.r });
    saveState();
    renderApp();
    showToast('Extra set logged.');
  },

  deleteSet(exId, setIdx) {
    const state = getState();
    if (!state.a) return;
    let matchCount = 0;
    state.a.sets = state.a.sets.filter(s => {
      if (s.ex === exId) {
        if (matchCount === setIdx) {
          matchCount++;
          return false;
        }
        matchCount++;
      }
      return true;
    });
    saveState();
    renderApp();
    showToast('Set removed.');
  },

  adjustRest(delta) {
    adjustRestTimer(delta);
    const displayEl = $('restTimerDisplay');
    if (displayEl) displayEl.textContent = formatTime(getRestTimeRemaining());
  },

  toggleRestPause() {
    const isPaused = togglePauseRestTimer();
    const btn = $('restPauseBtn');
    if (btn) btn.innerHTML = isPaused ? ICONS.play : ICONS.pause;
  },

  dismissRest() {
    stopRestTimer();
    renderApp();
  },

  saveMeasurements() {
    const state = getState();
    const unit = state.u;
    const values = {};
    let hasError = false;

    MEASUREMENT_KEYS.forEach(k => {
      const input = $('bm_' + k);
      const parsedCm = input ? parseLengthInput(input.value, unit) : null;
      if (!parsedCm) hasError = true;
      values[k] = parsedCm;
    });

    if (hasError) {
      return showToast('Please enter all measurements before saving.');
    }

    if (state.pr) {
      state.c = {
        pred: state.pr.e,
        act: values,
        wp: state.pr.wt,
        wa: getLatestWeight(),
        d: state.pr.d
      };
    }

    state.m.push({ d: getTodayDate(), v: values });
    updateProjection();
    saveState();
    showToast('Measurements saved! Target plans and projections updated.');
    IronLog.setTab('progress');
  },

  toggleMusclePriority(muscle) {
    const state = getState();
    const pri = state.p.pri || (state.p.pri = []);
    const idx = pri.indexOf(muscle);
    if (idx < 0) {
      pri.push(muscle);
      showToast(`${muscle} marked as priority focus (+1 set).`);
    } else {
      pri.splice(idx, 1);
      showToast(`${muscle} removed from priority.`);
    }
    updateProjection();
    saveState();
    renderApp();
  },

  showMeasureGuide() {
    const guideItems = [
      ['Chest', 'Wrap tape under armpits and across fullest part of chest. Keep arms relaxed at sides after normal exhale.'],
      ['Shoulders', 'Tape around widest point of shoulders over deltoids, feet together and arms relaxed.'],
      ['Bicep', 'Arm hanging relaxed at side. Measure midway between shoulder tip and elbow joint.'],
      ['Waist', 'Measure at navel level or narrowest point. Relax abs and breathe out normally without sucking in.'],
      ['Hips', 'Feet together. Wrap tape around fullest part of hips and glutes, parallel to floor.'],
      ['Thigh', 'Weight distributed evenly on both feet. Measure upper thigh right below gluteal crease.'],
      ['Calf', 'Weight on both feet. Measure around fullest circumference of calf.']
    ];

    const content = `
      <h2>How to Measure Accurately</h2>
      <p class="mu">Use a soft flexible tape measure. Take measurements in the morning before eating or training, with muscles relaxed (unflexed). Keep tape snug but not indenting skin.</p>
      <div style="margin:14px 0">
        ${guideItems.map(g => `<p><b>${g[0]}</b><br><span class="mu-sm">${g[1]}</span></p>`).join('')}
      </div>
      <button class="w" onclick="IronLog.closeModal()">Close</button>
    `;
    openModal(content);
  },

  showExerciseGuide(exId) {
    const ex = getAllExercises()[exId];
    if (!ex) return;
    const state = getState();
    const repRange = state.p?.g === 'f' ? '8–15' : '6–12';

    const content = `
      <h2>${ex.name}</h2>
      <div class="r" style="margin:8px 0">
        <span class="t t-ac">Primary: ${ex.primary}</span>
        ${ex.secondary.length ? `<span class="t">Secondary: ${ex.secondary.join(', ')}</span>` : ''}
      </div>

      <h3 style="margin-top:14px">Execution Steps</h3>
      <ol style="padding-left:20px;line-height:1.6">
        ${ex.steps.map(s => `<li>${s}</li>`).join('')}
      </ol>

      <h3 style="margin-top:14px;color:var(--rd)">Common Mistakes to Avoid</h3>
      <p class="mu" style="color:var(--rd)">${ex.mistakes}</p>

      <div class="mu-sm" style="margin-top:12px;padding:10px;background:var(--bg);border-radius:6px">
        <b>Target Reps:</b> ${repRange} controlled repetitions. Pick a weight where the last 1–2 reps are challenging while maintaining clean form.
      </div>

      <button class="w" style="margin-top:16px" onclick="IronLog.closeModal()">Got it</button>
    `;
    openModal(content);
  },

  showAddCustomExerciseModal() {
    const content = `
      <h2>Add Custom Exercise</h2>
      <label>Exercise Name</label>
      <input id="ce_name" placeholder="e.g. Incline Cable Flye">

      <label>Primary Muscle Target</label>
      <select id="ce_primary">
        ${MUSCLE_GROUPS.map(m => `<option value="${m}">${m}</option>`).join('')}
      </select>

      <label>Starting Weight Scaling Factor</label>
      <input id="ce_factor" type="number" step="0.05" value="0.3" placeholder="0.3">
      <div class="mu-sm">Fraction of bodyweight used for initial weight suggestion (e.g. 0.3 = 30% of bodyweight).</div>

      <label>Form Steps (separated by semicolon)</label>
      <textarea id="ce_steps" rows="3" placeholder="Step 1; Step 2; Step 3"></textarea>

      <label>Common Mistakes</label>
      <input id="ce_mistakes" placeholder="e.g. Swinging torso, cutting depth">

      <button class="w" style="margin-top:16px" onclick="IronLog.saveCustomExercise()">
        Save Exercise
      </button>
    `;
    openModal(content);
  },

  saveCustomExercise() {
    const name = $('ce_name').value.trim();
    const primary = $('ce_primary').value;
    const factor = parseFloat($('ce_factor').value) || 0.3;
    const stepsRaw = $('ce_steps').value.trim();
    const mistakes = $('ce_mistakes').value.trim() || 'Rushing the reps.';

    if (!name) return showToast('Please enter an exercise name.');

    const steps = stepsRaw ? stepsRaw.split(';').map(s => s.trim()).filter(Boolean) : ['Perform reps under full control.'];
    const exId = 'custom_' + Date.now();

    const state = getState();
    if (!state.customExercises) state.customExercises = {};
    state.customExercises[exId] = {
      name,
      primary,
      secondary: [],
      weightFactor: factor,
      steps,
      mistakes
    };

    saveState();
    closeModal();
    showToast(`"${name}" added to exercise library.`);
    renderApp();
  },

  rotateBodyView() {
    const container = $('bodyFigureContainer');
    if (container) {
      container.style.transform = 'scaleX(0)';
      setTimeout(() => {
        bodyView = bodyView === 'f' ? 'b' : 'f';
        container.innerHTML = renderBodySvg();
        container.style.transform = 'scaleX(1)';
      }, 150);
    }
  },

  onBodyPointerDown(e) {
    bodyPointerX = e.clientX;
  },

  onBodyPointerUp(e) {
    if (Math.abs(e.clientX - bodyPointerX) > 30) {
      IronLog.rotateBodyView();
    }
  },

  onSearchExercise(query) {
    exerciseSearchQuery = query;
    renderApp();
  },

  setExerciseFilter(muscle) {
    exerciseFilterMuscle = muscle;
    renderApp();
  },

  exportBackup() {
    exportStateJson();
    showToast('Backup downloaded.');
  },

  triggerImport() {
    $('importFileInput').click();
  },

  handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const res = importStateJson(e.target.result);
      if (res.success) {
        showToast('Backup restored successfully!');
        applyTheme();
        renderApp();
      } else {
        showToast(`Import failed: ${res.error}`);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  },

  exportCsv() {
    const success = exportWorkoutsCsv(getAllExercises());
    if (success) {
      showToast('Workout history exported to CSV.');
    } else {
      showToast('No workouts to export yet.');
    }
  },

  confirmResetData() {
    if (confirm('Are you sure you want to reset all IronLog data? This will erase all workout logs and measurements. This action cannot be undone.')) {
      resetState();
      currentTab = 'today';
      renderApp();
      showToast('All data has been reset.');
    }
  },

  currentAuthTab: 'signin',
  pendingCheckinAfterAuth: false,

  openAuthModal(initialTab = 'signin', options = {}) {
    IronLog.pendingCheckinAfterAuth = Boolean(options?.requiredForCheckin);
    const syncInfo = getSyncStatus();

    if (syncInfo.user) {
      // User is already logged in
      const content = `
        <h2>User Account</h2>
        <div style="background:var(--bg);padding:14px;border-radius:var(--radius-sm);margin:14px 0">
          <div class="r" style="gap:10px;align-items:center">
            ${ICONS.user}
            <div>
              <div style="font-weight:700;font-size:16px">${syncInfo.user.email}</div>
              <div class="mu-sm">Cloud ID: ${syncInfo.user.id.slice(0, 8)}...</div>
            </div>
          </div>
          <div style="margin-top:12px;font-size:13px;display:flex;align-items:center;gap:6px">
            <span class="sync-dot synced"></span>
            <b>Cloud Sync Active</b> (Offline-First)
          </div>
          ${syncInfo.lastSynced ? `<div class="mu-sm" style="margin-top:2px">Last sync: ${new Date(syncInfo.lastSynced).toLocaleTimeString()}</div>` : ''}
        </div>

        <button class="w" style="margin-bottom:8px" onclick="IronLog.handleManualSync()">
          ${ICONS.sync} Sync Now
        </button>
        <button class="g danger-outline" style="width:100%" onclick="IronLog.handleSignOut()">
          Log Out
        </button>
      `;
      openModal(content);
      return;
    }

    // Guest / Not Logged In
    const isConfigured = isSupabaseConfigured();
    IronLog.currentAuthTab = initialTab || 'signin';

    const content = `
      <h2>${options?.requiredForCheckin ? '🔒 Account Required to Check In' : 'Account & Cloud Sync'}</h2>
      
      ${options?.requiredForCheckin ? `
        <div style="padding:10px 14px;background:rgba(228,83,26,0.15);border:1px solid var(--ac);border-radius:var(--radius-sm);margin:12px 0;font-size:13px">
          <b>Check-in requires an account:</b> Please sign in or create an account to start your workout and track sets across devices.
        </div>
      ` : `
        <p class="mu-sm" style="margin-bottom:14px">
          Sign in to automatically sync your workouts, measurements, and custom routines across all your browsers and devices.
        </p>
      `}

      <div class="auth-tabs">
        <div id="tab_signin" class="auth-tab ${IronLog.currentAuthTab === 'signin' ? 'active' : ''}" onclick="IronLog.switchAuthTab('signin')">Sign In</div>
        <div id="tab_signup" class="auth-tab ${IronLog.currentAuthTab === 'signup' ? 'active' : ''}" onclick="IronLog.switchAuthTab('signup')">Create Account</div>
      </div>

      <div id="auth_error" style="display:none;color:var(--rd);font-size:13px;margin-bottom:10px;padding:8px;background:rgba(239,68,68,0.1);border-radius:6px"></div>

      <label>Email Address</label>
      <input id="auth_email" type="email" placeholder="you@example.com" autocomplete="email" required>

      <label>Password</label>
      <input id="auth_password" type="password" placeholder="At least 6 characters" autocomplete="current-password" required>

      <div style="margin-top:16px">
        <button id="auth_submit_btn" class="w" onclick="IronLog.submitAuth()">
          ${IronLog.currentAuthTab === 'signup' ? 'Create Account' : 'Sign In'}
        </button>
      </div>

      <div style="text-align:right;margin-top:8px">
        <button type="button" onclick="IronLog.handleForgotPassword()" style="background:none;border:none;color:var(--mu);font-size:12px;cursor:pointer;padding:0;text-decoration:underline">
          Forgot password?
        </button>
      </div>

      <div style="display:flex;align-items:center;margin:18px 0;gap:10px">
        <div style="flex:1;height:1px;background:var(--bd)"></div>
        <span class="mu-sm" style="font-size:12px;text-transform:uppercase">Or</span>
        <div style="flex:1;height:1px;background:var(--bd)"></div>
      </div>

      <button type="button" class="btn-google" onclick="IronLog.handleGoogleSignIn()">
        ${ICONS.google}
        <span>Continue with Google</span>
      </button>

      <div class="mu-sm" style="text-align:center;margin-top:16px;font-size:12px">
        100% offline-friendly. Your workouts remain accessible even without internet.
      </div>
    `;
    openModal(content);
  },

  enterAsGuest() {
    sessionStorage.setItem('il_guest_pass', 'true');
    renderApp();
  },

  switchAuthTab(tab) {
    IronLog.currentAuthTab = tab;
    const tabSignIn = $('tab_signin');
    const tabSignUp = $('tab_signup');
    const submitBtn = $('auth_submit_btn');
    const errBox = $('auth_error');
    if (errBox) errBox.style.display = 'none';

    if (tab === 'signup') {
      tabSignIn?.classList.remove('active');
      tabSignUp?.classList.add('active');
      if (submitBtn) submitBtn.textContent = 'Create Account';
    } else {
      tabSignUp?.classList.remove('active');
      tabSignIn?.classList.add('active');
      if (submitBtn) submitBtn.textContent = 'Sign In';
    }
  },

  async submitAuth() {
    const email = ($('auth_email')?.value || '').trim();
    const password = $('auth_password')?.value || '';
    const errBox = $('auth_error');
    const submitBtn = $('auth_submit_btn');

    if (!email || !password) {
      if (errBox) {
        errBox.textContent = 'Please enter both email and password.';
        errBox.style.display = 'block';
      }
      return;
    }

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
      }

      if (IronLog.currentAuthTab === 'signup') {
        const res = await signUpWithEmail(email, password);
        sessionStorage.setItem('il_guest_pass', 'true');
        if (res.user && !res.session) {
          showToast('Account created! Please check your email to verify.');
          IronLog.closeModal();
        } else {
          showToast('Account created and logged in!');
          IronLog.closeModal();
          await pullFromCloud();
          if (IronLog.pendingCheckinAfterAuth) {
            IronLog.pendingCheckinAfterAuth = false;
            IronLog.checkinWorkout();
          } else {
            renderApp();
          }
        }
      } else {
        await signInWithEmail(email, password);
        sessionStorage.setItem('il_guest_pass', 'true');
        showToast('Signed in successfully!');
        IronLog.closeModal();
        await pullFromCloud();
        if (IronLog.pendingCheckinAfterAuth) {
          IronLog.pendingCheckinAfterAuth = false;
          IronLog.checkinWorkout();
        } else {
          renderApp();
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      if (errBox) {
        errBox.textContent = err.message || 'Authentication failed. Please check credentials.';
        errBox.style.display = 'block';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = IronLog.currentAuthTab === 'signup' ? 'Create Account' : 'Sign In';
      }
    }
  },

  // ── Forgot / Reset Password ─────────────────────────────────────────────

  handleForgotPassword() {
    const content = `
      <h2>Reset Password</h2>
      <p class="mu-sm" style="margin-bottom:16px">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      <div id="fp_error" style="display:none;color:var(--rd);font-size:13px;margin-bottom:10px;padding:8px;background:rgba(239,68,68,0.1);border-radius:6px"></div>
      <div id="fp_success" style="display:none;color:#4caf50;font-size:13px;margin-bottom:10px;padding:10px 12px;background:rgba(76,175,80,0.1);border-radius:6px;line-height:1.5"></div>
      <label>Email Address</label>
      <input id="fp_email" type="email" placeholder="you@example.com" autocomplete="email">
      <button id="fp_btn" class="w" style="margin-top:14px" onclick="IronLog.submitForgotPassword()">
        Send Reset Link
      </button>
      <button class="g" style="width:100%;margin-top:8px" onclick="IronLog.openAuthModal('signin')">
        ← Back to Sign In
      </button>
    `;
    openModal(content);
  },

  async submitForgotPassword() {
    const email = ($('fp_email')?.value || '').trim();
    const errBox = $('fp_error');
    const successBox = $('fp_success');
    const btn = $('fp_btn');

    if (!email) {
      if (errBox) { errBox.textContent = 'Please enter your email address.'; errBox.style.display = 'block'; }
      return;
    }

    try {
      if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
      if (errBox) errBox.style.display = 'none';
      await resetPasswordForEmail(email);
      if (successBox) {
        successBox.innerHTML = `✅ Reset link sent to <b>${email}</b>.<br>Check your inbox (and spam folder). Click the link in the email to set a new password.`;
        successBox.style.display = 'block';
      }
      if (btn) { btn.style.display = 'none'; }
    } catch (err) {
      if (errBox) { errBox.textContent = err.message || 'Failed to send reset email.'; errBox.style.display = 'block'; }
    } finally {
      if (btn && btn.style.display !== 'none') { btn.disabled = false; btn.textContent = 'Send Reset Link'; }
    }
  },

  showPasswordResetForm() {
    const content = `
      <h2>🔑 Set New Password</h2>
      <p class="mu-sm" style="margin-bottom:16px">Choose a strong new password for your IronLog account.</p>
      <div id="pr_error" style="display:none;color:var(--rd);font-size:13px;margin-bottom:10px;padding:8px;background:rgba(239,68,68,0.1);border-radius:6px"></div>
      <label>New Password</label>
      <input id="pr_password" type="password" placeholder="At least 6 characters" autocomplete="new-password">
      <label style="margin-top:10px">Confirm New Password</label>
      <input id="pr_confirm" type="password" placeholder="Repeat your new password" autocomplete="new-password">
      <button id="pr_btn" class="w" style="margin-top:16px" onclick="IronLog.submitNewPassword()">
        Update Password
      </button>
    `;
    openModal(content);
  },

  async submitNewPassword() {
    const password = $('pr_password')?.value || '';
    const confirm = $('pr_confirm')?.value || '';
    const errBox = $('pr_error');
    const btn = $('pr_btn');

    if (!password || password.length < 6) {
      if (errBox) { errBox.textContent = 'Password must be at least 6 characters.'; errBox.style.display = 'block'; }
      return;
    }
    if (password !== confirm) {
      if (errBox) { errBox.textContent = 'Passwords do not match.'; errBox.style.display = 'block'; }
      return;
    }

    try {
      if (btn) { btn.disabled = true; btn.textContent = 'Updating...'; }
      if (errBox) errBox.style.display = 'none';
      await updatePassword(password);
      sessionStorage.setItem('il_guest_pass', 'true');
      showToast('✅ Password updated! You are now signed in.');
      closeModal();
      await pullFromCloud();
      renderApp();
    } catch (err) {
      if (errBox) { errBox.textContent = err.message || 'Failed to update password.'; errBox.style.display = 'block'; }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Update Password'; }
    }
  },

  async handleGoogleSignIn() {
    try {
      sessionStorage.setItem('il_guest_pass', 'true');
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign-in error:', err);
      let msg = err.message || 'Google sign-in failed.';
      if (msg.includes('provider is not enabled') || msg.includes('validation_failed')) {
        msg = 'Google provider is not enabled yet in your Supabase dashboard. Please sign in with Email & Password or enable Google under Supabase Auth → Providers.';
      }
      const errBox = $('auth_error');
      if (errBox) {
        errBox.textContent = msg;
        errBox.style.display = 'block';
      } else {
        showToast(msg);
      }
    }
  },

  async handleSignOut() {
    try {
      const state = getState();
      if (state.a) {
        state.a = null;
        saveState();
      }
      sessionStorage.removeItem('il_guest_pass');
      await signOutUser();
      showToast('Logged out.');
      IronLog.closeModal();
      renderApp();
    } catch (err) {
      showToast(err.message || 'Error signing out.');
    }
  },

  async handleManualSync() {
    showToast('Syncing with cloud...');
    const ok = await pullFromCloud();
    if (ok) {
      showToast('Synced successfully with cloud!');
    } else {
      showToast('Sync completed (or working offline).');
    }
    renderApp();
  },

  saveSupabaseConfigFromSettings() {
    const url = ($('cfg_sb_url')?.value || '').trim();
    const key = ($('cfg_sb_key')?.value || '').trim();
    setSupabaseConfig(url, key);
    showToast('Supabase connection saved!');
    renderApp();
  },

  showSupabaseSqlGuide() {
    const sql = `-- Run this in your Supabase SQL Editor:
create table if not exists public.user_data (
  user_id uuid references auth.users not null primary key,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_data enable row level security;

create policy "Users can view their own data"
  on public.user_data for select using (auth.uid() = user_id);

create policy "Users can insert their own data"
  on public.user_data for insert with check (auth.uid() = user_id);

create policy "Users can update their own data"
  on public.user_data for update using (auth.uid() = user_id);`;

    const content = `
      <h2>Supabase SQL Setup</h2>
      <p class="mu-sm">Open your Supabase project dashboard → <b>SQL Editor</b> → Paste and Run this snippet:</p>
      <textarea rows="10" readonly style="font-family:monospace;font-size:12px;margin:10px 0;width:100%">${sql}</textarea>
      <button class="w" onclick="navigator.clipboard.writeText(\`${sql}\`).then(() => IronLog.showToast('SQL copied to clipboard!'))">
        Copy SQL to Clipboard
      </button>
    `;
    openModal(content);
  },

  showToast(msg) {
    showToast(msg);
  },

  closeModal() {
    closeModal();
  }
};

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initApp();

  // Register service worker for offline PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.warn('ServiceWorker registration error:', err);
    });
  }
});

