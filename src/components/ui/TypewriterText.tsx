import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
  onDone?: () => void;
}

/**
 * Renders text character by character with a blinking cursor.
 * Respects `prefers-reduced-motion` by skipping the animation.
 */
export default function TypewriterText({
  text,
  delay = 0,
  speed = 50,
  className,
  onDone,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReduced) {
      setDisplayed(text);
      setDone(true);
      onDone?.();
      return;
    }

    const delayTimer = setTimeout(() => {
      setStarted(true);
    }, delay);

    return () => clearTimeout(delayTimer);
  }, [delay, prefersReduced, text, onDone]);

  useEffect(() => {
    if (!started || prefersReduced) return;
    indexRef.current = 0;
    setDisplayed('');

    const interval = setInterval(() => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        clearInterval(interval);
        setDone(true);
        onDone?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [started, text, speed, prefersReduced, onDone]);

  return (
    <span className={className}>
      {displayed}
      <AnimatePresence>
        {!done && (
          <motion.span
            key="cursor"
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
            className="ml-0.5 inline-block h-[1em] w-[2px] bg-current align-middle"
          />
        )}
      </AnimatePresence>
    </span>
  );
}
