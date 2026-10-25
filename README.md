# 🏋️ IronLog – Gym & Hypertrophy Tracker

An adaptive, progressive hypertrophy workout tracker and body aesthetic engine built with Golden-Era proportion targets, muscle recovery tracking, smart progressive overload, and **offline-first cloud synchronization**.

Designed to be **100% offline-ready**, **cross-device synced**, and **free to host**.

🔗 **Live App**: [salmandev2607.github.io/ironlog-app](https://salmandev2607.github.io/ironlog-app)  
📜 **Privacy Policy**: [salmandev2607.github.io/ironlog-app/privacy](https://salmandev2607.github.io/ironlog-app/privacy)

---

## ✨ Features & Highlights

### ☁️ Cloud Sync & User Accounts
- **Offline-First Architecture**: Log sets, track weights, and view workouts completely offline. When connectivity is restored, changes automatically sync to the cloud in the background.
- **Supabase Cloud Synchronization**: Securely backs up workout history, body measurements, and custom routines with database Row-Level Security (RLS).
- **Flexible Authentication**:
  - Sign in with **Email & Password** or **Google OAuth 2.0**.
  - **Guest Mode**: Explore all 82 exercises and 15 workout splits without signing in.
  - **Check-In Gate**: Creating an account is required only to record workout check-ins and sync data across devices.
  - **Self-Service Password Recovery**: Secure reset link flow with automatic token exchange and in-app password update dialog.

### 📚 Comprehensive Exercise Library & Routine Splits
- **82 Categorized Exercises**: Covering 11 muscle groups (Chest, Back, Shoulders, Biceps, Triceps, Quads, Hamstrings, Glutes, Calves, Abs, Forearms) with visual target markers and execution tips.
- **15 Pre-Built Training Splits**:
  - Push / Pull / Legs (PPL A & B variations)
  - Upper / Lower (Upper A/B, Lower A/B)
  - Full Body Hypertrophy
  - Arnold & Classic Bodybuilding Splits (Chest & Back, Shoulders & Arms, Legs & Abs)
  - Push-Pull Power & Custom Routine overrides.

### 🧬 Muscle Recovery Engine & Interactive Body Map
- **Dynamic Protein Recovery Calculation**: Classifies muscle status based on rest intervals (<36h red/recovering, 36–56h yellow, >56h green/ready).
- **Interactive Anatomical Model**: Visual front and back SVG body model displaying muscle recovery states in real time.
- **Smart Workout Generator**: Automatically prioritizes fully recovered muscle groups and adjusts daily training recommendations.

### 🏛️ Golden-Era Aesthetic Target Proportions
- **Classic Ratios**: Compares your monthly neck, chest, arm, waist, thigh, and calf circumferences against classic Grecian/Golden-era formulas relative to height.
- **Volume Auto-Regulation**: Automatically adds overload sets to lagging areas (<93% of ratio) and suggests maintenance volume on fully developed muscle groups.
- **Priority Muscle Selector**: Focus growth projections and set volume on target muscle groups.

### ⏱️ Rest Timer & Sound Synthesis
- **Zero-Asset Web Audio Chime**: Built-in harmonic bell chime via Web Audio API (no heavy MP3 audio files to download).
- **Mobile Haptic Feedback**: Vibration alerts when rest interval concludes.
- **Quick Controls**: +30s / -15s adjustments and pause controls.

### 📈 Weight & Body Analytics
- **Daily Weight Logs**: Rolling 7-day average SVG sparklines with trend indicators.
- **1-Month Future Projections**: Forecasts muscle growth and weight changes based on training experience and calorie targets.

### 📱 Progressive Web App (PWA)
- **Installable**: Add to home screen on Android, iPhone, iPad, and desktop for an app-like experience.
- **Network-First Caching**: Service Worker (`sw.js`) guarantees immediate live updates when online, with instant offline fallback.

---

## 🚀 Deployment Options

### Option 1: GitHub Pages (Currently Active)
1. Fork or push this repository to GitHub.
2. Go to **Settings** → **Pages** → Source: **Deploy from a branch** (`main` / root).
3. Live instantly with automatic HTTPS.

### Option 2: 1-Click Cloud Hosting (Vercel / Netlify)
- **Vercel**: Import repository on [vercel.com/new](https://vercel.com/new) (uses pre-configured `vercel.json`).
- **Netlify**: Drag and drop the app folder to [app.netlify.com/drop](https://app.netlify.com/drop) or link Git repo (`netlify.toml`).

### Option 3: Local Node.js Server
Zero third-party runtime dependencies required:
```bash
npm start
# or: node server.js
```
Opens automatically on `http://localhost:3000` (or the next available port).

### Option 4: Docker & Docker Compose
Production-ready Nginx Alpine container:
```bash
# Start container in background
docker compose up -d

# Open in browser:
http://localhost:8080

# Stop container:
docker compose down
```

### Option 5: Zero-Server Standalone File
Double-click `standalone.html` in any web browser to run the complete app locally via `file://` with zero internet, server, or build steps required.

To rebuild `standalone.html`:
```bash
npm run build:standalone
```

---

## 🧪 Testing

Run the automated test suite and build verification:
```bash
npm test
```

This validates:
- Syntax and module integrity across all JavaScript files.
- Automated auth & password recovery test suite (`tests/auth-flow.test.js`):
  - Implicit flow token detection (`#type=recovery`).
  - PKCE flow code exchange detection (`?code=...`).
  - Stale cache eviction and Service Worker cache version checks.
  - Password strength and confirmation validation.
- Standalone single-file HTML generation.

---

## 🛠 Project Structure

```
ironlog-app/
├── index.html            # Main PWA entrypoint
├── privacy.html          # Public Privacy Policy page
├── standalone.html       # Self-contained zero-dependency bundle
├── manifest.webmanifest  # Progressive Web App manifest
├── sw.js                 # Service worker with network-first caching strategy
├── css/
│   └── styles.css        # Responsive dark/light theme & athletic UI styles
├── js/
│   ├── app.js            # Main controller, router, auth modals & view renderers
│   ├── state.js          # Persistent state, local storage & cloud save listeners
│   ├── exercises.js      # 82-exercise database & 15 workout split routines
│   ├── supabase.js       # Supabase client, auth handlers & recovery token parser
│   ├── sync.js           # Offline-first sync engine & state merger
│   ├── timer.js          # Audio chime synthesizer, haptics & rest timer
│   └── icons.js          # Vector SVG icon library
├── tests/
│   └── auth-flow.test.js # Automated unit & integration tests
├── icons/
│   └── icon.svg          # Brand vector icon
├── server.js             # Zero-dependency local Node.js development server
├── build-standalone.js   # HTML compiler for standalone.html
├── Dockerfile            # Alpine Nginx container definition
├── docker-compose.yml    # Docker Compose setup
├── nginx.conf            # Nginx production configuration
├── vercel.json           # Vercel deployment configuration
├── netlify.toml          # Netlify configuration
└── package.json          # Project metadata, scripts & test runners
```

---

## 🔒 Security & Privacy

- All user data stored in Supabase uses **Row-Level Security (RLS)** ensuring users can only read and write their own data.
- Passwords are never stored in plain text and are managed via Supabase Auth.
- No tracking cookies, advertisements, or third-party behavioral analytics.
- Guest mode keeps 100% of data locally on your device in `localStorage`.

---

## 📄 License

MIT License. Free to use, modify, and distribute.
