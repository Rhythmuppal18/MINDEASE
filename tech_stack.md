# MindMaze Tech Stack: Definition & Explanation

This document defines and explains the technical architecture, design layout structures, and libraries used to build MindMaze.

---

## 1. Core Frameworks & Languages

### React 18 & TypeScript
* **Definition:** A component-based frontend library (React) paired with static typing compiler checks (TypeScript).
* **Role in MindMaze:** 
  - Manages interactive states (e.g. active levels, collected shards, current coordinates) using standard React hooks (`useState`, `useRef`, `useCallback`, `useMemo`).
  - TypeScript provides type-safe definitions (defined in [index.ts](file:///c:/Users/ASUS/OneDrive/Desktop/mindmaze/src/types/index.ts)) for structures like `LevelData`, `PlayerProgress`, and `EmotionId`, preventing compile-time bugs.

### Vite
* **Definition:** A fast, next-generation build tool and hot-module dev server.
* **Role in MindMaze:** Manages the build pipeline and processes assets (fonts, sounds, SVGs) instantly during development.

---

## 2. Animation & Styling Layer

### Tailwind CSS (Utility-First Styles)
* **Definition:** A utility-first CSS framework for rapid styling directly in TSX code blocks.
* **Role in MindMaze:** Powers the dark, sleek obsidian theme. Creates glowing neon text and box-shadow borders (e.g., `.shadow-neon-cyan`, `.shadow-neon-red`) representing the futuristic temple vibes.

### Framer Motion
* **Definition:** An animation library for React that simplifies declarative layout transitions and spring physics.
* **Role in MindMaze:** Powers route transitions, hover expansions on cards, floating thought bubbles in the Thought Storm, victory overlays, and interactive pulsing rings.

---

## 3. Game & Audio Renderers

### HTML5 SVG (Scalable Vector Graphics)
* **Definition:** An XML-based vector image format rendered directly in the DOM.
* **Role in MindMaze:** Renders game layouts (like the Canyon paths, laser sweeps, Sentinel wave circles, and rotating clocks). This keeps layouts lightweight, fully responsive, and easy to bind to React click/drag event listeners.

### Web Audio API (`AudioContext`)
* **Definition:** A low-level browser audio processing synthesizer.
* **Role in MindMaze:** Dynamically synthesizes sound waves in real-time. Sound effects (beeps for checkpoints/violations) and background ambient soundscapes (strings Detuned Sawtooth oscillators and plucks Triangle oscillators) are synthesized programmatically in [useAmbientSound.ts](file:///c:/Users/ASUS/OneDrive/Desktop/mindmaze/src/hooks/useAmbientSound.ts) without loading heavy audio assets.
