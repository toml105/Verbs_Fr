// XP & Leveling System

export const XP_CORRECT = 10;
export const XP_INCORRECT_ATTEMPT = 2;
export const XP_STREAK_BONUS = 5;
export const XP_DAILY_GOAL_BONUS = 25;
export const XP_REVIEW_BONUS = 15;
export const XP_DAILY_CHALLENGE_BONUS = 50;

export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 2.0;
  if (streak >= 14) return 1.5;
  if (streak >= 7) return 1.2;
  return 1.0;
}

// 50 levels with escalating thresholds
export const LEVEL_THRESHOLDS: number[] = [
  0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200,       // 1-10
  4000, 5000, 6200, 7600, 9200, 11000, 13000, 15500, 18500, 22000,  // 11-20
  26000, 30500, 35500, 41000, 47000, 54000, 62000, 71000, 81000, 92000, // 21-30
  104000, 118000, 134000, 152000, 172000, 195000, 220000, 250000, 285000, 325000, // 31-40
  370000, 420000, 480000, 550000, 630000, 720000, 825000, 950000, 1100000, 1300000, // 41-50
];

const LEVEL_TITLES: string[] = [
  'Débutant',          // 1
  'Curieux',           // 2
  'Apprenti',          // 3
  'Élève',             // 4
  'Étudiant',          // 5
  'Explorateur',       // 6
  'Pratiquant',        // 7
  'Habitué',           // 8
  'Connaisseur',       // 9
  'Compétent',         // 10
  'Avancé',            // 11
  'Confirmé',          // 12
  'Habile',            // 13
  'Aguerri',           // 14
  'Passionné',         // 15
  'Expert',            // 16
  'Spécialiste',       // 17
  'Virtuose',          // 18
  'Savant',            // 19
  'Maître',            // 20
  'Grand Maître',      // 21
  'Sage',              // 22
  'Érudit',            // 23
  'Lettré',            // 24
  'Philosophe',        // 25
  'Académicien',       // 26
  'Docteur',           // 27
  'Professeur',        // 28
  'Doyen',             // 29
  'Chancelier',        // 30
  'Ambassadeur',       // 31
  'Consul',            // 32
  'Sénateur',          // 33
  'Ministre',          // 34
  'Premier Ministre',  // 35
  'Président',         // 36
  'Empereur',          // 37
  'Monarque',          // 38
  'Souverain',         // 39
  'Légende',           // 40
  'Titan',             // 41
  'Olympien',          // 42
  'Demi-Dieu',         // 43
  'Immortel',          // 44
  'Divinité',          // 45
  'Astre',             // 46
  'Cosmos',            // 47
  'Infini',            // 48
  'Éternité',          // 49
  'Transcendance',     // 50
];

export interface LevelInfo {
  level: number;
  title: string;
  currentXP: number;
  nextLevelXP: number;
  progress: number;
}

export function getLevelFromXP(totalXP: number): LevelInfo {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }

  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[level - 1] + 100000;
  const xpInLevel = totalXP - currentThreshold;
  const xpForLevel = nextThreshold - currentThreshold;
  const progress = Math.min(100, Math.round((xpInLevel / xpForLevel) * 100));

  return {
    level: Math.min(level, 50),
    title: LEVEL_TITLES[Math.min(level, 50) - 1],
    currentXP: xpInLevel,
    nextLevelXP: xpForLevel,
    progress,
  };
}

export function calculateXPForAnswer(
  isCorrect: boolean,
  consecutiveCorrect: number,
  streakDays: number
): number {
  const base = isCorrect ? XP_CORRECT : XP_INCORRECT_ATTEMPT;
  const streakBonus = isCorrect && consecutiveCorrect > 0 ? XP_STREAK_BONUS * Math.min(consecutiveCorrect, 5) : 0;
  const multiplier = getStreakMultiplier(streakDays);
  return Math.round((base + streakBonus) * multiplier);
}
