// IronLog RAG (Retrieval-Augmented Generation) AI Chatbot & Semantic Similarity Cache
// Offline-first, strictly scoped to IronLog and hypertrophy gym training.

import { 
  DEFAULT_EXERCISES, 
  MUSCLE_GROUPS, 
  WORKOUT_SPLITS, 
  GOLDEN_RATIOS, 
  getMuscleRecovery 
} from './exercises.js';

import { 
  getState, 
  getTodayDate, 
  getLatestWeight, 
  formatWeight 
} from './state.js';

import { getClient } from './supabase.js';

import { ICONS } from './icons.js';

const CACHE_STORAGE_KEY = 'il_chatbot_cache_v4';
const HISTORY_STORAGE_KEY = 'il_chatbot_history_v4';
const AI_CONFIG_STORAGE_KEY = 'il_ai_config';
const MAX_CACHE_ENTRIES = 150;
const SIMILARITY_THRESHOLD = 0.70; // 70% similarity threshold for cache hit

// -------------------------------------------------------------
// RAG Knowledge Base Corpus
// -------------------------------------------------------------
export const IRONLOG_RAG_CORPUS = [
  {
    id: 'progressive_overload',
    title: 'Progressive Overload & Double Progression Algorithm',
    category: 'training',
    keywords: ['progressive', 'overload', 'progression', 'suggest', 'weight', 'increase', 'reps', 'sets', 'algorithm'],
    content: `IronLog implements a smart double progression model for progressive overload:
1. Target Rep Brackets: Each movement has an optimal hypertrophy rep target (e.g. 8–10 reps).
2. Weight Increase Threshold: When a lifter reaches the upper ceiling of their target reps on all working sets with strict form, IronLog recommends increasing the load on the next workout.
   • Compound Lifts (Bench Press, Squats, Deadlifts, Overhead Press, Rows): Recommend adding +2.5 kg (+5 lbs).
   • Isolation Lifts (Dumbbell Lateral Raises, Bicep Curls, Tricep Pushdowns, Calf Raises): Recommend adding +1 to 2 kg (+2.5 lbs).
3. Rep Progression: If adding weight is not yet feasible, the app encourages adding repetitions within the target range before increasing resistance.
4. Auto-Preloading: IronLog pre-loads previous session weights so lifters always know the exact benchmark to beat.`
  },
  {
    id: 'golden_era_ratios',
    title: 'Golden-Era Aesthetic Proportions & Steve Reeves Grecian Ratios',
    category: 'aesthetic',
    keywords: ['golden', 'era', 'ratio', 'ratios', 'aesthetic', 'steve', 'reeves', 'grecian', 'mccallum', 'proportions', 'waist', 'arm', 'chest', 'v-taper', 'body'],
    content: `IronLog's Body model calculates classic Golden-Era bodybuilding targets based on Steve Reeves and John McCallum formulas:
• V-Taper (Chest-to-Waist): The Golden Ratio is 1.618. Target chest circumference is 1.618× your waist circumference.
• Arm Size: Target arm circumference is approximately 2.52 × wrist circumference.
• Classical Symmetry (1:1:1): Calves and Neck circumferences should ideally match your Arm circumference.
• Thighs: Target thigh circumference is approximately 1.75 × knee circumference.
Lifters enter wrist, knee, and tape measurements in the Body tab to calculate their aesthetic rating and 1-month future projections.`
  },
  {
    id: 'muscle_recovery',
    title: 'Muscle Recovery Tracking & Fatigue Modeling',
    category: 'recovery',
    keywords: ['recovery', 'muscle', 'soreness', 'fatigue', 'score', 'status', 'ready', 'hours', 'body', 'map'],
    content: `IronLog monitors recovery across all 11 primary muscle groups:
• Calculation Method: Every completed workout logs volume (sets × reps) for targeted muscles. Recovery regenerates over 24 to 72 hours based on total volume and muscle size.
• Small Muscles (Biceps, Triceps, Calves, Abs): Recover within 24 to 48 hours.
• Large Muscles (Quads, Hamstrings, Chest, Back): Recover within 48 to 72 hours.
• Color Status on Anatomical Body Map:
  🔴 Red (<40%): High fatigue; active rest advised.
  🟡 Yellow (40–80%): Partial recovery; moderate volume allowable.
  🟢 Green (>80%): Fully recovered and primed for progressive overload.
Users can inspect the front and back anatomical visualizer on the Body tab.`
  },
  {
    id: 'workout_splits',
    title: '15 Workout Splits & Custom Daily Routines',
    category: 'splits',
    keywords: ['workout', 'routine', 'split', 'splits', 'ppl', 'push', 'pull', 'legs', 'upper', 'lower', 'arnold', 'full', 'body', 'schedule'],
    content: `IronLog includes 15 built-in workout routines:
1. Push-Pull-Legs (PPL 6-Day): The default hypertrophy split rotating Push A, Pull A, Legs A, Push B, Pull B, Legs B, and Sunday Rest.
2. Upper / Lower Split (4-Day): Balances volume with extra recovery days.
3. Arnold Split (6-Day): Classic split pairing Chest & Back on Day 1, Shoulders & Arms on Day 2, and Legs on Day 3.
4. Full Body (3-Day): Optimal for beginners or time-constrained schedules.
Lifters can swap exercises, reorder movements, or use the "Override Split" button on the Today tab to switch routines on any day.`
  },
  {
    id: 'exercise_library',
    title: '82-Exercise Library & Muscle Group Targets',
    category: 'exercises',
    keywords: ['exercise', 'exercises', 'library', 'chest', 'back', 'lats', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'calves', 'abs', 'list'],
    content: `IronLog comes with 82 pre-programmed hypertrophy movements across 11 muscle groups:
• Chest: Flat Dumbbell Bench Press, Incline Barbell Press, Cable Chest Fly, Dips.
• Back / Lats: Barbell Bent-Over Row, Lat Pulldown, Seated Cable Row, Pull-Ups.
• Shoulders: Overhead Barbell Press, Dumbbell Lateral Raise, Cable Face Pull, Rear Delt Fly.
• Biceps & Triceps: Incline Dumbbell Curl, Hammer Curl, Skull Crushers, Cable Rope Pushdown.
• Legs (Quads, Hamstrings, Glutes, Calves): Barbell Back Squat, Romanian Deadlift (RDL), Leg Press, Bulgarian Split Squat, Standing Calf Raise.
• Abs: Hanging Leg Raise, Cable Woodchoppers, Ab Wheel Rollouts.
Users can create unlimited custom exercises via the Exercises tab.`
  },
  {
    id: 'active_workout_logging',
    title: 'Active Workout Logging & Check-In Protocol',
    category: 'logging',
    keywords: ['log', 'logging', 'active', 'session', 'start', 'finish', 'checkin', 'check-in', 'set', 'sets', 'reps', 'weight', 'track'],
    content: `How to log training sessions in IronLog:
1. Navigate to the Today tab and tap "Start Workout" or "Check In".
2. Enter the working Weight and Reps for each set.
3. Tap the Checkmark (✓) button to mark the set complete. This immediately activates the Rest Timer.
4. If you need to substitute an exercise, tap "Swap" to pick another movement for that muscle group.
5. Tap "Finish Workout" when complete. The session is saved to local history and scheduled for debounced cloud backup.`
  },
  {
    id: 'rest_timer_chime',
    title: 'Rest Timer, Web Audio Harmonic Chime & Mobile Haptics',
    category: 'timer',
    keywords: ['timer', 'rest', 'chime', 'sound', 'bell', 'audio', 'vibrate', 'vibration', 'haptics', 'pause', 'adjust'],
    content: `IronLog includes an integrated rest timer:
• Auto-Start: Automatically triggers as soon as any set is marked complete (✓).
• Web Audio Synthesis: Rather than streaming MP3s, IronLog synthesizes a resonant harmonic chime directly via the browser's Web Audio API. Works 100% offline.
• Tactile Haptics: Triggers a double-pulse vibration on supported mobile devices when rest expires.
• Floating Rest Bar: Provides quick +/-15s and +30s buttons, pause, and dismiss.
• Duration: Default is 90 seconds, customizable in Settings.`
  },
  {
    id: 'cloud_sync_offline',
    title: 'Offline-First Architecture & Supabase Cloud Sync',
    category: 'sync',
    keywords: ['offline', 'cloud', 'sync', 'supabase', 'backup', 'guest', 'account', 'login', 'signup', 'merge', 'storage'],
    content: `IronLog's offline-first architecture:
• Local Storage: All workouts and weights are saved instantly to localStorage ('il'). You never lose workout data due to poor gym reception.
• Debounced Sync: 1.5 seconds after saving, changes automatically sync to Supabase PostgreSQL ('user_data' table).
• Non-Destructive Union Merge: Workout sessions and weights are merged by date and unique timestamp keys, ensuring multi-device synchronization never overwrites logs.
• Guest Mode vs Account: Full offline browsing in Guest Mode; signing in with Google or Email activates cloud backup.`
  },
  {
    id: 'units_and_settings',
    title: 'Units, Themes & Data Export / Import',
    category: 'settings',
    keywords: ['unit', 'units', 'kg', 'lbs', 'cm', 'inches', 'theme', 'dark', 'light', 'export', 'import', 'csv', 'json', 'backup', 'settings'],
    content: `IronLog settings and data control:
• Units: Switch between Kilograms (kg) and Pounds (lbs), and Centimeters (cm) and Inches (in) in Settings.
• Themes: Dark Theme, Light Theme, and System Automatic.
• Data Portability: Export full JSON backups, import JSON backups, or export a CSV spreadsheet of completed workouts.`
  }
];

// Common conversational filler words and stopwords for token normalization
const STOP_WORDS = new Set([
  'a', 'about', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'can', 'could', 'did',
  'do', 'does', 'for', 'from', 'get', 'give', 'got', 'had', 'has', 'have', 'he',
  'her', 'here', 'him', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its',
  'just', 'me', 'my', 'no', 'not', 'of', 'on', 'or', 'our', 'out', 'please',
  'she', 'should', 'so', 'some', 'tell', 'than', 'that', 'the', 'their', 'them',
  'then', 'there', 'these', 'they', 'this', 'to', 'us', 'was', 'we', 'were',
  'what', 'whats', 'when', 'where', 'which', 'who', 'why', 'will', 'with', 'would',
  'you', 'your',
  'app', 'ironlog', 'explain', 'describe', 'show', 'work', 'works', 'working',
  'mean', 'means', 'guide', 'info', 'information', 'details', 'know'
]);

// Explicit out-of-scope triggers
const OFF_TOPIC_TRIGGERS = [
  'president', 'prime minister', 'politics', 'election', 'government',
  'france', 'paris', 'germany', 'capital of', 'weather', 'forecast',
  'recipe', 'bake', 'baking', 'cook', 'cooking', 'pizza', 'cake',
  'python', 'javascript', 'html code', 'css code', 'programming', 'script to',
  'stock price', 'stocks', 'nasdaq', 'bitcoin', 'crypto',
  'movie', 'actor', 'actress', 'song lyrics', 'poem', 'quantum'
];

// Scope domain keywords
const SCOPE_KEYWORDS = [
  'sync', 'cloud', 'supabase', 'backup', 'export', 'import',
  'csv', 'json', 'theme', 'dark', 'light', 'offline', 'guest', 'account', 'login',
  'signup', 'password', 'reset', 'unit', 'units', 'kg', 'lbs', 'cm',
  'setting', 'settings', 'cache',
  'workout', 'routine', 'split', 'ppl', 'push', 'pull', 'legs', 'upper', 'lower',
  'full body', 'arnold', 'bro', 'session', 'schedule', 'rest', 'active', 'checkin',
  'check in', 'start workout', 'finish', 'log', 'logging', 'override', 'swap', 'reorder', 'today',
  'exercise', 'exercises', 'lift', 'lifting', 'set', 'sets', 'rep', 'reps', 'weight',
  'weights', 'rpe', '1rm', 'pr', 'overload', 'progressive', 'progression', 'volume',
  'intensity', 'frequency', 'dumbbell', 'barbell', 'cable', 'machine', 'smith', 'bench',
  'squat', 'deadlift', 'press', 'row', 'curl', 'extension', 'pulldown', 'chinup', 'pullup',
  'dip', 'raise', 'lunge', 'shrug', 'crunch', 'fly', 'pushdown', 'form', 'technique',
  'muscle', 'muscles', 'chest', 'pec', 'pecs', 'back', 'lat', 'lats', 'shoulder', 'shoulders',
  'delt', 'delts', 'deltoid', 'bicep', 'biceps', 'tricep', 'triceps', 'quad', 'quads',
  'quadriceps', 'hamstring', 'hamstrings', 'glute', 'glutes', 'calf', 'calves', 'abs',
  'core', 'traps', 'forearm', 'forearms', 'neck', 'anatomy',
  'hypertrophy', 'growth', 'recovery', 'fatigue', 'soreness', 'score', 'aesthetic',
  'golden', 'ratio', 'ratios', 'proportions', 'grecian', 'steve', 'reeves', 'measurement',
  'measurements', 'tape', 'waist', 'arm', 'thigh', 'wrist', 'knee', 'bodyweight', 'fat',
  'bulk', 'cut', 'recomposition', 'timer', 'chime', 'bell', 'vibration', 'haptic',
  'rag', 'ai', 'coach', 'assistant'
];

// -------------------------------------------------------------
// Text Normalization & Keyword Extraction
// -------------------------------------------------------------

export function normalizeQuery(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractKeywords(text) {
  const norm = normalizeQuery(text);
  if (!norm) return [];
  const words = norm.split(' ');
  const tokens = [];

  for (let w of words) {
    if (w.length <= 1) continue;
    if (STOP_WORDS.has(w)) continue;

    let stemmed = w;
    if (stemmed.endsWith('ing') && stemmed.length > 5) stemmed = stemmed.slice(0, -3);
    else if (stemmed.endsWith('ies') && stemmed.length > 4) stemmed = stemmed.slice(0, -3) + 'y';
    else if (stemmed.endsWith('es') && stemmed.length > 4 && stemmed !== 'united') stemmed = stemmed.slice(0, -2);
    else if (stemmed.endsWith('s') && !stemmed.endsWith('ss') && stemmed.length > 3 && stemmed !== 'this') stemmed = stemmed.slice(0, -1);
    else if (stemmed.endsWith('ed') && stemmed.length > 5 && stemmed !== 'united') stemmed = stemmed.slice(0, -2);

    tokens.push(stemmed);
  }

  return Array.from(new Set(tokens));
}

export function getBigrams(text) {
  const norm = normalizeQuery(text).replace(/\s+/g, '');
  const bigrams = new Set();
  for (let i = 0; i < norm.length - 1; i++) {
    bigrams.add(norm.slice(i, i + 2));
  }
  return bigrams;
}

export function calculateSimilarity(query1, query2, tokens1 = null, tokens2 = null) {
  const norm1 = normalizeQuery(query1);
  const norm2 = normalizeQuery(query2);

  if (norm1 === norm2) return 1.0;
  if (!norm1 || !norm2) return 0.0;

  // Conflicting timeframe check (e.g. today vs tomorrow vs day after tomorrow vs specific weekdays)
  const getTimeTag = (str) => {
    if (str.includes('day after tomorrow') || str.includes('in 2 days')) return 'day_after_tomorrow';
    if (str.includes('tomorrow') || str.includes('tommrow') || str.includes('tmrw') || str.includes('tomorow')) return 'tomorrow';
    if (str.includes('today')) return 'today';
    if (str.includes('yesterday')) return 'yesterday';
    for (const w of ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']) {
      if (str.includes(w)) return w;
    }
    return null;
  };

  const isTime1 = getTimeTag(norm1);
  const isTime2 = getTimeTag(norm2);
  if (isTime1 && isTime2 && isTime1 !== isTime2) {
    return 0.1; // Mutually exclusive timeframes
  }

  // Conflicting muscle targets check (e.g. chest vs leg)
  const muscleGroups = ['chest', 'back', 'lat', 'shoulder', 'delt', 'bicep', 'tricep', 'quad', 'hamstring', 'glute', 'calf', 'abs', 'leg', 'legs', 'arm', 'arms'];
  const m1 = muscleGroups.find(m => norm1.includes(m));
  const m2 = muscleGroups.find(m => norm2.includes(m));
  if (m1 && m2 && m1 !== m2) {
    return 0.1; // Mutually exclusive muscle targets
  }

  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    const minLen = Math.min(norm1.length, norm2.length);
    const maxLen = Math.max(norm1.length, norm2.length);
    if (minLen / maxLen >= 0.70) return 0.90;
  }

  const t1 = tokens1 || extractKeywords(query1);
  const t2 = tokens2 || extractKeywords(query2);

  if (t1.length === 0 || t2.length === 0) return 0.0;

  const s1 = new Set(t1);
  const s2 = new Set(t2);
  let intersection = 0;
  for (const item of s1) {
    if (s2.has(item)) intersection++;
  }

  const union = new Set([...t1, ...t2]).size;
  const jaccard = union > 0 ? intersection / union : 0;
  const minTokenLen = Math.min(s1.size, s2.size);
  const overlap = minTokenLen > 0 ? intersection / minTokenLen : 0;

  // Only allow overlap bonus if 2 or more distinct keywords match
  const multiTokenOverlap = intersection >= 2 ? (overlap * 0.7 + jaccard * 0.3) : jaccard;

  if (overlap === 1.0 && intersection >= 2) {
    return Math.max(0.85, 0.5 * jaccard + 0.5 * overlap);
  }

  const bg1 = getBigrams(norm1);
  const bg2 = getBigrams(norm2);
  let dice = 0;
  if (bg1.size > 0 && bg2.size > 0) {
    let matches = 0;
    for (const bg of bg1) {
      if (bg2.has(bg)) matches++;
    }
    dice = (2 * matches) / (bg1.size + bg2.size);
  }

  const lev = calculateLevenshteinRatio(norm1, norm2);

  return Math.max(
    multiTokenOverlap,
    jaccard * 0.6 + dice * 0.4,
    dice * 0.8 + lev * 0.2,
    lev
  );
}

function calculateLevenshteinRatio(s1, s2) {
  if (s1 === s2) return 1.0;
  const l1 = s1.length;
  const l2 = s2.length;
  if (l1 === 0 || l2 === 0) return 0.0;

  const maxLen = Math.max(l1, l2);
  const track = Array(l2 + 1).fill(null).map(() => Array(l1 + 1).fill(null));
  for (let i = 0; i <= l1; i += 1) track[0][i] = i;
  for (let j = 0; j <= l2; j += 1) track[j][0] = j;

  for (let j = 1; j <= l2; j += 1) {
    for (let i = 1; i <= l1; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }

  const distance = track[l2][l1];
  return Math.max(0, 1 - distance / maxLen);
}

export function isQueryInScope(query) {
  if (!query || typeof query !== 'string') return false;
  const norm = normalizeQuery(query);
  if (!norm) return false;

  // 1. Check explicit off-topic triggers
  for (const trigger of OFF_TOPIC_TRIGGERS) {
    if (norm.includes(trigger)) {
      const anchors = ['workout', 'hypertrophy', 'exercise', 'lifting', 'muscle', 'sets', 'reps', 'ironlog', 'rag'];
      if (!anchors.some(a => norm.includes(a))) {
        return false;
      }
    }
  }

  // 2. Greetings
  const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'who are you', 'help', 'what can you do'];
  if (greetings.some(g => norm === g || norm.startsWith(g + ' ') || norm.endsWith(' ' + g))) {
    return true;
  }

  // 3. Check explicit scope keywords with word boundaries
  for (const kw of SCOPE_KEYWORDS) {
    const regex = new RegExp(`\\b${kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    if (regex.test(norm)) {
      return true;
    }
  }

  // 4. Check token matches
  const tokens = extractKeywords(query);
  const scopeSet = new Set(SCOPE_KEYWORDS);
  if (tokens.some(t => scopeSet.has(t))) {
    return true;
  }

  return false;
}

// -------------------------------------------------------------
// RAG Retrieval Engine (BM25 + TF-IDF Vector Ranking)
// -------------------------------------------------------------

/**
 * Retrieve the most relevant knowledge base chunks for a query
 */
export function retrieveRagChunks(query, topK = 3) {
  const qTokens = extractKeywords(query);
  if (qTokens.length === 0) {
    return IRONLOG_RAG_CORPUS.slice(0, topK);
  }

  const scoredChunks = IRONLOG_RAG_CORPUS.map(chunk => {
    let score = 0;
    const chunkTokens = extractKeywords(chunk.title + ' ' + chunk.content);
    const chunkTokenSet = new Set(chunkTokens);
    const keywordSet = new Set(chunk.keywords || []);

    for (const qt of qTokens) {
      // Direct keyword tag match (high weight)
      if (keywordSet.has(qt)) score += 4.0;
      // Title or content token match
      if (chunkTokenSet.has(qt)) score += 2.0;
    }

    // Substring match in title
    const normTitle = normalizeQuery(chunk.title);
    for (const qt of qTokens) {
      if (normTitle.includes(qt)) score += 3.0;
    }

    return { chunk, score };
  });

  scoredChunks.sort((a, b) => b.score - a.score);

  // Return topK chunks with non-zero scores, or first topK if none scored
  const positive = scoredChunks.filter(s => s.score > 0);
  if (positive.length > 0) {
    return positive.slice(0, topK).map(s => s.chunk);
  }
  return IRONLOG_RAG_CORPUS.slice(0, topK);
}

// -------------------------------------------------------------
// Supabase pgvector Semantic Search & Embeddings
// -------------------------------------------------------------

/**
 * Generate embedding vector using Gemini (Free) or OpenAI
 */
export async function generateEmbedding(text, apiKey, provider = 'gemini') {
  if (!text || !apiKey) return null;

  try {
    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey.trim()}`;
      const payload = {
        model: 'models/text-embedding-004',
        content: { parts: [{ text: text.slice(0, 2000) }] }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) return null;
      const data = await res.json();
      return data.embedding?.values || null;
    }

    if (provider === 'openai') {
      const url = 'https://api.openai.com/v1/embeddings';
      const payload = {
        model: 'text-embedding-3-small',
        input: text.slice(0, 2000),
        dimensions: 768
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) return null;
      const data = await res.json();
      return data.data?.[0]?.embedding || null;
    }
  } catch (err) {
    console.warn('Embedding API error:', err.message);
  }

  return null;
}

/**
 * Query Supabase pgvector match_ironlog_documents RPC
 */
export async function searchSupabasePgVector(query, apiKey, provider = 'gemini', topK = 3) {
  try {
    const client = getClient();
    if (!client) return null;

    const queryEmbedding = await generateEmbedding(query, apiKey, provider);
    if (!queryEmbedding) return null;

    const { data, error } = await client.rpc('match_ironlog_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.35,
      match_count: topK
    });

    if (error || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    return data.map(row => ({
      id: row.id,
      title: row.title,
      category: row.category,
      content: row.content,
      similarity: row.similarity
    }));
  } catch (err) {
    console.warn('Supabase pgvector query bypassed:', err.message);
    return null;
  }
}

/**
 * Hybrid RAG Retrieval: Supabase pgvector when online, Local BM25 fallback when offline
 */
export async function retrieveHybridChunks(query, apiKey = '', provider = 'gemini', topK = 3) {
  if (apiKey && typeof navigator !== 'undefined' && navigator.onLine) {
    const vectorChunks = await searchSupabasePgVector(query, apiKey, provider, topK);
    if (vectorChunks && vectorChunks.length > 0) {
      return { chunks: vectorChunks, source: 'supabase-pgvector' };
    }
  }

  // Local in-memory BM25 retrieval
  return { chunks: retrieveRagChunks(query, topK), source: 'local-bm25' };
}

/**
 * Sync & embed the local corpus chunks into Supabase ironlog_rag_documents table
 */
export async function syncCorpusToSupabase(apiKey, provider = 'gemini', onProgress = null) {
  const client = getClient();
  if (!client) throw new Error('Supabase is not configured.');
  if (!apiKey) throw new Error('API key is required to generate vector embeddings.');

  let synced = 0;
  for (const chunk of IRONLOG_RAG_CORPUS) {
    if (onProgress) onProgress(synced + 1, IRONLOG_RAG_CORPUS.length, chunk.title);

    // Compute embedding for the chunk
    const embedding = await generateEmbedding(`${chunk.title}\n${chunk.content}`, apiKey, provider);

    const row = {
      id: chunk.id,
      title: chunk.title,
      category: chunk.category,
      content: chunk.content,
      embedding: embedding || null,
      updated_at: new Date().toISOString()
    };

    const { error } = await client
      .from('ironlog_rag_documents')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.warn(`Failed to upsert chunk ${chunk.id}:`, error.message);
    } else {
      synced++;
    }
  }

  return { total: IRONLOG_RAG_CORPUS.length, synced };
}

/**
 * Build live user state context for RAG prompt augmentation
 */
export function buildLiveUserContext() {
  const state = getState();
  const todayStr = getTodayDate();
  const unit = state.wu || 'kg';
  const lenUnit = state.u || 'cm';
  const latestWeight = getLatestWeight();

  // Today's split
  let todaySplitName = 'Rest Day';
  let todayExercises = [];

  const dayIndex = (new Date().getDay() + 6) % 7;
  const todaySplit = (state.ov && state.ov.d === todayStr)
    ? (state.ov.i >= 0 ? WORKOUT_SPLITS[state.ov.i] : null)
    : (dayIndex <= 5 ? WORKOUT_SPLITS[dayIndex] : null);

  if (todaySplit) {
    todaySplitName = todaySplit[0];
    todayExercises = (todaySplit[1] || []).map(id => DEFAULT_EXERCISES[id]?.name || id);
  }

  // Tomorrow's split
  const tomorrowDay = (new Date().getDay() + 1) % 7;
  const tomorrowIndex = (tomorrowDay + 6) % 7;
  let tomorrowSplitName = 'Rest Day';
  let tomorrowExercises = [];

  const tomorrowSplit = tomorrowIndex <= 5 ? WORKOUT_SPLITS[tomorrowIndex] : null;
  if (tomorrowSplit) {
    tomorrowSplitName = tomorrowSplit[0];
    tomorrowExercises = (tomorrowSplit[1] || []).map(id => DEFAULT_EXERCISES[id]?.name || id);
  }

  // Day after tomorrow's split
  const dayAfterTomorrowDate = new Date(Date.now() + 2 * 86400000);
  const dayAfterTomorrowIndex = (dayAfterTomorrowDate.getDay() + 6) % 7;
  let dayAfterTomorrowSplitName = 'Rest Day';
  let dayAfterTomorrowExercises = [];

  const dayAfterTomorrowSplit = dayAfterTomorrowIndex <= 5 ? WORKOUT_SPLITS[dayAfterTomorrowIndex] : null;
  if (dayAfterTomorrowSplit) {
    dayAfterTomorrowSplitName = dayAfterTomorrowSplit[0];
    dayAfterTomorrowExercises = (dayAfterTomorrowSplit[1] || []).map(id => DEFAULT_EXERCISES[id]?.name || id);
  }

  const activeStatus = state.a 
    ? `Active Workout in progress: ${state.a.n || 'Training'} (Started ${new Date(state.a.start).toLocaleTimeString()})`
    : 'No active workout currently running.';

  const profileInfo = state.p ? `
- User Profile: Gender: ${state.p.g === 'm' ? 'Male' : state.p.g === 'f' ? 'Female' : 'Other'}, Age: ${state.p.a}, Height: ${state.p.h} cm, Target Weight: ${state.p.w} kg, Goal: ${state.p.o}, Experience: ${state.p.l === 'a' ? 'Advanced' : state.p.l === 'i' ? 'Intermediate' : 'Beginner'}
- Priority Muscles: ${(state.p.pri || []).join(', ') || 'Standard balance'}
` : '- User Profile: Not yet completed.';

  return `
[LIVE USER APPLICATION STATE]
- Today's Date: ${todayStr}
- Today's Scheduled Split: ${todaySplitName}
- Today's Movements: ${todayExercises.join(', ') || 'None (Rest Day)'}
- Tomorrow's Scheduled Split: ${tomorrowSplitName}
- Tomorrow's Movements: ${tomorrowExercises.join(', ') || 'None (Rest Day)'}
- Day After Tomorrow (${dayAfterTomorrowDate.toLocaleDateString(undefined, { weekday: 'long' })}): ${dayAfterTomorrowSplitName} (${dayAfterTomorrowExercises.join(', ') || 'Rest Day'})
- Active Session: ${activeStatus}
- Latest Logged Body Weight: ${formatWeight(latestWeight, unit)} ${unit}
- Length Unit: ${lenUnit}
${profileInfo}
`.trim();
}

/**
 * Build complete RAG augmented prompt for LLM execution
 */
export function buildRagPrompt(query, retrievedChunks, userContext) {
  const contextText = retrievedChunks.map((c, i) => `[DOCUMENT ${i + 1}: ${c.title}]\n${c.content}`).join('\n\n');

  return {
    systemPrompt: `You are the IronLog AI Coach, an expert fitness, hypertrophy, and bodybuilding coach integrated directly into the IronLog app.

STRICT INSTRUCTIONS:
1. ONLY answer questions related to IronLog, workouts, gym exercises, progressive overload, recovery, and aesthetic proportions.
2. Ground your answers firmly in the PROVIDED IRONLOG RETRIEVED CONTEXT and LIVE USER STATE. Do not invent app features that are not in the context.
3. If the user asks something unrelated to IronLog or gym training, politely decline and steer them back to training.
4. Keep responses crisp, actionable, inspiring, and formatted in clean GitHub-style Markdown.`,
    userPrompt: `RETRIEVED IRONLOG KNOWLEDGE BASE CONTEXT:
${contextText}

${userContext}

USER QUESTION:
${query}`
  };
}

// -------------------------------------------------------------
// Admin Authorization & Write-Only Security
// -------------------------------------------------------------

export const ADMIN_EMAILS = ['salman.a@vigocare.com', 'admin@ironlog.app'];
export const DEFAULT_ADMIN_EMAIL = 'salman.a@vigocare.com';
export const DEFAULT_ADMIN_PASSCODE = 'ironlog-admin-2026';
const ADMIN_STORAGE_KEY = 'il_admin_passcode';
const ADMIN_SESSION_KEY = 'il_admin_session';

export function getAdminPasscode() {
  try {
    return localStorage.getItem(ADMIN_STORAGE_KEY) || DEFAULT_ADMIN_PASSCODE;
  } catch (e) {
    return DEFAULT_ADMIN_PASSCODE;
  }
}

export function setAdminPasscode(newPasscode) {
  if (!newPasscode || newPasscode.trim().length < 6) {
    throw new Error('Admin passcode must be at least 6 characters.');
  }
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, newPasscode.trim());
    return true;
  } catch (e) {
    return false;
  }
}

export function isAdminSession() {
  try {
    // 1. Session-level authentication in this browser tab
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true') {
      return true;
    }
    // 2. Authenticated Supabase user matching admin email or role
    if (typeof window !== 'undefined' && window.IronLog && typeof window.IronLog.getCurrentUser === 'function') {
      const user = window.IronLog.getCurrentUser();
      if (user && (ADMIN_EMAILS.includes(user.email) || user.app_metadata?.role === 'admin')) {
        return true;
      }
    }
  } catch (e) {}
  return false;
}

export function verifyAdminPasscode(enteredPasscode) {
  if (!enteredPasscode) return false;
  const currentPasscode = getAdminPasscode();
  if (enteredPasscode.trim() === currentPasscode.trim()) {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      }
    } catch (e) {}
    return true;
  }
  return false;
}

export function lockAdminSession() {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
  } catch (e) {}
}

// -------------------------------------------------------------
// AI Provider Configuration & Generation Service
// -------------------------------------------------------------

export const DEFAULT_AI_CONFIG = {
  provider: 'gemini', // 'gemini' | 'openai' | 'custom'
  apiKey: '',         // Stored locally in localStorage / browser (never committed)
  model: 'gemini-1.5-flash',
  customEndpoint: ''
};

export function getAiConfig() {
  try {
    const raw = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed) {
        return {
          ...DEFAULT_AI_CONFIG,
          ...parsed,
          apiKey: parsed.apiKey || DEFAULT_AI_CONFIG.apiKey
        };
      }
    }
  } catch (e) {}
  return { ...DEFAULT_AI_CONFIG };
}

export function setAiConfig(config) {
  try {
    const current = getAiConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to save AI config:', e);
    return getAiConfig();
  }
}

/**
 * Call cloud LLM provider with RAG augmented prompt
 */
export async function callCloudLlm(ragPrompt, config) {
  const { provider, apiKey, model, customEndpoint } = config;
  if (!apiKey) {
    throw new Error('No API key configured');
  }

  // 1. Google Gemini API
  if (provider === 'gemini') {
    const targetModel = model || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey.trim()}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: ragPrompt.systemPrompt + '\n\n' + ragPrompt.userPrompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 800
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData.error ? errData.error.message : `Gemini HTTP ${res.status}`;
      throw new Error(msg);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) throw new Error('No response text returned from Gemini API.');
    return candidate.trim();
  }

  // 2. OpenAI / Compatible endpoint
  if (provider === 'openai' || provider === 'custom') {
    const endpoint = customEndpoint || 'https://api.openai.com/v1/chat/completions';
    const targetModel = model || 'gpt-4o-mini';

    const payload = {
      model: targetModel,
      temperature: 0.3,
      messages: [
        { role: 'system', content: ragPrompt.systemPrompt },
        { role: 'user', content: ragPrompt.userPrompt }
      ]
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData.error ? errData.error.message : `OpenAI HTTP ${res.status}`;
      throw new Error(msg);
    }

    const data = await res.json();
    const candidate = data.choices?.[0]?.message?.content;
    if (!candidate) throw new Error('No response text returned from OpenAI API.');
    return candidate.trim();
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}

/**
 * Dynamically resolves workout schedule queries (today, tomorrow, day after tomorrow, specific weekdays)
 */
export function resolveWorkoutScheduleQuery(query) {
  const norm = normalizeQuery(query);
  const scheduleWords = ['workout', 'routine', 'split', 'schedule', 'train', 'exercise', 'movement', 'plan'];
  if (!scheduleWords.some(w => norm.includes(w))) {
    return null;
  }

  const state = getState();
  const todayStr = getTodayDate();

  let targetIndex = null;
  let targetLabel = '';

  if (norm.includes('day after tomorrow') || norm.includes('in 2 days') || norm.includes('2 days from now')) {
    const targetDate = new Date(Date.now() + 2 * 86400000);
    const targetDay = targetDate.getDay();
    targetIndex = (targetDay + 6) % 7;
    const weekdayName = targetDate.toLocaleDateString(undefined, { weekday: 'long' });
    targetLabel = `The Day After Tomorrow (${weekdayName})`;
  } else if (norm.includes('tomorrow') || norm.includes('tommrow') || norm.includes('tomorow') || norm.includes('tmrw')) {
    const targetDate = new Date(Date.now() + 86400000);
    const targetDay = targetDate.getDay();
    targetIndex = (targetDay + 6) % 7;
    const weekdayName = targetDate.toLocaleDateString(undefined, { weekday: 'long' });
    targetLabel = `Tomorrow (${weekdayName})`;
  } else if (norm.includes('today') || norm.includes('current')) {
    const dayIndex = (new Date().getDay() + 6) % 7;
    targetIndex = (state.ov && state.ov.d === todayStr)
      ? (state.ov.i >= 0 ? state.ov.i : -1)
      : (dayIndex <= 5 ? dayIndex : -1);
    targetLabel = 'Today';
  } else {
    // Check specific weekdays
    const weekdays = [
      { name: 'monday', idx: 0 },
      { name: 'tuesday', idx: 1 },
      { name: 'wednesday', idx: 2 },
      { name: 'thursday', idx: 3 },
      { name: 'friday', idx: 4 },
      { name: 'saturday', idx: 5 },
      { name: 'sunday', idx: 6 }
    ];
    for (const w of weekdays) {
      if (norm.includes(w.name)) {
        targetIndex = w.idx;
        targetLabel = w.name.charAt(0).toUpperCase() + w.name.slice(1);
        break;
      }
    }
  }

  if (targetIndex === null) return null;

  if (targetIndex < 0 || targetIndex > 5 || !WORKOUT_SPLITS[targetIndex]) {
    return `📅 **${targetLabel} is scheduled as a Rest Day.**\n\nRest and recovery are when hypertrophy occurs. Hit your protein targets and sleep well.\n*Tip: You can use "Override Split" on the Today tab if you wish to train.*`;
  }

  const split = WORKOUT_SPLITS[targetIndex];
  const splitName = split[0];
  const exercises = (split[1] || []).map(id => DEFAULT_EXERCISES[id]?.name || id);

  return `🏋️ **${targetLabel}'s Scheduled Routine: ${splitName}**\n\n${exercises.map(name => `• **${name}**`).join('\n')}\n\n*Targeted movements for ${splitName}. Prepare to crush it!*`;
}

/**
 * Local RAG Generation Fallback (Executes when offline or without API key)
 */
export function generateLocalRagResponse(query, retrievedChunks) {
  const norm = normalizeQuery(query);
  const liveContext = buildLiveUserContext();

  // Greetings, identity, and capabilities
  const greetings = ['who are you', 'who r u', 'what can you do', 'hi', 'hello', 'hey', 'help', 'what are you', 'introduce yourself'];
  if (greetings.some(g => norm === g || norm.startsWith(g + ' ') || norm.endsWith(' ' + g))) {
    return `👋 **I am the IronLog AI Coach!**

I am your dedicated hypertrophy and workout training companion, grounded directly in the IronLog app and your personal training data.

Here is what I can help you with:
• **Today's Workout**: Check your scheduled split (PPL, Upper/Lower, Arnold), exercises, target sets, and reps.
• **Progressive Overload**: Learn how IronLog calculates your next weight suggestions (+2.5 kg for compounds, +1 kg for isolations).
• **Golden-Era Proportions**: Steve Reeves & John McCallum Grecian ratio targets (1.618 V-taper, arms, neck, calves).
• **Muscle Recovery**: Recovery percentages (0–100%) and fatigue color statuses across 11 muscle groups.
• **Rest Timer & Audio**: Web Audio harmonic chime synthesis and mobile haptic vibration.
• **Cloud Sync & Offline**: Supabase backup, pgvector semantic search, and offline logging.

Ask me anything about your workouts, or tap one of the quick inquiry chips!`;
  }

  // Check dynamic schedule query (today, tomorrow, day after tomorrow, specific weekdays)
  const scheduleAnswer = resolveWorkoutScheduleQuery(query);
  if (scheduleAnswer) {
    return scheduleAnswer;
  }

  // Synthesize answer directly from highest-ranking retrieved knowledge chunk
  const primaryChunk = retrievedChunks[0];
  const secondaryChunk = retrievedChunks[1];

  let synthesized = `🧠 **${primaryChunk.title}**\n\n${primaryChunk.content}`;
  if (secondaryChunk && secondaryChunk.id !== primaryChunk.id) {
    synthesized += `\n\n---\n**Related: ${secondaryChunk.title}**\n${secondaryChunk.content.split('\n')[0]}`;
  }

  return synthesized;
}

// -------------------------------------------------------------
// Similarity Cache Storage & Retrieval
// -------------------------------------------------------------

export function getChatCache() {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return { version: 2, entries: [] };
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.entries) ? parsed : { version: 2, entries: [] };
  } catch (err) {
    return { version: 2, entries: [] };
  }
}

export function saveChatCache(cache) {
  try {
    if (cache.entries.length > MAX_CACHE_ENTRIES) {
      cache.entries.sort((a, b) => (b.lastHitAt || 0) - (a.lastHitAt || 0));
      cache.entries = cache.entries.slice(0, MAX_CACHE_ENTRIES);
    }
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cache));
  } catch (err) {
    console.warn('Failed to persist chat cache:', err);
  }
}

export function findInCache(query) {
  const normQ = normalizeQuery(query);
  if (!normQ) return null;

  const cache = getChatCache();
  const qTokens = extractKeywords(query);

  let bestMatch = null;
  let highestSimilarity = 0;

  for (const entry of cache.entries) {
    if (entry.normQuery === normQ) {
      entry.hits = (entry.hits || 1) + 1;
      entry.lastHitAt = Date.now();
      saveChatCache(cache);
      return {
        entry,
        similarity: 1.0,
        isExact: true
      };
    }

    const sim = calculateSimilarity(query, entry.originalQuery, qTokens, entry.tokens);
    if (sim > highestSimilarity) {
      highestSimilarity = sim;
      bestMatch = entry;
    }
  }

  if (bestMatch && highestSimilarity >= SIMILARITY_THRESHOLD) {
    bestMatch.hits = (bestMatch.hits || 1) + 1;
    bestMatch.lastHitAt = Date.now();
    saveChatCache(cache);
    return {
      entry: bestMatch,
      similarity: highestSimilarity,
      isExact: false
    };
  }

  return null;
}

export function putInCache(query, response, inScope = true, source = 'rag') {
  const normQ = normalizeQuery(query);
  if (!normQ) return;

  const cache = getChatCache();
  const tokens = extractKeywords(query);

  const existing = cache.entries.find(e => e.normQuery === normQ);
  if (existing) {
    existing.response = response;
    existing.inScope = inScope;
    existing.tokens = tokens;
    existing.source = source;
    existing.lastHitAt = Date.now();
  } else {
    cache.entries.push({
      id: 'cache_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      originalQuery: query.trim(),
      normQuery: normQ,
      tokens,
      response,
      inScope,
      source,
      hits: 1,
      createdAt: Date.now(),
      lastHitAt: Date.now()
    });
  }

  saveChatCache(cache);
}

export function clearChatCache() {
  try {
    localStorage.removeItem(CACHE_STORAGE_KEY);
  } catch (e) {}
}

export function getChatCacheStats() {
  const cache = getChatCache();
  let totalHits = 0;
  for (const e of cache.entries) {
    totalHits += (e.hits || 1);
  }
  return {
    totalEntries: cache.entries.length,
    totalHits,
    entries: cache.entries
  };
}

// -------------------------------------------------------------
// Chat History Storage
// -------------------------------------------------------------

export function getChatHistory() {
  try {
    const raw = sessionStorage.getItem(HISTORY_STORAGE_KEY) || localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveChatHistory(history) {
  try {
    const trimmed = history.slice(-40);
    sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {}
}

export function clearChatHistory() {
  try {
    sessionStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (e) {}
}

export function getOutOfScopeResponse() {
  return `⚠️ **I can only answer questions related to IronLog and your gym training.**

I am your dedicated **IronLog RAG AI Coach**, strictly specialized in:
• Today's workout splits, sets, and reps
• Progressive overload and weight progression
• Golden-Era aesthetic proportions and measurements
• Muscle recovery tracking and anatomical maps
• Rest timer, audio chimes, and haptics
• Supabase cloud sync, offline storage, and app features

*Please ask a question about IronLog or your training!*`;
}

// -------------------------------------------------------------
// Main RAG Pipeline Execution (`askChatbot`)
// -------------------------------------------------------------

export async function askChatbot(query) {
  const trimmed = (query || '').trim();
  if (!trimmed) {
    return {
      response: 'Please enter a question about IronLog or your workout.',
      cached: false,
      hits: 0,
      inScope: true,
      source: 'none'
    };
  }

  // 1. Strict Scope Filter
  const inScope = isQueryInScope(trimmed);
  if (!inScope) {
    const cachedRefusal = findInCache(trimmed);
    if (cachedRefusal && !cachedRefusal.entry.inScope) {
      return {
        response: cachedRefusal.entry.response,
        cached: true,
        hits: cachedRefusal.entry.hits,
        similarity: Math.round(cachedRefusal.similarity * 100),
        inScope: false,
        source: 'cache'
      };
    }

    const refusal = getOutOfScopeResponse();
    putInCache(trimmed, refusal, false, 'refusal');
    return {
      response: refusal,
      cached: false,
      hits: 1,
      inScope: false,
      source: 'refusal'
    };
  }

  // 2. Immediate Identity & Greeting check
  const normQ = normalizeQuery(trimmed);
  const greetings = ['who are you', 'who r u', 'what can you do', 'hi', 'hello', 'hey', 'help', 'what are you', 'introduce yourself'];
  if (greetings.some(g => normQ === g || normQ.startsWith(g + ' ') || normQ.endsWith(' ' + g))) {
    return {
      response: `👋 **I am the IronLog AI Coach!**

I am your dedicated hypertrophy and workout training companion, grounded directly in the IronLog app and your personal training data.

Here is what I can help you with:
• **Today's Workout**: Check your scheduled split (PPL, Upper/Lower, Arnold), exercises, target sets, and reps.
• **Progressive Overload**: How IronLog calculates your next weight suggestions (+2.5 kg for compounds, +1 kg for isolations).
• **Golden-Era Proportions**: Steve Reeves & John McCallum Grecian ratio targets (1.618 V-taper, arms, neck, calves).
• **Muscle Recovery**: Recovery percentages (0–100%) and fatigue color statuses across 11 muscle groups.
• **Rest Timer & Audio**: Web Audio harmonic chime synthesis and mobile haptic vibration.
• **Cloud Sync & Offline**: Supabase backup, pgvector semantic search, and offline logging.

Ask me anything about your training, or tap one of the suggestion chips!`,
      cached: false,
      hits: 1,
      inScope: true,
      source: 'intro'
    };
  }

  // 3. Check Similarity Cache
  const cachedResult = findInCache(trimmed);
  if (cachedResult && cachedResult.entry.inScope) {
    return {
      response: cachedResult.entry.response,
      cached: true,
      hits: cachedResult.entry.hits,
      similarity: Math.round(cachedResult.similarity * 100),
      matchedQuery: cachedResult.entry.originalQuery,
      inScope: true,
      source: 'cache'
    };
  }

  // 3. RAG Retrieval Step: Retrieve relevant knowledge chunks (Supabase pgvector or local BM25)
  const aiConfig = getAiConfig();
  const retrievalResult = await retrieveHybridChunks(trimmed, aiConfig.apiKey, aiConfig.provider, 3);
  const retrievedChunks = retrievalResult.chunks;
  const userContext = buildLiveUserContext();
  const ragPrompt = buildRagPrompt(trimmed, retrievedChunks, userContext);

  // 4. Generation Step: Cloud LLM or Local RAG Engine
  let generatedResponse = '';
  let source = retrievalResult.source === 'supabase-pgvector' ? 'rag-pgvector' : 'rag-local';

  if (aiConfig.apiKey && aiConfig.apiKey.trim().length > 0) {
    try {
      generatedResponse = await callCloudLlm(ragPrompt, aiConfig);
      source = `llm-${aiConfig.provider}+${retrievalResult.source}`;
    } catch (llmErr) {
      console.warn('Cloud LLM call failed, falling back to Local RAG:', llmErr.message);
      generatedResponse = generateLocalRagResponse(trimmed, retrievedChunks);
      source = `rag-fallback+${retrievalResult.source}`;
    }
  } else {
    // Zero-dependency local RAG synthesis
    generatedResponse = generateLocalRagResponse(trimmed, retrievedChunks);
    source = `rag-local+${retrievalResult.source}`;
  }

  // 5. Store in Similarity Cache for instant future retrieval
  putInCache(trimmed, generatedResponse, true, source);

  return {
    response: generatedResponse,
    cached: false,
    hits: 1,
    inScope: true,
    source,
    retrievedChunks: retrievedChunks.map(c => c.title)
  };
}

// -------------------------------------------------------------
// UI Rendering & Event Controller
// -------------------------------------------------------------

let isChatOpen = false;

export function toggleChat(forceState = null) {
  isChatOpen = forceState !== null ? forceState : !isChatOpen;
  const drawer = document.getElementById('chat-drawer');
  const fab = document.getElementById('chat-fab');

  if (!drawer) return;

  if (isChatOpen) {
    drawer.classList.add('open');
    if (fab) fab.classList.add('active');
    renderMessagesList();
    setTimeout(() => {
      const input = document.getElementById('chat-input-field');
      if (input) input.focus();
    }, 150);
  } else {
    drawer.classList.remove('open');
    if (fab) fab.classList.remove('active');
  }
}

export async function sendChatMessage(customText = null) {
  const inputEl = document.getElementById('chat-input-field');
  const query = customText || (inputEl ? inputEl.value : '');
  if (!query || !query.trim()) return;

  if (inputEl && !customText) inputEl.value = '';

  const history = getChatHistory();
  const userMsg = { sender: 'user', text: query.trim(), timestamp: Date.now() };
  history.push(userMsg);
  saveChatHistory(history);
  renderMessagesList();
  scrollChatToBottom();
  showTypingIndicator();

  // Run through RAG pipeline & similarity cache
  const result = await askChatbot(query.trim());

  removeTypingIndicator();

  const botMsg = {
    sender: 'bot',
    text: result.response,
    cached: result.cached,
    hits: result.hits,
    similarity: result.similarity,
    source: result.source,
    inScope: result.inScope,
    timestamp: Date.now()
  };

  history.push(botMsg);
  saveChatHistory(history);
  renderMessagesList();
  scrollChatToBottom();
  updateCacheBadge();
}

function renderMessagesList() {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;

  const history = getChatHistory();
  if (history.length === 0) {
    const aiConfig = getAiConfig();
    const modelBadge = aiConfig.apiKey 
      ? `<span class="chat-guard-pill" style="background:rgba(16,185,129,0.15);color:#10b981">AI Cloud: ${aiConfig.provider} (${aiConfig.model || 'active'})</span>` 
      : `<span class="chat-guard-pill" style="background:rgba(228,83,26,0.15);color:var(--ac)">RAG Engine: Local Offline</span>`;

    container.innerHTML = `
      <div class="chat-welcome">
        <div class="chat-welcome-icon">${ICONS.bot || '🤖'}</div>
        <h3>IronLog AI Coach (RAG)</h3>
        <div style="margin-bottom:8px">${modelBadge}</div>
        <p class="mu-sm">Retrieval-Augmented Assistant grounded exclusively in your IronLog training logs, routines, progressive overload, and Golden-Era aesthetic targets.</p>
        
        <div class="chat-suggestions-title">Quick Inquiries:</div>
        <div class="chat-suggestions-grid">
          <button class="chat-chip" onclick="IronLogChat.askQuick('What is my workout today?')">🏋️ Today's Workout</button>
          <button class="chat-chip" onclick="IronLogChat.askQuick('How does progressive overload work?')">📈 Progressive Overload</button>
          <button class="chat-chip" onclick="IronLogChat.askQuick('Explain Golden Era aesthetic ratios')">🏛️ Golden Ratios</button>
          <button class="chat-chip" onclick="IronLogChat.askQuick('How does muscle recovery tracking work?')">🔋 Muscle Recovery</button>
          <button class="chat-chip" onclick="IronLogChat.askQuick('What are the best chest exercises?')">💪 Chest Exercises</button>
          <button class="chat-chip" onclick="IronLogChat.askQuick('How does cloud sync work?')">☁️ Cloud Sync & Offline</button>
        </div>
      </div>
    `;
    return;
  }

  let html = '';
  for (const msg of history) {
    if (msg.sender === 'user') {
      html += `
        <div class="chat-bubble-row user">
          <div class="chat-bubble user">
            ${escapeHtml(msg.text)}
          </div>
        </div>
      `;
    } else {
      const cacheTag = msg.cached
        ? `<div class="chat-cache-tag" title="Loaded instantly from similarity cache (${msg.hits} total requests)">⚡ Cached (${msg.hits}x)</div>`
        : msg.source && msg.source.startsWith('llm-')
          ? `<div class="chat-cache-tag" style="color:#10b981;background:rgba(16,185,129,0.1)">✨ RAG AI Generation</div>`
          : `<div class="chat-cache-tag" style="color:var(--mu);background:var(--cd-hover)">📖 RAG Retrieved</div>`;

      html += `
        <div class="chat-bubble-row bot">
          <div class="chat-bot-avatar">${ICONS.bot || '🤖'}</div>
          <div class="chat-bubble-wrapper">
            <div class="chat-bubble bot">
              ${formatBotMessage(msg.text)}
            </div>
            ${cacheTag}
          </div>
        </div>
      `;
    }
  }

  container.innerHTML = html;
}

function showTypingIndicator() {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;
  const existing = document.getElementById('chat-typing');
  if (existing) return;

  const typing = document.createElement('div');
  typing.id = 'chat-typing';
  typing.className = 'chat-bubble-row bot';
  typing.innerHTML = `
    <div class="chat-bot-avatar">${ICONS.bot || '🤖'}</div>
    <div class="chat-bubble bot typing-dots">
      <span></span><span></span><span></span>
    </div>
  `;
  container.appendChild(typing);
  scrollChatToBottom();
}

function removeTypingIndicator() {
  const el = document.getElementById('chat-typing');
  if (el) el.remove();
}

function scrollChatToBottom() {
  const container = document.getElementById('chat-messages-container');
  if (container) {
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 20);
  }
}

function updateCacheBadge() {
  const badge = document.getElementById('chat-cache-badge');
  if (badge) {
    const stats = getChatCacheStats();
    badge.textContent = `⚡ ${stats.totalEntries} Cached`;
    badge.title = `${stats.totalEntries} queries cached (${stats.totalHits} total hits)`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatBotMessage(text) {
  if (!text) return '';
  let formatted = escapeHtml(text);
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="chat-code">$1</code>');
  formatted = formatted.replace(/\n• /g, '<br>• ');
  formatted = formatted.replace(/\n---/g, '<hr style="border:0;border-top:1px solid var(--bd);margin:8px 0">');
  formatted = formatted.replace(/\n\n/g, '<br><br>');
  formatted = formatted.replace(/\n/g, '<br>');
  return formatted;
}

/**
 * Open Admin Unlock Modal
 */
export function openAdminUnlockModal() {
  const html = `
    <div class="c" style="max-width:380px;margin:auto">
      <div class="r sb" style="margin-bottom:12px">
        <div class="r" style="gap:6px;align-items:center">
          <h3>🔐 Admin Authentication</h3>
        </div>
        <button class="icon-btn sm" onclick="IronLog.closeModal()">${ICONS.close || '✕'}</button>
      </div>
      <p class="mu-sm">
        API Key configuration and Cloud AI settings are restricted to the <b>IronLog Administrator</b>.
      </p>

      <label style="margin-top:8px">Admin Master Passcode</label>
      <input 
        id="admin_pass_input" 
        type="password" 
        placeholder="Enter Admin Master Passcode..." 
        autocomplete="current-password"
        onkeydown="if(event.key==='Enter') IronLogChat.unlockAdmin()"
      >
      <div class="mu-sm" style="font-size:11px;margin-top:4px">
        Default passcode: <code>ironlog-admin-2026</code> (changeable once unlocked).
      </div>

      <div class="r" style="gap:8px;margin-top:16px">
        <button class="g" style="flex:1" onclick="IronLogChat.unlockAdmin()">Unlock Admin Settings</button>
        <button class="g" onclick="IronLog.closeModal()">Cancel</button>
      </div>
    </div>
  `;

  if (window.IronLog && window.IronLog.openModal) {
    window.IronLog.openModal(html);
  }
}

/**
 * Open AI & RAG Configuration Modal (Admin Mode Only, Write-Only Key)
 */
export function openAiConfigModal() {
  if (!isAdminSession()) {
    openAdminUnlockModal();
    return;
  }

  const current = getAiConfig();
  const hasKey = !!(current.apiKey && current.apiKey.trim().length > 0);

  const html = `
    <div class="c" style="max-width:440px;margin:auto">
      <div class="r sb" style="margin-bottom:12px">
        <div class="r" style="gap:6px;align-items:center">
          <h3>AI & RAG Coach Settings</h3>
          <span class="chat-guard-pill" style="background:rgba(16,185,129,0.15);color:#10b981">Admin Mode</span>
        </div>
        <button class="icon-btn sm" onclick="IronLog.closeModal()">${ICONS.close || '✕'}</button>
      </div>
      <p class="mu-sm">Configure your AI model. IronLog uses RAG (Retrieval-Augmented Generation) to ground the AI in your live workouts and exercise database.</p>

      <label>AI Provider</label>
      <select id="ai_provider" onchange="IronLogChat.onProviderChange(this.value)">
        <option value="gemini" ${current.provider === 'gemini' ? 'selected' : ''}>Google Gemini (Recommended & Free tier)</option>
        <option value="openai" ${current.provider === 'openai' ? 'selected' : ''}>OpenAI (GPT-4o-mini)</option>
        <option value="custom" ${current.provider === 'custom' ? 'selected' : ''}>Custom / OpenRouter / Local</option>
      </select>

      <label style="margin-top:10px">API Key (Write-Only • Masked for Security)</label>
      ${hasKey ? `
        <div style="background:var(--bg);padding:8px 10px;border-radius:var(--radius-sm);margin-bottom:6px;display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="color:#10b981;font-weight:700;font-size:12px">●●●●●●●●●●●● Active API Key Saved</div>
            <div class="mu-sm" style="font-size:10px">Write-only security: Key cannot be viewed or copied from the UI</div>
          </div>
          <button type="button" class="sm g" style="padding:2px 8px;font-size:11px" onclick="IronLogChat.removeApiKey()">Remove Key</button>
        </div>
      ` : `
        <div class="mu-sm" style="font-size:11px;margin-bottom:6px">⚪ No API key currently configured (Using local offline RAG engine)</div>
      `}
      <input 
        id="ai_api_key" 
        type="password" 
        placeholder="${hasKey ? 'Type new key to overwrite (leave blank to keep current)' : 'Enter your Google Gemini or OpenAI API Key...'}" 
        value=""
        autocomplete="new-password"
        spellcheck="false"
        oncopy="return false"
        oncut="return false"
      >
      <div class="mu-sm" style="font-size:11px;margin-top:2px">
        🔒 Security enforced: Even in admin view, keys cannot be copied or inspected.
      </div>

      <label style="margin-top:10px">Model Name</label>
      <input 
        id="ai_model" 
        type="text" 
        placeholder="gemini-1.5-flash or gpt-4o-mini" 
        value="${escapeHtml(current.model || (current.provider === 'gemini' ? 'gemini-1.5-flash' : 'gpt-4o-mini'))}"
      >

      <div id="ai_custom_box" style="display:${current.provider === 'custom' ? 'block' : 'none'};margin-top:8px">
        <label>Custom Endpoint URL</label>
        <input 
          id="ai_custom_endpoint" 
          type="text" 
          placeholder="https://openrouter.ai/api/v1/chat/completions" 
          value="${escapeHtml(current.customEndpoint || '')}"
        >
      </div>

      <div style="background:var(--bg);padding:10px;border-radius:var(--radius-sm);margin:14px 0">
        <div style="font-size:12px;font-weight:700">RAG Engine: Hybrid Vector + BM25</div>
        <div class="mu-sm" style="font-size:11px;margin-top:2px">
          • Online: Supabase pgvector semantic search (if set up)<br>
          • Offline: In-memory BM25 retrieval (100% offline)
        </div>
      </div>

      <div style="margin:12px 0">
        <button 
          id="btn_sync_pgvector"
          type="button" 
          class="g sm" 
          style="width:100%;font-size:12px" 
          onclick="IronLogChat.handleSyncCorpus()"
        >
          ⚡ Sync & Embed Corpus to Supabase pgvector
        </button>
      </div>

      <!-- Admin Passcode Management -->
      <details style="margin:12px 0;background:var(--bg);padding:8px 10px;border-radius:var(--radius-sm)">
        <summary style="font-size:12px;font-weight:600;cursor:pointer">Admin Security Settings</summary>
        <div style="margin-top:8px">
          <label style="font-size:11px">Change Admin Master Passcode</label>
          <div class="r" style="gap:6px;margin-top:4px">
            <input 
              id="new_admin_passcode" 
              type="password" 
              placeholder="Min 6 characters..." 
              style="flex:1"
            >
            <button class="sm g" type="button" onclick="IronLogChat.updateAdminPasscode()">Update</button>
          </div>
          <div class="mu-sm" style="font-size:10px;margin-top:4px">Default was: <code>ironlog-admin-2026</code></div>
        </div>
      </details>

      <div class="r" style="gap:8px;margin-top:14px">
        <button class="g" style="flex:1" onclick="IronLogChat.saveSettings()">Save AI Settings</button>
        <button class="g" type="button" onclick="IronLogChat.lockAdmin()" title="Lock Admin Session">Lock Admin</button>
        <button class="g" onclick="IronLog.closeModal()">Cancel</button>
      </div>
    </div>
  `;

  if (window.IronLog && window.IronLog.openModal) {
    window.IronLog.openModal(html);
  }
}

/**
 * Mount the Chatbot FAB and Drawer
 */
export function mountChatWidget() {
  if (document.getElementById('chat-fab')) return;

  const fab = document.createElement('button');
  fab.id = 'chat-fab';
  fab.className = 'chat-fab';
  fab.setAttribute('title', 'IronLog AI Coach (RAG & Similarity Cache)');
  fab.setAttribute('aria-label', 'Open IronLog AI Coach Chat');
  fab.innerHTML = `
    <span class="chat-fab-icon">${ICONS.bot || ICONS.chat || '🤖'}</span>
    <span class="chat-fab-badge">RAG</span>
  `;
  fab.onclick = () => toggleChat();

  const drawer = document.createElement('div');
  drawer.id = 'chat-drawer';
  drawer.className = 'chat-drawer';
  drawer.innerHTML = `
    <div class="chat-header">
      <div class="chat-header-title">
        <span class="chat-avatar-icon">${ICONS.bot || '🤖'}</span>
        <div>
          <div style="font-weight:700;display:flex;align-items:center;gap:6px">
            IronLog AI Coach
            <span class="chat-guard-pill">RAG App Only</span>
          </div>
          <div class="mu-sm" style="font-size:11px">Grounded in IronLog & Hypertrophy</div>
        </div>
      </div>
      <div class="chat-header-actions">
        <span 
          id="chat-cache-badge" 
          class="chat-cache-pill" 
          title="Click to clear cached answers" 
          onclick="IronLogChat.clearCache()"
        >⚡ 0 Cached</span>
        <button class="icon-btn sm" onclick="IronLogChat.openSettings()" title="AI & RAG Model Settings">
          ${ICONS.settings || '⚙️'}
        </button>
        <button class="icon-btn sm" onclick="IronLogChat.clearChat()" title="Clear Chat History">
          ${ICONS.trash || '🗑️'}
        </button>
        <button class="icon-btn sm" onclick="IronLogChat.toggle()" title="Close Assistant">
          ${ICONS.close || '✕'}
        </button>
      </div>
    </div>

    <div id="chat-messages-container" class="chat-messages"></div>

    <div class="chat-input-area">
      <form onsubmit="event.preventDefault(); IronLogChat.send();" style="display:flex;gap:8px;width:100%">
        <input 
          id="chat-input-field" 
          type="text" 
          placeholder="Ask AI Coach about workouts, overload, recovery..." 
          autocomplete="off"
        >
        <button type="submit" class="chat-send-btn" title="Send Question">
          ${ICONS.send || '➤'}
        </button>
      </form>
      <div class="chat-footer-note">
        Strictly answers IronLog & gym questions • RAG Grounded • Cached for instant speed
      </div>
    </div>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(drawer);

  updateCacheBadge();
}

// Global UI bindings
if (typeof window !== 'undefined') {
  window.IronLogChat = {
    toggle: () => toggleChat(),
    send: () => sendChatMessage(),
    askQuick: (q) => sendChatMessage(q),
    openSettings: () => openAiConfigModal(),
    unlockAdmin: () => {
      const input = document.getElementById('admin_pass_input');
      const val = (input ? input.value : '').trim();
      if (verifyAdminPasscode(val)) {
        if (window.IronLog && window.IronLog.showToast) {
          window.IronLog.showToast('✅ Admin session unlocked!');
        }
        openAiConfigModal();
      } else {
        if (window.IronLog && window.IronLog.showToast) {
          window.IronLog.showToast('❌ Invalid Admin Passcode.');
        }
        if (input) {
          input.value = '';
          input.focus();
        }
      }
    },
    lockAdmin: () => {
      lockAdminSession();
      if (window.IronLog && window.IronLog.closeModal) window.IronLog.closeModal();
      if (window.IronLog && window.IronLog.showToast) {
        window.IronLog.showToast('🔒 Admin session locked.');
      }
    },
    removeApiKey: () => {
      if (!isAdminSession()) return;
      setAiConfig({ apiKey: '' });
      if (window.IronLog && window.IronLog.showToast) {
        window.IronLog.showToast('API Key removed.');
      }
      openAiConfigModal();
    },
    updateAdminPasscode: () => {
      if (!isAdminSession()) return;
      const input = document.getElementById('new_admin_passcode');
      const val = (input ? input.value : '').trim();
      try {
        setAdminPasscode(val);
        if (window.IronLog && window.IronLog.showToast) {
          window.IronLog.showToast('✅ Admin master passcode updated!');
        }
        if (input) input.value = '';
      } catch (err) {
        if (window.IronLog && window.IronLog.showToast) {
          window.IronLog.showToast(`Error: ${err.message}`);
        }
      }
    },
    onProviderChange: (val) => {
      const customBox = document.getElementById('ai_custom_box');
      const modelInput = document.getElementById('ai_model');
      if (customBox) customBox.style.display = val === 'custom' ? 'block' : 'none';
      if (modelInput) {
        if (val === 'gemini') modelInput.value = 'gemini-1.5-flash';
        else if (val === 'openai') modelInput.value = 'gpt-4o-mini';
      }
    },
    saveSettings: () => {
      if (!isAdminSession()) {
        if (window.IronLog && window.IronLog.showToast) {
          window.IronLog.showToast('Admin authorization required.');
        }
        return;
      }
      const provider = (document.getElementById('ai_provider') || {}).value || 'gemini';
      const enteredKey = ((document.getElementById('ai_api_key') || {}).value || '').trim();
      const current = getAiConfig();
      // If user typed a new key, overwrite. If left blank, preserve existing key!
      const apiKey = enteredKey !== '' ? enteredKey : (current.apiKey || '');
      const model = (document.getElementById('ai_model') || {}).value || 'gemini-1.5-flash';
      const customEndpoint = (document.getElementById('ai_custom_endpoint') || {}).value || '';

      setAiConfig({ provider, apiKey, model, customEndpoint });
      if (window.IronLog && window.IronLog.closeModal) window.IronLog.closeModal();
      if (window.IronLog && window.IronLog.showToast) {
        window.IronLog.showToast('AI Coach settings updated!');
      }
      renderMessagesList();
    },
    clearChat: () => {
      clearChatHistory();
      renderMessagesList();
    },
    clearCache: () => {
      clearChatCache();
      updateCacheBadge();
      if (window.IronLog && window.IronLog.showToast) {
        window.IronLog.showToast('Assistant cache cleared (0 questions cached).');
      }
    },
    handleSyncCorpus: async () => {
      if (!isAdminSession()) {
        if (window.IronLog && window.IronLog.showToast) {
          window.IronLog.showToast('Admin authorization required.');
        }
        return;
      }
      const enteredKey = ((document.getElementById('ai_api_key') || {}).value || '').trim();
      const apiKey = enteredKey || getAiConfig().apiKey;
      const provider = (document.getElementById('ai_provider') || {}).value || getAiConfig().provider;
      const btn = document.getElementById('btn_sync_pgvector');

      if (!apiKey) {
        if (window.IronLog && window.IronLog.showToast) {
          window.IronLog.showToast('Please enter an API Key first to generate embeddings.');
        }
        return;
      }

      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Embedding & Uploading to Supabase...';
      }

      try {
        const res = await syncCorpusToSupabase(apiKey, provider, (curr, total, title) => {
          if (btn) btn.textContent = `Embedding [${curr}/${total}]: ${title.slice(0, 20)}...`;
        });
        if (btn) btn.textContent = `✅ Synced ${res.synced}/${res.total} Chunks to pgvector!`;
        if (window.IronLog && window.IronLog.showToast) {
          window.IronLog.showToast(`Successfully synced ${res.synced} chunks to Supabase pgvector!`);
        }
      } catch (err) {
        if (btn) btn.textContent = '❌ Sync Failed (Run SQL Migration first)';
        if (window.IronLog && window.IronLog.showToast) {
          window.IronLog.showToast(`Sync error: ${err.message}`);
        }
      } finally {
        setTimeout(() => {
          if (btn) {
            btn.disabled = false;
            btn.textContent = '⚡ Sync & Embed Corpus to Supabase pgvector';
          }
        }, 3500);
      }
    },
    getStats: () => getChatCacheStats()
  };
}
