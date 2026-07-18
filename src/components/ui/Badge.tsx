import { motion } from 'framer-motion';
import clsx from '../../utils/clsx';

interface BadgeProps {
  icon: string;
  name: string;
  description: string;
  unlocked: boolean;
}

export default function Badge({ icon, name, description, unlocked }: BadgeProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={clsx(
        'glass-panel flex flex-col items-center gap-2 rounded-2xl p-5 text-center transition-all',
        unlocked ? 'border-neon-cyan/30 hover:shadow-neon-cyan' : 'opacity-60 grayscale',
      )}
    >
      <div
        className={clsx(
          'flex h-14 w-14 items-center justify-center rounded-full text-2xl',
          unlocked ? 'bg-neon-cyan/10 shadow-neon-cyan' : 'bg-white/5',
        )}
      >
        <span aria-hidden="true">{icon}</span>
      </div>
      <p className="font-display text-sm text-white">{name}</p>
      <p className="text-xs leading-snug text-slate-400">{description}</p>
      {!unlocked && (
        <span className="mt-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-slate-500">
          Locked
        </span>
      )}
    </motion.div>
  );
}
