import React, { createContext, useCallback, useContext, useMemo } from 'react';
import type { EmotionId, MoodLog, PlayerProgress } from '../types';
import { ACHIEVEMENTS, TOTAL_LEVEL_COUNT, WORLDS, getWorld } from '../data/mockData';
import { useLocalStorage } from '../hooks/useLocalStorage';

const STORAGE_KEY = 'mindmaze-save-v2';

function createLockedProgress(existingSettings?: PlayerProgress['settings']): PlayerProgress {
  const worldUnlocked = {
    anxiety: true,
    depression: true,
    overthinking: true,
    stress: true,
    impatience: true,
  };

  return {
    xp: 0,
    playerLevel: 1,
    completedLevels: [],
    worldUnlocked,
    achievementsUnlocked: [],
    streak: 0,
    lastPlayedISO: new Date().toISOString(),
    settings: existingSettings ?? {
      soundOn: true,
      musicOn: true,
      theme: 'obsidian',
      reducedMotion: false,
      demoMode: false,
    },
    dailyProgress: {
      date: new Date().toISOString().slice(0, 10),
      completedChallengeIds: [],
      levelsCompletedToday: 0,
      xpEarnedToday: 0,
    },
    moodHistory: [],
  };
}

const DEFAULT_PROGRESS = createLockedProgress();

/** XP required to reach a given player level (simple escalating curve). */
export function xpForLevel(level: number): number {
  return Math.round(200 * Math.pow(level, 1.35));
}

/** Derives the player's current level + progress-to-next-level from total XP. */
export function deriveLevelFromXP(xp: number) {
  let level = 1;
  while (xp >= xpForLevel(level)) {
    level += 1;
  }
  const currentFloor = level === 1 ? 0 : xpForLevel(level - 1);
  const nextCeiling = xpForLevel(level);
  const progress = (xp - currentFloor) / (nextCeiling - currentFloor);
  return { level, currentFloor, nextCeiling, progress };
}

interface GameContextValue {
  progress: PlayerProgress;
  /** Marks a level complete, grants XP, unlocks the next world if eligible, unlocks any earned achievements. */
  completeLevel: (worldId: EmotionId, levelId: string, xpEarned: number) => string[];
  /** Records a mood check-in into the history log. */
  logMood: (worldId: EmotionId, levelId: string, moodValue: number, moodLabel: string, intentionLabel: string) => void;
  isLevelUnlocked: (worldId: EmotionId, levelIndex: number) => boolean;
  isWorldUnlocked: (worldId: EmotionId) => boolean;
  isLevelCompleted: (levelId: string) => boolean;
  toggleSound: () => void;
  toggleMusic: () => void;
  toggleTheme: () => void;
  toggleReducedMotion: () => void;
  resetProgress: () => void;
  totalLevelsCompleted: number;
  completionPercent: number;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useLocalStorage<PlayerProgress>(STORAGE_KEY, DEFAULT_PROGRESS);

  // Runtime migration: patch old saves that predate moodHistory field
  React.useEffect(() => {
    if (!progress.moodHistory) {
      setProgress((prev) => ({ ...prev, moodHistory: [] }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isWorldUnlocked = useCallback(
    (worldId: EmotionId) => true,
    []
  );

  const isLevelCompleted = useCallback(
    (levelId: string) => progress.completedLevels.includes(levelId),
    [progress.completedLevels],
  );

  const isLevelUnlocked = useCallback(
    (worldId: EmotionId, levelIndex: number) => true,
    []
  );

  const completeLevel = useCallback(
    (worldId: EmotionId, levelId: string, xpEarned: number): string[] => {
      const newlyUnlockedAchievements: string[] = [];

      setProgress((prev) => {
        const alreadyCompleted = prev.completedLevels.includes(levelId);
        const completedLevels = alreadyCompleted
          ? prev.completedLevels
          : [...prev.completedLevels, levelId];
        const xp = prev.xp + (alreadyCompleted ? Math.round(xpEarned * 0.25) : xpEarned);
        const { level } = deriveLevelFromXP(xp);

        // Determine if the next world should unlock.
        const worldUnlocked = { ...prev.worldUnlocked };
        const world = getWorld(worldId);
        if (world) {
          const allLevelsDone = world.levels.every((l) => completedLevels.includes(l.id));
          if (allLevelsDone) {
            const nextWorld = WORLDS.find((w) => w.requiredWorld === worldId);
            if (nextWorld) worldUnlocked[nextWorld.id] = true;
          }
        }

        // Evaluate achievements.
        const achievementsUnlocked = new Set(prev.achievementsUnlocked);

        if (completedLevels.length >= 1) achievementsUnlocked.add('first-steps');

        for (const w of WORLDS) {
          const worldComplete = w.levels.every((l) => completedLevels.includes(l.id));
          if (worldComplete) {
            const match = ACHIEVEMENTS.find((a) => a.worldId === w.id);
            if (match) achievementsUnlocked.add(match.id);
          }
        }

        if (xp >= 1000) achievementsUnlocked.add('xp-1000');
        if (xp >= 2000) achievementsUnlocked.add('xp-2000');
        if (completedLevels.length >= TOTAL_LEVEL_COUNT) achievementsUnlocked.add('mind-restored');

        // Track which achievements are new for toast/notification purposes.
        for (const id of achievementsUnlocked) {
          if (!prev.achievementsUnlocked.includes(id)) newlyUnlockedAchievements.push(id);
        }

        const today = new Date().toISOString().slice(0, 10);
        const lastDay = prev.lastPlayedISO?.slice(0, 10);
        const streak = lastDay === today ? prev.streak : prev.streak + 1;

        return {
          ...prev,
          xp,
          playerLevel: level,
          completedLevels,
          worldUnlocked,
          achievementsUnlocked: Array.from(achievementsUnlocked),
          streak,
          lastPlayedISO: new Date().toISOString(),
        };
      });

      return newlyUnlockedAchievements;
    },
    [setProgress],
  );

  const toggleSound = useCallback(() => {
    setProgress((prev) => ({ ...prev, settings: { ...prev.settings, soundOn: !prev.settings.soundOn } }));
  }, [setProgress]);

  const toggleMusic = useCallback(() => {
    setProgress((prev) => ({ ...prev, settings: { ...prev.settings, musicOn: !prev.settings.musicOn } }));
  }, [setProgress]);

  const toggleTheme = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      settings: { ...prev.settings, theme: prev.settings.theme === 'obsidian' ? 'aurora' : 'obsidian' },
    }));
  }, [setProgress]);

  const toggleReducedMotion = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      settings: { ...prev.settings, reducedMotion: !prev.settings.reducedMotion },
    }));
  }, [setProgress]);

  const resetProgress = useCallback(() => {
    setProgress(createLockedProgress());
  }, [setProgress]);

  const logMood = useCallback(
    (worldId: EmotionId, levelId: string, moodValue: number, moodLabel: string, intentionLabel: string) => {
      const entry: MoodLog = {
        id: `mood-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        moodValue,
        moodLabel,
        intentionLabel,
        worldId,
        levelId,
      };
      setProgress((prev) => ({
        ...prev,
        moodHistory: [...(prev.moodHistory ?? []), entry],
      }));
    },
    [setProgress],
  );

  const totalLevelsCompleted = progress.completedLevels.length;
  const completionPercent = Math.round((totalLevelsCompleted / TOTAL_LEVEL_COUNT) * 100);

  const value = useMemo<GameContextValue>(
    () => ({
      progress,
      completeLevel,
      logMood,
      isLevelUnlocked,
      isWorldUnlocked,
      isLevelCompleted,
      toggleSound,
      toggleMusic,
      toggleTheme,
      toggleReducedMotion,
      resetProgress,
      totalLevelsCompleted,
      completionPercent,
    }),
    [
      progress,
      completeLevel,
      logMood,
      isLevelUnlocked,
      isWorldUnlocked,
      isLevelCompleted,
      toggleSound,
      toggleMusic,
      toggleTheme,
      toggleReducedMotion,
      resetProgress,
      totalLevelsCompleted,
      completionPercent,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
