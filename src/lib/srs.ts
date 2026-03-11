import type { SRSGrade, SRSResult, TenseProgress } from '../types';

const MIN_EASE_FACTOR = 1.3;

export function getDefaultTenseProgress(): TenseProgress {
  return {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: new Date().toISOString().split('T')[0],
    lastReview: '',
    totalAttempts: 0,
    correctAttempts: 0,
    masteryLevel: 0,
  };
}

export function calculateSRS(
  prev: TenseProgress,
  grade: SRSGrade
): SRSResult {
  let { easeFactor, interval, repetitions } = prev;

  if (grade >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect - reset
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor
  easeFactor =
    easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (easeFactor < MIN_EASE_FACTOR) {
    easeFactor = MIN_EASE_FACTOR;
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReview: nextReview.toISOString().split('T')[0],
  };
}

export function calculateMasteryLevel(
  progress: TenseProgress
): 0 | 1 | 2 | 3 | 4 | 5 {
  const { correctAttempts, totalAttempts, interval, repetitions } = progress;

  if (totalAttempts === 0) return 0;
  if (repetitions <= 1) return 1;

  const accuracy = correctAttempts / totalAttempts;

  if (interval >= 30 && accuracy >= 0.9 && repetitions >= 8) return 5;
  if (interval >= 14 && accuracy >= 0.8 && repetitions >= 5) return 4;
  if (interval >= 6 && accuracy >= 0.7 && repetitions >= 3) return 3;
  if (repetitions >= 2) return 2;
  return 1;
}

export function isDueForReview(progress: TenseProgress): boolean {
  if (!progress.nextReview) return true;
  const today = new Date().toISOString().split('T')[0];
  return progress.nextReview <= today;
}

export function gradeFromUI(label: 'again' | 'hard' | 'good' | 'easy'): SRSGrade {
  switch (label) {
    case 'again': return 0;
    case 'hard': return 2;
    case 'good': return 3;
    case 'easy': return 5;
  }
}

export function getMasteryColor(level: number): string {
  switch (level) {
    case 0: return 'bg-warm-200 dark:bg-warm-700';
    case 1: return 'bg-red-200 dark:bg-red-900';
    case 2: return 'bg-amber-200 dark:bg-amber-900';
    case 3: return 'bg-yellow-200 dark:bg-yellow-900';
    case 4: return 'bg-emerald-200 dark:bg-emerald-900';
    case 5: return 'bg-emerald-400 dark:bg-emerald-700';
    default: return 'bg-warm-200 dark:bg-warm-700';
  }
}

export function getMasteryLabel(level: number): string {
  switch (level) {
    case 0: return 'New';
    case 1: return 'Learning';
    case 2: return 'Familiar';
    case 3: return 'Practiced';
    case 4: return 'Strong';
    case 5: return 'Mastered';
    default: return 'New';
  }
}
