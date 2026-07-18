import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MiniGameProps } from './types';
import ProgressBar from '../components/ui/ProgressBar';

interface Laser {
  id: number;
  type: 'h' | 'v'; // horizontal or vertical sweep
  coord: number;   // current x or y position
  min: number;
  max: number;
  speed: number;
  direction: number; // 1 or -1
}

interface Shard {
  x: number;
  y: number;
  collected: boolean;
}

interface LevelConfig {
  lasers: Laser[];
  shards: Shard[];
  checkpoint?: { x: number; y: number };
  pulseTimings: { green: number; red: number };
  sentinelActive: boolean;
}

const CONFIG_BY_INDEX: LevelConfig[] = [
  // Level 1: Time Sync. 2 shards. Gold checkpoint in center.
  {
    lasers: [],
    shards: [
      { x: 180, y: 80, collected: false },
      { x: 420, y: 220, collected: false },
    ],
    checkpoint: { x: 300, y: 150 },
    pulseTimings: { green: 3200, red: 2400 },
    sentinelActive: false,
  },
  // Level 2: Temporal Shift. 3 shards. Gold checkpoint in center.
  {
    lasers: [],
    shards: [
      { x: 150, y: 70, collected: false },
      { x: 300, y: 230, collected: false },
      { x: 450, y: 70, collected: false },
    ],
    checkpoint: { x: 300, y: 150 },
    pulseTimings: { green: 2800, red: 2200 },
    sentinelActive: false,
  },
];

type PulseState = 'green' | 'red';

export default function ChronoTrial({ level, onComplete }: MiniGameProps) {
  const config = CONFIG_BY_INDEX[level.index - 1] ?? CONFIG_BY_INDEX[0];

  // Game States
  const [pos, setPos] = useState({ x: 50, y: 150 });
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const [shards, setShards] = useState<Shard[]>(() => config.shards.map((s) => ({ ...s })));
  const [pulseState, setPulseState] = useState<PulseState>('green');
  const [violations, setViolations] = useState(0);
  const [hasCheckpoint, setHasCheckpoint] = useState(false);
  const [lasers, setLasers] = useState<Laser[]>(() => config.lasers.map((l) => ({ ...l })));
  
  // Sentinel Boss Shockwaves
  const [bossWaves, setBossWaves] = useState<{ radius: number; maxRadius: number; opacity: number }[]>([]);

  // Red Flash overlays on hit or lock breach
  const [redFlashActive, setRedFlashActive] = useState(false);
  const [violationText, setViolationText] = useState('');

  // Mouse / Pointer attraction input
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isPointerActive, setIsPointerActive] = useState(false);

  // References for game loop animation
  const particlePos = useRef({ x: 50, y: 150 });
  const isPointerDown = useRef(false);
  const pointerPos = useRef({ x: 0, y: 0 });
  const completedRef = useRef(false);
  const pulseRef = useRef<PulseState>('green');
  const checkpointReached = useRef(false);
  const isResetting = useRef(false);

  // Keyboard controls key state
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    pulseRef.current = pulseState;
  }, [pulseState]);

  useEffect(() => {
    isPointerDown.current = isPointerActive;
    pointerPos.current = mousePos;
  }, [isPointerActive, mousePos]);

  // Audio Context Synthesizer for beep sounds on pulse alert and lock violations
  const playSynthTone = (freq: number, duration: number, type: OscillatorType = 'sine') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  };

  // Re-sync checkpoints on unmount/level change
  useEffect(() => {
    checkpointReached.current = false;
    setHasCheckpoint(false);
    completedRef.current = false;
    isResetting.current = false;
    setViolations(0);
    setPos({ x: 50, y: 150 });
    particlePos.current = { x: 50, y: 150 };
    setShards(config.shards.map((s) => ({ ...s })));
  }, [level.index, config.shards]);

  // Handle resetting back to spawn or checkpoint
  const triggerReset = useCallback((reason: string) => {
    if (isResetting.current) return;
    isResetting.current = true;
    
    setRedFlashActive(true);
    setViolationText(reason);
    
    setTimeout(() => {
      setRedFlashActive(false);
      setViolationText('');
      isResetting.current = false;
    }, 850);

    // Audio buzz
    playSynthTone(120, 0.4, 'sawtooth');

    const spawn = checkpointReached.current && config.checkpoint 
      ? { ...config.checkpoint }
      : { x: 50, y: 150 };

    particlePos.current = spawn;
    setPos(spawn);
    setTrail([]);
  }, [config.checkpoint]);

  // Pulse Interval Loop: switches state between green -> red
  // Pulse Interval Loop: switches state between green <-> red
  useEffect(() => {
    const delay = pulseState === 'green' ? config.pulseTimings.green : config.pulseTimings.red;
    
    const timerId = setTimeout(() => {
      setPulseState((curr) => {
        if (curr === 'green') {
          playSynthTone(220, 0.35, 'sine');
          return 'red';
        } else {
          playSynthTone(523.25, 0.15, 'sine');
          return 'green';
        }
      });
    }, delay);

    return () => clearTimeout(timerId);
  }, [pulseState, config.pulseTimings]);

  // Listen to arrow and WASD keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main game tick (60 FPS)
  useEffect(() => {
    let lastTime = performance.now();
    let rafId: number;
    let waveTimer = 0;

    const loop = (time: number) => {
      if (completedRef.current) return;

      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      let px = particlePos.current.x;
      let py = particlePos.current.y;

      // 1. Process direct keyboard and pointer velocity directions
      let isMovingInput = false;
      const speed = 195; // responsive direct movement speed in pixels per second

      let dx = 0;
      let dy = 0;

      if (!isResetting.current) {
        // Keyboard inputs
        if (keysPressed.current['arrowup'] || keysPressed.current['w']) {
          dy -= 1;
          isMovingInput = true;
        }
        if (keysPressed.current['arrowdown'] || keysPressed.current['s']) {
          dy += 1;
          isMovingInput = true;
        }
        if (keysPressed.current['arrowleft'] || keysPressed.current['a']) {
          dx -= 1;
          isMovingInput = true;
        }
        if (keysPressed.current['arrowright'] || keysPressed.current['d']) {
          dx += 1;
          isMovingInput = true;
        }

        // Pointer click & drag gravity attraction
        if (isPointerDown.current) {
          const pdx = pointerPos.current.x - px;
          const pdy = pointerPos.current.y - py;
          const dist = Math.hypot(pdx, pdy);
          if (dist > 6) {
            dx = pdx / dist;
            dy = pdy / dist;
            isMovingInput = true;
          }
        }
      }

      // Normalize diagonal vectors so movement speed is consistent
      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        dx /= len;
        dy /= len;
      }

      // Check if player is located in a Temporal Safe Zone (Start Spawn or Checkpoint pad)
      const distToSpawn = Math.hypot(px - 50, py - 150);
      const distToCheckpoint = config.checkpoint ? Math.hypot(px - config.checkpoint.x, py - config.checkpoint.y) : 999;
      const inSafeZone = distToSpawn < 26 || distToCheckpoint < 26;

      // 2. Check Red Light Violation
      if (pulseRef.current === 'red' && isMovingInput && !inSafeZone && !isResetting.current) {
        // Locked! Reset to start/checkpoint
        setViolations((v) => v + 1);
        triggerReset('PACING EXCEEDED - STABILIZE AND FOCUS');
        rafId = requestAnimationFrame(loop);
        return;
      }

      // 3. Update coordinates only if Green Light OR protected inside Safe Zone
      if (pulseRef.current === 'green' || inSafeZone) {
        if (!isResetting.current) {
          px += dx * speed * dt;
          py += dy * speed * dt;
        }
      }

      if (!isResetting.current) {
        // 4. Check Checkpoint crossing
        if (config.checkpoint && !checkpointReached.current) {
          if (distToCheckpoint < 24) {
            checkpointReached.current = true;
            setHasCheckpoint(true);
            playSynthTone(880, 0.25, 'sine');
          }
        }

        // 5. Check Wall boundaries (Arena margins: x=15 to 585, y=25 to 275)
        const wallCeil = 25;
        const wallFloor = 275;
        if (px < 15 || px > 585 || py < wallCeil || py > wallFloor) {
          triggerReset('TRACK BOUNDARY DEVIATION');
          rafId = requestAnimationFrame(loop);
          return;
        }

        // 6. Check Shards collection
        setShards((prevShards) => {
          let changed = false;
          const next = prevShards.map((s) => {
            if (!s.collected) {
              const dist = Math.hypot(px - s.x, py - s.y);
              if (dist < 18) {
                changed = true;
                playSynthTone(784, 0.15, 'sine');
                return { ...s, collected: true };
              }
            }
            return s;
          });
          return changed ? next : prevShards;
        });
      }

      // 7. Sweeper Lasers
      const wallCeil = 25;
      const wallFloor = 275;
      setLasers((prevLasers) => {
        const nextLasers = prevLasers.map((laser) => {
          let nextCoord = laser.coord + laser.speed * laser.direction * dt;
          let nextDirection = laser.direction;
          
          if (nextCoord >= laser.max) {
            nextCoord = laser.max;
            nextDirection = -1;
          } else if (nextCoord <= laser.min) {
            nextCoord = laser.min;
            nextDirection = 1;
          }

          return { ...laser, coord: nextCoord, direction: nextDirection };
        });

        // Laser collision checking (ignored during resets)
        if (!isResetting.current) {
          let hitLaser = false;
          for (const laser of nextLasers) {
            if (laser.type === 'h') {
              if (Math.abs(py - laser.coord) < 7 && px > 60 && px < 540) {
                hitLaser = true;
                break;
              }
            } else {
              if (Math.abs(px - laser.coord) < 7 && py > wallCeil && py < wallFloor) {
                hitLaser = true;
                break;
              }
            }
          }

          if (hitLaser) {
            triggerReset('LASER BURNT FIELD');
          }
        }

        return nextLasers;
      });

      // 8. Sentinel Expanding Shockwaves (Level 3 Sentinel Boss)
      if (config.sentinelActive) {
        waveTimer += dt;
        if (waveTimer >= 1.8) {
          waveTimer = 0;
          setBossWaves((prev) => [...prev, { radius: 10, maxRadius: 280, opacity: 0.8 }]);
          playSynthTone(200, 0.25, 'triangle');
        }

        setBossWaves((prevWaves) => {
          const nextWaves = prevWaves
            .map((w) => {
              const speed = 135;
              const radius = w.radius + speed * dt;
              const opacity = 1 - radius / w.maxRadius;
              return { ...w, radius, opacity };
            })
            .filter((w) => w.opacity > 0);

          // Wave collision check
          if (!isResetting.current) {
            let hitWave = false;
            for (const wave of nextWaves) {
              const distToSentinel = Math.hypot(px - 550, py - 150);
              if (Math.abs(distToSentinel - wave.radius) < 6) {
                hitWave = true;
                break;
              }
            }

            if (hitWave) {
              triggerReset('SENTINEL ENERGY WAVE SHOCK');
            }
          }

          return nextWaves;
        });
      }

      // 9. Exit gate
      const distToExit = Math.hypot(px - 550, py - 150);
      const allCollected = shards.every((s) => s.collected);

      if (distToExit < 24 && allCollected && !isResetting.current) {
        completedRef.current = true;
        setPos({ x: 550, y: 150 });
        playSynthTone(1046.5, 0.4, 'sine'); // high chord
        setTimeout(onComplete, 900);
        return;
      }

      // Sync refs
      particlePos.current = { x: px, y: py };

      setPos({ x: px, y: py });
      setTrail((prev) => [{ x: px, y: py }, ...prev].slice(0, 10));

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [config, onComplete, triggerReset, shards]);

  // Pointer event tracking
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateMousePosition(e);
    setIsPointerActive(true);
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
    const y = ((e.clientY - rect.top) / rect.height) * 300;
    setMousePos({ x, y });
  };

  const shardsNeeded = config.shards.length;
  const isPortalUnlocked = shards.every((s) => s.collected);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl px-4">
      {/* HUD Bar */}
      <div className="w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {shardsNeeded > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Focus Targets:</span>
              <span className="font-display font-bold text-neon-cyan">
                {shards.filter((s) => s.collected).length} / {shardsNeeded}
              </span>
            </div>
          )}

          {config.checkpoint && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Checkpoint:</span>
              <span className={`font-display font-bold text-xs uppercase tracking-wider ${hasCheckpoint ? 'text-neon-green' : 'text-slate-600'}`}>
                {hasCheckpoint ? 'Synced' : 'Dormant'}
              </span>
            </div>
          )}
        </div>

        {/* Pace Adjustments */}
        <div className="flex items-center gap-2 text-right">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Pace Adjustments:</span>
          <span className="font-display font-extrabold text-neon-pink">
            {violations}
          </span>
        </div>
      </div>

      {/* Arena Grid layout */}
      <div className="relative w-full aspect-[600/300] rounded-2xl border border-white/10 bg-void-950 overflow-hidden shadow-2xl max-h-[50vh]">
        {/* Red Flash on reset */}
        <AnimatePresence>
          {redFlashActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-red-600 pointer-events-none z-30 flex items-center justify-center"
            >
              <p className="font-display text-xs uppercase tracking-[0.25em] text-white font-extrabold select-none bg-black/60 px-4 py-2 rounded-lg border border-red-500/40">
                {violationText}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Simple Green/Red Light Banner */}
        <div className="absolute inset-x-0 top-0 h-9 z-20 pointer-events-none flex items-center justify-between px-6 bg-void-950/80 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                pulseState === 'green'
                  ? 'bg-neon-green animate-pulse'
                  : 'bg-neon-pink'
              }`}
            />
            <p className="font-display text-[10px] uppercase tracking-widest font-extrabold text-slate-300">
              {pulseState === 'green' ? 'GREEN LIGHT' : 'RED LIGHT'}
            </p>
          </div>
          <p
            className={`font-display text-[9px] uppercase tracking-[0.2em] font-extrabold ${
              pulseState === 'green' ? 'text-neon-green' : 'text-neon-pink'
            }`}
          >
            {pulseState === 'green' ? 'GO - MOVE FREELY' : 'STOP - FREEZE'}
          </p>
        </div>

        {/* SVG Viewport */}
        <svg
          className="w-full h-full cursor-crosshair"
          viewBox="0 0 600 300"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ touchAction: 'none' }}
        >
          <defs>
            <filter id="glow-pulse" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <filter id="laser-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Clock background */}
          <g opacity={0.06}>
            <circle cx={300} cy={150} r={110} fill="none" stroke="currentColor" className="text-white" strokeWidth={1} />
            <circle cx={300} cy={150} r={105} fill="none" stroke="currentColor" className="text-white" strokeWidth={1} strokeDasharray="3,6" />
            <motion.path
              d="M 300 95 L 300 205 M 245 150 L 355 150"
              stroke="currentColor"
              className="text-white"
              strokeWidth={2}
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '300px 150px' }}
            />
          </g>

          <line x1={0} y1={25} x2={600} y2={25} stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
          <line x1={0} y1={275} x2={600} y2={275} stroke="rgba(255,255,255,0.08)" strokeWidth={2} />

          {/* Checkpoint Pad */}
          {config.checkpoint && (
            <g opacity={0.8}>
              <circle
                cx={config.checkpoint.x}
                cy={config.checkpoint.y}
                r={hasCheckpoint ? 20 : 16}
                fill="none"
                stroke={hasCheckpoint ? '#4dffb8' : '#ffb84d'}
                strokeWidth={1.5}
                strokeDasharray="4,2"
                className="animate-spin"
                style={{ transformOrigin: `${config.checkpoint.x}px ${config.checkpoint.y}px`, animationDuration: '6s' }}
              />
              <circle
                cx={config.checkpoint.x}
                cy={config.checkpoint.y}
                r={6}
                fill={hasCheckpoint ? 'rgba(77, 255, 184, 0.2)' : 'rgba(255, 184, 77, 0.1)'}
                stroke={hasCheckpoint ? '#4dffb8' : '#ffb84d'}
                strokeWidth={1}
              />
            </g>
          )}

          {/* Sweeper Lasers */}
          {lasers.map((laser) => (
            <g key={laser.id} opacity={0.8}>
              {laser.type === 'h' ? (
                <line
                  x1={60}
                  y1={laser.coord}
                  x2={540}
                  y2={laser.coord}
                  stroke="#ff5c7a"
                  strokeWidth={2}
                  filter="url(#laser-glow)"
                />
              ) : (
                <line
                  x1={laser.coord}
                  y1={25}
                  x2={laser.coord}
                  y2={275}
                  stroke="#ff5c7a"
                  strokeWidth={2}
                  filter="url(#laser-glow)"
                />
              )}
            </g>
          ))}

          {/* Boss Shockwaves */}
          {bossWaves.map((wave, idx) => (
            <circle
              key={idx}
              cx={550}
              cy={150}
              r={wave.radius}
              fill="none"
              stroke="#ff4d4d"
              strokeWidth={1.5}
              opacity={wave.opacity}
              filter="url(#laser-glow)"
              pointerEvents="none"
            />
          ))}

          {/* Shards */}
          {shards.map((shard, idx) => (
            <g key={idx} opacity={shard.collected ? 0.12 : 1} className="transition-opacity duration-300">
              {!shard.collected && (
                <circle
                  cx={shard.x}
                  cy={shard.y}
                  r={12}
                  fill="none"
                  stroke="#ffb84d"
                  strokeWidth={1}
                  strokeDasharray="4,2"
                  className="animate-spin"
                  style={{ transformOrigin: `${shard.x}px ${shard.y}px`, animationDuration: '4s' }}
                />
              )}
              <polygon
                points={`${shard.x},${shard.y - 7} ${shard.x + 5},${shard.y} ${shard.x},${shard.y + 7} ${
                  shard.x - 5
                },${shard.y}`}
                fill="#ffb84d"
                filter="url(#glow-pulse)"
              />
            </g>
          ))}

          {/* Start Spawn */}
          <circle cx={50} cy={150} r={22} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="3,3" />

          {/* Exit Gate */}
          <g>
            <circle
              cx={550}
              cy={150}
              r={24}
              fill="none"
              stroke={isPortalUnlocked ? '#3df8ff' : '#ffb84d'}
              strokeWidth={2}
              strokeDasharray="5,3"
              className="animate-spin"
              style={{ transformOrigin: '550px 150px', animationDuration: '5s' }}
            />
            {config.sentinelActive && (
              <circle
                cx={550}
                cy={150}
                r={36}
                fill="none"
                stroke="#ff4d4d"
                strokeWidth={1.5}
                strokeDasharray="6,8"
                opacity={0.3}
                className="animate-pulse"
              />
            )}
            <circle
              cx={550}
              cy={150}
              r={12}
              fill={isPortalUnlocked ? 'rgba(61, 248, 255, 0.15)' : 'rgba(255, 184, 77, 0.05)'}
              stroke={isPortalUnlocked ? '#3df8ff' : '#ffb84d'}
              strokeWidth={1.5}
              filter={isPortalUnlocked ? 'url(#glow-pulse)' : ''}
            />
          </g>

          {/* Particle Trail */}
          {trail.map((t, idx) => (
            <circle
              key={idx}
              cx={t.x}
              cy={t.y}
              r={6 * (1 - idx / 10)}
              fill={pulseState === 'green' ? '#4dffb8' : '#ff4d4d'}
              opacity={0.25 * (1 - idx / 10)}
              pointerEvents="none"
            />
          ))}

          {/* Main Focus Spark */}
          <circle
            cx={pos.x}
            cy={pos.y}
            r={8}
            fill={pulseState === 'green' ? '#4dffb8' : '#ff4d4d'}
            filter="url(#glow-pulse)"
            pointerEvents="none"
            style={{
              transition: redFlashActive ? 'none' : 'fill 0.2s',
            }}
          />

          {/* Pointer Attractor */}
          {isPointerActive && (
            <g pointerEvents="none">
              <circle
                cx={mousePos.x}
                cy={mousePos.y}
                r={16}
                fill="none"
                stroke={pulseState === 'green' ? '#4dffb8' : '#ff4d4d'}
                strokeWidth={1}
                opacity={0.3}
              />
              <circle cx={mousePos.x} cy={mousePos.y} r={3} fill={pulseState === 'green' ? '#4dffb8' : '#ff4d4d'} opacity={0.6} />
            </g>
          )}
        </svg>
      </div>

      {/* Guide text */}
      <p className="text-center text-xs text-slate-500 max-w-lg leading-relaxed font-display">
        {pulseState === 'red' ? (
          <span className="text-neon-pink font-semibold uppercase tracking-wider">RED LIGHT IN EFFECT — Hold your position and breathe.</span>
        ) : isPortalUnlocked ? (
          <span className="text-neon-cyan uppercase tracking-wider">GREEN LIGHT — Focus Targets aligned. Move to Exit.</span>
        ) : (
          <span className="uppercase tracking-wider">GREEN LIGHT — Navigate calmly using WASD / Arrows or Click & Drag.</span>
        )}
      </p>
    </div>
  );
}
