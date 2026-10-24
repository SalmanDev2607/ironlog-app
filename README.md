# 🏋️ IronLog – Gym & Hypertrophy Tracker

An adaptive **Push-Pull-Legs (PPL)** workout tracker and body hypertrophy progression app built with Golden-Era proportion targets, muscle recovery tracking, and smart progressive overload.

Designed to be **100% offline-ready**, **free to host**, and **trivially easy to deploy** anywhere.

---

## ✨ Highlights & Features

- **Adaptive 6-Day PPL Split**: Automatically schedules Push A, Pull A, Legs A, Push B, Pull B, Legs B with customizable daily overrides and exercise swaps.
- **Muscle Recovery Engine & 3D Interactive Body Map**:
  - Dynamically calculates muscle protein recovery (<36h red/recovering, 36–56h yellow, >56h green/ready).
  - Automatically omits recovering muscles from today's workout (with a 1-tap "Do Anyway" bypass).
  - Rotatable 3D front/back anatomical figure that updates colors in real time.
- **Golden-Era Aesthetic Proportions**:
  - Compares monthly circumference measurements against classic Grecian/Golden-era ratios relative to height.
  - Automatically adjusts workout set volume (lagging muscle <93% → +1 set overload; developed muscle ≥102% → 2 sets maintenance).
  - Priority muscle selector adds targeted volume and accelerates growth projections.
- **Rest Timer with Synthesized Audio & Vibrations**:
  - Built-in zero-asset audio bell chime via Web Audio API.
  - Mobile haptic vibration feedback.
  - Quick +30s / -15s adjustments and pause controls.
- **Weight Tracking & Trend Analysis**:
  - Daily weight logs with instant rolling 7-day average SVG sparkline.
- **1-Month Future Projection**:
  - Forecasts body measurements and weight for next month based on training experience and calorie goal.
  - Compares last month's predicted vs. actual measurements.
- **Data Freedom & Privacy**:
  - All data is stored in your device's browser (`localStorage`).
  - **1-Click Export to JSON**: Full backup anytime.
  - **1-Click Import from JSON**: Instant restore on a new device or browser.
  - **Export Workouts to CSV**: Open your workout history in Microsoft Excel or Google Sheets.
- **PWA (Progressive Web App)**:
  - Add to Home Screen on iOS and Android for a native app feel.
  - Works 100% offline in basement gyms with no signal.
- **Global Usability**:
  - Switch between **kg** and **lbs** for weights.
  - Switch between **cm** and **in** for body measurements.
  - Dark Athletic, Clean Light, and System theme modes.

---

## 🚀 Easy Deployment Options

Choose the deployment method that fits your needs:

### Option 1: 1-Click Free Cloud Deployment (Recommended)

#### Deploy to Vercel
1. Fork or push this repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and select the repository.
3. Click **Deploy** (zero configuration needed, `vercel.json` is pre-configured).

#### Deploy to Netlify
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop the `ironlog-app` folder onto the page.
3. Your app is live instantly on an SSL-secured URL!

#### Deploy to GitHub Pages
1. Push this folder to a GitHub repository.
2. Go to **Settings** → **Pages** → Source: **Deploy from a branch** (`main` / root).
3. Click **Save**.

---

### Option 2: Docker / Docker Compose (Self-Hosted)

A lightweight production-grade Nginx Alpine container image is pre-configured:

```bash
# Start container in background
docker compose up -d

# Open in browser:
http://localhost:8080
```

To stop:
```bash
docker compose down
```

---

### Option 3: Local Node.js Server

Zero third-party dependencies required:

```bash
# Start server
npm start
# or: node server.js

# Open in browser:
http://localhost:3000
```
*(If port 3000 is occupied, it automatically falls back to an available port).*

---

### Option 4: Python Simple Server

If you have Python installed:

```bash
python3 -m http.server 8080
```

---

### Option 5: Zero-Server Standalone File

Want to run IronLog without running any servers or terminal commands?
Simply double-click:
```
ironlog-app/standalone.html
```
It bundles all styles, scripts, vector icons, and exercise databases into a single self-contained 104 KB file that runs in any browser offline.

To regenerate `standalone.html` after modifying code:
```bash
npm run build:standalone
```

---

## 📱 Installing on Mobile (PWA)

### iPhone / iPad (iOS Safari)
1. Open your deployed URL in Safari.
2. Tap the **Share** button (box with an arrow pointing up).
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add**. IronLog will appear as an app icon with standalone window mode.

### Android (Chrome)
1. Open your deployed URL in Chrome.
2. Tap the three dots menu in the top right.
3. Tap **Install app** or **Add to Home screen**.

---

## 🛠 Project Structure

```
ironlog-app/
├── index.html            # Main PWA entrypoint
├── standalone.html       # Single-file zero-dependency bundle
├── manifest.webmanifest  # Progressive Web App manifest
├── sw.js                 # Service worker for offline caching
├── css/
│   └── styles.css        # Responsive athletic UI theme & dark/light styles
├── js/
│   ├── app.js            # Main application controller & view renderer
│   ├── state.js          # Persistent state, unit conversions & JSON/CSV import/export
│   ├── exercises.js      # Exercise library, Golden ratios & recovery logic
│   ├── timer.js          # Audio chime synthesizer, haptics & rest timer
│   └── icons.js          # Vector SVG icons
├── icons/
│   └── icon.svg          # High-resolution vector brand icon
├── server.js             # Zero-dependency local Node.js HTTP server
├── build-standalone.js   # Script to bundle all files into standalone.html
├── Dockerfile            # Nginx alpine production container
├── docker-compose.yml    # Docker compose configuration
├── nginx.conf            # Nginx gzip and cache settings
├── vercel.json           # Vercel deployment config
├── netlify.toml          # Netlify deployment config
└── package.json          # npm commands & metadata
```

---

## 📄 License

MIT License. Free to use, modify, and distribute.
