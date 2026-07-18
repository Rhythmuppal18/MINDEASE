import { motion } from 'framer-motion';

interface LoadingScreenProps {
  label?: string;
}

/**
 * Full-screen cinematic loading state. Used on initial boot and can be
 * reused anywhere a heavier async transition is simulated.
 */
export default function LoadingScreen({ label = 'Calibrating the Mind…' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-void-950">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <motion.div
        className="relative flex flex-col items-center gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative h-24 w-24">
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-neon-cyan/70"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
          />
          <motion.span
            className="absolute inset-3 rounded-full border-2 border-dashed border-neon-violet/70"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 3.4, ease: 'linear' }}
          />
          <motion.span
            className="absolute inset-8 rounded-full bg-neon-cyan/80 blur-[2px]"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          />
        </div>
        <p className="font-display text-sm uppercase tracking-[0.35em] text-slate-400">{label}</p>
      </motion.div>
    </div>
  );
}
