import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { MiniGameProps } from './types';
import ProgressBar from '../components/ui/ProgressBar';

const SYMBOL_SETS = ['🪟', '🏙️', '🕯️', '📻', '🪴', '🖼️', '☕', '📖', '🔑', '🎈'];
const PAIR_COUNT_BY_INDEX = [3, 5, 7];
const MISMATCH_LIMIT_BY_INDEX = [Infinity, Infinity, 6];

interface Tile {
  id: number;
  symbol: string;
  matched: boolean;
}

function shuffledDeck(pairCount: number): Tile[] {
  const symbols = SYMBOL_SETS.slice(0, pairCount);
  const deck = [...symbols, ...symbols].map((symbol, i) => ({ id: i, symbol, matched: false }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/** Grey City — the Depression world's signature level. Restore color by matching rooftop windows. */
export default function GreyCity({ level, onComplete }: MiniGameProps) {
  const pairCount = PAIR_COUNT_BY_INDEX[level.index - 1] ?? 4;
  const mismatchLimit = MISMATCH_LIMIT_BY_INDEX[level.index - 1] ?? Infinity;

  const [deck, setDeck] = useState<Tile[]>(() => shuffledDeck(pairCount));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [mismatches, setMismatches] = useState(0);
  const [locked, setLocked] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);

  const matchedCount = deck.filter((t) => t.matched).length / 2;
  const saturation = Math.round((matchedCount / pairCount) * 100);

  const handleFlip = (id: number) => {
    if (locked || flipped.includes(id) || deck.find((t) => t.id === id)?.matched) return;
    if (flipped.length === 2) return;

    const next = [...flipped, id];
    setFlipped(next);

    if (next.length === 2) {
      setLocked(true);
      const [a, b] = next;
      const tileA = deck.find((t) => t.id === a);
      const tileB = deck.find((t) => t.id === b);

      window.setTimeout(() => {
        if (tileA && tileB && tileA.symbol === tileB.symbol) {
          setDeck((prev) => prev.map((t) => (t.id === a || t.id === b ? { ...t, matched: true } : t)));
        } else {
          setMismatches((m) => m + 1);
        }
        setFlipped([]);
        setLocked(false);
      }, 700);
    }
  };

  // Turbulent difficulty: too many mismatches gently resets the board rather than punishing the player.
  useEffect(() => {
    if (mismatches >= mismatchLimit) {
      setResetNotice(true);
      const t = setTimeout(() => {
        setDeck(shuffledDeck(pairCount));
        setMismatches(0);
        setFlipped([]);
        setResetNotice(false);
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [mismatches, mismatchLimit, pairCount]);

  const allMatched = matchedCount === pairCount;

  useEffect(() => {
    if (allMatched) {
      const t = setTimeout(onComplete, 700);
      return () => clearTimeout(t);
    }
  }, [allMatched, onComplete]);

  const gridCols = useMemo(() => {
    const total = pairCount * 2;
    if (total <= 6) return 3;
    if (total <= 10) return 5;
    return 6;
  }, [pairCount]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-3xl px-4">
      <div className="w-full max-w-lg">
        <ProgressBar
          value={saturation}
          showLabel
          label="City color restored"
          colorFrom="#7d7d8a"
          colorTo="#a35cff"
        />
      </div>

      {/* Skyline backdrop that gains saturation as tiles match */}
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 shadow-lg">
        <div
          className="absolute inset-0 bg-gradient-to-t from-void-900 via-[#3a2e55] to-[#a35cff]/40 transition-all duration-700"
          style={{ filter: `saturate(${saturation}%)` }}
        />
        <div className="relative flex items-end justify-center gap-3 px-6 pt-12 pb-6" style={{ filter: `grayscale(${100 - saturation}%)` }}>
          {[55, 95, 70, 125, 85, 60].map((h, i) => (
            <div
              key={i}
              className="w-10 rounded-t-md bg-white/20 sm:w-12"
              style={{ height: h, filter: `saturate(${saturation}%)` }}
            />
          ))}
        </div>

        {/* Tile grid */}
        <div
          className="relative grid gap-3.5 bg-void-950/70 p-7"
          style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
        >
          {deck.map((tile) => {
            const isFlipped = flipped.includes(tile.id) || tile.matched;
            return (
              <motion.button
                key={tile.id}
                onClick={() => handleFlip(tile.id)}
                whileHover={{ scale: tile.matched ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="aspect-square rounded-xl"
                style={{ perspective: 600 }}
                aria-label={isFlipped ? `Window showing ${tile.symbol}` : 'Hidden window'}
              >
                <motion.div
                  className="relative h-full w-full rounded-xl"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/5 text-slate-600"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    ▢
                  </div>
                  <div
                    className={`absolute inset-0 flex items-center justify-center rounded-xl text-2xl ${
                      tile.matched ? 'bg-neon-violet/20 shadow-neon-violet' : 'bg-white/10'
                    }`}
                    style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                  >
                    {tile.symbol}
                  </div>
                </motion.div>
              </motion.button>
            );
          })}
        </div>

        {resetNotice && (
          <div className="absolute inset-0 flex items-center justify-center bg-void-950/80 backdrop-blur-sm">
            <p className="font-display text-sm uppercase tracking-widest text-neon-violet">
              Too many mismatches — the block resets its memory…
            </p>
          </div>
        )}
      </div>

      <p className="max-w-md text-center text-xs text-slate-500">
        Click two windows to reveal them. Matching pairs stay lit and bring color back to the city.
      </p>
    </div>
  );
}
