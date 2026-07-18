import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Toast {
  id: string;
  message: string;
  subMessage?: string;
  accent: string;
  icon: string;
  duration?: number;
}

let toastQueue: ((t: Toast) => void)[] = [];

/** Push a toast notification from anywhere in the app (no context needed). */
export function pushToast(toast: Toast) {
  toastQueue.forEach((fn) => fn(toast));
}

/** Mount once in the app root. Listens for `pushToast` calls. */
export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const handler = (toast: Toast) => {
      setToasts((prev) => [...prev.slice(-3), toast]); // max 4 stacked
      const duration = toast.duration ?? 3500;
      const existing = timers.current.get(toast.id);
      if (existing) clearTimeout(existing);
      timers.current.set(
        toast.id,
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toast.id));
          timers.current.delete(toast.id);
        }, duration),
      );
    };
    toastQueue.push(handler);
    return () => {
      toastQueue = toastQueue.filter((fn) => fn !== handler);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="glass-panel pointer-events-auto flex items-center gap-3 rounded-2xl px-5 py-3"
            style={{
              borderColor: `${toast.accent}60`,
              boxShadow: `0 0 24px ${toast.accent}30, 0 4px 24px rgba(0,0,0,0.4)`,
            }}
          >
            {/* Accent left bar */}
            <div
              className="h-10 w-1 flex-shrink-0 rounded-full"
              style={{ background: toast.accent }}
            />
            <span className="text-2xl">{toast.icon}</span>
            <div>
              <p className="font-display text-sm text-white">{toast.message}</p>
              {toast.subMessage && (
                <p className="text-xs text-slate-400">{toast.subMessage}</p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
