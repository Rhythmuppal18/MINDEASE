import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import { useGame } from '../context/GameContext';
import { usePageTitle } from '../hooks/usePageTitle';

interface ToggleRowProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

function ToggleRow({ label, description, enabled, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="font-medium text-white">{label}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        onClick={onToggle}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          enabled ? 'bg-neon-cyan/80' : 'bg-white/10'
        }`}
      >
        <motion.span
          className="absolute top-1 h-5 w-5 rounded-full bg-white shadow"
          animate={{ left: enabled ? 26 : 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

export default function Settings() {
  const { progress, toggleSound, toggleMusic, toggleTheme, toggleReducedMotion, resetProgress } = useGame();
  const [confirmingReset, setConfirmingReset] = useState(false);
  usePageTitle('Settings');

  const handleReset = () => {
    if (!confirmingReset) {
      setConfirmingReset(true);
      window.setTimeout(() => setConfirmingReset(false), 4000);
      return;
    }
    resetProgress();
    setConfirmingReset(false);
  };

  return (
    <Layout>
      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Settings • Experience</p>
      <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">Settings</h1>
      <p className="mt-2 text-slate-400">Tune the experience to your liking. Everything saves automatically.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard className="p-6" hoverLift={false}>
          <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-slate-500">Audio</p>
          <div className="divide-y divide-white/5">
            <ToggleRow
              label="Sound Effects"
              description="Chimes, ambient cues, and interaction feedback."
              enabled={progress.settings.soundOn}
              onToggle={toggleSound}
            />
            <ToggleRow
              label="Background Music"
              description="Atmospheric score for each world."
              enabled={progress.settings.musicOn}
              onToggle={toggleMusic}
            />
          </div>
        </GlassCard>

        <GlassCard className="p-6" hoverLift={false}>
          <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-slate-500">Visuals</p>
          <div className="divide-y divide-white/5">
            <ToggleRow
              label="Aurora Theme"
              description="Switch between Obsidian (default) and Aurora color palettes."
              enabled={progress.settings.theme === 'aurora'}
              onToggle={toggleTheme}
            />
            <ToggleRow
              label="Reduced Motion"
              description="Minimizes particle effects and background animation."
              enabled={progress.settings.reducedMotion}
              onToggle={toggleReducedMotion}
            />
          </div>
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-2" hoverLift={false}>
          <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-slate-500">Data</p>
          <p className="text-sm text-slate-400">
            Your progress lives only in this browser's local storage — nothing is sent anywhere.
            Resetting will permanently clear all XP, unlocked worlds, and achievements.
          </p>
          <div className="mt-4">
            <NeonButton variant="danger" onClick={handleReset}>
              {confirmingReset ? 'Click again to confirm reset' : 'Reset All Progress'}
            </NeonButton>
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
}
