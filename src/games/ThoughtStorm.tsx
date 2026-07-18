import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MiniGameProps } from './types';
import ProgressBar from '../components/ui/ProgressBar';

interface ThoughtNode {
  id: number;
  text: string;
  order: number; // the correct position in the logical chain, 1-indexed
  top: number;
  left: number;
  duration: number;
  delay: number;
}

const SEQUENCES: string[][] = [
  ['A message goes unanswered', 'Maybe it sounded wrong', 'They must be upset with me'],
  [
    'The meeting got moved up',
    'I have not finished preparing',
    'They will notice the gaps',
    'This could affect the whole project',
    'I should have started earlier',
  ],
  [
    'A small mistake in the report',
    'Someone will definitely catch it',
    'They will question the whole analysis',
    'It reflects on everything else I do',
    'This could follow me for a while',
    'Maybe I am not cut out for this',
    'I need to fix it before anyone sees',
  ],
];

function buildNodes(sequenceIndex: number): ThoughtNode[] {
  const texts = SEQUENCES[sequenceIndex] ?? SEQUENCES[0];
  const shuffledOrder = texts.map((_, i) => i + 1).sort(() => Math.random() - 0.5);

  return texts.map((text, i) => ({
    id: i,
    text,
    order: i + 1,
    top: 10 + Math.random() * 65,
    left: 5 + ((shuffledOrder[i] - 1) / texts.length) * 85 + Math.random() * 6,
    duration: 5 + Math.random() * 4,
    delay: Math.random() * 2,
  }));
}

/** Thought Storm — the Overthinking world's signature level. Click drifting thoughts in their logical order. */
export default function ThoughtStorm({ level, onComplete }: MiniGameProps) {
  const [nodes] = useState<ThoughtNode[]>(() => buildNodes(level.index - 1));
  const [nextExpected, setNextExpected] = useState(1);
  const [built, setBuilt] = useState<ThoughtNode[]>([]);
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);

  const total = nodes.length;

  const handleClick = (node: ThoughtNode) => {
    if (built.some((b) => b.id === node.id)) return;

    if (node.order === nextExpected) {
      setBuilt((prev) => [...prev, node]);
      setNextExpected((n) => n + 1);
    } else {
      setMistakes((m) => m + 1);
      setShakeId(node.id);
      window.setTimeout(() => setShakeId(null), 400);
    }
  };

  const complete = built.length === total;

  useEffect(() => {
    if (complete) {
      const t = setTimeout(onComplete, 700);
      return () => clearTimeout(t);
    }
  }, [complete, onComplete]);

  const remainingNodes = useMemo(() => nodes.filter((n) => !built.some((b) => b.id === n.id)), [nodes, built]);

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full max-w-2xl">
        <ProgressBar
          value={(built.length / total) * 100}
          showLabel
          label={`Thoughts ordered: ${built.length}/${total} · missteps: ${mistakes}`}
          colorFrom="#ffb84d"
          colorTo="#ff4dd8"
        />
      </div>

      {/* Floating storm field */}
      <div className="relative h-80 w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-void-900/60 sm:h-96">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,184,77,0.12),transparent_60%)]" />
        {remainingNodes.map((node) => (
          <motion.button
            key={node.id}
            onClick={() => handleClick(node)}
            className="glass-panel absolute max-w-[11rem] rounded-xl px-3 py-2 text-left text-xs text-slate-200 shadow-glass hover:border-neon-amber/60 sm:max-w-[13rem] sm:text-sm"
            style={{ top: `${node.top}%`, left: `${node.left}%` }}
            animate={
              shakeId === node.id
                ? { x: [0, -8, 8, -8, 0] }
                : { y: [0, -10, 0, 10, 0], x: [0, 6, 0, -6, 0] }
            }
            transition={
              shakeId === node.id
                ? { duration: 0.4 }
                : { duration: node.duration, delay: node.delay, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            {node.text}
          </motion.button>
        ))}
      </div>

      {/* Built path */}
      <div className="w-full max-w-3xl">
        <p className="mb-2 text-xs uppercase tracking-widest text-slate-500">Your logical path</p>
        <div className="flex flex-wrap items-center gap-2">
          <AnimatePresence>
            {built.map((node, i) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2"
              >
                <span className="glass-panel rounded-lg border-neon-amber/30 px-3 py-1.5 text-xs text-neon-amber sm:text-sm">
                  {node.text}
                </span>
                {i < built.length - 1 && <span className="text-slate-600">→</span>}
              </motion.div>
            ))}
          </AnimatePresence>
          {built.length === 0 && (
            <p className="text-sm text-slate-600">Click the thought that should come first…</p>
          )}
        </div>
      </div>
    </div>
  );
}
