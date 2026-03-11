export interface DailyChallengeTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  targetCount: number;
  type: 'perfect-streak' | 'speed' | 'tense-focus' | 'accuracy' | 'volume';
}

export const DAILY_CHALLENGES: DailyChallengeTemplate[] = [
  {
    id: 'perfect-5',
    name: 'Perfect 5',
    description: 'Get 5 correct answers in a row',
    icon: 'Target',
    targetCount: 5,
    type: 'perfect-streak',
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Answer 10 questions in under 2 minutes',
    icon: 'Zap',
    targetCount: 10,
    type: 'speed',
  },
  {
    id: 'accuracy-king',
    name: 'Accuracy King',
    description: 'Complete a session with 90%+ accuracy',
    icon: 'Crown',
    targetCount: 90,
    type: 'accuracy',
  },
  {
    id: 'present-practice',
    name: 'Présent Practice',
    description: 'Get 5 correct in présent tense',
    icon: 'Clock',
    targetCount: 5,
    type: 'tense-focus',
  },
  {
    id: 'passe-practice',
    name: 'Passé Composé Challenge',
    description: 'Get 5 correct in passé composé',
    icon: 'History',
    targetCount: 5,
    type: 'tense-focus',
  },
  {
    id: 'futur-focus',
    name: 'Future Focus',
    description: 'Get 5 correct in futur simple',
    icon: 'FastForward',
    targetCount: 5,
    type: 'tense-focus',
  },
  {
    id: 'marathon',
    name: 'Marathon',
    description: 'Complete 20 reviews today',
    icon: 'TrendingUp',
    targetCount: 20,
    type: 'volume',
  },
];

export function getTodayChallenge(): DailyChallengeTemplate {
  const today = new Date();
  const daysSinceEpoch = Math.floor(today.getTime() / 86400000);
  const index = daysSinceEpoch % DAILY_CHALLENGES.length;
  return DAILY_CHALLENGES[index];
}
