import type { LevelData } from '../types';

/** Every mini-game receives its level definition and a callback to fire on success. */
export interface MiniGameProps {
  level: LevelData;
  onComplete: () => void;
}
