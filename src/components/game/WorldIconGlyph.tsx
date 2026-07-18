import React from 'react';
import type { WorldIcon } from '../../types';

interface WorldIconGlyphProps {
  icon: WorldIcon;
  className?: string;
  style?: React.CSSProperties;
}

/** Renders a themed SVG glyph for a given world icon key. Kept dependency-free (no icon library). */
export default function WorldIconGlyph({ icon, className, style }: WorldIconGlyphProps) {
  const common = {
    className,
    style,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (icon) {
    case 'fog':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M4 9h11a3 3 0 100-6 4 4 0 00-7.6 1.5" />
          <path d="M3 13h14" />
          <path d="M6 17h13" />
          <path d="M4 21h9" />
        </svg>
      );
    case 'city':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M4 21V9l5-4 5 4v12" />
          <path d="M14 21V13l4-3 2 1.5V21" />
          <path d="M7 13h1M7 16h1M11 13h1M11 16h1" />
        </svg>
      );
    case 'storm':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M6 10a4 4 0 118-1.5A3.5 3.5 0 0117.5 15H6a3 3 0 01-1-5.8" />
          <path d="M10 18l-1.5 3" />
          <path d="M14 18l-1.5 3" />
        </svg>
      );
    case 'wave':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
          <path d="M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
        </svg>
      );
    case 'time':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M12 5v7l4 3" />
          <circle cx="12" cy="12" r="8" />
          <path d="M4 4l3 3" />
          <path d="M20 4l-3 3" />
        </svg>
      );
    default:
      return null;
  }
}
