import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { WorldData } from '../../types';
import WorldIconGlyph from './WorldIconGlyph';
import ProgressBar from '../ui/ProgressBar';
import clsx from '../../utils/clsx';

interface WorldCardProps {
  world: WorldData;
  unlocked: boolean;
  completedCount: number;
  index: number;
}

export default function WorldCard({ world, unlocked, completedCount, index }: WorldCardProps) {
  const navigate = useNavigate();
  const total = world.levels.length;
  const percent = (completedCount / total) * 100;
  const isComplete = completedCount === total;

  return (
    <motion.button
      type="button"
      disabled={!unlocked}
      onClick={() => navigate(`/levels/${world.id}`)}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={unlocked ? { y: -6, scale: 1.02 } : undefined}
      className={clsx(
        'glass-panel group relative w-full rounded-3xl p-6 text-left transition-all sm:p-8',
        unlocked ? 'cursor-pointer hover:shadow-neon-cyan' : 'cursor-not-allowed opacity-50',
      )}
    >
      <div
        className="absolute inset-0 -z-10 rounded-3xl opacity-20 blur-2xl transition-opacity group-hover:opacity-30"
        style={{ background: `linear-gradient(135deg, ${world.colorFrom}, ${world.colorTo})` }}
      />

      <div className="flex items-start justify-between gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${world.accent}1a`, color: world.accent }}
        >
          <WorldIconGlyph icon={world.icon} className="h-8 w-8" />
        </div>
        <div className="flex flex-col items-end gap-2">
          {isComplete ? (
            <span className="rounded-full bg-neon-green/15 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-neon-green">
              Restored
            </span>
          ) : !unlocked ? (
            <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-slate-400">
              Locked
            </span>
          ) : (
            <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-slate-400">
              Available
            </span>
          )}
        </div>
      </div>

      <h3 className="mt-5 font-display text-2xl text-white">{world.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{world.description}</p>

      <div className="mt-6">
        <ProgressBar
          value={percent}
          colorFrom={world.colorFrom}
          colorTo={world.colorTo}
          showLabel
          label={`${completedCount}/${total} levels complete`}
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
        <span>{world.levels.length} trials</span>
        <span>{unlocked ? 'Enter realm' : 'Awaiting path'}</span>
      </div>
    </motion.button>
  );
}
