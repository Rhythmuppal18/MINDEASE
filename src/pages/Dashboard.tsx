import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import ProgressBar from '../components/ui/ProgressBar';
import MindHealthGauge from '../components/ui/MindHealthGauge';
import { useGame, deriveLevelFromXP } from '../context/GameContext';
import { DAILY_CHALLENGES, TOTAL_LEVEL_COUNT, WORLDS, getWorld } from '../data/mockData';
import WorldIconGlyph from '../components/game/WorldIconGlyph';
import { usePageTitle } from '../hooks/usePageTitle';
import type { MoodLog } from '../types';

const MOOD_EMOJIS: Record<number, string> = { 1: '😔', 2: '😟', 3: '😐', 4: '🙂', 5: '😊' };

export default function Dashboard() {
  const navigate = useNavigate();
  const { progress, totalLevelsCompleted, completionPercent, isLevelUnlocked, isLevelCompleted } = useGame();
  const { level, progress: levelProgress, nextCeiling } = deriveLevelFromXP(progress.xp);
  usePageTitle('Dashboard');

  const nextLevel = WORLDS.flatMap((w) => w.levels).find(
    (l) => isLevelUnlocked(l.worldId, l.index) && !isLevelCompleted(l.id),
  );
  const nextWorld = nextLevel ? getWorld(nextLevel.worldId) : undefined;

  /** Weighted mind-health score: 60% completion + 20% level + 20% streak */
  const mindHealthScore = Math.round(
    Math.min(100, completionPercent * 0.6 + Math.min(level / 20, 1) * 20 + Math.min(progress.streak / 30, 1) * 20),
  );

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        {/* Page header */}
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.35em] text-neon-cyan/70">Mental Wellness Companion</p>
          <h1 className="font-display text-3xl text-white sm:text-4xl">Wellness Insights Dashboard</h1>
          <p className="max-w-2xl text-slate-300">
            Your mind health index is {completionPercent}% restored. Each completed exercise builds long-term
            resilience and emotional balance.
          </p>
        </div>

        {/* Mind health gauge + stat cards */}
        <div className="mt-8 flex flex-col items-center gap-8 lg:flex-row lg:items-start">
          {/* Gauge */}
          <GlassCard className="flex flex-col items-center p-6" glowColor="cyan">
            <MindHealthGauge value={mindHealthScore} />
          </GlassCard>
 
          {/* Stat grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2">
              {[
                { label: 'Wellness Tier', value: level, color: '#3df8ff', glow: 'cyan' },
                { label: 'Mindfulness Score', value: progress.xp.toLocaleString(), color: '#a35cff', glow: 'violet' },
                { label: 'Completed Exercises', value: `${totalLevelsCompleted}/${TOTAL_LEVEL_COUNT}`, color: '#ff4dd8', glow: 'pink' },
                { label: 'Check-in Streak', value: `${progress.streak}📅`, color: '#ffb84d', glow: 'amber' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <GlassCard className="p-4 text-center sm:p-5" glowColor={stat.glow as any}>
                    <p
                      className="font-display text-2xl sm:text-3xl"
                      style={{ color: stat.color, textShadow: `0 0 16px ${stat.color}60` }}
                    >
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-slate-300">{stat.label}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Continue journey + level XP card */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <GlassCard className="p-6 lg:col-span-2" glowColor="cyan">
            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-300">Continue Your Journey</p>
            {nextLevel && nextWorld ? (
              <>
                <div className="mt-4 flex items-center gap-4">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${nextWorld.accent}1a`, color: nextWorld.accent }}
                  >
                    <WorldIconGlyph icon={nextWorld.icon} className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-white">{nextLevel.name}</h2>
                    <p className="text-sm text-slate-300">
                      {nextWorld.title} · {nextLevel.tagline}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <NeonButton onClick={() => navigate(`/play/${nextLevel.id}`)}>Resume Level</NeonButton>
                  <NeonButton variant="secondary" onClick={() => navigate(`/levels/${nextLevel.worldId}`)}>
                    View World
                  </NeonButton>
                  <NeonButton variant="ghost" onClick={() => navigate('/breathe')}>
                    🫁 Breathe
                  </NeonButton>
                </div>
              </>
            ) : (
              <div className="mt-4">
                <p className="font-display text-xl text-white">The Mind is Fully Restored</p>
                <p className="mt-2 text-sm text-slate-400">
                  Every realm has been traversed. Return to the map whenever you want to revisit a memory or replay a
                  favorite challenge.
                </p>
                <NeonButton className="mt-4" onClick={() => navigate('/map')}>
                  Explore World Map
                </NeonButton>
              </div>
            )}

            <div className="mt-6">
              <ProgressBar
                value={completionPercent}
                showLabel
                label="Overall restoration"
                colorFrom="#3df8ff"
                colorTo="#ff4dd8"
              />
            </div>
          </GlassCard>

          <GlassCard className="p-6" glowColor="violet">
            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-300">Wellness Tier</p>
            <p className="mt-3 font-display text-4xl text-white">{level}</p>
            <div className="mt-4">
              <ProgressBar value={levelProgress * 100} colorFrom="#a35cff" colorTo="#ff4dd8" />
              <p className="mt-2 text-xs text-slate-300">
                {progress.xp.toLocaleString()} / {nextCeiling.toLocaleString()} Score to Tier {level + 1}
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Daily Challenges */}
        <div className="mt-8">
          <h2 className="font-display text-xl text-white">Daily Challenges</h2>
          <p className="text-sm text-slate-300">Fresh exercises for today. No penalty for skipping.</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {DAILY_CHALLENGES.map((challenge, i) => {
              const world = getWorld(challenge.worldId);
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <GlassCard className="h-full p-5" glowColor="amber">
                    <div className="flex items-center justify-between">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.3em]"
                        style={{ backgroundColor: `${world?.accent}1a`, color: world?.accent }}
                      >
                        {world?.name}
                      </span>
                      <span className="text-xs text-slate-300">{challenge.expiresInHours}h left</span>
                    </div>
                    <h3 className="mt-3 font-display text-base text-white">{challenge.title}</h3>
                    <p className="mt-1 text-sm text-slate-300">{challenge.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-display text-sm text-neon-amber">+{challenge.xpReward} XP</span>
                      <NeonButton
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/levels/${challenge.worldId}`)}
                      >
                        Go →
                      </NeonButton>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent Check-ins widget */}
        {(() => {
          const moodHistory: MoodLog[] = progress.moodHistory ?? [];
          const recent3 = [...moodHistory].reverse().slice(0, 3);
          const hasLowMood = recent3.some((l) => l.moodValue <= 2);
          return (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-white">Recent Check-ins</h2>
                <NeonButton size="sm" variant="ghost" onClick={() => navigate('/support')}>
                  View Full History →
                </NeonButton>
              </div>
              {hasLowMood && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-400/[0.06] px-4 py-3"
                >
                  <span className="text-lg">💛</span>
                  <p className="text-sm text-amber-200">
                    We noticed some low check-ins recently. Visit{' '}
                    <button
                      onClick={() => navigate('/support')}
                      className="font-semibold underline underline-offset-2 hover:text-white"
                    >
                      Support Resources
                    </button>{' '}
                    for helplines and calming exercises.
                  </p>
                </motion.div>
              )}
              {recent3.length === 0 ? (
                <GlassCard className="mt-3 p-5">
                  <p className="text-sm text-slate-400">No check-ins yet. Start an exercise to log your first mood entry.</p>
                </GlassCard>
              ) : (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {recent3.map((log) => {
                    const world = getWorld(log.worldId);
                    const dateStr = new Date(log.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                    return (
                      <GlassCard key={log.id} className="flex items-center gap-3 p-4">
                        <div className="text-2xl">{MOOD_EMOJIS[log.moodValue] ?? '😐'}</div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white">{log.moodLabel}</p>
                          <p className="text-xs text-slate-400 truncate">{world?.title ?? log.worldId}</p>
                        </div>
                        <p className="shrink-0 text-xs text-slate-500">{dateStr}</p>
                      </GlassCard>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </motion.div>
    </Layout>
  );
}
