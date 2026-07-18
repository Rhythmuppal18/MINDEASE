import React from 'react';
import { motion } from 'framer-motion';

/** Wraps every routed page to provide a consistent cinematic enter/exit transition. */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen w-full"
    >
      {children}
    </motion.div>
  );
}
