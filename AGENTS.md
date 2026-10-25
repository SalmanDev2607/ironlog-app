# 🤖 AI Agent & Developer Reference Guide – IronLog

> This document is designed for AI models (and human developers) to rapidly comprehend the architecture, data models, state flows, authentication lifecycle, and technical conventions of the **IronLog** codebase.

---

## 1. High-Level Architecture & Philosophy

- **Application Type**: Offline-First Progressive Web App (PWA) for hypertrophy & gym training.
- **Frontend Stack**: Pure Vanilla JavaScript (ES Modules, standard DOM APIs), CSS Variables, SVG graphics. **Zero client-side framework dependencies** (no React, Vue, Svelte, Tailwind, or bundlers required to run).
- **Backend / Cloud**: [Supabase](https://supabase.com) (Auth + PostgreSQL with Row-Level Security).
- **Dual-Distribution Model**:
  1. **Standard Web / PWA**: Served by simple static web servers or CDNs (GitHub Pages, Vercel, Netlify, Docker/Nginx, local Node.js `server.js`).
  2. **Zero-Server Standalone File**: `standalone.html` compiles all CSS, JS, SVGs, and libraries into a single file runnable via `file://`.
- **Core Principle**: Complete functionality offline. Network and cloud sync enhance the app but are never a blocker for workout logging.

---

## 2. Directory & File Manifest

| File / Directory | Purpose & Responsibilities |
| :--- | :--- |
| [`index.html`](file:///home/vigo/vigo/personalSpace/ironlog-app/index.html) | Main PWA entry point. Loads Google fonts, Supabase JS CDN script, styles, and mounts `js/app.js`. Includes pre-rendered semantic landing markup for SEO/crawlers. |
| [`privacy.html`](file:///home/vigo/vigo/personalSpace/ironlog-app/privacy.html) | Public privacy policy required for OAuth compliance (Google verification, GDPR, Supabase data handling). |
| [`manifest.webmanifest`](file:///home/vigo/vigo/personalSpace/ironlog-app/manifest.webmanifest) | Web App Manifest for mobile/desktop PWA installation. |
| [`sw.js`](file:///home/vigo/vigo/personalSpace/ironlog-app/sw.js) | Service Worker handling offline caching. Uses **Network-First** for application code (`.js`, `.html`, `.css`) and **Cache-First** for static assets. |
| [`css/styles.css`](file:///home/vigo/vigo/personalSpace/ironlog-app/css/styles.css) | All UI styles, dark/light themes via CSS custom properties (`--bg`, `--cd`, `--bd`, `--tx`, `--ac`, `--rd`, `--gr`). |
| [`js/app.js`](file:///home/vigo/vigo/personalSpace/ironlog-app/js/app.js) | Main application controller, view routing (`today`, `weight`, `body`, `progress`, `exercises`, `settings`), modal manager, and UI event binding (`window.IronLog`). |
| [`js/state.js`](file:///home/vigo/vigo/personalSpace/ironlog-app/js/state.js) | Centralized state store, schema defaults, `localStorage` persistence, unit conversions (`kg`/`lbs`, `cm`/`in`), and state mutation hooks. |
| [`js/exercises.js`](file:///home/vigo/vigo/personalSpace/ironlog-app/js/exercises.js) | 82-exercise database across 11 muscle groups, 15 workout routines (`WORKOUT_SPLITS`), muscle recovery calculations, and Golden-era aesthetic formulas. |
| [`js/supabase.js`](file:///home/vigo/vigo/personalSpace/ironlog-app/js/supabase.js) | Supabase client initializer, authentication functions (Email + Google OAuth), recovery token parser (`handleRecoveryRedirect`), and session management. |
| [`js/sync.js`](file:///home/vigo/vigo/personalSpace/ironlog-app/js/sync.js) | Offline-first cloud sync engine. Debounced push on save, cloud pull on login/reconnect, and union-based state merger (`mergeStates`). |
| [`js/timer.js`](file:///home/vigo/vigo/personalSpace/ironlog-app/js/timer.js) | Rest timer engine using Web Audio API synthesis (harmonic chime bell) and Mobile Vibration API. |
| [`js/icons.js`](file:///home/vigo/vigo/personalSpace/ironlog-app/js/icons.js) | Raw SVG vector strings used across the interface. |
| [`tests/auth-flow.test.js`](file:///home/vigo/vigo/personalSpace/ironlog-app/tests/auth-flow.test.js) | Automated unit & integration tests for password recovery, URL parsing, and token handling. |
| [`build-standalone.js`](file:///home/vigo/vigo/personalSpace/ironlog-app/build-standalone.js) | Node.js script that strips ES modules and compiles everything into `standalone.html`. |
| [`standalone.html`](file:///home/vigo/vigo/personalSpace/ironlog-app/standalone.html) | Generated single-file bundle. |
| [`server.js`](file:///home/vigo/vigo/personalSpace/ironlog-app/server.js) | Lightweight development server with port fallback. |

---

## 3. Data Schema & State Architecture (`js/state.js`)

State is persisted locally in `localStorage.getItem('il')` as a single JSON object.

### State Schema (`DEFAULT_STATE`):

```javascript
{
  p: {                 // User Profile
    g: 'm',            // Gender: 'm' | 'f' | 'o'
    a: 28,             // Age in years
    h: 178,            // Height in cm
    w: 75,             // Target or starting weight
    o: 'gain',         // Goal: 'gain' | 'lose' | 'maintain'
    l: 'i',            // Training experience: 'b' (beginner) | 'i' (intermediate) | 'a' (advanced)
    pri: ['shoulders'] // Priority muscle groups receiving extra volume
  },
  w: [                 // Weight History Logs
    { d: '2026-10-24', w: 75.2 }
  ],
  m: [                 // Body Circumference Measurements (cm)
    { d: '2026-10-24', v: { neck: 38, chest: 104, arm: 37, waist: 82, thigh: 58, calf: 38 } }
  ],
  s: [                 // Completed Workout Sessions
    {
      d: '2026-10-24', // Date YYYY-MM-DD
      n: 'Push A',     // Split Routine Name
      start: 1792840000000,
      end: 1792843600000,
      sets: [
        { id: 'bp', s: 1, w: 80, r: 8, targetReps: '8-10', done: true }
      ]
    }
  ],
  a: null,             // Active In-Progress Workout Session (null if not training)
  pr: null,            // 1-month future aesthetic and weight projections
  c: null,             // Comparison object between projected vs actual
  ov: null,            // Routine override for today: { d: '2026-10-24', i: 2 }
  x: null,             // Custom exercise swaps for today: { d, rm: [], add: [], fo: [] }
  u: 'cm',             // Length unit: 'cm' | 'in'
  wu: 'kg',            // Weight unit: 'kg' | 'lbs'
  theme: 'dark',       // Theme: 'dark' | 'light' | 'system'
  restTimerDuration: 90, // Default rest time in seconds
  soundEnabled: true,  // Web Audio chime
  hapticsEnabled: true,// Mobile vibration
  customExercises: {}  // User-created exercises: { id: { name, primary, ... } }
}
```

### Save Hook Mechanism:
`state.js` exports `setOnSaveListener(fn)`. `sync.js` registers its `scheduleDebouncedPush()` via this hook, so any call to `saveState()` anywhere in the application automatically schedules a debounced cloud sync.

---

## 4. Offline-First Cloud Sync Protocol (`js/sync.js`)

Cloud synchronization is managed via a debounced push and pull strategy:

### Database Table in Supabase:
- **Table**: `public.user_data`
- **Columns**:
  - `user_id uuid primary key references auth.users(id)`
  - `state jsonb not null default '{}'::jsonb`
  - `updated_at timestamp with time zone default timezone('utc'::text, now())`
- **Security**: Row-Level Security (RLS) is enabled. Users can only select, insert, and update rows where `auth.uid() = user_id`.

### Merge Logic (`mergeStates(local, remote)`):
Sync performs a non-destructive union:
1. **Workouts (`s`)**: Deduplicated by unique key `${session.d}_${session.start || session.n}` and sorted chronologically.
2. **Weights (`w`)**: Union by date (`entry.d`), newest entry wins.
3. **Measurements (`m`)**: Union by date (`entry.d`).
4. **Active Workout (`a`)**: Retained from local if training is in progress.
5. **Profile (`p`)**: Local profile wins unless remote has more complete fields.

---

## 5. Authentication & Recovery Flow (`js/supabase.js` & `js/app.js`)

### Auth Modes:
1. **Guest Mode**:
   - `sessionStorage.getItem('il_guest_pass') === 'true'`.
   - Allows full browsing of routines, body models, and exercise guides.
   - Clears on browser restart.
2. **Authenticated Mode**:
   - Supabase user session stored in local storage.
   - Required to **check in and complete workouts** (`checkinWorkout` enforces this).
   - Enables background cloud backup.

### Password Reset Flow:
1. User clicks **"Forgot password?"** in the Sign In modal.
2. `submitForgotPassword()` sets `localStorage.setItem('il_awaiting_password_reset', 'true')` and calls `resetPasswordForEmail()`.
3. Supabase emails a link pointing to the app.
4. When the user returns to the app, `handleRecoveryRedirect()` executes:
   - Detects recovery through `#type=recovery` or `?code=...` (or `il_awaiting_password_reset` flag).
   - Explicitly sets the session using `client.auth.setSession()` or `client.auth.exchangeCodeForSession()`.
   - Cleans the tokens from the URL bar via `history.replaceState()`.
   - Opens `IronLog.showPasswordResetForm()`.
5. User enters a new password -> `updatePassword()` updates credentials via `client.auth.updateUser()`.

---

## 6. Service Worker Caching Strategy (`sw.js`)

To prevent stale cache lock-ins during continuous deployment:
- **Core Code Files** (`index.html`, `js/*.js`, `css/*.css`, root navigation):
  - **Network-First**: The browser fetches live code over the network when online. If the network request fails, it instantly falls back to the cache.
- **Static Assets** (fonts, vector icons, vendor CDNs):
  - **Cache-First**: Served from cache to conserve bandwidth.
- **Cache Eviction**:
  - Controlled by `CACHE_NAME = 'ironlog-v2.3.0'`.
  - **Rule**: When updating JS or CSS files in production, bump `CACHE_NAME` in `sw.js` to invalidate deprecated caches.

---

## 7. Standalone Compiler (`build-standalone.js`)

`standalone.html` is an offline single-file distribution:
- It reads `css/styles.css`, `icons/icon.svg`, and all `js/*.js` modules in strict dependency order:
  1. `exercises.js`
  2. `state.js`
  3. `timer.js`
  4. `icons.js`
  5. `supabase.js`
  6. `sync.js`
  7. `app.js`
- `stripModules()` removes `import` and `export` statements, transforming ES modules into a monolithic, global scope.
- Injects a base64 Data URI for the app icon.
- Automatically tested and generated during `npm test`.

---

## 8. Development & Testing Commands

```bash
# Run full automated validation (syntax + unit tests + standalone compilation)
npm test

# Run local development HTTP server
npm start
# or: node server.js

# Build standalone HTML bundle manually
npm run build:standalone
```

---

## 9. Crucial Guidelines for Future AI Assistants

1. **Preserve Zero-Dependency Runtime**: Do not add heavy npm packages (`react`, `axios`, `lodash`, `tailwindcss`, `vite`). Vanilla JavaScript and native browser APIs are intentional architectural choices.
2. **Preserve Offline Capabilities**: Never make local workout logging conditional on server or Supabase response success. Local state must update immediately; cloud sync must always be backgrounded/debounced.
3. **Module & Standalone Parity**: If modifying imports, exports, or global identifiers, verify that `build-standalone.js` still builds without errors (`npm test`).
4. **Cache Invalidation**: Whenever editing client files, update the version in `sw.js` (`CACHE_NAME = 'ironlog-vX.X.X'`) so end-user PWAs immediately receive updates.
5. **Secrets Hygiene**: Never commit Supabase `service_role` keys or Google OAuth client secrets to any client-side files.
