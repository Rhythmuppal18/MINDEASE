import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import clsx from '../../utils/clsx';

interface NeonButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-gradient-to-r from-neon-cyan to-neon-violet text-void-950 font-semibold shadow-[0_0_30px_rgba(61,248,255,0.25)] hover:brightness-110',
  secondary:
    'glass-panel text-neon-cyan border-neon-cyan/40 hover:border-neon-cyan hover:shadow-neon-cyan',
  ghost: 'bg-transparent text-slate-300 hover:text-white hover:bg-white/5',
  danger:
    'glass-panel text-neon-red border-neon-red/40 hover:border-neon-red hover:shadow-[0_0_20px_rgba(255,92,122,0.4)]',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export default function NeonButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  className,
  ...props
}: NeonButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-display uppercase tracking-wider transition-all duration-200',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </motion.button>
  );
}
