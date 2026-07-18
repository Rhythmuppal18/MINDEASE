import type { Achievement, DailyChallenge, EmotionId, WorldData } from '../types';

/**
 * All game content is defined here as static mock data.
 * No backend, no API calls — MindMaze runs entirely client-side.
 */

export const WORLDS: WorldData[] = [
  {
    id: 'anxiety',
    name: 'Drift',
    title: 'The Drift',
    description:
      'A narrow, winding canyon of drifting thoughts where any sudden force creates chaos. Guide a delicate spark of focus using gentle wind currents to reach the calm gateway.',
    colorFrom: '#61f0ff',
    colorTo: '#4f6cff',
    accent: '#61f0ff',
    glow: 'shadow-neon-cyan',
    icon: 'fog',
    requiredWorld: null,
    levels: [
      {
        id: 'anxiety-1',
        worldId: 'anxiety',
        index: 1,
        name: 'First Drift',
        tagline: 'Gently guide your spark of focus using soft winds.',
        difficulty: 'calm',
        xpReward: 120,
        estimatedMinutes: 4,
        mechanicSummary: 'Steer the spark through a wide, straight path to reach the exit gate.',
      },
      {
        id: 'anxiety-2',
        worldId: 'anxiety',
        index: 2,
        name: 'Jagged Canyon',
        tagline: 'Avoid sudden currents. Slow adjustments are key.',
        difficulty: 'steady',
        xpReward: 160,
        estimatedMinutes: 5,
        mechanicSummary: 'Steer the spark through narrow bends and collect two particles of clarity.',
      },
      {
        id: 'anxiety-3',
        worldId: 'anxiety',
        index: 3,
        name: 'The Center Point',
        tagline: 'Calm your inputs to breach the heavy crosswinds.',
        difficulty: 'turbulent',
        xpReward: 220,
        estimatedMinutes: 7,
        mechanicSummary: 'Coordinate your path through active crosswind vents and collect all focus shards.',
      },
    ],
  },
  {
    id: 'depression',
    name: 'Grey City',
    title: 'The Grey City',
    description:
      'A skyline drained of color, frozen mid-thought. Every solved puzzle returns a little more light to the streets below.',
    colorFrom: '#a35cff',
    colorTo: '#4b2e83',
    accent: '#a35cff',
    glow: 'shadow-neon-violet',
    icon: 'city',
    requiredWorld: 'anxiety',
    levels: [
      {
        id: 'depression-1',
        worldId: 'depression',
        index: 1,
        name: 'Faded Rooftops',
        tagline: 'Match the dormant windows to wake the first block.',
        difficulty: 'calm',
        xpReward: 130,
        estimatedMinutes: 5,
        mechanicSummary: 'Match tile pairs across rooftops to restore saturation.',
      },
      {
        id: 'depression-2',
        worldId: 'depression',
        index: 2,
        name: 'Silent Avenue',
        tagline: 'The streetlights remember how to shine, one puzzle at a time.',
        difficulty: 'steady',
        xpReward: 170,
        estimatedMinutes: 6,
        mechanicSummary: 'Solve a larger tile-matching grid to bring color to the avenue.',
      },
      {
        id: 'depression-3',
        worldId: 'depression',
        index: 3,
        name: 'Sunrise Threshold',
        tagline: 'One block stands between the city and its color.',
        difficulty: 'turbulent',
        xpReward: 230,
        estimatedMinutes: 8,
        mechanicSummary: 'Full grid restoration under a limited number of mismatches.',
      },
    ],
  },
  {
    id: 'overthinking',
    name: 'Thought Storm',
    title: 'The Thought Storm',
    description:
      'A sky crowded with drifting memories, each one talking over the last. Order them into a single, quiet line of reasoning.',
    colorFrom: '#ffb84d',
    colorTo: '#8a5a1e',
    accent: '#ffb84d',
    glow: 'shadow-neon-cyan',
    icon: 'storm',
    requiredWorld: 'depression',
    levels: [
      {
        id: 'overthinking-1',
        worldId: 'overthinking',
        index: 1,
        name: 'Scattered Sky',
        tagline: 'Catch the loudest thoughts first.',
        difficulty: 'calm',
        xpReward: 140,
        estimatedMinutes: 5,
        mechanicSummary: 'Sort drifting thought nodes into three category zones.',
      },
      {
        id: 'overthinking-2',
        worldId: 'overthinking',
        index: 2,
        name: 'Tangled Threads',
        tagline: 'Connect each thought to the one that follows.',
        difficulty: 'steady',
        xpReward: 180,
        estimatedMinutes: 6,
        mechanicSummary: 'Link thought nodes in the correct sequence to build a logical path.',
      },
      {
        id: 'overthinking-3',
        worldId: 'overthinking',
        index: 3,
        name: 'Eye of the Storm',
        tagline: 'Silence everything except the one thought that matters.',
        difficulty: 'turbulent',
        xpReward: 240,
        estimatedMinutes: 8,
        mechanicSummary: 'Build a complete reasoning chain before the storm scatters it again.',
      },
    ],
  },
  {
    id: 'stress',
    name: 'Ocean of Stress',
    title: 'The Ocean of Stress',
    description:
      'Waves stacked on waves, a horizon that will not sit still. Find the balance point and the storm forgets how to rage.',
    colorFrom: '#4dffb8',
    colorTo: '#1c8a63',
    accent: '#4dffb8',
    glow: 'shadow-neon-pink',
    icon: 'wave',
    requiredWorld: 'overthinking',
    levels: [
      {
        id: 'stress-1',
        worldId: 'stress',
        index: 1,
        name: 'First Swell',
        tagline: 'Feel the rhythm of the water before it feels you.',
        difficulty: 'calm',
        xpReward: 150,
        estimatedMinutes: 5,
        mechanicSummary: 'Balance the raft against gentle waves using timed corrections.',
      },
      {
        id: 'stress-2',
        worldId: 'stress',
        index: 2,
        name: 'Rising Tide',
        tagline: 'The waves grow bolder. So must your footing.',
        difficulty: 'steady',
        xpReward: 190,
        estimatedMinutes: 7,
        mechanicSummary: 'Balance against increasingly erratic wave patterns.',
      },
      {
        id: 'stress-3',
        worldId: 'stress',
        index: 3,
        name: 'The Calm Point',
        tagline: 'Hold steady long enough and the ocean will listen.',
        difficulty: 'turbulent',
        xpReward: 250,
        estimatedMinutes: 9,
        mechanicSummary: 'Sustain balance through a full storm cycle to calm the ocean.',
      },
    ],
  },
  {
    id: 'impatience',
    name: 'Chrono Trial',
    title: 'The Chrono Trial',
    description:
      'A mystical temple of shifting gears. Cross the temporal arena during the green pulse and freeze during the red pulse. Beware of moving lasers and unpredictable clock timers.',
    colorFrom: '#ff4d4d',
    colorTo: '#b30000',
    accent: '#ff4d4d',
    glow: 'shadow-neon-red',
    icon: 'time',
    requiredWorld: 'stress',
    levels: [
      {
        id: 'impatience-1',
        worldId: 'impatience',
        index: 1,
        name: 'Time Sync',
        tagline: 'Timing is everything when the timelock shifts.',
        difficulty: 'steady',
        xpReward: 200,
        estimatedMinutes: 6,
        mechanicSummary: 'Collect two time shards to unlock the exit while dodging the red light pulses.',
      },
      {
        id: 'impatience-2',
        worldId: 'impatience',
        index: 2,
        name: 'Temporal Shift',
        tagline: 'Keep your stance steady through rapid time cycles.',
        difficulty: 'turbulent',
        xpReward: 260,
        estimatedMinutes: 8,
        mechanicSummary: 'Navigate the arena during green lights and freeze on red to collect all shards and exit.',
      },
    ],
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your very first self-care exercise.',
    icon: '🌱',
  },
  {
    id: 'fog-walker',
    name: 'Anxiety Regulation',
    description: 'Complete the anxiety track exercises.',
    icon: '🍃',
    worldId: 'anxiety',
  },
  {
    id: 'color-bringer',
    name: 'Depression Response',
    description: 'Complete the cognitive re-activation exercises.',
    icon: '🌆',
    worldId: 'depression',
  },
  {
    id: 'clear-mind',
    name: 'Thought Restructuring',
    description: 'Complete the cognitive restructuring exercises.',
    icon: '🧠',
    worldId: 'overthinking',
  },
  {
    id: 'calm-sea',
    name: 'Stress Reduction',
    description: 'Complete the stress reduction exercises.',
    icon: '🌊',
    worldId: 'stress',
  },
  {
    id: 'time-master',
    name: 'Patience & Pacing',
    description: 'Complete the timing and pacing exercises.',
    icon: '⏳',
    worldId: 'impatience',
  },
  {
    id: 'xp-1000',
    name: 'Rising Mind',
    description: 'Reach 1,000 total mindfulness score.',
    icon: '✨',
    xpThreshold: 1000,
  },
  {
    id: 'xp-2000',
    name: 'Luminous',
    description: 'Reach 2,000 total mindfulness score.',
    icon: '💫',
    xpThreshold: 2000,
  },
  {
    id: 'mind-restored',
    name: 'Self-Care Integration',
    description: 'Complete all clinical modules in the dashboard.',
    icon: '🏆',
  },
];

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'daily-fog',
    worldId: 'anxiety',
    title: 'Gentle Currents',
    description: 'Complete any Drift level to practice focus and gentle pacing.',
    xpReward: 80,
    expiresInHours: 14,
    condition: 'complete-world-level',
  },
  {
    id: 'daily-city',
    worldId: 'depression',
    title: 'Speed of Light',
    description: 'Complete any Grey City block to restore layout colors and re-engage cognitive paths.',
    xpReward: 90,
    expiresInHours: 14,
    condition: 'complete-world-level',
  },
  {
    id: 'daily-storm',
    worldId: 'overthinking',
    title: 'One Clean Thought',
    description: 'Complete a thought structuring card connection exercise.',
    xpReward: 100,
    expiresInHours: 14,
    condition: 'complete-world-level',
  },
  {
    id: 'daily-time',
    worldId: 'impatience',
    title: 'Frozen in Time',
    description: 'Complete a Chrono Trial exercise with zero pacing adjustments.',
    xpReward: 120,
    expiresInHours: 14,
    condition: 'complete-world-level',
  },
];

/** Returns the world definition for a given emotion id. */
export function getWorld(id: EmotionId): WorldData | undefined {
  return WORLDS.find((w) => w.id === id);
}

/** Returns a single level definition by its id. */
export function getLevel(levelId: string) {
  for (const world of WORLDS) {
    const level = world.levels.find((l) => l.id === levelId);
    if (level) return level;
  }
  return undefined;
}

/** Total number of levels across the entire game. */
export const TOTAL_LEVEL_COUNT = WORLDS.reduce((sum, w) => sum + w.levels.length, 0);
