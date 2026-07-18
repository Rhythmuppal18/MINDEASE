import { motion } from 'framer-motion';
import type { WorldData } from '../../types';
import clsx from '../../utils/clsx';

interface TimelineProps {
  worlds: WorldData[];
  isLevelCompleted: (levelId: string) => boolean;
}

export default function Timeline({ worlds, isLevelCompleted }: TimelineProps) {
  const allLevels = worlds.flatMap((w) => w.levels.map((l) => ({ ...l, world: w })));

  return (
    <div className="relative pl-8">
      <div className="absolute bottom-0 left-3 top-0 w-px bg-gradient-to-b from-neon-cyan via-neon-violet to-neon-pink opacity-30" />
      <ul className="space-y-6">
        {allLevels.map((level, i) => {
          const done = isLevelCompleted(level.id);
          return (
            <motion.li
              key={level.id}
              className="relative"
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: (i % 6) * 0.05, duration: 0.4 }}
            >
              <span
                className={clsx(
                  'absolute -left-8 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px]',
                  done
                    ? 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan shadow-neon-cyan'
                    : 'border-white/20 bg-void-900 text-slate-500',
                )}
              >
                {done ? '✓' : '·'}
              </span>
              <div className="glass-panel rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-display text-sm text-white">{level.name}</p>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.3em]"
                    style={{ backgroundColor: `${level.world.accent}1a`, color: level.world.accent }}
                  >
                    {level.world.name}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{level.tagline}</p>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
