import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import ParticleField from '../components/ui/ParticleField';
import NeonButton from '../components/ui/NeonButton';
import GlassCard from '../components/ui/GlassCard';
import TypewriterText from '../components/ui/TypewriterText';
import { WORLDS } from '../data/mockData';
import WorldIconGlyph from '../components/game/WorldIconGlyph';
import Footer from '../components/layout/Footer';
import { usePageTitle } from '../hooks/usePageTitle';

/** Wrapper that reveals its children once in view. */
function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  usePageTitle('Home');

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground variant="default" />
      <ParticleField count={36} color="#3df8ff" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-24 pt-20 text-center sm:pt-28">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel mb-8 flex items-center gap-2 rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.35em] text-neon-cyan"
        >
          <span className="h-1.5 w-1.5 animate-pulse-slow rounded-full bg-neon-cyan" />
          MINDEASE · Mental Wellness Companion
        </motion.div>

        {/* Hero title */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-balance font-display text-5xl font-black leading-[1.05] text-white sm:text-7xl lg:text-8xl"
        >
          Your Personal
          <span className="mt-3 block text-gradient">
            <TypewriterText text="Wellness Companion" delay={700} speed={60} />
          </span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-6 max-w-3xl text-balance text-lg leading-relaxed text-slate-400 sm:text-xl"
        >
          A calming interactive space for mood check-ins, guided mindfulness exercises, and personalized self-care
          insights — designed around evidence-based cognitive techniques.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <NeonButton size="lg" onClick={() => navigate('/dashboard')}>
            Start Your Session
          </NeonButton>
          <NeonButton size="lg" variant="secondary" onClick={() => navigate('/map')}>
            View Therapy Tracks
          </NeonButton>
        </motion.div>

        {/* World cards — scroll-revealed */}
        <div className="mt-24 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {WORLDS.map((world, i) => (
            <ScrollReveal key={world.id} delay={i * 0.08}>
              <GlassCard
                className="h-full p-6 text-left"
                glowColor="cyan"
                onClick={() => navigate(`/levels/${world.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${world.accent}1a`, color: world.accent }}
                >
                  <WorldIconGlyph icon={world.icon} className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg text-white">{world.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{world.description}</p>
                <motion.div
                  className="mt-4 text-xs font-medium uppercase tracking-wider"
                  style={{ color: world.accent }}
                  whileHover={{ x: 4 }}
                >
                  Start Exercise →
                </motion.div>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>

        <Footer />
      </div>
    </div>
  );
}
