import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface ParticleFieldProps {
  count?: number;
  color?: string;
  className?: string;
}

interface Particle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
}

export default function ParticleField({ count = 24, color = '#3df8ff', className }: ParticleFieldProps) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: count }, (_, id) => ({
        id,
        left: Math.random() * 100,
        size: 1 + Math.random() * 3,
        duration: 8 + Math.random() * 14,
        delay: Math.random() * 10,
        drift: (Math.random() - 0.5) * 60,
        opacity: 0.35 + Math.random() * 0.65,
      })),
    [count],
  );

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`} aria-hidden="true">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            bottom: '-5%',
            width: p.size,
            height: p.size,
            backgroundColor: color,
            boxShadow: `0 0 ${p.size * 3}px ${color}`,
            opacity: p.opacity,
          }}
          animate={{
            y: ['0%', '-120vh'],
            x: [0, p.drift],
            opacity: [0, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
