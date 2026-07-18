import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import { useGame } from '../context/GameContext';
import { getWorld } from '../data/mockData';
import { usePageTitle } from '../hooks/usePageTitle';
import type { MoodLog } from '../types';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const HELPLINES = [
  {
    name: 'iCall India',
    number: '9152987821',
    desc: 'Free confidential psychological counselling (Mon–Sat, 8AM–10PM)',
    accent: '#3df8ff',
    href: 'tel:9152987821',
  },
  {
    name: 'Vandrevala Foundation',
    number: '1860-2662-345',
    desc: '24/7 crisis support & mental health helpline',
    accent: '#a35cff',
    href: 'tel:18602662345',
  },
  {
    name: 'NIMHANS Helpline',
    number: '080-46110007',
    desc: 'National mental health support — Karnataka-based, widely accessible',
    accent: '#ff4dd8',
    href: 'tel:08046110007',
  },
  {
    name: 'iCall Chat',
    number: 'icallhelpline.org',
    desc: 'Online chat-based counselling & self-help resources',
    accent: '#ffb84d',
    href: 'https://icallhelpline.org',
    isLink: true,
  },
];

const WELLNESS_TIPS: { state: string; emoji: string; tip: string; accent: string }[] = [
  {
    state: 'Anxiety',
    emoji: '🌬️',
    tip: 'Try 4-7-8 breathing: inhale 4 seconds, hold 7, exhale 8. Repeat 4 cycles.',
    accent: '#3df8ff',
  },
  {
    state: 'Stress',
    emoji: '🌊',
    tip: 'Progressive muscle relaxation — tense and release each muscle group from feet upward.',
    accent: '#a35cff',
  },
  {
    state: 'Low Mood',
    emoji: '☀️',
    tip: 'Spend 10 minutes outside or near a window. Light exposure directly boosts serotonin.',
    accent: '#ffb84d',
  },
  {
    state: 'Grief',
    emoji: '🕊️',
    tip: 'Allow yourself to feel. Journaling 3 sentences about what you miss can ease emotional weight.',
    accent: '#ff4dd8',
  },
];

const MEDITATION_GUIDES: {
  id: string;
  title: string;
  emoji: string;
  duration: string;
  category: string;
  accent: string;
  steps: string[];
}[] = [
  {
    id: 'box-breathing',
    title: 'Box Breathing',
    emoji: '📦',
    duration: '5 min',
    category: 'Anxiety Relief',
    accent: '#3df8ff',
    steps: [
      'Sit upright, feet flat on the floor.',
      'Breathe IN slowly for 4 counts.',
      'HOLD your breath for 4 counts.',
      'Breathe OUT fully for 4 counts.',
      'HOLD empty for 4 counts.',
      'Repeat 4–6 times, focusing only on the count.',
    ],
  },
  {
    id: 'body-scan',
    title: 'Body Scan',
    emoji: '🧍',
    duration: '10 min',
    category: 'Stress Release',
    accent: '#a35cff',
    steps: [
      'Lie down or sit comfortably. Close your eyes.',
      'Start at your toes — notice any tension without judgement.',
      'Slowly move your attention up: feet → calves → thighs.',
      'Continue through abdomen → chest → shoulders → neck.',
      'End at your face. Release any tension you notice.',
      'Take 3 deep breaths and slowly open your eyes.',
    ],
  },
  {
    id: '5-4-3-2-1',
    title: '5-4-3-2-1 Grounding',
    emoji: '🌿',
    duration: '3 min',
    category: 'Overthinking',
    accent: '#ff4dd8',
    steps: [
      'Name 5 things you can SEE around you right now.',
      'Name 4 things you can TOUCH — feel their texture.',
      'Name 3 things you can HEAR in this moment.',
      'Name 2 things you can SMELL (or like the smell of).',
      'Name 1 thing you can TASTE.',
      'Take a slow breath. You are here, in the present.',
    ],
  },
  {
    id: 'loving-kindness',
    title: 'Loving-Kindness',
    emoji: '💜',
    duration: '8 min',
    category: 'Low Mood',
    accent: '#ffb84d',
    steps: [
      'Sit quietly and close your eyes.',
      'Think of someone you love. Feel warmth toward them.',
      'Silently repeat: "May you be happy. May you be healthy."',
      'Now extend this to a neutral person — a neighbour or colleague.',
      'Finally extend it to yourself: "May I be happy. May I be at peace."',
      'Rest in the feeling for a moment before opening your eyes.',
    ],
  },
  {
    id: 'mindful-walking',
    title: 'Mindful Walking',
    emoji: '🚶',
    duration: '10 min',
    category: 'Depression',
    accent: '#3df8ff',
    steps: [
      'Walk slowly in a quiet space (indoors or outdoors).',
      'Feel each foot lift, move forward, and land.',
      'Notice the rhythm — left, right, left, right.',
      'If your mind wanders, gently return to the sensation of walking.',
      'Notice sounds, temperature, and your surroundings without judgement.',
      'End by standing still for 30 seconds and taking 3 deep breaths.',
    ],
  },
  {
    id: 'progressive-relaxation',
    title: 'Progressive Relaxation',
    emoji: '🌊',
    duration: '12 min',
    category: 'Impatience',
    accent: '#a35cff',
    steps: [
      'Lie down and close your eyes.',
      'Tense your right foot for 5 seconds, then release.',
      'Move up — calves, thighs, abdomen, hands, arms.',
      'Tense each group for 5 seconds, then relax fully.',
      'Notice the contrast between tension and release.',
      'End with 5 slow, deep breaths and stay still for 1 minute.',
    ],
  },
];

const MOOD_EMOJIS: Record<number, string> = { 1: '😔', 2: '😟', 3: '😐', 4: '🙂', 5: '😊' };

// ---------------------------------------------------------------------------
// Mood chart — pure inline SVG, no external library
// ---------------------------------------------------------------------------
function MoodChart({ logs }: { logs: MoodLog[] }) {
  const recent = logs.slice(-30);
  if (recent.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-slate-500">
        No check-ins logged yet. Complete a level to start tracking.
      </div>
    );
  }

  const W = 520;
  const H = 120;
  const PAD = 16;
  const plotW = W - PAD * 2;
  const plotH = H - PAD * 2;

  const xStep = recent.length > 1 ? plotW / (recent.length - 1) : plotW;
  const points = recent.map((log, i) => ({
    x: PAD + (recent.length > 1 ? i * xStep : plotW / 2),
    y: PAD + plotH - ((log.moodValue - 1) / 4) * plotH,
    log,
  }));

  const pathD =
    points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');

  const fillD =
    pathD +
    ` L ${points[points.length - 1].x.toFixed(1)} ${(PAD + plotH).toFixed(1)} L ${PAD} ${(PAD + plotH).toFixed(1)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Mood trend chart">
      <defs>
        <linearGradient id="moodGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3df8ff" />
          <stop offset="100%" stopColor="#a35cff" />
        </linearGradient>
        <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3df8ff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3df8ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Gridlines */}
      {[1, 2, 3, 4, 5].map((v) => {
        const y = PAD + plotH - ((v - 1) / 4) * plotH;
        return (
          <line key={v} x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        );
      })}
      {/* Fill */}
      <path d={fillD} fill="url(#fillGrad)" />
      {/* Line */}
      <path d={pathD} fill="none" stroke="url(#moodGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#3df8ff" stroke="#0d0d14" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Self-care insight generator
// ---------------------------------------------------------------------------
function SelfCareInsight({ logs }: { logs: MoodLog[] }) {
  const navigate = useNavigate();
  const recent5 = logs.slice(-5);
  if (recent5.length === 0) {
    return (
      <GlassCard className="p-5" glowColor="cyan">
        <p className="text-sm text-slate-300">
          Complete your first mood check-in to receive personalised self-care suggestions.
        </p>
        <NeonButton className="mt-3" size="sm" onClick={() => navigate('/map')}>
          Start an Exercise
        </NeonButton>
      </GlassCard>
    );
  }

  const avg = recent5.reduce((s, l) => s + l.moodValue, 0) / recent5.length;

  if (avg <= 2) {
    return (
      <GlassCard
        className="border border-red-400/30 p-5"
        glowColor="pink"
        style={{ background: 'rgba(255,77,77,0.06)' }}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-red-400">We're here for you</p>
        <p className="mt-2 font-display text-base text-white">
          You've been feeling quite low recently.
        </p>
        <p className="mt-1 text-sm text-slate-300">
          Please consider reaching out to a support line — talking to someone can help. You can also try the Breathing Oasis below for immediate calm.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <NeonButton size="sm" onClick={() => navigate('/breathe')}>🫁 Breathing Oasis</NeonButton>
          <a href="tel:9152987821">
            <NeonButton size="sm" variant="secondary">📞 iCall: 9152987821</NeonButton>
          </a>
        </div>
      </GlassCard>
    );
  }

  if (avg <= 3.5) {
    return (
      <GlassCard
        className="border border-amber-400/30 p-5"
        glowColor="amber"
        style={{ background: 'rgba(255,184,77,0.06)' }}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-amber-400">A gentle nudge</p>
        <p className="mt-2 font-display text-base text-white">
          You seem a bit stressed lately.
        </p>
        <p className="mt-1 text-sm text-slate-300">
          Try the Breathing Oasis for 4 cycles or explore the Ocean of Stress track — both are proven to lower cortisol quickly.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <NeonButton size="sm" onClick={() => navigate('/breathe')}>🫁 Breathing Oasis</NeonButton>
          <NeonButton size="sm" variant="secondary" onClick={() => navigate('/levels/stress')}>🌊 Ocean of Stress</NeonButton>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard
      className="border border-emerald-400/30 p-5"
      glowColor="cyan"
      style={{ background: 'rgba(61,248,255,0.04)' }}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">You're doing well 🌱</p>
      <p className="mt-2 font-display text-base text-white">
        Your recent check-ins show steady emotional balance.
      </p>
      <p className="mt-1 text-sm text-slate-300">
        Keep up the consistency — daily micro-sessions of mindfulness compound into lasting resilience.
      </p>
      <NeonButton className="mt-4" size="sm" onClick={() => navigate('/map')}>Continue Exercises</NeonButton>
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// Meditation card — expandable step list
// ---------------------------------------------------------------------------
function MeditationCard({
  guide,
  index,
}: {
  guide: (typeof MEDITATION_GUIDES)[0];
  index: number;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      <GlassCard className="h-full p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{guide.emoji}</span>
            <div>
              <p className="font-display text-base text-white">{guide.title}</p>
              <div className="mt-0.5 flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.2em]"
                  style={{ backgroundColor: `${guide.accent}18`, color: guide.accent }}
                >
                  {guide.category}
                </span>
                <span className="text-[11px] text-slate-500">⏱ {guide.duration}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="shrink-0 rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-400 transition-colors hover:border-white/20 hover:text-white"
          >
            {open ? 'Close' : 'Start'}
          </button>
        </div>

        {/* Expandable steps */}
        {open && (
          <motion.ol
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 flex flex-col gap-2"
          >
            {guide.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: `${guide.accent}20`, color: guide.accent }}
                >
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </motion.ol>
        )}
      </GlassCard>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function Support() {
  usePageTitle('Support Resources');
  const { progress } = useGame();
  const moodHistory: MoodLog[] = progress.moodHistory ?? [];
  const recentLogs = [...moodHistory].reverse().slice(0, 20);

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>

        {/* Page header */}
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.35em] text-neon-cyan/70">Guided Wellness</p>
          <h1 className="font-display text-3xl text-white sm:text-4xl">Support Resources</h1>
          <p className="max-w-2xl text-slate-300">
            Helplines, mindfulness guides, your mood history, and personalised self-care insights — all in one place.
          </p>
        </div>

        {/* ─── Section A: Helplines ───────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="font-display text-xl text-white">🆘 Crisis & Support Lines</h2>
          <p className="mt-1 text-sm text-slate-400">Confidential. Free. Available to you right now.</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HELPLINES.map((h, i) => (
              <motion.a
                key={h.name}
                href={h.href}
                target={h.isLink ? '_blank' : undefined}
                rel={h.isLink ? 'noreferrer' : undefined}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="block"
              >
                <GlassCard className="h-full p-5 transition-all duration-200 hover:scale-[1.02]" glowColor="cyan">
                  <div
                    className="mb-3 inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.3em]"
                    style={{ backgroundColor: `${h.accent}18`, color: h.accent }}
                  >
                    {h.isLink ? 'Online' : 'Helpline'}
                  </div>
                  <p className="font-display text-base text-white">{h.name}</p>
                  <p className="mt-0.5 font-mono text-sm" style={{ color: h.accent }}>{h.number}</p>
                  <p className="mt-2 text-xs text-slate-300">{h.desc}</p>
                </GlassCard>
              </motion.a>
            ))}
          </div>
        </section>

        {/* ─── Section A2: Wellness Tips ──────────────────────────────── */}
        <section className="mt-10">
          <h2 className="font-display text-xl text-white">🧘 Quick Mindfulness Tips</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WELLNESS_TIPS.map((tip, i) => (
              <motion.div
                key={tip.state}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
              >
                <GlassCard className="h-full p-5">
                  <div className="mb-2 text-2xl">{tip.emoji}</div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: tip.accent }}>
                    {tip.state}
                  </p>
                  <p className="mt-1.5 text-sm text-slate-300">{tip.tip}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── Section B: Mood Chart ──────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="font-display text-xl text-white">📈 Mood Trend</h2>
          <p className="mt-1 text-sm text-slate-400">Your last {Math.min(moodHistory.length, 30)} check-ins visualised.</p>
          <GlassCard className="mt-4 p-5" glowColor="cyan">
            <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2">
              <span>Older</span>
              <span>Recent</span>
            </div>
            <MoodChart logs={moodHistory} />
            <div className="mt-2 flex justify-between text-[10px] text-slate-600">
              <span>😔 Low</span>
              <span>😊 Calm</span>
            </div>
          </GlassCard>
        </section>

        {/* ─── Section C: Timeline ───────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="font-display text-xl text-white">🗓 Check-in History</h2>
          <p className="mt-1 text-sm text-slate-400">A log of every mood check-in before your exercises.</p>
          <div className="mt-4">
            {recentLogs.length === 0 ? (
              <GlassCard className="p-6">
                <p className="text-center text-sm text-slate-500">No check-ins yet. Start an exercise to log your first mood entry.</p>
              </GlassCard>
            ) : (
              <div className="flex flex-col gap-3">
                {recentLogs.map((log) => {
                  const world = getWorld(log.worldId);
                  const date = new Date(log.timestamp);
                  const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                  const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <GlassCard className="flex items-center gap-4 p-4">
                        {/* Emoji */}
                        <div className="text-2xl">{MOOD_EMOJIS[log.moodValue] ?? '😐'}</div>
                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-white">{log.moodLabel}</span>
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.2em]"
                              style={{
                                backgroundColor: `${world?.accent ?? '#3df8ff'}18`,
                                color: world?.accent ?? '#3df8ff',
                              }}
                            >
                              {log.intentionLabel}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-400 truncate">
                            {world?.title ?? log.worldId} · {log.levelId}
                          </p>
                        </div>
                        {/* Time */}
                        <div className="text-right shrink-0">
                          <p className="text-xs text-slate-300">{dateStr}</p>
                          <p className="text-[10px] text-slate-500">{timeStr}</p>
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ─── Section D: Self-Care Insights ─────────────────────────── */}
        <section className="mt-10">
          <h2 className="font-display text-xl text-white">💡 Self-Care Insights</h2>
          <p className="mt-1 text-sm text-slate-400">Personalised suggestions based on your recent check-ins.</p>
          <div className="mt-4">
            <SelfCareInsight logs={moodHistory} />
          </div>
        </section>
        {/* ─── Section E: Guided Meditation Exercises ──────────────── */}
        <section className="mt-10">
          <h2 className="font-display text-xl text-white">🧘‍♀️ Guided Meditation Exercises</h2>
          <p className="mt-1 text-sm text-slate-400">
            Step-by-step evidence-based practices — no app, no equipment needed.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MEDITATION_GUIDES.map((guide, i) => (
              <MeditationCard key={guide.id} guide={guide} index={i} />
            ))}
          </div>
        </section>

      </motion.div>
    </Layout>
  );
}
