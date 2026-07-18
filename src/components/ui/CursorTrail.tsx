import { useEffect, useRef } from 'react';

interface TrailDot {
  x: number;
  y: number;
  id: number;
  el: HTMLDivElement;
}

interface CursorTrailProps {
  color?: string;
}

/**
 * Renders a glowing particle trail that follows the mouse cursor.
 * Particles fade out after a short duration. Uses vanilla DOM for maximum perf.
 */
export default function CursorTrail({ color = '#3df8ff' }: CursorTrailProps) {
  const counter = useRef(0);
  const dots = useRef<TrailDot[]>([]);
  const container = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Create a container fixed above everything
    const div = document.createElement('div');
    div.style.cssText =
      'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;';
    document.body.appendChild(div);
    container.current = div;

    const handleMove = (e: MouseEvent) => {
      const id = ++counter.current;
      const dot = document.createElement('div');
      const size = 6 + Math.random() * 6;
      dot.style.cssText = `
        position:absolute;
        left:${e.clientX - size / 2}px;
        top:${e.clientY - size / 2}px;
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        background:${color};
        box-shadow:0 0 ${size * 2}px ${color};
        opacity:0.85;
        transition:opacity 0.55s ease,transform 0.55s ease;
        pointer-events:none;
      `;
      div.appendChild(dot);
      dots.current.push({ x: e.clientX, y: e.clientY, id, el: dot });

      // Fade & scale out
      requestAnimationFrame(() => {
        dot.style.opacity = '0';
        dot.style.transform = `scale(0.2)`;
      });

      // Remove after animation
      setTimeout(() => {
        if (dot.parentNode) dot.parentNode.removeChild(dot);
        dots.current = dots.current.filter((d) => d.id !== id);
      }, 600);
    };

    window.addEventListener('mousemove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (div.parentNode) div.parentNode.removeChild(div);
      cancelAnimationFrame(rafRef.current);
    };
  }, [color]);

  return null;
}
