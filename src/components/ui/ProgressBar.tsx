import { motion } from 'framer-motion';
import clsx from '../../utils/clsx';

interface ProgressBarProps {
  value: number; // 0-100
  colorFrom?: string;
  colorTo?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

/** A glowing horizontal progress bar used for XP, level completion, and puzzle meters. */
export default function ProgressBar({
  value,
  colorFrom = '#3df8ff',
  colorTo = '#a35cff',
  height = 10,
  showLabel = false,
  label,
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-400">
          <span>{label}</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      )}
      <div
        className="w-full overflow-hidden rounded-full bg-white/5"
        style={{ height }}
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${colorFrom}, ${colorTo})` }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
