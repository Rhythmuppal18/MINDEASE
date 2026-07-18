import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import BreathingRhythm from '../games/BreathingRhythm';
import { usePageTitle } from '../hooks/usePageTitle';

// Provide a stub LevelData compatible object so BreathingRhythm gets the props it needs
const BREATH_LEVEL = {
  id: 'breath-demo',
  worldId: 'stress' as const,
  index: 1,
  name: 'Breathing Rhythm',
  tagline: 'Find the still point inside the storm.',
  difficulty: 'calm' as const,
  xpReward: 0,
  estimatedMinutes: 5,
  mechanicSummary: 'Guided breathing exercise.',
};

/**
 * Standalone breathing wellness page — accessible from the navbar & dashboard.
 * Not a scored level; purely restorative.
 */
export default function BreathPage() {
  const navigate = useNavigate();
  usePageTitle('Breathing Exercise');

  return (
    <Layout backgroundVariant="ocean">
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        ← Back to Dashboard
      </button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <p className="text-[10px] uppercase tracking-[0.4em] text-neon-green">Wellness · The Breath</p>
        <h1 className="font-display text-3xl text-white sm:text-4xl">Breathing Exercise</h1>
        <p className="max-w-2xl text-slate-400">
          A guided breath session. No score, no pressure. Follow the ring and let the mind settle.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-10 flex justify-center"
      >
        <BreathingRhythm
          level={BREATH_LEVEL}
          onComplete={() => navigate('/dashboard')}
        />
      </motion.div>
    </Layout>
  );
}
