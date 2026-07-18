import Layout from '../components/layout/Layout';
import GlassCard from '../components/ui/GlassCard';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import Timeline from '../components/game/Timeline';
import { ACHIEVEMENTS, WORLDS } from '../data/mockData';
import { useGame, deriveLevelFromXP } from '../context/GameContext';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Progress() {
  const { progress, completionPercent, isLevelCompleted } = useGame();
  const { level } = deriveLevelFromXP(progress.xp);
  usePageTitle('Progress');

  return (
    <Layout>
      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Progress • Journey Archive</p>
      <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">Progress & Milestones</h1>
      <p className="mt-2 text-slate-400">A record of every step taken toward restoring the mind.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <GlassCard className="p-5 text-center" glowColor="cyan">
          <p className="font-display text-3xl text-neon-cyan">{level}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-slate-300">Wellness Tier</p>
        </GlassCard>
        <GlassCard className="p-5 text-center" glowColor="pink">
          <p className="font-display text-3xl text-neon-pink">{progress.achievementsUnlocked.length}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-slate-300">Wellness Milestones</p>
        </GlassCard>
      </div>

      <GlassCard className="mt-6 p-6" glowColor="cyan">
        <ProgressBar
          value={completionPercent}
          showLabel
          label="Overall Mind Health Index"
          colorFrom="#3df8ff"
          colorTo="#ff4dd8"
          height={14}
        />
      </GlassCard>

      <div className="mt-10">
        <h2 className="font-display text-xl text-white">Mental Restoration Progress</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {WORLDS.map((world) => {
            const done = world.levels.filter((l) => progress.completedLevels.includes(l.id)).length;
            const glowColorMap: Record<string, 'cyan' | 'violet' | 'pink' | 'green' | 'red'> = {
              anxiety: 'cyan',
              depression: 'violet',
              overthinking: 'pink',
              stress: 'green',
              impatience: 'red',
            };
            return (
              <GlassCard key={world.id} className="p-5" glowColor={glowColorMap[world.id]}>
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm text-white">{world.title}</p>
                  <span className="text-xs text-slate-500">{done}/{world.levels.length}</span>
                </div>
                <div className="mt-3">
                  <ProgressBar
                     value={(done / world.levels.length) * 100}
                     colorFrom={world.colorFrom}
                     colorTo={world.colorTo}
                  />
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl text-white">Wellness Milestones</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {ACHIEVEMENTS.map((achievement) => (
            <Badge
              key={achievement.id}
              icon={achievement.icon}
              name={achievement.name}
              description={achievement.description}
              unlocked={progress.achievementsUnlocked.includes(achievement.id)}
            />
          ))}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl text-white">Journey Timeline</h2>
        <div className="mt-4">
          <Timeline worlds={WORLDS} isLevelCompleted={isLevelCompleted} />
        </div>
      </div>
    </Layout>
  );
}
