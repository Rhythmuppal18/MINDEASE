# MindMaze Workflow & User Journey

This document outlines the step-by-step user flow, level progression, and backend mechanics state sync for MindMaze.

---

## 1. Landing & Boot Sequence

```
[Landing Page] ---> (Click Start Journey) ---> [Dashboard / Dashboard Portal]
                                                    |
                                                    +---> [World Map]
                                                    |
                                                    +---> [Breathing Oasis Page]
```

1. **Boot Screen:** Checks for pre-existing save data in `localStorage` under key `'mindmaze-save-v2'`. If missing, initializes default state (World 1 unlocked, others locked, streak set to 0).
2. **Dashboard:** Displays player level, daily wellness quotes, active Daily Challenges, unlocked Achievements, and direct path links to the World Map.

---

## 2. Emotional Worlds Progression Loop
Players must travel sequentially through five worlds to restore their mental clarity:

1. **The Drift (Anxiety):**
   - *Mechanic:* Physics-based cursor wind attraction. Guide focus spark through winding canyons. Avoid worry circle nodes.
2. **The Grey City (Depression):**
   - *Mechanic:* Saturation restoration card matching. Turn on windows and colorize the sky skyline.
3. **The Thought Storm (Overthinking):**
   - *Mechanic:* Logical sequence ordering. Connect drifting thoughts in logical chains before they scatter.
4. **The Ocean of Stress (Stress):**
   - *Mechanic:* Real-time raft balance stabilizer. Timed mouse clicks/taps keep the balance indicator steady.
5. **The Chrono Trial (Impatience):**
   - *Mechanic:* Green Light / Red Light timelock. Direct key movement to cross the arena. Freeze completely during red phases outside safe zones to avoid violations.

---

## 3. Gameplay Loop & Progression State

```
[Select Level] ---> [Enter Mood Gate] ---> [Play Mini-Game] 
                                                  |
                                                  +---> (Violations/Collisions) ---> [Reset to Checkpoint]
                                                  |
                                                  +---> (Reach Portal Exit) ---> [Complete Level]
                                                                                        |
                                                                                        v
                                                                             [Grant XP & Level Up]
                                                                                        |
                                                                                        v
                                                                                [Victory Screen]
                                                                                        |
                                                                                        v
                                                                             [Unlock Next World]
```

1. **Level Selection:** Clicking a world shows its levels (marked Calm, Steady, or Turbulent). Unlocked levels are highlighted; locked levels display a padlock (`🔒`).
2. **Mood Gate:** Before entering, players select their current emotional state to set mindfulness intentions.
3. **Interactive Arena:** Players play the custom mini-game component. Hits/Violations trigger visual overlays and reset players to checkpoints.
4. **Level Clearance:** Reaching the portal triggers the completion callback (`completeLevel`), saving progress to local storage.
5. **XP Rewards & Achievements:** Calculates leveling curves, checks daily challenges, and unlocks badges (e.g. `'time-master'`).
