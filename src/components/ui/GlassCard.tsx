import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import clsx from '../../utils/clsx';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'violet' | 'pink' | 'amber' | 'green' | 'none';
  hoverLift?: boolean;
}

const glowMap: Record<string, string> = {
  cyan: 'hover:shadow-neon-cyan',
  violet: 'hover:shadow-neon-violet',
  pink: 'hover:shadow-neon-pink',
  amber: 'hover:shadow-[0_0_20px_rgba(255,184,77,0.45)]',
  green: 'hover:shadow-[0_0_20px_rgba(77,255,184,0.45)]',
  none: '',
};

export default function GlassCard({
  children,
  className,
  glowColor = 'none',
  hoverLift = true,
  ...motionProps
}: GlassCardProps) {
  return (
    <motion.div
      className={clsx('glass-panel rounded-2xl transition-all duration-300', glowMap[glowColor], className)}
      whileHover={hoverLift ? { y: -5, scale: 1.01 } : undefined}
      transition={{ type: 'spring', stiffness: 250, damping: 20 }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
