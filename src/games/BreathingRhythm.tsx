import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressBar from '../components/ui/ProgressBar';
import type { MiniGameProps } from './types';

/** Phase config per breath cycle */
const PHASES = [
  { label: 'Breathe In', duration: 4000, scale: 1.6, color: '#4dffb8' },
  { label: 'Hold', duration: 4000, scale: 1.6, color: '#3df8ff' },
  { label: 'Breathe Out', duration: 6000, scale: 1.0, color: '#a35cff' },
  { label: 'Hold', duration: 2000, scale: 1.0, color: '#ff4dd8' },
] as const;

const CYCLES_REQUIRED = 4;

/**
 * Breathing Rhythm — the Breath world's signature game.
 * A guided 4-7-8 style breathing exercise that tracks the user's
 * completion of full breath cycles. Visual ring expands and contracts.
 */
export default function BreathingRhythm({ onComplete }: MiniGameProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [countdown, setCountdown] = useState(PHASES[0].duration / 1000);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  const phase = PHASES[phaseIndex];
  const breathProgress = ((cyclesCompleted + phaseIndex / PHASES.length) / CYCLES_REQUIRED) * 100;

  const nextPhase = () => {
    setPhaseIndex((prev) => {
      const next = (prev + 1) % PHASES.length;
      if (next === 0) {
        setCyclesCompleted((c) => {
          const newCount = c + 1;
          if (newCount >= CYCLES_REQUIRED && !completedRef.current) {
            completedRef.current = true;
            setTimeout(onComplete, 1200);
          }
          return newCount;
        });
      }
      setCountdown(PHASES[next].duration / 1000);
      return next;
    });
  };

  useEffect(() => {
    if (!isRunning) return;

    setCountdown(phase.duration / 1000);

    timerRef.current = setTimeout(nextPhase, phase.duration);
    intervalRef.current = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseIndex, isRunning]);

  const ringVariants = {
    breathIn: { scale: PHASES[0].scale, transition: { duration: PHASES[0].duration / 1000, ease: 'easeInOut' } },
    holdFull: { scale: PHASES[1].scale, transition: { duration: PHASES[1].duration / 1000 } },
    breathOut: { scale: PHASES[2].scale, transition: { duration: PHASES[2].duration / 1000, ease: 'easeInOut' } },
    holdEmpty: { scale: PHASES[3].scale, transition: { duration: PHASES[3].duration / 1000 } },
  };

  const ringState = ['breathIn', 'holdFull', 'breathOut', 'holdEmpty'][phaseIndex] as keyof typeof ringVariants;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Progress bar */}
      <div className="w-full max-w-md">
        <ProgressBar
          value={Math.min(100, breathProgress)}
          showLabel
          label={`${cyclesCompleted}/${CYCLES_REQUIRED} breath cycles • ${isRunning ? phase.label : 'Ready'}`}
          colorFrom="#4dffb8"
          colorTo="#a35cff"
        />
      </div>

      {/* Breathing ring */}
      <div className="relative flex h-72 w-72 items-center justify-center">
        {/* Outer ambient glow */}
        <motion.div
          className="absolute rounded-full"
          style={{ backgroundColor: phase.color, opacity: 0.08 }}
          animate={{ width: isRunning ? `${phase.scale * 180}px` : '220px', height: isRunning ? `${phase.scale * 180}px` : '220px' }}
          transition={{ duration: phase.duration / 1000, ease: 'easeInOut' }}
        />

        {/* Main ring */}
        <motion.div
          className="absolute rounded-full border-4"
          variants={ringVariants}
          animate={isRunning ? ringState : 'holdEmpty'}
          initial={{ scale: 1.0 }}
          style={{
            width: 160,
            height: 160,
            borderColor: phase.color,
            boxShadow: `0 0 40px ${phase.color}50`,
          }}
        />

        {/* Inner pulsing core */}
        <motion.div
          className="absolute rounded-full"
          style={{ backgroundColor: phase.color }}
          animate={
            isRunning
              ? { width: [24, 32, 24], height: [24, 32, 24], opacity: [0.6, 1, 0.6] }
              : { width: 24, height: 24, opacity: 0.4 }
          }
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Center text */}
        <div className="absolute flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={phaseIndex + (isRunning ? '-running' : '-idle')}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="font-display text-sm font-bold uppercase tracking-widest"
              style={{ color: isRunning ? phase.color : '#64748b' }}
            >
              {isRunning ? phase.label : 'Tap to Begin'}
            </motion.p>
          </AnimatePresence>
          {isRunning && (
            <motion.p
              key={`count-${countdown}`}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.7 }}
              className="mt-1 font-display text-2xl text-white"
            >
              {countdown}
            </motion.p>
          )}
        </div>
      </div>

      {/* Start / pause button */}
      {!isRunning ? (
        <motion.button
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsRunning(true)}
          className="rounded-2xl border border-neon-green/40 bg-neon-green/10 px-8 py-3 font-display text-sm uppercase tracking-widest text-neon-green shadow-[0_0_20px_rgba(77,255,184,0.15)] transition-all hover:border-neon-green hover:shadow-[0_0_30px_rgba(77,255,184,0.3)]"
        >
          {cyclesCompleted > 0 ? 'Continue' : 'Begin Breathing'}
        </motion.button>
      ) : null}

      {/* Cycle indicators */}
      <div className="flex items-center gap-3">
        {Array.from({ length: CYCLES_REQUIRED }).map((_, i) => (
          <motion.div
            key={i}
            className="h-2 rounded-full"
            animate={{
              width: i < cyclesCompleted ? 32 : i === cyclesCompleted ? 20 : 8,
              backgroundColor:
                i < cyclesCompleted ? '#4dffb8' : i === cyclesCompleted ? '#3df8ff' : 'rgba(255,255,255,0.1)',
            }}
            transition={{ duration: 0.4 }}
          />
        ))}
      </div>

      <p className="max-w-xs text-center text-xs text-slate-500">
        Follow the ring. Breathe in as it expands, hold, then exhale slowly as it contracts.
        Complete {CYCLES_REQUIRED} full cycles to restore calm.
      </p>
    </div>
  );
}
