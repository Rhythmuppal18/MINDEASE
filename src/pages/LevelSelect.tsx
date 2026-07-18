import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import LevelCard from '../components/game/LevelCard';
import NeonButton from '../components/ui/NeonButton';
import WorldIconGlyph from '../components/game/WorldIconGlyph';
import { getWorld } from '../data/mockData';
import { useGame } from '../context/GameContext';
import type { EmotionId } from '../types';
import { usePageTitle } from '../hooks/usePageTitle';

const backgroundByWorld: Record<EmotionId, 'fog' | 'grey' | 'storm' | 'ocean' | 'time'> = {
  anxiety: 'fog',
  depression: 'grey',
  overthinking: 'storm',
  stress: 'ocean',
  impatience: 'time',
};

export default function LevelSelect() {
  const { worldId } = useParams<{ worldId: EmotionId }>();
  const navigate = useNavigate();
  const { isWorldUnlocked, isLevelUnlocked, isLevelCompleted } = useGame();

  const world = worldId ? getWorld(worldId) : undefined;
  if (!world) return <Navigate to="/map" replace />;
  usePageTitle(world.title);

  const unlocked = isWorldUnlocked(world.id);

  return (
    <Layout backgroundVariant={backgroundByWorld[world.id]}>
      <button
        onClick={() => navigate('/map')}
        className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white"
      >
        ← Back to World Map
      </button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:p-8"
      >
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${world.accent}1a`, color: world.accent }}
        >
          <WorldIconGlyph icon={world.icon} className="h-8 w-8" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl text-white sm:text-3xl">{world.title}</h1>
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.35em] text-slate-400">
              {world.levels.length} trials
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400 sm:text-base">{world.description}</p>
        </div>
      </motion.div>

      <div className="mt-8">
        {unlocked ? (
          <div className="space-y-4">
            {world.levels.map((level, i) => (
              <LevelCard
                key={level.id}
                level={level}
                unlocked={isLevelUnlocked(world.id, level.index)}
                completed={isLevelCompleted(level.id)}
                accent={world.accent}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel flex flex-col items-center gap-4 rounded-2xl p-12 text-center">
            <span className="text-4xl">🔒</span>
            <h3 className="font-display text-xl text-white">This world is still locked</h3>
            <p className="max-w-md text-sm text-slate-400">
              Complete the previous world to open the path to {world.title}.
            </p>
            <NeonButton variant="secondary" onClick={() => navigate('/map')}>
              Return to World Map
            </NeonButton>
          </div>
        )}
      </div>
    </Layout>
  );
}
