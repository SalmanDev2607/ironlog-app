// IronLog Offline-First Cloud Synchronization Engine

import { getClient, getCurrentUser, isSupabaseConfigured, onAuthChange } from './supabase.js';
import { getState, saveState, setOnSaveListener, DEFAULT_STATE } from './state.js';

export const SYNC_STATUS = {
  UNCONFIGURED: 'unconfigured',
  GUEST: 'guest',
  SYNCING: 'syncing',
  SYNCED: 'synced',
  OFFLINE: 'offline',
  ERROR: 'error'
};

let currentSyncStatus = SYNC_STATUS.GUEST;
let statusChangeListeners = [];
let pushDebounceTimer = null;
let lastSyncedTime = null;
let currentUser = null;

/**
 * Register a listener for sync status updates
 */
export function onSyncStatusChange(fn) {
  statusChangeListeners.push(fn);
  fn(currentSyncStatus, { user: currentUser, lastSynced: lastSyncedTime });
  return () => {
    statusChangeListeners = statusChangeListeners.filter(l => l !== fn);
  };
}

function setStatus(status) {
  currentSyncStatus = status;
  statusChangeListeners.forEach(fn => fn(currentSyncStatus, {
    user: currentUser,
    lastSynced: lastSyncedTime
  }));
}

export function getSyncStatus() {
  return {
    status: currentSyncStatus,
    user: currentUser,
    lastSynced: lastSyncedTime,
    isConfigured: isSupabaseConfigured()
  };
}

/**
 * Merge remote state with local state without data loss
 */
export function mergeStates(local, remote) {
  if (!remote) return local;
  if (!local) return remote;

  // 1. Merge completed workout sessions (union by start timestamp & date)
  const mergedSessions = [...(local.s || [])];
  const localSessionKeys = new Set(mergedSessions.map(s => `${s.d}_${s.start || s.n}`));

  (remote.s || []).forEach(remS => {
    const key = `${remS.d}_${remS.start || remS.n}`;
    if (!localSessionKeys.has(key)) {
      mergedSessions.push(remS);
      localSessionKeys.add(key);
    }
  });
  // Sort chronologically
  mergedSessions.sort((a, b) => (a.start || 0) - (b.start || 0));

  // 2. Merge weight history (by date, latest wins)
  const weightMap = new Map();
  (local.w || []).forEach(entry => weightMap.set(entry.d, entry));
  (remote.w || []).forEach(entry => {
    if (!weightMap.has(entry.d)) {
      weightMap.set(entry.d, entry);
    }
  });
  const mergedWeights = Array.from(weightMap.values()).sort((a, b) => a.d.localeCompare(b.d));

  // 3. Merge body measurements (by date)
  const measurementMap = new Map();
  (local.m || []).forEach(entry => measurementMap.set(entry.d, entry));
  (remote.m || []).forEach(entry => {
    if (!measurementMap.has(entry.d)) {
      measurementMap.set(entry.d, entry);
    }
  });
  const mergedMeasurements = Array.from(measurementMap.values()).sort((a, b) => a.d.localeCompare(b.d));

  // 4. Merge custom exercises
  const mergedCustom = {
    ...(remote.customExercises || {}),
    ...(local.customExercises || {})
  };

  // 5. Profile & Settings
  const profile = local.p || remote.p || null;
  const theme = local.theme || remote.theme || 'dark';
  const u = local.u || remote.u || 'cm';
  const wu = local.wu || remote.wu || 'kg';
  const restTimerDuration = local.restTimerDuration || remote.restTimerDuration || 90;

  return {
    ...DEFAULT_STATE,
    ...local,
    p: profile,
    s: mergedSessions,
    w: mergedWeights,
    m: mergedMeasurements,
    customExercises: mergedCustom,
    theme,
    u,
    wu,
    restTimerDuration
  };
}

/**
 * Pull latest user data from Supabase
 */
export async function pullFromCloud() {
  if (!navigator.onLine) {
    setStatus(SYNC_STATUS.OFFLINE);
    return false;
  }

  const client = getClient();
  if (!client || !currentUser) {
    setStatus(isSupabaseConfigured() ? SYNC_STATUS.GUEST : SYNC_STATUS.UNCONFIGURED);
    return false;
  }

  try {
    setStatus(SYNC_STATUS.SYNCING);

    const { data, error } = await client
      .from('user_data')
      .select('state, updated_at')
      .eq('user_id', currentUser.id)
      .maybeSingle();

    if (error) throw error;

    if (data && data.state) {
      const currentState = getState();
      const merged = mergeStates(currentState, data.state);
      
      // Update memory state
      Object.assign(currentState, merged);
      saveState(); // write to localStorage

      lastSyncedTime = new Date();
      setStatus(SYNC_STATUS.SYNCED);
      return true;
    } else {
      // First time cloud user: upload local guest data to cloud!
      await pushToCloud();
      return true;
    }
  } catch (err) {
    console.error('Failed to pull user data from Supabase:', err);
    setStatus(SYNC_STATUS.ERROR);
    return false;
  }
}

/**
 * Push local state to Supabase
 */
export async function pushToCloud() {
  if (!navigator.onLine) {
    setStatus(SYNC_STATUS.OFFLINE);
    return false;
  }

  const client = getClient();
  if (!client || !currentUser) return false;

  try {
    setStatus(SYNC_STATUS.SYNCING);
    const stateToSave = getState();

    const { error } = await client
      .from('user_data')
      .upsert({
        user_id: currentUser.id,
        state: stateToSave,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) throw error;

    lastSyncedTime = new Date();
    setStatus(SYNC_STATUS.SYNCED);
    return true;
  } catch (err) {
    console.error('Failed to push state to Supabase:', err);
    setStatus(SYNC_STATUS.ERROR);
    return false;
  }
}

/**
 * Schedule a debounced push (1.5 seconds)
 */
export function scheduleDebouncedPush() {
  if (!currentUser || !isSupabaseConfigured()) return;
  if (!navigator.onLine) {
    setStatus(SYNC_STATUS.OFFLINE);
    return;
  }

  clearTimeout(pushDebounceTimer);
  pushDebounceTimer = setTimeout(() => {
    pushToCloud();
  }, 1500);
}

/**
 * Initialize sync listeners and auth state handling
 */
export async function initSync(onUpdateCallback, onPasswordRecovery) {
  // Wire auto-save hook
  setOnSaveListener(scheduleDebouncedPush);

  // Network connectivity listeners
  window.addEventListener('online', () => {
    if (currentUser) {
      pullFromCloud().then(() => onUpdateCallback?.());
    } else {
      setStatus(isSupabaseConfigured() ? SYNC_STATUS.GUEST : SYNC_STATUS.UNCONFIGURED);
    }
  });

  window.addEventListener('offline', () => {
    setStatus(SYNC_STATUS.OFFLINE);
  });

  if (!isSupabaseConfigured()) {
    setStatus(SYNC_STATUS.UNCONFIGURED);
    return;
  }

  try {
    currentUser = await getCurrentUser();
    if (currentUser) {
      await pullFromCloud();
      onUpdateCallback?.();
    } else {
      setStatus(SYNC_STATUS.GUEST);
    }
  } catch (err) {
    console.warn('Initial auth check notice:', err);
    setStatus(SYNC_STATUS.GUEST);
  }

  // Subscribe to auth events
  onAuthChange(async (event, session) => {
    // PASSWORD_RECOVERY: user clicked the reset link — show reset form, don't log in yet
    if (event === 'PASSWORD_RECOVERY') {
      currentUser = session?.user || null;
      if (onPasswordRecovery) onPasswordRecovery();
      return;
    }

    currentUser = session?.user || null;
    if (currentUser) {
      await pullFromCloud();
      onUpdateCallback?.();
    } else {
      setStatus(SYNC_STATUS.GUEST);
      onUpdateCallback?.();
    }
  });
}
