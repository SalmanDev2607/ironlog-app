// IronLog Timer & Sound Synthesizer (Zero External Dependencies)

import { getState } from './state.js';

let restTimerInterval = null;
let restTimeRemaining = 0;
let restTotalDuration = 90;
let isRestPaused = false;
let onRestTickCallback = null;
let onRestCompleteCallback = null;

// Web Audio API context for zero-asset chime
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a double chime sound when timer completes
 */
export function playChime() {
  const state = getState();
  if (!state.soundEnabled) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const playTone = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Smooth attack and decay envelope
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(659.25, now, 0.25);        // E5
    playTone(880.00, now + 0.15, 0.45); // A5
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

/**
 * Trigger haptic vibration if supported
 */
export function triggerHaptic(pattern = [200, 80, 200]) {
  const state = getState();
  if (!state.hapticsEnabled) return;

  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }
}

/**
 * Start or reset the rest timer
 */
export function startRestTimer(seconds, onTick, onComplete) {
  stopRestTimer();
  restTotalDuration = seconds || getState().restTimerDuration || 90;
  restTimeRemaining = restTotalDuration;
  isRestPaused = false;
  onRestTickCallback = onTick;
  onRestCompleteCallback = onComplete;

  // First callback immediately
  if (onRestTickCallback) {
    onRestTickCallback(restTimeRemaining, restTotalDuration);
  }

  restTimerInterval = setInterval(() => {
    if (isRestPaused) return;

    restTimeRemaining--;
    if (onRestTickCallback) {
      onRestTickCallback(restTimeRemaining, restTotalDuration);
    }

    if (restTimeRemaining <= 0) {
      stopRestTimer();
      playChime();
      triggerHaptic([250, 100, 250, 100, 400]);
      if (onRestCompleteCallback) {
        onRestCompleteCallback();
      }
    }
  }, 1000);
}

/**
 * Pause or resume rest timer
 */
export function togglePauseRestTimer() {
  isRestPaused = !isRestPaused;
  return isRestPaused;
}

/**
 * Add or subtract seconds to current rest timer
 */
export function adjustRestTimer(deltaSeconds) {
  if (restTimerInterval) {
    restTimeRemaining = Math.max(0, restTimeRemaining + deltaSeconds);
    restTotalDuration = Math.max(restTimeRemaining, restTotalDuration + deltaSeconds);
    if (onRestTickCallback) {
      onRestTickCallback(restTimeRemaining, restTotalDuration);
    }
  }
}

/**
 * Stop and dismiss rest timer
 */
export function stopRestTimer() {
  if (restTimerInterval) {
    clearInterval(restTimerInterval);
    restTimerInterval = null;
  }
  restTimeRemaining = 0;
  isRestPaused = false;
}

export function isRestTimerRunning() {
  return restTimerInterval !== null;
}

export function getRestTimeRemaining() {
  return restTimeRemaining;
}

/**
 * Formats seconds into M:SS string
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
