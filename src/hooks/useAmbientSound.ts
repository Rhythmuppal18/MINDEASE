import { useEffect, useRef, useCallback } from 'react';

/**
 * Acoustic Synthesis Ambient Engine — Soft Guitar & Violin Pads
 * - String Pad (Violin/Cello): Filtered sawtooth waves with slow attack (1.8s)
 *   and low cutoff, simulating a warm bowed string ensemble.
 * - Plucks (Nylon Guitar/Harp): Filtered triangle waves with a plucked envelope
 *   to create a soft, woody acoustic string sound.
 */

export type WorldSoundId = 'anxiety' | 'depression' | 'overthinking' | 'stress' | 'impatience' | 'default' | 'off';

interface SoundscapeConfig {
  scale: number[];      // Guitar pluck scale frequencies (G4, A4, B4, etc.)
  padFreq: number;       // Violin/Cello pad root frequency (Hz)
  guitarVolume: number;  // Nylon guitar peak volume
  stringVolume: number;  // Bowed string pad volume
  lfoSpeed: number;      // Bowing/swelling speed
}

// Relaxing pentatonic scales
const SOUNDSCAPES: Record<string, SoundscapeConfig> = {
  anxiety: {
    scale: [293.66, 329.63, 392.00, 440.00, 587.33], // G Major Pentatonic (Reassuring)
    padFreq: 110.00, // A2 (Low warm cello string)
    guitarVolume: 0.022,
    stringVolume: 0.012,
    lfoSpeed: 0.04,
  },
  depression: {
    scale: [261.63, 311.13, 349.23, 392.00, 466.16], // C Minor Pentatonic (Comforting)
    padFreq: 98.00,  // G2 (Deep reassuring double-bass/cello)
    guitarVolume: 0.018,
    stringVolume: 0.01,
    lfoSpeed: 0.03,
  },
  overthinking: {
    scale: [261.63, 293.66, 329.63, 392.00, 440.00], // C Major Pentatonic (Bright clarity)
    padFreq: 130.81, // C3 (Warm cello string)
    guitarVolume: 0.02,
    stringVolume: 0.012,
    lfoSpeed: 0.06,
  },
  stress: {
    scale: [329.63, 392.00, 440.00, 493.88, 587.33], // E minor / G major (Serene release)
    padFreq: 146.83, // D3
    guitarVolume: 0.025,
    stringVolume: 0.015,
    lfoSpeed: 0.04,
  },
  impatience: {
    scale: [293.66, 349.23, 440.00, 523.25, 587.33], // D Minor Pentatonic (Tense but focused / Temporal)
    padFreq: 146.83, // D3 (Tense warm cello root)
    guitarVolume: 0.024,
    stringVolume: 0.013,
    lfoSpeed: 0.05,
  },
  default: {
    scale: [293.66, 329.63, 392.00, 440.00, 493.88, 587.33], // Zen Major Pentatonic
    padFreq: 130.81, // C3 (Soothing default string pad)
    guitarVolume: 0.022,
    stringVolume: 0.014,
    lfoSpeed: 0.05,
  },
};

interface AmbientNodes {
  ctx: AudioContext;
  masterGain: GainNode;
  stringOsc1?: OscillatorNode;
  stringOsc2?: OscillatorNode;
  stringLfo?: OscillatorNode;
  timerId?: any;
  cleanupListeners: () => void;
}

export function useAmbientSound(world: WorldSoundId = 'default', enabled: boolean = true) {
  const nodesRef = useRef<AmbientNodes | null>(null);

  const stop = useCallback(() => {
    if (!nodesRef.current) return;
    const { masterGain, ctx, stringOsc1, stringOsc2, stringLfo, timerId, cleanupListeners } = nodesRef.current;
    cleanupListeners();
    if (timerId) clearTimeout(timerId);

    // Fade out string pad and active notes smoothly over 1.2s to prevent pops
    masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.4);

    const snapshot = nodesRef.current;
    nodesRef.current = null;

    setTimeout(() => {
      try {
        if (stringOsc1) stringOsc1.stop();
        if (stringOsc2) stringOsc2.stop();
        if (stringLfo) stringLfo.stop();
        snapshot.ctx.close();
      } catch (_) {
        /* ignore double-stop errors */
      }
    }, 1500);
  }, []);

  const start = useCallback(
    (worldId: WorldSoundId) => {
      if (worldId === 'off') return;
      stop();

      const cfg = SOUNDSCAPES[worldId] ?? SOUNDSCAPES.default;

      let ctx: AudioContext;
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        ctx = new AudioContextClass();
      } catch {
        return; // Safari / blocked
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);

      // Lowpass filter for the Bowed String Pad (muffles the sawtooth buzz into a warm cello)
      const stringFilter = ctx.createBiquadFilter();
      stringFilter.type = 'lowpass';
      stringFilter.frequency.value = 260; // Deep warm string resonance
      stringFilter.Q.value = 1.0;

      // 1. Bowed String Pad (Violin / Cello ensemble)
      // Sawtooth wave detuned + heavily filtered + slow attack = warm bowed strings
      const stringOsc1 = ctx.createOscillator();
      const stringOsc2 = ctx.createOscillator();
      const stringGain = ctx.createGain();

      stringOsc1.type = 'sawtooth';
      stringOsc1.frequency.value = cfg.padFreq;

      stringOsc2.type = 'sawtooth';
      stringOsc2.frequency.value = cfg.padFreq + 0.45; // slight chorus detune

      stringGain.gain.setValueAtTime(cfg.stringVolume, ctx.currentTime);

      // Slow LFO to swell the string pad (simulating slow bows)
      const stringLfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      stringLfo.type = 'sine';
      stringLfo.frequency.value = cfg.lfoSpeed;
      lfoGain.gain.value = cfg.stringVolume * 0.35;

      stringLfo.connect(lfoGain);
      lfoGain.connect(stringGain.gain);

      stringOsc1.connect(stringGain);
      stringOsc2.connect(stringGain);
      stringGain.connect(stringFilter);
      stringFilter.connect(masterGain);

      stringOsc1.start();
      stringOsc2.start();
      stringLfo.start();

      // 2. Nylon Guitar / Harp Pluck Generator
      // Triangle wave + lowpass filter = warm wood-like plucked string
      const guitarFilter = ctx.createBiquadFilter();
      guitarFilter.type = 'lowpass';
      guitarFilter.frequency.value = 550; // Cut off high sharpness for nylon-string warmth
      guitarFilter.connect(masterGain);

      const playGuitarPluck = () => {
        if (ctx.state === 'closed') return;
        const freq = cfg.scale[Math.floor(Math.random() * cfg.scale.length)];

        const osc = ctx.createOscillator();
        const envelope = ctx.createGain();

        osc.type = 'triangle'; // Woody plucked string character
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Guitar pluck envelope: 0.04s attack (soft pluck), 4.2s decay
        envelope.gain.setValueAtTime(0, ctx.currentTime);
        envelope.gain.linearRampToValueAtTime(cfg.guitarVolume, ctx.currentTime + 0.04);
        envelope.gain.exponentialRampToValueAtTime(0.0005, ctx.currentTime + 4.0);

        osc.connect(envelope);
        envelope.connect(guitarFilter);

        osc.start();

        setTimeout(() => {
          try {
            osc.stop();
            osc.disconnect();
            envelope.disconnect();
          } catch (_) {}
        }, 4500);
      };

      // Loop guitar plucks at relaxed intervals (every 3.2s to 6.8s)
      let timerId: any;
      const guitarLoop = () => {
        if (ctx.state === 'closed') return;
        playGuitarPluck();
        const delay = 3200 + Math.random() * 3600;
        timerId = setTimeout(guitarLoop, delay);
        if (nodesRef.current) {
          nodesRef.current.timerId = timerId;
        }
      };

      guitarLoop();

      masterGain.connect(ctx.destination);
      // Gentle fade in on page entry (1.2 seconds)
      masterGain.gain.setTargetAtTime(1, ctx.currentTime, 0.8);

      // Auto-resume on interaction
      const resume = () => {
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
      };
      window.addEventListener('click', resume);
      window.addEventListener('touchstart', resume);
      window.addEventListener('keydown', resume);

      const cleanupListeners = () => {
        window.removeEventListener('click', resume);
        window.removeEventListener('touchstart', resume);
        window.removeEventListener('keydown', resume);
      };

      ctx.resume().catch(() => {});

      nodesRef.current = {
        ctx,
        masterGain,
        stringOsc1,
        stringOsc2,
        stringLfo,
        timerId,
        cleanupListeners,
      };
    },
    [stop],
  );

  useEffect(() => {
    if (!enabled || world === 'off') {
      stop();
      return;
    }
    const t = setTimeout(() => start(world), 150);
    return () => {
      clearTimeout(t);
      stop();
    };
  }, [world, enabled, start, stop]);
}
