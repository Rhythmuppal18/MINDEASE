import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import NeonButton from '../components/ui/NeonButton';
import ParticleField from '../components/ui/ParticleField';
import VictoryModal, { getRandomVictoryQuote } from '../components/ui/VictoryModal';
import MoodGate from '../components/ui/MoodGate';
import { getLevel, getWorld, ACHIEVEMENTS } from '../data/mockData';
import { useGame } from '../context/GameContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { pushToast } from '../components/ui/ToastContainer';
import type { EmotionId } from '../types';
import Drift from '../games/Drift';
import GreyCity from '../games/GreyCity';
import ThoughtStorm from '../games/ThoughtStorm';
import OceanStress from '../games/OceanStress';
import ChronoTrial from '../games/ChronoTrial';

const backgroundByWorld: Record<EmotionId, 'fog' | 'grey' | 'storm' | 'ocean' | 'time'> = {
  anxiety: 'fog',
  depression: 'grey',
  overthinking: 'storm',
  stress: 'ocean',
  impatience: 'time',
};

const INSTRUCTIONS_BY_WORLD: Record<EmotionId, { title: string; steps: string[] }> = {
  anxiety: {
    title: 'How to Play: The Drift',
    steps: [
      'Steer the glowing spark of focus using WASD, Arrow keys, or by clicking/dragging your cursor.',
      'Gently guide it through the winding canyon paths.',
      'Avoid colliding with the dark canyon walls to stay centered.',
      'Reach the circular exit gateway to complete this mindfulness track.'
    ]
  },
  depression: {
    title: 'How to Play: The Grey City',
    steps: [
      'Click building windows to reveal their hidden color patterns.',
      'Find and select matching pairs of window colors back-to-back.',
      'Matching pairs will return light and color to the city blocks.',
      'Expose all window pairs on the grid to complete the restoration.'
    ]
  },
  overthinking: {
    title: 'How to Play: The Thought Storm',
    steps: [
      'Drifting thought bubbles are cluttering your field of vision.',
      'Drag and drop thoughts into their matching slot categories at the bottom.',
      'Build order by sorting all thoughts successfully.',
      'Clear all nodes to calm the storm and settle your mind.'
    ]
  },
  stress: {
    title: 'How to Play: The Ocean of Stress',
    steps: [
      'Fluctuating tides will constantly pull your circle off-center.',
      'Drag/move your pointer to balance the circle steady.',
      'Sustain your balance inside the green target ring.',
      'Maintain position until the recovery progress bar is fully filled.'
    ]
  },
  impatience: {
    title: 'How to Play: Chrono Trial',
    steps: [
      'Move your focus spark from the start pad using WASD or Arrow keys.',
      'Watch the central warning signal (Green / Red light cycle).',
      'Only move when the signal is green. Stop immediately when it turns red.',
      'Moving during a red light triggers a pacing adjustment and resets your position.'
    ]
  }
};

type Stage = 'mood' | 'intro' | 'playing' | 'victory';

export default function GameLevel() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { completeLevel, isLevelUnlocked, progress, logMood } = useGame();

  const level = levelId ? getLevel(levelId) : undefined;
  const world = level ? getWorld(level.worldId) : undefined;
  const instructions = level ? INSTRUCTIONS_BY_WORLD[level.worldId] : undefined;

  const [stage, setStage] = useState<Stage>('mood');
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [victoryQuote] = useState(getRandomVictoryQuote);
  const [showVictory, setShowVictory] = useState(false);

  usePageTitle(level ? `${level.name} · ${world?.title}` : 'Level');

  if (!level || !world) return <Navigate to="/map" replace />;
  if (!isLevelUnlocked(level.worldId, level.index)) return <Navigate to={`/levels/${level.worldId}`} replace />;

  const handleComplete = () => {
    const unlocked = completeLevel(level.worldId, level.id, level.xpReward);
    setNewAchievements(unlocked);
    setStage('victory');
    setShowVictory(true);
    // Fire XP toast
    pushToast({
      id: `xp-${level.id}-${Date.now()}`,
      message: `+${level.xpReward} XP earned!`,
      subMessage: level.name,
      accent: world?.accent ?? '#3df8ff',
      icon: '✨',
      duration: 4000,
    });
    // Fire achievement toasts
    unlocked.forEach((achId, i) => {
      const ach = ACHIEVEMENTS.find((a) => a.id === achId);
      if (!ach) return;
      setTimeout(() => {
        pushToast({
          id: `ach-${achId}-${Date.now()}`,
          message: ach.name,
          subMessage: ach.description,
          accent: '#a35cff',
          icon: ach.icon,
          duration: 5000,
        });
      }, i * 600 + 800);
    });
  };

  const GameComponent = useMemo(() => {
    switch (level.worldId) {
      case 'anxiety':
        return Drift;
      case 'depression':
        return GreyCity;
      case 'overthinking':
        return ThoughtStorm;
      case 'stress':
        return OceanStress;
      case 'impatience':
        return ChronoTrial;
      default:
        return Drift;
    }
  }, [level.worldId]);

  const achievementObjects = newAchievements
    .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
    .filter(Boolean) as typeof ACHIEVEMENTS;

  return (
    <Layout backgroundVariant={backgroundByWorld[level.worldId]}>
      {/* Victory Modal — rendered as a portal */}
      <VictoryModal
        isOpen={showVictory}
        xpEarned={level.xpReward}
        levelName={level.name}
        worldAccent={world.accent}
        quote={victoryQuote}
        newAchievements={achievementObjects}
        onContinue={() => navigate(`/levels/${level.worldId}`)}
        onViewProgress={() => navigate('/progress')}
      />

      <button
        onClick={() => navigate(`/levels/${level.worldId}`)}
        className="mb-6 flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        ← Back to {world.title}
      </button>

      <AnimatePresence mode="wait">
        {/* STAGE: Mood check-in */}
        {stage === 'mood' && (
          <motion.div
            key="mood"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-12"
          >
            <MoodGate
              worldName={world.title}
              worldAccent={world.accent}
              onSelect={(value, moodLabel, intention) => {
                logMood(level.worldId, level.id, value, moodLabel, intention);
                setStage('intro');
              }}
            />
          </motion.div>
        )}

        {/* STAGE: Level intro */}
        {stage === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative mx-auto flex max-w-xl flex-col items-center gap-6 rounded-3xl py-12 text-center"
          >
            <ParticleField count={16} color={world.accent} />
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-full px-4 py-1 text-[10px] uppercase tracking-[0.35em]"
              style={{ backgroundColor: `${world.accent}1a`, color: world.accent }}
            >
              {world.title} · Level {level.index}
            </motion.span>
            <h1 className="font-display text-4xl text-white">{level.name}</h1>
            <p className="max-w-md text-slate-400">{level.tagline}</p>
            <p className="max-w-md text-sm text-slate-500">{level.mechanicSummary}</p>

            {instructions && (
              <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-5 text-left backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: world.accent }}>
                  {instructions.title}
                </p>
                <ul className="mt-3 space-y-2 text-xs text-slate-300">
                  {instructions.steps.map((step, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <span style={{ color: world.accent }}>•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <NeonButton size="lg" onClick={() => setStage('playing')}>
              Enter the Level
            </NeonButton>
          </motion.div>
        )}

        {/* STAGE: Active gameplay */}
        {stage === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center py-6"
          >
            <GameComponent level={level} onComplete={handleComplete} />
          </motion.div>
        )}

        {/* STAGE: Victory fallback (shown while modal is visible, so layout doesn't shift) */}
        {stage === 'victory' && !showVictory && (
          <motion.div
            key="victory-fallback"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mx-auto flex max-w-xl flex-col items-center gap-6 rounded-3xl py-16 text-center"
          >
            <ParticleField count={26} color="#4dffb8" />
            <h1 className="font-display text-3xl text-white">Level Restored</h1>
            <div className="flex flex-wrap justify-center gap-3">
              <NeonButton onClick={() => navigate(`/levels/${level.worldId}`)}>
                Level Select
              </NeonButton>
              <NeonButton variant="secondary" onClick={() => navigate('/dashboard')}>
                Dashboard
              </NeonButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
