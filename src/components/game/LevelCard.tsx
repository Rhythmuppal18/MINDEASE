import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { LevelData } from '../../types';
import clsx from '../../utils/clsx';

interface LevelCardProps {
  level: LevelData;
  unlocked: boolean;
  completed: boolean;
  accent: string;
  index: number;
}

const difficultyLabel: Record<string, string> = {
  calm: 'Calm',
  steady: 'Steady',
  turbulent: 'Turbulent',
};

export default function LevelCard({ level, unlocked, completed, accent, index }: LevelCardProps) {
  const navigate = useNavigate();

  return (
    <motion.button
      type="button"
      disabled={!unlocked}
      onClick={() => navigate(`/play/${level.id}`)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={unlocked ? { x: 6, scale: 1.01 } : undefined}
      className={clsx(
        'glass-panel flex w-full items-center gap-5 rounded-2xl p-5 text-left transition-all',
        unlocked ? 'cursor-pointer hover:shadow-neon-cyan' : 'cursor-not-allowed opacity-50',
      )}
    >
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl font-display text-xl font-bold"
        style={{ backgroundColor: `${accent}1a`, color: accent }}
      >
        {!unlocked ? '🔒' : completed ? '★' : level.worldId === 'anxiety' ? '⟳' : level.index}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-lg text-white">{level.name}</h3>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-slate-400">
            {difficultyLabel[level.difficulty]}
          </span>
        </div>
        <p className="mt-1 truncate text-sm text-slate-400">{level.tagline}</p>
      </div>

      <div className="hidden shrink-0 flex-col items-end gap-1 text-right sm:flex">
        <span className="font-display text-sm text-neon-cyan">+{level.xpReward} XP</span>
        <span className="text-xs text-slate-500">~{level.estimatedMinutes} min</span>
      </div>
    </motion.button>
  );
}
