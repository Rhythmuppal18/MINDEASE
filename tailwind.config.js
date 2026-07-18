/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: {
          950: '#05060a',
          900: '#0a0d16',
          800: '#10131f',
          700: '#171b2b',
          600: '#20263a',
        },
        neon: {
          cyan: '#3df8ff',
          violet: '#a35cff',
          pink: '#ff4dd8',
          amber: '#ffb84d',
          green: '#4dffb8',
          red: '#ff5c7a',
        },
      },
      fontFamily: {
        display: ['"Orbitron"', 'sans-serif'],
        body: ['"Rajdhani"', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(61,248,255,0.45), 0 0 60px rgba(61,248,255,0.15)',
        'neon-violet': '0 0 20px rgba(163,92,255,0.45), 0 0 60px rgba(163,92,255,0.15)',
        'neon-pink': '0 0 20px rgba(255,77,216,0.45), 0 0 60px rgba(255,77,216,0.15)',
        glass: '0 8px 32px rgba(0,0,0,0.45)',
      },
      backgroundImage: {
        'grid-lines':
          'linear-gradient(rgba(61,248,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(61,248,255,0.06) 1px, transparent 1px)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
        'float-delay': 'float 6s ease-in-out 2s infinite',
        drift: 'drift 18s linear infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-18px)' },
        },
        drift: {
          '0%': { transform: 'translateX(-10%)' },
          '100%': { transform: 'translateX(10%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
      },
    },
  },
  plugins: [],
};
