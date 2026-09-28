# Zencus • Focused Productivity & Flow

> A calm Pomodoro timer, private encrypted notebook, and disciplined task list working together as one quiet, distraction-free sanctuary.

[![Deploy to GitHub Pages](https://github.com/Deeprockz22/Zencus/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/Deeprockz22/Zencus/actions/workflows/deploy-pages.yml)
[![Tests](https://img.shields.io/badge/tests-173%20passed-brightgreen)](https://github.com/Deeprockz22/Zencus)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🌐 Live Deployments

- **Production (Vercel):** [https://amify-lyart.vercel.app](https://amify-lyart.vercel.app)
- **Marketing Landing Page:** [https://amify-lyart.vercel.app/landing.html](https://amify-lyart.vercel.app/landing.html)
- **GitHub Pages:** [https://deeprockz22.github.io/Zencus/](https://deeprockz22.github.io/Zencus/)

---

## ✨ Features

- **Pomodoro Focus Engine:** Accurate real-time countdown measured against wall-clock timestamps (never pauses or falls behind when browser tabs or mobile apps background).
- **Four Art Worlds:**
  - **Crisp Atelier:** Swiss minimalist editorial dial with precision typography.
  - **Surreal Night:** René Magritte-inspired *False Mirror* sky and interactive pointer-tracking gaze.
  - **Lantern Garden:** Warm meditative paper lantern sanctuary with ambient soundscapes.
  - **Komorebi Room:** Filtered sunlight through leaves with natural moss and honey hues.
- **Battery-Aware Light Mode (`fx-lite`):** Automatic hardware detection for battery conservation, throttling costly GPU blurs on low-power devices.
- **Encrypted Notes Vault:** Client-side AES-GCM encrypted notes protected by private PIN, stored entirely in your local browser vault.
- **Native iOS Live Activity:** Dynamic Island and Lock Screen countdown for iPhone via Capacitor native integration.
- **Distraction-Free Zen Fullscreen:** Minimalist dial and ambient rooms with keyboard shortcuts (`Space` to pause, `Esc` to return).

---

## 📂 Project Organization

```
Zencus/
├── .github/workflows/       # GitHub Actions automated CI/CD
│   └── deploy-pages.yml     # Auto-deploys main directly to GitHub Pages
├── docs/                    # Design specs, QA reports & brainstorm notes
│   ├── BRAINSTORM_LOUNGE.md # Feature discussions & architectural planning
│   ├── CREDITS.md           # Third-party assets and design inspirations
│   ├── DESIGN_RESOURCES.md  # Curated aesthetics & typography references
│   ├── IDEAS_LOG.md         # Roadmap & feature idea pipeline
│   ├── NOTES_TEST_CASES.md  # Test specifications for notes encryption
│   ├── QA_AUDIT_REPORT.md   # Comprehensive QA testing checklist
│   └── STEVE_REVIEW_NOTES.md# Review notes & iterative design polish logs
├── ios/                     # Native iOS Capacitor app project (App & LiveActivity)
├── public/                  # Static assets, web manifests & service worker
│   ├── favicon.svg          # Dynamic browser favicon
│   ├── manifest.json        # PWA manifest
│   └── sw.js                # Service Worker
├── resources/               # App icons and splash assets for native builds
├── src/                     # Application source code
│   ├── components/          # Reusable UI & view components
│   │   ├── komorebi/        # Komorebi filtered-light world
│   │   ├── lantern/         # Lantern garden world
│   │   ├── notes/           # Private notes vault & editor
│   │   ├── pip/             # Picture-in-Picture floating timer
│   │   ├── surreal/         # Surreal world & eye gaze mechanics
│   │   ├── tasks/           # Task manager & prioritization
│   │   ├── timer/           # Pomodoro timers, visualizers & debrief
│   │   └── ui/              # Buttons, modals, dialogs & toasts
│   ├── hooks/               # Custom React hooks (fxMode, wakeLock, etc.)
│   ├── landing/             # Marketing landing page components
│   ├── native/              # iOS Capacitor LiveActivity bridge
│   ├── themes/              # Theme color systems & art-layer styling
│   ├── utils/               # Audio, storage, crypto & history utilities
│   ├── App.jsx              # Main application shell
│   ├── index.css            # Base typography & design tokens
│   └── main.jsx             # React DOM entry point
├── index.html               # Main app HTML entry
├── landing.html             # Landing page HTML entry
├── capacitor.config.json    # Capacitor iOS bridge configuration
├── package.json             # Dependencies & scripts
└── vite.config.js           # Multi-page Vite build & Vitest configuration
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+ (recommended Node 22+)
- npm 10+

### Installation & Local Development

```bash
# Clone the repository
git clone https://github.com/Deeprockz22/Zencus.git
cd Zencus

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

### Testing

```bash
# Run unit & screen test suite (173 tests)
npm test

# Run tests in watch mode
npm run test:watch
```

### Production Build

```bash
# Compile and bundle for production
npm run build

# Preview production build locally
npm run preview
```

### Native iOS App

```bash
# Sync web build to iOS Xcode project
npm run ios:sync

# Open in Xcode
npm run ios:open
```

---

## 📄 License

MIT © [Manideep Jakka](https://github.com/Deeprockz22)
