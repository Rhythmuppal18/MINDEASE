import { motion } from 'framer-motion';
import clsx from '../../utils/clsx';

interface AnimatedBackgroundProps {
  variant?: 'default' | 'fog' | 'grey' | 'storm' | 'ocean' | 'time';
  className?: string;
}

const variantBlobs: Record<string, { a: string; b: string; c: string }> = {
  default: { a: '#3df8ff', b: '#a35cff', c: '#ff4dd8' },
  fog: { a: '#3df8ff', b: '#8fa9b8', c: '#1c8fb0' },
  grey: { a: '#7d7d8a', b: '#a35cff', c: '#4b2e83' },
  storm: { a: '#ffb84d', b: '#8a5a1e', c: '#ff9d4d' },
  ocean: { a: '#4dffb8', b: '#1c8a63', c: '#3df8ff' },
  time: { a: '#61f0ff', b: '#4f6cff', c: '#b24cff' },
};

export default function AnimatedBackground({ variant = 'default', className }: AnimatedBackgroundProps) {
  const colors = variantBlobs[variant];

  return (
    <div className={clsx('pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-void-950', className)}>
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_32%)]" />
      <motion.div
        className="absolute -left-24 -top-24 h-[34rem] w-[34rem] rounded-full blur-[140px]"
        style={{ backgroundColor: colors.a, opacity: 0.2 }}
        animate={{ x: [0, 70, 0], y: [0, 40, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-24 -right-20 h-[30rem] w-[30rem] rounded-full blur-[140px]"
        style={{ backgroundColor: colors.b, opacity: 0.16 }}
        animate={{ x: [0, -40, 0], y: [0, -24, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-1/3 top-1/2 h-[24rem] w-[24rem] rounded-full blur-[120px]"
        style={{ backgroundColor: colors.c, opacity: 0.13 }}
        animate={{ x: [0, 50, 0], y: [0, 40, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
