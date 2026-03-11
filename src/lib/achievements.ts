import type { UserData } from '../types';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'mastery' | 'volume' | 'speed' | 'tense' | 'explorer';
  check: (data: UserData) => boolean;
}

function countMasteredVerbs(data: UserData, minLevel = 5): number {
  let count = 0;
  for (const vp of Object.values(data.verbProgress)) {
    const levels = Object.values(vp).map(t => t.masteryLevel);
    if (levels.length > 0 && levels.every(l => l >= minLevel)) count++;
  }
  return count;
}

function countTotalCorrectInARow(data: UserData): number {
  return data.sessionCorrectStreak ?? 0;
}

function countVerbsMasteredForTense(data: UserData, tenseKey: string, minLevel = 4): number {
  let count = 0;
  for (const vp of Object.values(data.verbProgress)) {
    if (vp[tenseKey] && vp[tenseKey].masteryLevel >= minLevel) count++;
  }
  return count;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Streak
  {
    id: 'flame-keeper',
    name: 'Flame Keeper',
    description: 'Maintain a 7-day streak',
    icon: 'Flame',
    category: 'streak',
    check: (d) => d.stats.currentStreak >= 7 || d.stats.longestStreak >= 7,
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Maintain a 30-day streak',
    icon: 'Zap',
    category: 'streak',
    check: (d) => d.stats.currentStreak >= 30 || d.stats.longestStreak >= 30,
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Maintain a 100-day streak',
    icon: 'Crown',
    category: 'streak',
    check: (d) => d.stats.currentStreak >= 100 || d.stats.longestStreak >= 100,
  },

  // Mastery
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Master your first verb',
    icon: 'Footprints',
    category: 'mastery',
    check: (d) => countMasteredVerbs(d) >= 1,
  },
  {
    id: 'getting-there',
    name: 'Getting There',
    description: 'Master 10 verbs',
    icon: 'TrendingUp',
    category: 'mastery',
    check: (d) => countMasteredVerbs(d) >= 10,
  },
  {
    id: 'polyglot',
    name: 'Polyglot',
    description: 'Master 50 verbs',
    icon: 'Globe',
    category: 'mastery',
    check: (d) => countMasteredVerbs(d) >= 50,
  },
  {
    id: 'grand-maitre',
    name: 'Grand Maître',
    description: 'Master 100 verbs',
    icon: 'GraduationCap',
    category: 'mastery',
    check: (d) => countMasteredVerbs(d) >= 100,
  },

  // Volume
  {
    id: 'century',
    name: 'Century',
    description: 'Complete 100 reviews',
    icon: 'Hash',
    category: 'volume',
    check: (d) => d.stats.totalReviews >= 100,
  },
  {
    id: 'five-hundred',
    name: 'Demi-Millionnaire',
    description: 'Complete 500 reviews',
    icon: 'Star',
    category: 'volume',
    check: (d) => d.stats.totalReviews >= 500,
  },
  {
    id: 'millionnaire',
    name: 'Millionnaire',
    description: 'Complete 1000 reviews',
    icon: 'Sparkles',
    category: 'volume',
    check: (d) => d.stats.totalReviews >= 1000,
  },

  // Speed/Accuracy
  {
    id: 'sans-faute',
    name: 'Sans Faute',
    description: 'Get 10 correct answers in a row',
    icon: 'CheckCircle',
    category: 'speed',
    check: (d) => countTotalCorrectInARow(d) >= 10,
  },
  {
    id: 'parfait',
    name: 'Parfait',
    description: 'Complete a perfect quiz session (10/10)',
    icon: 'Award',
    category: 'speed',
    check: (d) => d.perfectSessions > 0,
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Score 20+ in Speed Drill',
    icon: 'Timer',
    category: 'speed',
    check: (d) => (d.speedDrillBest ?? 0) >= 20,
  },

  // Tenses
  {
    id: 'present-perfect',
    name: 'Présent Perfect',
    description: 'Master 20 verbs in présent',
    icon: 'Clock',
    category: 'tense',
    check: (d) => countVerbsMasteredForTense(d, 'PRESENT') >= 20,
  },
  {
    id: 'passe-pro',
    name: 'Passé Pro',
    description: 'Master 20 verbs in passé composé',
    icon: 'History',
    category: 'tense',
    check: (d) => countVerbsMasteredForTense(d, 'PASSE_COMPOSE') >= 20,
  },
  {
    id: 'imparfait-ace',
    name: "Imparfait Ace",
    description: 'Master 20 verbs in imparfait',
    icon: 'Rewind',
    category: 'tense',
    check: (d) => countVerbsMasteredForTense(d, 'IMPARFAIT') >= 20,
  },
  {
    id: 'future-sight',
    name: 'Future Sight',
    description: 'Master 20 verbs in futur simple',
    icon: 'FastForward',
    category: 'tense',
    check: (d) => countVerbsMasteredForTense(d, 'FUTUR_SIMPLE') >= 20,
  },
  {
    id: 'subjonctif-scholar',
    name: 'Subjonctif Scholar',
    description: 'Master 10 verbs in subjonctif',
    icon: 'Brain',
    category: 'tense',
    check: (d) => countVerbsMasteredForTense(d, 'SUBJONCTIF_PRESENT') >= 10,
  },

  // Explorer
  {
    id: 'curieux',
    name: 'Curieux',
    description: 'Practice all quiz types',
    icon: 'Search',
    category: 'explorer',
    check: (d) => (d.quizTypesUsed?.length ?? 0) >= 3,
  },
  {
    id: 'daily-warrior',
    name: 'Daily Warrior',
    description: 'Complete 7 daily challenges',
    icon: 'Calendar',
    category: 'explorer',
    check: (d) => (d.completedChallenges?.length ?? 0) >= 7,
  },
];

export function checkNewAchievements(data: UserData): Achievement[] {
  const unlocked = data.unlockedAchievements ?? [];
  return ACHIEVEMENTS.filter(a => !unlocked.includes(a.id) && a.check(data));
}
