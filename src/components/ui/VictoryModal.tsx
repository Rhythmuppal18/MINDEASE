import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import ParticleField from './ParticleField';
import NeonButton from './NeonButton';

interface VictoryModalProps {
  isOpen: boolean;
  xpEarned: number;
  levelName: string;
  worldAccent: string;
  quote: string;
  newAchievements?: Array<{ id: string; name: string; icon: string; description: string }>;
  onContinue: () => void;
  onViewProgress: () => void;
}

const VICTORY_QUOTES = [
  'The mind clears one breath at a time.',
  'Every step through the storm is a step toward the sun.',
  'Stillness is not the absence of feeling — it is mastery of it.',
  'You have restored what noise tried to take.',
  'The path was always inside you.',
  'Clarity is not found. It is returned to.',
  'In the quiet after the storm, growth begins.',
  'You faced the maze and found the way through.',
];

export function getRandomVictoryQuote() {
  return VICTORY_QUOTES[Math.floor(Math.random() * VICTORY_QUOTES.length)];
}

/** Full-screen cinematic victory modal with particle burst and XP counter. */
export default function VictoryModal({
  isOpen,
  xpEarned,
  levelName,
  worldAccent,
  quote,
  newAchievements = [],
  onContinue,
  onViewProgress,
}: VictoryModalProps) {
  const [displayedXP, setDisplayedXP] = useState(0);
  const rafRef = useRef<number>(0);

  // Animate XP counter from 0 to xpEarned
  useEffect(() => {
    if (!isOpen) {
      setDisplayedXP(0);
      return;
    }
    let start: number | null = null;
    const duration = 1800;
    const step = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setDisplayedXP(Math.round(ease * xpEarned));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    // Short delay so the modal animates in first
    const t = setTimeout(() => {
      rafRef.current = requestAnimationFrame(step);
    }, 600);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isOpen, xpEarned]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="victory-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-void-950/90 backdrop-blur-md"
        >
          {/* Radial burst particles */}
          <ParticleField count={60} color={worldAccent} className="absolute inset-0" />

          {/* Center glow */}
          <motion.div
            className="pointer-events-none absolute h-96 w-96 rounded-full blur-[120px]"
            style={{ backgroundColor: worldAccent, opacity: 0.18 }}
            animate={{ scale: [0.8, 1.4, 1.1] }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />

          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.1 }}
            className="glass-panel relative mx-4 flex max-w-lg flex-col items-center gap-6 rounded-3xl px-8 py-12 text-center"
          >
            {/* World-colored top border */}
            <div
              className="absolute inset-x-0 top-0 h-1 rounded-t-3xl"
              style={{ background: `linear-gradient(90deg, transparent, ${worldAccent}, transparent)` }}
            />

            {/* Trophy / Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.25 }}
              className="flex h-20 w-20 items-center justify-center rounded-2xl text-5xl"
              style={{ backgroundColor: `${worldAccent}1a`, boxShadow: `0 0 40px ${worldAccent}40` }}
            >
              🌿
            </motion.div>

            <div className="space-y-1">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-[10px] uppercase tracking-[0.4em] text-slate-500"
              >
                Level Restored
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="font-display text-3xl text-white"
              >
                {levelName}
              </motion.h2>
            </div>

            {/* XP Counter */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 }}
              className="flex items-center gap-3 rounded-2xl px-8 py-4"
              style={{ backgroundColor: `${worldAccent}18`, border: `1px solid ${worldAccent}40` }}
            >
              <span className="text-2xl">✨</span>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">XP Earned</p>
                <p
                  className="font-display text-4xl tabular-nums"
                  style={{ color: worldAccent, textShadow: `0 0 20px ${worldAccent}80` }}
                >
                  +{displayedXP}
                </p>
              </div>
            </motion.div>

            {/* New achievements */}
            {newAchievements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="glass-panel w-full rounded-2xl p-4"
              >
                <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-slate-500">
                  🏅 New Achievements Unlocked
                </p>
                <div className="flex flex-col gap-2">
                  {newAchievements.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 text-left">
                      <span className="text-xl">{a.icon}</span>
                      <div>
                        <p className="text-sm text-white">{a.name}</p>
                        <p className="text-xs text-slate-500">{a.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Motivational quote */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="max-w-xs text-sm italic leading-relaxed text-slate-400"
            >
              "{quote}"
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-wrap justify-center gap-3"
            >
              <NeonButton onClick={onContinue}>Continue Journey</NeonButton>
              <NeonButton variant="secondary" onClick={onViewProgress}>
                View Progress
              </NeonButton>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
