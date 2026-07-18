/**
 * Central type definitions for MindMaze.
 * Keeping these in one place makes the mock data, context, and UI
 * components share a single source of truth for the game's shape.
 */

/** The five emotional worlds the player can travel through. */
export type EmotionId = 'anxiety' | 'depression' | 'overthinking' | 'stress' | 'impatience';

/** Difficulty tiers used purely for flavor + XP scaling. */
export type Difficulty = 'calm' | 'steady' | 'turbulent';

/** A single playable level that belongs to an emotional world. */
export interface LevelData {
  id: string;
  worldId: EmotionId;
  index: number;
  name: string;
  tagline: string;
  difficulty: Difficulty;
  xpReward: number;
  estimatedMinutes: number;
  mechanicSummary: string;
}

/** Metadata describing an emotional world on the World Map. */
export interface WorldData {
  id: EmotionId;
  name: string;
  title: string;
  description: string;
  colorFrom: string;
  colorTo: string;
  accent: string;
  glow: string;
  icon: WorldIcon;
  requiredWorld: EmotionId | null;
  levels: LevelData[];
}

export type WorldIcon = 'fog' | 'city' | 'storm' | 'wave' | 'time';

/** A badge the player can earn. */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpThreshold?: number;
  worldId?: EmotionId;
}

/** A single mood check-in entry logged before playing a level. */
export interface MoodLog {
  id: string;
  timestamp: string;       // ISO 8601
  moodValue: number;       // 1 = Low … 5 = Calm
  moodLabel: string;       // e.g. "Uneasy"
  intentionLabel: string;  // e.g. "Anxious", "Restless", "Skipped"
  worldId: EmotionId;
  levelId: string;
}

/** Runtime save-data shape, persisted to localStorage. */
export interface PlayerProgress {
  xp: number;
  playerLevel: number;
  completedLevels: string[];
  worldUnlocked: Record<EmotionId, boolean>;
  achievementsUnlocked: string[];
  streak: number;
  lastPlayedISO: string | null;
  moodHistory: MoodLog[];
  settings: {
    soundOn: boolean;
    musicOn: boolean;
    theme: 'obsidian' | 'aurora';
    reducedMotion: boolean;
    demoMode: boolean;
  };
  dailyProgress: DailyProgress;
}

/** Daily challenge mock entry. */
export interface DailyChallenge {
  id: string;
  worldId: EmotionId;
  title: string;
  description: string;
  xpReward: number;
  expiresInHours: number;
  /** Condition type used to evaluate completion. */
  condition: 'complete-world-level' | 'complete-any-level' | 'earn-xp-today';
  /** For earn-xp-today: minimum XP earned today to complete. */
  xpThreshold?: number;
}

/** Tracks daily challenge progress, reset each calendar day. */
export interface DailyProgress {
  date: string;
  completedChallengeIds: string[];
  levelsCompletedToday: number;
  xpEarnedToday: number;
}
