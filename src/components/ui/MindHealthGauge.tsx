import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface MindHealthGaugeProps {
  value: number; // 0-100
  size?: number;
  accent?: string;
}

const RADIUS = 80;
const STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// The gauge arc spans 240 degrees (goes from 150° to 30° — bottom-left to bottom-right)
const ARC_FRACTION = 240 / 360;

/**
 * Circular arc gauge that animates from 0 to `value` on mount.
 * Built with pure SVG — no external library.
 */
export default function MindHealthGauge({ value, size = 220, accent = '#3df8ff' }: MindHealthGaugeProps) {
  const dashRef = useRef<SVGCircleElement>(null);
  const textRef = useRef<SVGTextElement>(null);

  const arcLength = CIRCUMFERENCE * ARC_FRACTION;
  const gapLength = CIRCUMFERENCE * (1 - ARC_FRACTION);
  // dashoffset: 0 = full arc, arcLength = empty arc
  const targetOffset = arcLength - (arcLength * value) / 100;

  useEffect(() => {
    const el = dashRef.current;
    const textEl = textRef.current;
    if (!el || !textEl) return;

    let start: number | null = null;
    const duration = 1600;
    const initialOffset = arcLength;

    const step = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentOffset = initialOffset - ease * (initialOffset - targetOffset);
      el.style.strokeDashoffset = String(currentOffset);
      const currentVal = Math.round(ease * value);
      textEl.textContent = String(currentVal);
      if (progress < 1) requestAnimationFrame(step);
    };

    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, targetOffset, arcLength]);

  const center = size / 2;
  const scale = size / 220;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size * 0.72} viewBox={`0 0 220 160`} aria-label={`Mind health: ${value}%`}>
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a35cff" />
            <stop offset="50%" stopColor={accent} />
            <stop offset="100%" stopColor="#ff4dd8" />
          </linearGradient>
          <filter id="gaugeGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background track */}
        <circle
          cx={110}
          cy={110}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${gapLength}`}
          strokeDashoffset={0}
          transform={`rotate(150, 110, 110)`}
        />

        {/* Foreground animated arc */}
        <circle
          ref={dashRef}
          cx={110}
          cy={110}
          r={RADIUS}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${gapLength}`}
          strokeDashoffset={arcLength}
          transform={`rotate(150, 110, 110)`}
          filter="url(#gaugeGlow)"
        />

        {/* Center value */}
        <text
          ref={textRef}
          x={110}
          y={105}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={38}
          fontFamily="Orbitron, sans-serif"
          fontWeight={800}
          fill="white"
        >
          0
        </text>
        <text
          x={110}
          y={130}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={11}
          fontFamily="Rajdhani, sans-serif"
          fill="rgba(148,163,184,0.8)"
          letterSpacing="3"
        >
          MIND HEALTH
        </text>
      </svg>
      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-600">
        Your restoration score
      </p>
    </div>
  );
}
