import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame, deriveLevelFromXP } from '../../context/GameContext';
import clsx from '../../utils/clsx';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Home' },
  { to: '/map', label: 'Therapy Tracks' },
  { to: '/progress', label: 'My Progress' },
  { to: '/support', label: 'Support' },
  { to: '/settings', label: 'Settings' },
];

export default function Navbar() {
  const { progress } = useGame();
  const { level, progress: levelProgress } = deriveLevelFromXP(progress.xp);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-void-950/75 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <span className="relative flex h-3 w-3 items-center justify-center">
            <span className="absolute h-3 w-3 rounded-full bg-neon-cyan shadow-neon-cyan" />
            <span className="absolute h-5 w-5 rounded-full border border-neon-cyan/40" />
          </span>
          <span className="font-display text-lg font-bold tracking-[0.25em] text-white">
            MIND<span className="neon-text-cyan">EASE</span>
          </span>
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                clsx(
                  'rounded-full px-4 py-2 text-sm font-medium tracking-wide transition-all',
                  isActive ? 'bg-white/10 text-neon-cyan shadow-[0_0_20px_rgba(61,248,255,0.12)]' : 'text-slate-400 hover:text-white',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Level {level}</span>
            <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-violet"
                animate={{ width: `${Math.round(levelProgress * 100)}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>
          <div className="glass-panel flex items-center gap-1.5 rounded-full px-3 py-1.5">
            <span className="text-sm">✨</span>
            <span className="font-display text-sm text-neon-cyan">{progress.xp}</span>
          </div>
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }))}
            className="hidden items-center justify-center rounded-lg border border-white/10 bg-white/5 px-2 py-1 font-display text-xs text-slate-400 transition-all hover:border-neon-cyan/40 hover:text-neon-cyan sm:flex"
            title="Keyboard shortcuts"
            aria-label="Show keyboard shortcuts"
          >
            ?
          </button>
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t border-white/10 px-4 py-2 md:hidden" aria-label="Primary mobile">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              clsx(
                'whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                isActive ? 'bg-white/10 text-neon-cyan' : 'text-slate-400',
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
