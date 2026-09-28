# 🌐 Project Design & Technical Resources Catalog

A comprehensive, curated registry of all design inspiration galleries, component libraries, 3D/audio repositories, and technical design specifications provided throughout the evolution of **Thelidhu**.

---

## 📑 Quick Navigation

1. [Design Galleries & Trendsetters](#1-design-galleries--trendsetters)
2. [Micro-Interactions & Real-World Product UX](#2-micro-interactions--real-world-product-ux)
3. [3D WebGL, Custom Shaders & Motion Systems](#3-3d-webgl-custom-shaders--motion-systems)
4. [Acoustic Audio & Web Sound Engines](#4-acoustic-audio--web-sound-engines)
5. [Hardware & Aesthetic Design Specifications](#5-hardware--aesthetic-design-specifications-downloads)
6. [Component Toolkits & Precedents](#6-component-toolkits--precedents)

---

## 1. Design Galleries & Trendsetters

Curated galleries showcasing the bleeding edge of web aesthetics, creative coding, and experimental typography.

| Resource | URL | Primary Focus & Aesthetic Value | Applied In Project |
| :--- | :--- | :--- | :--- |
| **Godly** | [godly.website](https://godly.website/) | Curated hub of "astronomically good" web design with high-end motion, 3D WebGL, and dark-mode luxury. | Fluid atmospheric backdrops, dark-mode color balance, and smooth spring physics. |
| **Collected** | [collected.li](https://collected.li/) | Curated pool of 8 fresh, breathtaking web experiences per visit focusing on editorial typography and spatial balance. | Editorial typography scales (`display-lg`), high-contrast hierarchy, and spacious layout framing. |
| **Site of Sites** | [siteofsites.co](https://siteofsites.co/) | Comprehensive categorized directory of web design inspiration indexed by industry, style, and platform. | Multi-tier visualizer categorization and Bento grid structural rhythms. |
| **Unmatched Style** | [unmatchedstyle.com](https://unmatchedstyle.com/) | Legendary CSS design gallery highlighting technical web standards, layout mastery, and design criticism. | Strict CSS token architecture, semantic HTML structure, and responsive viewport breakpoints. |
| **Design Prompts** | [designprompts.dev](https://designprompts.dev/) | 31+ distinct web design aesthetic styles (CSS Zen Garden concept: Brutalism, Cyberpunk, Retro-Futurism, Neumorphism). | Multiverse visualizer suite where each mode transforms the entire aesthetic and sonic landscape. |
| **Deck.Gallery** | [deck.gallery](https://deck.gallery/) | Premier curated visual reference library for presentation decks, keynote storytelling, and information layout hierarchy. | High-density card layout proportions, telemetry framing, and clear visual hierarchy. |

---

## 2. Micro-Interactions & Real-World Product UX

Resources detailing the micro-details, delightful Easter eggs, and verified product flows from the world's most refined applications.

| Resource | URL | Primary Focus & Aesthetic Value | Applied In Project |
| :--- | :--- | :--- | :--- |
| **Design Spells** | [designspells.com](https://www.designspells.com/) | Bite-sized library of micro-interactions, delightful design details, hover Easter eggs, and tactile controls. | ClickSpark particles, magnetic button pull (`MagnetButton`), and tactile cursor feedback. |
| **Refero Design** | [refero.design](https://refero.design/) | Massive real-world UX library indexing user flows and screens from leading apps (Linear, Raycast, Figma, Stripe). | Command-center layout density, task-focus linking, and distraction-free fullscreen flow states. |
| **Skiper UI (skiper40)** | [skiper-ui.com](https://skiper-ui.com/) | Minimal animated cursor.com-inspired micro-interaction links (`npx shadcn add @skiper-ui/skiper40`) with 5 kinetic hover reveal variants. | [`skiper40.jsx`](file:///Users/jakkasaisrinivasamanideep/Documents/Thelidhu/src/components/ui/skiper-ui/skiper40.jsx) (`Link001` - `Link005`) for high-craft external and internal link interactions. |

---

## 3. 3D WebGL, Custom Shaders & Motion Systems

Core libraries and repositories powering the application's hardware-accelerated 3D graphics and reactive physics.

| Resource | Repository / URL | Technical Capabilities | Applied In Project |
| :--- | :--- | :--- | :--- |
| **React Three Fiber** | [github.com/pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) | Declarative Three.js scene graph renderer for React with reactive camera controls and shader hooks. | Powers the 3D canvas pipeline, camera controls, and WebGL2 particle fields. |
| **ShaderGradient** | [github.com/ruucm/shadergradient](https://github.com/ruucm/shadergradient) | 3D fluid gradient mesh engine with Simplex noise deformation and customizable color stops. | [`ShaderAtmosphere.jsx`](file:///Users/jakkasaisrinivasamanideep/Documents/Thelidhu/src/components/canvas/ShaderAtmosphere.jsx) (global background) and [`ShaderGradientVisualizer.jsx`](file:///Users/jakkasaisrinivasamanideep/Documents/Thelidhu/src/components/timer/ShaderGradientVisualizer.jsx) (Aura Flow mode). |
| **Aceternity UI** | [ui.aceternity.com](https://ui.aceternity.com/) | Cutting-edge UI component patterns: 3D Card Tilt, Moving Border Beams, Bento Grids, and Spotlight cards. | [`Card3D.jsx`](file:///Users/jakkasaisrinivasamanideep/Documents/Thelidhu/src/components/ui/Card3D.jsx), [`BorderBeam.jsx`](file:///Users/jakkasaisrinivasamanideep/Documents/Thelidhu/src/components/ui/BorderBeam.jsx), and spotlight glare cards. |
| **Animaster Library** | [animmasterlib.dev](https://animmasterlib.dev/) | Physics-driven kinetic typography, spring mechanics, and fluid transition curves. | Smooth countdown transitions, rolling digits, and hover elastic responses. |
| **Neuform.ai** | [neuform.ai](https://neuform.ai/) | Generative 3D iridescent metamaterials, chromatic Fresnel glass dispersion, and fluid liquid deformation. | [`NeuformVisualizer.jsx`](file:///Users/jakkasaisrinivasamanideep/Documents/Thelidhu/src/components/timer/NeuformVisualizer.jsx): Custom Simplex noise 3D deformable glass sphere with chromatic rim dispersion and orbiting droplets. |
| **Lenis Scroll** | [github.com/darkroomengineering/lenis](https://github.com/darkroomengineering/lenis) | Studio Freight's legendary buttery smooth scroll engine with inertia normalization, momentum scrolling, and zero jank. | [`App.jsx`](file:///Users/jakkasaisrinivasamanideep/Documents/Thelidhu/src/App.jsx): Global momentum scrolling across long dashboards, notes vaults, and task lists. |
| **GSAP (GreenSock)** | [github.com/greensock/GSAP](https://github.com/greensock/GSAP) | Professional-grade JavaScript web animation platform with timeline orchestration, sub-pixel rendering, and buttery spring physics. | High-performance kinetic timelines, focus session countdown pulses, and button micro-interactions. |
| **Vanta.js** | [github.com/itsjwill/vanta](https://github.com/itsjwill/vanta) | Animated 3D WebGL interactive canvas backgrounds (Waves, Net, Halo, Birds, Clouds, Topology) powered by Three.js. | [`VantaAtmosphere.jsx`](file:///Users/jakkasaisrinivasamanideep/Documents/Thelidhu/src/components/canvas/VantaAtmosphere.jsx): Atmospheric ambient 3D backgrounds selectable in Settings. |
| **ThreeUI & MCP API** | [threeui.com](https://threeui.com/) · [MCP Server](https://threeui.com/api/mcp) | Meng To's collection of 3D WebGL components for React/Three.js alongside an AI Model Context Protocol (MCP) server endpoint. | Cataloged for Three.js 3D hero modules, WebGL shaders, and agent-driven 3D component ingestion. |

---

## 4. Acoustic Audio & Web Sound Engines

Tactile audio synthesis turning interface interactions into physical, tangible sensations.

| Resource | URL | Technical Capabilities | Applied In Project |
| :--- | :--- | :--- | :--- |
| **UI SFX** | [uisfx.com](https://uisfx.com/) | Zero-latency Web Audio acoustic synthesis engine offering 12 specialized sound packs. | [`sfx.js`](file:///Users/jakkasaisrinivasamanideep/Documents/Thelidhu/src/utils/sfx.js): Full haptic sound integration across all 12 packs (`Zen`, `Mechanical`, `Glass`, `Arcade`, `Sci-Fi`, `Studio`, `Rubber`, `Organic`, `Dreamy`, `Cinematic`, `Minimal`, `Soft`). |

---

## 5. Hardware & Aesthetic Design Specifications (Downloads)

Custom markdown design specifications supplied to define distinct operational modes and visual identities:

### 1. BAK F2 · 32-Bit Float Field Recorder
- **File**: [`BAK F2 32-bit Float Field Recorder Design.md`](file:///Users/jakkasaisrinivasamanideep/Downloads/BAK%20F2%2032-bit%20Float%20Field%20Recorder%20Design.md)
- **Palette**: `#9DB0AF` (Primary), `#5CC8CD` (Secondary), `#9EA7BA` (Tertiary), `#E7EFEE` (Neutral Surface).
- **Core Elements**: Dual 32-bit float VU peak ladders (-48dB to +6dB), live oscilloscope signal monitor, SMPTE timecode (`00:MM:SS:FF`), 4px grid cadence, 3px radii, and retro-futurist dot-matrix WebGL field.
- **Component**: [`BakF2Visualizer.jsx`](file:///Users/jakkasaisrinivasamanideep/Documents/Thelidhu/src/components/timer/BakF2Visualizer.jsx) (mapped to `mechanical` sound pack).

### 2. Launch Experience Design
- **File**: [`Launch Experience Design.md`](file:///Users/jakkasaisrinivasamanideep/Downloads/Launch%20Experience%20Design.md)
- **Palette**: Brutalist safety orange (`#F97316`), deep pitch black (`#000000`), neutral white (`#FFFFFF`), border (`#6C6655`).
- **Core Elements**: Aerospace launch countdown telemetry, orbital sequence tracking, and high-impact industrial typography.
- **Component**: [`LaunchVisualizer.jsx`](file:///Users/jakkasaisrinivasamanideep/Documents/Thelidhu/src/components/timer/LaunchVisualizer.jsx) (mapped to `cinematic` sound pack).

### 3. Quantum Particulate Render Matrix
- **File**: [`Quantum Particulate Render Matrix Design.md`](file:///Users/jakkasaisrinivasamanideep/Downloads/Quantum%20Particulate%20Render%20Matrix%20Design.md)
- **Palette**: Clean laboratory white (`#FAFAFA`), subtle particle gray (`#18181B`), cyan quantum flare (`#06B6D4`).
- **Core Elements**: Subatomic particle accelerator physics, quantum probability wavefields, and orbital node counters.
- **Component**: [`QuantumVisualizer.jsx`](file:///Users/jakkasaisrinivasamanideep/Documents/Thelidhu/src/components/timer/QuantumVisualizer.jsx) (mapped to `scifi` sound pack).

### 4. NEXUS Output Registry Personnel
- **File**: [`NEXUS Output Registry Personnel Design.md`](file:///Users/jakkasaisrinivasamanideep/Downloads/NEXUS%20Output%20Registry%20Personnel%20Design.md)
- **Palette**: Warm ivory parchment (`#FFF9E9`), military tactical green (`#1E3A2F`), telemetry crimson (`#DC2626`).
- **Core Elements**: Cyberpunk biometric surveillance registry, personnel clearance levels, and active monitoring metrics.
- **Component**: [`NexusVisualizer.jsx`](file:///Users/jakkasaisrinivasamanideep/Documents/Thelidhu/src/components/timer/NexusVisualizer.jsx) (mapped to `minimal` sound pack).

---

## 6. Component Toolkits & Precedents

Foundational codebases and repositories referenced for structure and micro-components:

| Resource | Source | Role in Application |
| :--- | :--- | :--- |
| **Microkit** | [github.com/henriquegpb/microkit.git](https://github.com/henriquegpb/microkit.git) | Minimalist component interactions, switch primitives, and lightweight tactile controls. |
| **Notes-App Directory** | Local Workspace (`Notes-App`) | Aesthetic benchmark for custom notes folders, rich text editing, and tag organization. |
| **Skiper UI** | [skiper-ui.com](https://skiper-ui.com/) | Minimal copy-paste React micro-interaction component library (`@skiper-ui/skiper40`). |
| **ThreeUI MCP** | [threeui.com/api/mcp](https://threeui.com/api/mcp) | Model Context Protocol API endpoint providing automated 3D component discovery for AI coding agents. |

---

*Catalog compiled automatically from conversation trajectory and verified against active workspace components.*

---

## 7. Applied in the landing page (`landing.html`, Sep 2026)

| Resource | How the landing page uses it |
| :--- | :--- |
| **Collected** | Editorial display type (Instrument Serif), one idea per section, generous spacing. |
| **Godly** | A soft, slowly drifting red aura behind the hero, and a dark-mode palette built on the same tokens. |
| **Aceternity UI / Site of Sites** | The feature bento: one large card with a real screenshot, four small ones. |
| **Design Spells / React Bits** | `MagnetButton` on the main call to action. |
| **Skiper UI (skiper40)** | The underline-sweep-and-arrow nav links (`Link001`), rebuilt in plain CSS so the page doesn't load Tailwind. |
| **Animaster (rolling digits)** | The hero's working timer uses `FlipText`, so only the changed digit rolls. |
| **Lenis** | Smooth, inertial scrolling and anchor links. Off for people who ask for reduced motion. |

**Left out on purpose:** ShaderGradient, React Three Fiber and Vanta (WebGL would add hundreds of KB
to a page whose job is to load instantly), and GSAP (an IntersectionObserver plus CSS covers the scroll
reveals). The page's own code is about 14 KB of JavaScript and 13 KB of CSS.
