import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MiniGameProps } from './types';
import ProgressBar from '../components/ui/ProgressBar';

interface Obstacle {
  x: number;
  y: number;
  r: number;
}

interface Shard {
  x: number;
  y: number;
}

interface WindVent {
  x: number;
  y: number;
  w: number;
  h: number;
  forceY: number; // upward (negative) or downward (positive)
}

interface LevelConfig {
  obstacles: Obstacle[];
  shards: Shard[];
  windVents?: WindVent[];
}

const CONFIG_BY_INDEX: LevelConfig[] = [
  // Level 1: Straight, wide path. No hazards. Exit immediately open.
  {
    obstacles: [],
    shards: [],
  },
  // Level 2: Winding canyon path. 3 static worry circles. 2 clarity shards to collect.
  {
    obstacles: [
      { x: 220, y: 120, r: 32 },
      { x: 320, y: 240, r: 38 },
      { x: 440, y: 130, r: 32 },
    ],
    shards: [
      { x: 220, y: 270 },
      { x: 440, y: 270 },
    ],
  },
  // Level 3: Crosswinds. 4 obstacles. 3 clarity shards. 2 wind vents applying vertical force.
  {
    obstacles: [
      { x: 170, y: 110, r: 26 },
      { x: 280, y: 240, r: 32 },
      { x: 380, y: 100, r: 26 },
      { x: 470, y: 230, r: 28 },
    ],
    shards: [
      { x: 170, y: 250 },
      { x: 330, y: 175 },
      { x: 470, y: 80 },
    ],
    windVents: [
      { x: 210, y: 180, w: 50, h: 140, forceY: -65 },  // blows upward
      { x: 320, y: 30, w: 50, h: 140, forceY: 65 },    // blows downward
    ],
  },
];

export default function Drift({ level, onComplete }: MiniGameProps) {
  const config = CONFIG_BY_INDEX[level.index - 1] ?? CONFIG_BY_INDEX[0];

  // Particle Physics States
  const [pos, setPos] = useState({ x: 50, y: 175 });
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const [collected, setCollected] = useState<Set<number>>(new Set());
  const [turbulence, setTurbulence] = useState(0); // 0 to 100
  const [collisionActive, setCollisionActive] = useState(false); // flash red screen on hit

  // Mouse Input Tracking
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isPointerActive, setIsPointerActive] = useState(false);
  const [windRadius, setWindRadius] = useState(0);

  // References for requestAnimationFrame loop
  const particlePos = useRef({ x: 50, y: 175 });
  const particleVel = useRef({ x: 0, y: 0 });
  const isPointerDown = useRef(false);
  const pointerPos = useRef({ x: 0, y: 0 });
  const completedRef = useRef(false);

  // Sync state values with refs for use in the animation frame loop
  useEffect(() => {
    isPointerDown.current = isPointerActive;
    pointerPos.current = mousePos;
  }, [isPointerActive, mousePos]);

  // Handle resets
  const triggerReset = useCallback(() => {
    setCollisionActive(true);
    setTimeout(() => setCollisionActive(false), 200);

    particlePos.current = { x: 50, y: 175 };
    particleVel.current = { x: 0, y: 0 };
    setPos({ x: 50, y: 175 });
    setTrail([]);
    setCollected(new Set());
    setTurbulence(0);
  }, []);

  // Main game loop (RAF)
  useEffect(() => {
    let lastTime = performance.now();
    let rafId: number;

    const loop = (time: number) => {
      if (completedRef.current) return;

      const dt = Math.min((time - lastTime) / 1000, 0.05); // cap step to prevent clipping
      lastTime = time;

      let vx = particleVel.current.x;
      let vy = particleVel.current.y;
      let px = particlePos.current.x;
      let py = particlePos.current.y;

      // 1. Apply Natural Drag (Friction: reduces velocity smoothly)
      const friction = 2.5;
      vx -= vx * friction * dt;
      vy -= vy * friction * dt;

      // 2. Apply Subtle Ambient Drift (Anxiety / Unpredictability)
      const driftPower = 15;
      vx += (Math.random() - 0.5) * driftPower * dt;
      vy += (Math.random() - 0.5) * driftPower * dt;

      // 3. Apply Cursor Wind Force
      if (isPointerDown.current) {
        const mx = pointerPos.current.x;
        const my = pointerPos.current.y;
        const dx = px - mx;
        const dy = py - my;
        const dist = Math.hypot(dx, dy);
        const windRange = 160;

        if (dist > 5 && dist < windRange) {
          // Force falls off as distance increases (stronger when clicked close to particle)
          const baseForce = 220;
          const power = (1 - dist / windRange) * baseForce;
          vx += (dx / dist) * power * dt;
          vy += (dy / dist) * power * dt;
        }
      }

      // 4. Apply Environmental Wind Vents (Level 3)
      if (config.windVents) {
        for (const vent of config.windVents) {
          if (
            px >= vent.x &&
            px <= vent.x + vent.w &&
            py >= vent.y &&
            py <= vent.y + vent.h
          ) {
            vy += vent.forceY * dt;
          }
        }
      }

      // 5. Update Turbulence Meter & Shake controls
      setTurbulence((prev) => {
        const next = isPointerDown.current
          ? Math.min(100, prev + dt * 45)  // rises while held
          : Math.max(0, prev - dt * 35);   // falls when released
        
        // Shake factor increases with turbulence level
        if (next > 40) {
          const shakeFactor = (next - 40) * 1.8;
          vx += (Math.random() - 0.5) * shakeFactor * dt;
          vy += (Math.random() - 0.5) * shakeFactor * dt;
        }
        return next;
      });

      // 6. Update Position
      px += vx * dt;
      py += vy * dt;

      // 7. Check Boundaries (Walls)
      // Viewport bounds: width 600, height 350. Margin 15 for top/bottom, 10 for sides.
      const borderMarginY = 25;
      if (px < 15 || px > 585 || py < borderMarginY || py > 350 - borderMarginY) {
        triggerReset();
        rafId = requestAnimationFrame(loop);
        return;
      }

      // 8. Check Obstacle Hits
      let hit = false;
      for (const obs of config.obstacles) {
        const d = Math.hypot(px - obs.x, py - obs.y);
        if (d < obs.r + 8) { // 8 is particle radius
          hit = true;
          break;
        }
      }
      if (hit) {
        triggerReset();
        rafId = requestAnimationFrame(loop);
        return;
      }

      // 9. Check Shard Collection
      setCollected((prevCollected) => {
        const nextCollected = new Set(prevCollected);
        let changed = false;

        config.shards.forEach((shard, idx) => {
          if (!nextCollected.has(idx)) {
            const d = Math.hypot(px - shard.x, py - shard.y);
            if (d < 18) {
              nextCollected.add(idx);
              changed = true;
            }
          }
        });

        return changed ? nextCollected : prevCollected;
      });

      // 10. Check Exit Portal Reach
      const distToExit = Math.hypot(px - 550, py - 175);
      const shardsNeeded = config.shards.length;
      const allShardsCollected = collected.size === shardsNeeded;

      if (distToExit < 24 && allShardsCollected) {
        completedRef.current = true;
        setPos({ x: 550, y: 175 });
        setTimeout(onComplete, 800);
        return; // end loop
      }

      // Save physics back to refs
      particleVel.current = { x: vx, y: vy };
      particlePos.current = { x: px, y: py };

      // Update render positions
      setPos({ x: px, y: py });
      setTrail((prev) => [{ x: px, y: py }, ...prev].slice(0, 10));

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [config, onComplete, triggerReset, collected]);

  // Handle mouse/touch mappings inside SVG
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateMousePosition(e);
    setIsPointerActive(true);
    setWindRadius(20);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    updateMousePosition(e);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
    setIsPointerActive(false);
  };

  const updateMousePosition = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 600;
    const y = ((e.clientY - rect.top) / rect.height) * 350;
    setMousePos({ x, y });
  };

  // Pulsing ring animation for wind cursor
  useEffect(() => {
    if (!isPointerActive) return;
    const interval = setInterval(() => {
      setWindRadius((r) => (r >= 100 ? 20 : r + 4));
    }, 30);
    return () => clearInterval(interval);
  }, [isPointerActive]);

  const shardsNeeded = config.shards.length;
  const isPortalUnlocked = collected.size === shardsNeeded;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl px-4">
      {/* HUD Bar */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Shard counter */}
        {shardsNeeded > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Clarity Shards:</span>
            <span className="font-display font-bold text-neon-cyan">
              {collected.size} / {shardsNeeded}
            </span>
          </div>
        ) : (
          <div className="text-xs text-neon-cyan font-display uppercase tracking-widest">Canyon Path Clear</div>
        )}

        {/* Turbulence Meter */}
        <div className="w-48 flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold whitespace-nowrap">Turbulence:</span>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative">
            <div
              className={`h-full transition-all duration-75 rounded-full ${
                turbulence > 40 ? 'bg-gradient-to-r from-neon-pink to-red-500 animate-pulse' : 'bg-neon-cyan'
              }`}
              style={{ width: `${turbulence}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Physics Area */}
      <div className="relative w-full aspect-[600/350] rounded-2xl border border-white/10 bg-void-950 overflow-hidden shadow-2xl">
        {/* Flash red screen overlay on collision */}
        <AnimatePresence>
          {collisionActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-red-500 pointer-events-none z-30"
            />
          )}
        </AnimatePresence>

        {/* SVG Renderer */}
        <svg
          className="w-full h-full cursor-crosshair"
          viewBox="0 0 600 350"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ touchAction: 'none' }}
        >
          <defs>
            {/* Glowing filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Boundaries: Border Walls */}
          <line x1={0} y1={25} x2={600} y2={25} stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
          <line x1={0} y1={325} x2={600} y2={325} stroke="rgba(255,255,255,0.08)" strokeWidth={2} />

          {/* Level 3: Wind Vents Background rendering */}
          {config.windVents?.map((vent, idx) => (
            <g key={idx} opacity={0.12}>
              <rect
                x={vent.x}
                y={vent.y}
                width={vent.w}
                height={vent.h}
                fill="url(#vent-pattern)"
                stroke="#3df8ff"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              {/* Animating arrows indicating wind direction */}
              <path
                d={
                  vent.forceY < 0
                    ? `M ${vent.x + vent.w / 2} ${vent.y + vent.h - 20} L ${vent.x + vent.w / 2} ${vent.y + 20} M ${
                        vent.x + vent.w / 2 - 8
                      } ${vent.y + 28} L ${vent.x + vent.w / 2} ${vent.y + 20} L ${vent.x + vent.w / 2 + 8} ${vent.y + 28}`
                    : `M ${vent.x + vent.w / 2} ${vent.y + 20} L ${vent.x + vent.w / 2} ${vent.y + vent.h - 20} M ${
                        vent.x + vent.w / 2 - 8
                      } ${vent.y + vent.h - 28} L ${vent.x + vent.w / 2} ${vent.y + vent.h - 20} L ${
                        vent.x + vent.w / 2 + 8
                      } ${vent.y + vent.h - 28}`
                }
                stroke="#3df8ff"
                strokeWidth={2}
                fill="none"
              />
            </g>
          ))}

          {/* Obstacles (Worry Circles) */}
          {config.obstacles.map((obs, idx) => (
            <g key={idx}>
              {/* Outer boundary halo */}
              <circle
                cx={obs.x}
                cy={obs.y}
                r={obs.r}
                fill="rgba(255, 92, 122, 0.05)"
                stroke="#ff5c7a"
                strokeWidth={1.5}
                strokeDasharray="6,4"
                opacity={0.7}
              />
              {/* Core warning circle */}
              <circle cx={obs.x} cy={obs.y} r={8} fill="#ff5c7a" filter="url(#glow)" />
              {/* Central text node identifier */}
              <text
                x={obs.x}
                y={obs.y + 25}
                textAnchor="middle"
                className="fill-slate-500 font-display text-[9px] uppercase tracking-wider font-semibold pointer-events-none"
              >
                worry
              </text>
            </g>
          ))}

          {/* Shards (Collectibles) */}
          {config.shards.map((shard, idx) => {
            const isCollected = collected.has(idx);
            return (
              <g key={idx} opacity={isCollected ? 0.15 : 1} className="transition-opacity duration-300">
                {/* Outer spin rings */}
                {!isCollected && (
                  <circle
                    cx={shard.x}
                    cy={shard.y}
                    r={14}
                    fill="none"
                    stroke="#ffb84d"
                    strokeWidth={1}
                    strokeDasharray="4,2"
                    className="animate-spin"
                    style={{ transformOrigin: `${shard.x}px ${shard.y}px` }}
                  />
                )}
                {/* Central Star Diamond shape */}
                <polygon
                  points={`${shard.x},${shard.y - 8} ${shard.x + 6},${shard.y} ${shard.x},${shard.y + 8} ${
                    shard.x - 6
                  },${shard.y}`}
                  fill="#ffb84d"
                  filter="url(#glow-gold)"
                />
              </g>
            );
          })}

          {/* Start Point Zone indicator */}
          <circle cx={50} cy={175} r={28} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="3,3" />
          <text
            x={50}
            y={215}
            textAnchor="middle"
            className="fill-slate-500 font-display text-[9px] uppercase tracking-widest font-medium pointer-events-none"
          >
            start
          </text>

          {/* Exit Portal vortex */}
          <g>
            {/* Pulsing halo */}
            <circle
              cx={550}
              cy={175}
              r={24}
              fill="none"
              stroke={isPortalUnlocked ? '#3df8ff' : '#ffb84d'}
              strokeWidth={2}
              strokeDasharray="6,4"
              className="animate-spin"
              style={{ transformOrigin: '550px 175px', animationDuration: '4s' }}
            />
            {/* Core vortex */}
            <circle
              cx={550}
              cy={175}
              r={12}
              fill={isPortalUnlocked ? 'rgba(61, 248, 255, 0.15)' : 'rgba(255, 184, 77, 0.05)'}
              stroke={isPortalUnlocked ? '#3df8ff' : '#ffb84d'}
              strokeWidth={1.5}
              filter={isPortalUnlocked ? 'url(#glow)' : ''}
            />
            <text
              x={550}
              y={215}
              textAnchor="middle"
              className="fill-slate-500 font-display text-[9px] uppercase tracking-widest font-medium pointer-events-none"
            >
              exit
            </text>
          </g>

          {/* Particle Trail rendering */}
          {trail.map((t, idx) => (
            <circle
              key={idx}
              cx={t.x}
              cy={t.y}
              r={7 * (1 - idx / 10)}
              fill={turbulence > 40 ? '#ff4dd8' : '#3df8ff'}
              opacity={0.3 * (1 - idx / 10)}
              pointerEvents="none"
            />
          ))}

          {/* Physics Particle: The Focus Spark */}
          <circle
            cx={pos.x}
            cy={pos.y}
            r={8}
            fill={turbulence > 40 ? '#ff4dd8' : '#3df8ff'}
            filter="url(#glow)"
            pointerEvents="none"
          />

          {/* Interactive Wind ripple circles at cursor */}
          {isPointerActive && (
            <g pointerEvents="none">
              <circle
                cx={mousePos.x}
                cy={mousePos.y}
                r={windRadius}
                fill="none"
                stroke={turbulence > 40 ? '#ff4dd8' : '#3df8ff'}
                strokeWidth={1.2}
                opacity={1 - windRadius / 100}
              />
              <circle cx={mousePos.x} cy={mousePos.y} r={4} fill={turbulence > 40 ? '#ff4dd8' : '#3df8ff'} opacity={0.4} />
            </g>
          )}
        </svg>
      </div>

      {/* Controller Guide message */}
      <p className="text-center text-xs text-slate-500 max-w-md leading-relaxed">
        {isPortalUnlocked
          ? 'Clear passage! Guide the spark into the exit portal to complete the level.'
          : 'Hold/drag click to generate wind currents. Push the spark gently—applying force for too long triggers turbulence.'}
      </p>
    </div>
  );
}
