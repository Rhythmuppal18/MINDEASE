import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MoodGateProps {
  onSelect: (mood: number, moodLabel: string, intention: string) => void;
  worldName: string;
  worldAccent: string;
}

const MOODS = [
  { value: 1, emoji: '😔', label: 'Low' },
  { value: 2, emoji: '😟', label: 'Uneasy' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '🙂', label: 'Steady' },
  { value: 5, emoji: '😊', label: 'Calm' },
];

const INTENTION_TAGS = ['Overwhelmed', 'Restless', 'Anxious', 'Steady', 'Peaceful'];

/**
 * A brief mood check-in screen that appears before playing a level.
 * Step 1: pick an emoji. Step 2: pick an intention tag. Auto-proceeds after selection.
 */
export default function MoodGate({ onSelect, worldName, worldAccent }: MoodGateProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMoodSelect = (value: number, label: string) => {
    setSelected(value);
    setSelectedLabel(label);
  };

  const handleIntentionSelect = (intention: string) => {
    if (selected === null || selectedLabel === null) return;
    timerRef.current = setTimeout(() => onSelect(selected, selectedLabel, intention), 600);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const displayMood = hoveredValue ?? selected;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="relative glass-panel mx-auto flex max-w-sm flex-col items-center gap-6 rounded-3xl px-8 py-10 text-center"
    >
      {/* Accent top bar */}
      <div
        className="absolute inset-x-0 top-0 h-0.5 rounded-t-3xl"
        style={{ background: `linear-gradient(90deg, transparent, ${worldAccent}, transparent)` }}
      />

      <div>
        <p
          className="text-[10px] uppercase tracking-[0.4em]"
          style={{ color: worldAccent }}
        >
          {worldName}
        </p>
        <h2 className="mt-2 font-display text-2xl text-white">
          How are you feeling right now?
        </h2>
        <p className="mt-1.5 text-sm text-slate-300">
          Your mood is safe here. No wrong answers.
        </p>
      </div>

      {/* Emoji row */}
      <div className="flex items-center gap-3">
        {MOODS.map((mood) => (
          <motion.button
            key={mood.value}
            onClick={() => handleMoodSelect(mood.value, mood.label)}
            onMouseEnter={() => setHoveredValue(mood.value)}
            onMouseLeave={() => setHoveredValue(null)}
            whileHover={{ scale: 1.25, y: -4 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl transition-all duration-200"
            style={{
              backgroundColor:
                selected === mood.value || hoveredValue === mood.value
                  ? `${worldAccent}20`
                  : 'rgba(255,255,255,0.04)',
              boxShadow:
                selected === mood.value
                  ? `0 0 20px ${worldAccent}50`
                  : 'none',
              border: `1px solid ${
                selected === mood.value ? `${worldAccent}70` : 'rgba(255,255,255,0.08)'
              }`,
            }}
            aria-label={`Mood: ${mood.label}`}
          >
            {mood.emoji}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {displayMood && (
          <motion.p
            key={displayMood}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-slate-300"
          >
            {MOODS.find((m) => m.value === displayMood)?.label}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Intention tag row — appears once mood is picked */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex w-full flex-col items-center gap-3"
          >
            <p className="text-xs text-slate-400">What's on your mind?</p>
            <div className="flex flex-wrap justify-center gap-2">
              {INTENTION_TAGS.map((tag) => (
                <motion.button
                  key={tag}
                  onClick={() => handleIntentionSelect(tag)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200"
                  style={{
                    borderColor: `${worldAccent}50`,
                    color: worldAccent,
                    backgroundColor: `${worldAccent}10`,
                  }}
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => onSelect(3, 'Neutral', 'Skipped')}
        className="text-xs text-slate-600 transition-colors hover:text-slate-400"
      >
        Skip check-in
      </button>
    </motion.div>
  );
}
