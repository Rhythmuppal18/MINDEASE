import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { WORLDS } from '../data/mockData';
import { useGame } from '../context/GameContext';
import WorldIconGlyph from '../components/game/WorldIconGlyph';
import { usePageTitle } from '../hooks/usePageTitle';

/** Connection path between two island positions. */
function PathLine({
  from,
  to,
  unlocked,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  unlocked: boolean;
}) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2 - 60;
  const d = `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;

  return (
    <g>
      {/* Glow trail */}
      <motion.path
        d={d}
        fill="none"
        stroke={unlocked ? 'rgba(61,248,255,0.25)' : 'rgba(255,255,255,0.06)'}
        strokeWidth={unlocked ? 3 : 2}
        strokeDasharray="8 6"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.4 }}
      />
      {/* Animated pulsing dots at midpoint to indicate active path */}
      {unlocked && (
        <motion.circle
          cx={midX}
          cy={midY}
          r={4}
          fill="#3df8ff"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </g>
  );
}

/** Island card rendered as an SVG foreignObject. */
function IslandNode({
  world,
  position,
  unlocked,
  completedCount,
  index,
}: {
  world: (typeof WORLDS)[number];
  position: { x: number; y: number };
  unlocked: boolean;
  completedCount: number;
  index: number;
}) {
  const navigate = useNavigate();
  const total = world.levels.length;
  const completedFrac = completedCount / total;

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18, delay: index * 0.15 }}
    >
      {/* Outer glow ring */}
      {unlocked && (
        <motion.circle
          cx={position.x}
          cy={position.y}
          r={72}
          fill="none"
          stroke={world.accent}
          strokeWidth={1.5}
          opacity={0.35}
          animate={{ r: [72, 80, 72], opacity: [0.35, 0.15, 0.35] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Island base shadow */}
      <ellipse
        cx={position.x}
        cy={position.y + 62}
        rx={54}
        ry={10}
        fill="rgba(0,0,0,0.3)"
        style={{ filter: 'blur(6px)' }}
      />

      {/* Island body — foreignObject for rich HTML content */}
      <foreignObject
        x={position.x - 64}
        y={position.y - 64}
        width={128}
        height={145}
        style={{ overflow: 'visible' }}
      >
        <motion.div
          className="flex flex-col items-center gap-2 cursor-pointer"
          whileHover={unlocked ? { scale: 1.06, y: -6 } : {}}
          animate={{ y: [0, -8, 0] }}
          transition={{
            y: { duration: 4 + index * 0.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.4 },
          }}
          onClick={() => unlocked && navigate(`/levels/${world.id}`)}
        >
          {/* Icon bubble */}
          <div
            className="relative flex h-28 w-28 items-center justify-center rounded-3xl border"
            style={{
              backgroundColor: unlocked ? `${world.accent}18` : 'rgba(255,255,255,0.03)',
              borderColor: unlocked ? `${world.accent}50` : 'rgba(255,255,255,0.08)',
              boxShadow: unlocked ? `0 0 30px ${world.accent}30` : 'none',
              filter: unlocked ? 'none' : 'grayscale(0.9) opacity(0.5)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <WorldIconGlyph
              icon={world.icon}
              className="h-12 w-12"
              style={{ color: unlocked ? world.accent : '#4a5568' }}
            />

            {/* Completion arc (pure CSS) */}
            {unlocked && (
              <svg
                className="absolute inset-0"
                viewBox="0 0 112 112"
                style={{ transform: 'rotate(-90deg)' }}
              >
                <circle cx={56} cy={56} r={52} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3} />
                <motion.circle
                  cx={56}
                  cy={56}
                  r={52}
                  fill="none"
                  stroke={world.accent}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - completedFrac) }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 + index * 0.15 }}
                  opacity={0.7}
                />
              </svg>
            )}

            {/* Lock icon */}
            {!unlocked && (
              <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-void-950/60">
                <span className="text-2xl opacity-50">🔒</span>
              </div>
            )}
          </div>

          {/* World label */}
          <div className="text-center" style={{ width: 128 }}>
            <p
              className="font-display text-xs font-bold uppercase tracking-wider"
              style={{ color: unlocked ? world.accent : '#4a5568' }}
            >
              {world.name}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              {unlocked ? `${completedCount}/${total} cleared` : 'Locked'}
            </p>
          </div>
        </motion.div>
      </foreignObject>
    </motion.g>
  );
}

/** Island positions on the SVG canvas — arranged in a diagonal arc. */
const ISLAND_POSITIONS = [
  { x: 130, y: 200 },
  { x: 360, y: 280 },
  { x: 590, y: 180 },
  { x: 820, y: 290 },
  { x: 1060, y: 200 },
];

export default function WorldMap() {
  usePageTitle('World Map');
  const { isWorldUnlocked, progress } = useGame();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
          World Map • Emotional Realms
        </p>
        <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">
          A Path of Light Through Shadow
        </h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Each realm represents a different emotional landscape. Complete every trial within
          a world to unlock the path forward.
        </p>
      </div>

      {/* SVG world map */}
      <div className="relative w-full overflow-x-auto">
        <div className="min-w-[850px]">
          <svg
            viewBox="0 0 1200 450"
            className="w-full"
            style={{ overflow: 'visible' }}
            aria-label="World map showing five emotional realms"
          >
            {/* Ambient grid */}
            <defs>
              <pattern id="worldgrid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path
                  d="M 48 0 L 0 0 0 48"
                  fill="none"
                  stroke="rgba(61,248,255,0.05)"
                  strokeWidth="1"
                />
              </pattern>
              <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(61,248,255,0.06)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>
            </defs>
            <rect width={1200} height={450} fill="url(#worldgrid)" />
            <rect width={1200} height={450} fill="url(#bgGlow)" />

            {/* Connection paths between islands */}
            {WORLDS.slice(0, -1).map((world, i) => {
              const nextUnlocked = isWorldUnlocked(WORLDS[i + 1].id);
              return (
                <PathLine
                  key={`path-${world.id}`}
                  from={ISLAND_POSITIONS[i]}
                  to={ISLAND_POSITIONS[i + 1]}
                  unlocked={nextUnlocked}
                />
              );
            })}

            {/* Island nodes */}
            {WORLDS.map((world, i) => {
              const completedCount = world.levels.filter((l) =>
                progress.completedLevels.includes(l.id),
              ).length;
              return (
                <IslandNode
                  key={world.id}
                  world={world}
                  position={ISLAND_POSITIONS[i]}
                  unlocked={isWorldUnlocked(world.id)}
                  completedCount={completedCount}
                  index={i}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* World legend */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {WORLDS.map((world) => {
          const unlocked = isWorldUnlocked(world.id);
          const completed = world.levels.filter((l) =>
            progress.completedLevels.includes(l.id),
          ).length;
          return (
            <motion.button
              key={world.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={unlocked ? { y: -4, scale: 1.02 } : {}}
              onClick={() => unlocked && navigate(`/levels/${world.id}`)}
              className="glass-panel rounded-2xl p-4 text-left transition-all"
              style={{
                borderColor: unlocked ? `${world.accent}40` : 'rgba(255,255,255,0.06)',
                opacity: unlocked ? 1 : 0.5,
                cursor: unlocked ? 'pointer' : 'not-allowed',
              }}
              aria-disabled={!unlocked}
            >
              <div
                className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${world.accent}20`, color: world.accent }}
              >
                <WorldIconGlyph icon={world.icon} className="h-4 w-4" />
              </div>
              <p className="font-display text-sm text-white">{world.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {unlocked ? `${completed}/${world.levels.length} exercises` : 'Locked'}
              </p>
            </motion.button>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-center text-xs uppercase tracking-[0.35em] text-slate-600"
      >
        Complete the final exercise in a module to unlock the next track
      </motion.p>
    </Layout>
  );
}
