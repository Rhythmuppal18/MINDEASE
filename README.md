# MindMaze

A cinematic, browser-based puzzle adventure where each level represents a human emotion through immersive gameplay, responsive visual feedback, and ambient environmental storytelling. 

MindMaze is fully client-side — requiring zero servers, database configuration, or external API keys. All progression metrics, achievements, streaks, and user preferences are persisted locally inside the browser.

---

## 🌟 Core Features

- **Dynamic Psychological Mechanics:** Puzzles designed around emotional coping mechanisms: calming storms, ordering chaotic loops, matching thoughts, and coordinating loops with historical records.
- **Progress Tracking & Stats:**
  - **Experience Points (XP):** Earned by clearing levels and completing daily trials.
  - **Dynamic Leveling:** Level up based on accumulated XP milestones.
  - **Day Streak Tracker:** Encourages daily mindfulness exercises with streak multipliers.
  - **Achievement Badges:** Unlock visual accomplishments as you traverse the mental worlds.
  - **Daily Challenges:** Unique daily tasks awarding bonus XP.
- **Cinematic Visuals & Polish:** Premium glassmorphic interface, adaptive neon shadow glows (`shadow-neon-cyan`, `shadow-neon-violet`, `shadow-neon-pink`), and smooth spring-physics motion transitions powered by Framer Motion.
- **Acoustic Synthesis Audio Engine:** Synthesized background soundtracks that cross-fade between custom frequency pads and chord ranges matching the emotional tone of the current screen.
- **Accessibility Integration:**
  - **Reduced Motion:** Option to toggle off heavy particle emitters and camera drift.
  - **Keyboard Interface:** Full keyboard hotkey overlay accessible by pressing `?` anywhere.
  - **Responsive Layouts:** Designed to scale beautifully from mobile screens up to wide desktops.
- **Guided Wellness Mode:** A dedicated, standalone breathing page featuring a paced ring expansion to guide users through diaphragmatic breathing exercises.

---

## 🛠️ Technology Stack

- **Framework:** React 18
- **Language:** TypeScript (Strictly typed schemas)
- **Styling:** Tailwind CSS (Utility classes & custom design tokens)
- **Animations:** Framer Motion (Page slides, springs, fade-ins)
- **Routing:** React Router v6 (SPA routing with route-level transitions)
- **Bundler:** Vite (Lightning-fast HMR and build optimization)
- **Audio Synthesizer:** Web Audio API (Dynamic browser-side oscillators)

---

## 🧭 The 4 Emotional Worlds

| World | Emotion Theme | Gameplay Mechanic | Psychological Metaphor |
| --- | --- | --- | --- |
| **Time Echoes** | Anxiety | Solve seed-generated mazes by recording loop traces and coordinating switch/door activation with your past "echo" self. | Understanding looping thought cycles and aligning past events. |
| **Grey City** | Depression | Match pairs of memory tiles in a grayscale grid, gradually restoring bright saturation to a frozen skyline block-by-block. | Small, focused actions gradually restore energy and color to life. |
| **Thought Storm** | Overthinking | Sort drifting memory nodes into correct category zones and sequence thought chains in logical order before a storm scatters them. | Filtering out clutter, structuring chaos, and focus control. |
| **Ocean of Stress** | Stress | Hold balance on a floating raft, counter-balancing dynamic physics tilts caused by layered storm wave sines. | Finding stillness and adjusting to unpredictable external forces. |

---

## 📂 Project Structure

```
src/
  components/
    layout/         Navbar header, page transition wrapper, Layout Shell
    ui/             GlassCard, NeonButton, ProgressBar, Badge, LoadingScreen, ParticleField...
    game/           WorldCard, LevelCard, Timeline tracker, WorldIconGlyph...
  games/            The core interactive mini-games:
                    ├── FogMaze.tsx (Time Echoes - Anxiety Loop Game)
                    ├── GreyCity.tsx (Skyline Memory Match - Depression Game)
                    ├── ThoughtStorm.tsx (Sequence Chain - Overthinking Game)
                    ├── OceanStress.tsx (Tilt Raft Physics - Stress Game)
                    └── BreathingRhythm.tsx (Guided Wellness Breath Circle)
  context/          GameContext — XP, completed levels, unlocked worlds, badges, and settings saved to localStorage
  data/             mockData.ts — Worlds configuration, levels definitions, badges, and daily challenges schemas
  pages/            Top-level routing screens:
                    ├── LandingPage.tsx (Intro portal)
                    ├── Dashboard.tsx (Player stats, health gauges, streaks, quick resumes)
                    ├── WorldMap.tsx (Global emotional node tree map)
                    ├── LevelSelect.tsx (Level selectors)
                    ├── GameLevel.tsx (Level stage engine: Mood Gate -> Intro -> Game -> Victory)
                    ├── Progress.tsx (Breakdown statistics and achievement grid)
                    ├── Settings.tsx (Audio toggles, reduced motion controls, profile resets)
                    └── BreathPage (Guided wellness space)
  hooks/            useLocalStorage, useAmbientSound synth engine, usePageTitle, usePageScroll...
  types/            TypeScript models for achievements, progress save, worlds, levels...
  utils/            Tailwind class helper utils (clsx)
```

---

## 🚀 Getting Started

Ensure you have [Node.js](https://nodejs.org/) installed, then follow these steps:

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open the printed local URL (typically `http://localhost:5173`) in your browser to begin the journey.

### 3. Build for Production
To generate a compiled and highly optimized static bundle:
```bash
npm run build
npm run preview
```
