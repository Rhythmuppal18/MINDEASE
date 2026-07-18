import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const SHORTCUTS = [
  { key: 'Click/Hold', label: 'Create wind currents (Drift)' },
  { key: '← → / A D', label: 'Counter waves (OceanStress)' },
  { key: 'Click', label: 'Select thought (ThoughtStorm)' },
  { key: 'Click', label: 'Flip tiles (GreyCity)' },
  { key: '?', label: 'Show this overlay' },
  { key: 'Esc', label: 'Close overlay' },
];

/**
 * Press "?" anywhere to show a floating keyboard shortcut reference.
 * Closes on Escape, clicking outside, or pressing "?" again.
 */
export default function KeyboardShortcutOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="shortcut-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-void-950/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Center alignment container */}
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="shortcut-panel"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className="glass-panel pointer-events-auto w-full max-w-sm rounded-2xl p-6 relative"
            >
            {/* Top accent */}
            <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-neon-cyan to-transparent" />

            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">Controls</p>
                <h2 className="mt-0.5 font-display text-lg text-white">Keyboard Shortcuts</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="divide-y divide-white/5">
              {SHORTCUTS.map(({ key, label }) => (
                <div key={key + label} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-slate-300">{label}</span>
                  <kbd className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 font-display text-xs text-neon-cyan">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>

            <p className="mt-4 text-center text-[10px] text-slate-600">
              Press <kbd className="rounded bg-white/5 px-1 py-0.5 font-display text-[10px] text-slate-400">?</kbd> to toggle · <kbd className="rounded bg-white/5 px-1 py-0.5 font-display text-[10px] text-slate-400">Esc</kbd> to close
            </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
