import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { MiniGameProps } from './types';
import ProgressBar from '../components/ui/ProgressBar';

const CONFIG_BY_INDEX = [
  { amplitude: 14, threshold: 10, calmRate: 26, requiredHold: 100 },
  { amplitude: 20, threshold: 8, calmRate: 22, requiredHold: 100 },
  { amplitude: 26, threshold: 6, calmRate: 18, requiredHold: 100 },
];

/** Ocean of Stress — the Stress world's signature level. Counter the storm's tilt to hold your balance. */
export default function OceanStress({ level, onComplete }: MiniGameProps) {
  const config = CONFIG_BY_INDEX[level.index - 1] ?? CONFIG_BY_INDEX[0];

  const [tilt, setTilt] = useState(0);
  const [calm, setCalm] = useState(0);
  const heldDirection = useRef<0 | -1 | 1>(0);
  const counterRef = useRef(0);
  const timeRef = useRef(0);
  const completedRef = useRef(false);

  const completionTimeoutRef = useRef<any>(null);

  useEffect(() => {
    let last = performance.now();
    let raf: number;

    const step = (now: number) => {
      if (completedRef.current) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      timeRef.current += dt;

      // Natural storm tilt: layered sine waves for an organic, unpredictable swell.
      const t = timeRef.current;
      const natural =
        Math.sin(t * 0.9) * config.amplitude * 0.6 + Math.sin(t * 1.7 + 1.3) * config.amplitude * 0.4;

      // Player counter-force eases toward -1/0/1 based on held direction, then scales the correction.
      const targetCounter = heldDirection.current * 1;
      counterRef.current += (targetCounter - counterRef.current) * Math.min(1, dt * 4);

      const totalTilt = natural + counterRef.current * -config.amplitude * 1.05;
      setTilt(totalTilt);

      const balanced = Math.abs(totalTilt) < config.threshold;
      setCalm((prev) => {
        const next = balanced ? prev + dt * config.calmRate : prev - dt * (config.calmRate * 0.6);
        return Math.max(0, Math.min(100, next));
      });

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [config]);

  useEffect(() => {
    if (calm >= 100 && !completedRef.current) {
      completedRef.current = true;
      completionTimeoutRef.current = setTimeout(onComplete, 600);
    }
  }, [calm, onComplete]);

  useEffect(() => {
    return () => {
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') heldDirection.current = -1;
      if (e.key === 'ArrowRight' || e.key === 'd') heldDirection.current = 1;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (
        (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'ArrowRight' || e.key === 'd') &&
        heldDirection.current !== 0
      ) {
        heldDirection.current = 0;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const balanced = Math.abs(tilt) < config.threshold;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-md">
        <ProgressBar value={calm} showLabel label="Ocean calmed" colorFrom="#4dffb8" colorTo="#3df8ff" />
      </div>

      <div className="relative h-72 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-void-900 to-[#0d2b24]">
        {/* Layered animated waves */}
        <motion.div
          className="absolute -left-1/4 bottom-0 h-24 w-[150%] rounded-[100%] bg-neon-green/10"
          animate={{ x: [0, -40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -left-1/4 bottom-4 h-20 w-[150%] rounded-[100%] bg-neon-cyan/10"
          animate={{ x: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Balance indicator: horizon line + raft */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">
          <div className="relative h-1 w-56 rounded-full bg-white/10 sm:w-72">
            <div
              className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors"
              style={{
                backgroundColor: balanced ? '#4dffb8' : '#ff5c7a',
                boxShadow: balanced ? '0 0 16px rgba(77,255,184,0.7)' : '0 0 16px rgba(255,92,122,0.6)',
                transform: `translate(calc(-50% + ${(tilt / config.amplitude) * 110}px), -50%)`,
              }}
            />
            <div
              className="absolute left-1/2 top-1/2 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/20"
              style={{ width: (config.threshold / config.amplitude) * 220 }}
            />
          </div>

          <motion.div
            className="relative h-3 w-40 rounded-full bg-gradient-to-r from-neon-green to-neon-cyan sm:w-56"
            animate={{ rotate: tilt * 1.4 }}
            transition={{ type: 'tween', duration: 0.05 }}
          >
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl">🛶</span>
          </motion.div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onPointerDown={() => (heldDirection.current = -1)}
          onPointerUp={() => (heldDirection.current = 0)}
          onPointerLeave={() => (heldDirection.current === -1 ? (heldDirection.current = 0) : null)}
          className="glass-panel flex h-14 w-20 items-center justify-center rounded-xl text-lg text-neon-cyan active:scale-95"
          aria-label="Lean left"
        >
          ◀
        </button>
        <p className="w-40 text-center text-xs text-slate-500">
          Hold left/right (or arrow keys) to counter the swell and hold your balance.
        </p>
        <button
          onPointerDown={() => (heldDirection.current = 1)}
          onPointerUp={() => (heldDirection.current = 0)}
          onPointerLeave={() => (heldDirection.current === 1 ? (heldDirection.current = 0) : null)}
          className="glass-panel flex h-14 w-20 items-center justify-center rounded-xl text-lg text-neon-cyan active:scale-95"
          aria-label="Lean right"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
