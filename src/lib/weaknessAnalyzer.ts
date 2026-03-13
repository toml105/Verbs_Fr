/**
 * Weakness Analysis Engine
 * Analyzes user progress data to identify weak verbs, tenses, and patterns.
 * Pure data analysis — no AI needed.
 */

import type { UserData, WeaknessReport } from '../types';
import { verbs } from '../data/verbs';
import { TENSES } from '../data/tenses';

const WEAK_THRESHOLD = 0.7; // Below 70% accuracy is considered weak
const MIN_ATTEMPTS = 3; // Need at least 3 attempts to be considered

/**
 * Analyze user weaknesses across verbs and tenses.
 * Returns a structured report with weak areas, patterns, and recommendations.
 */
export function analyzeWeaknesses(userData: UserData): WeaknessReport {
  const weakVerbs = findWeakVerbs(userData);
  const weakTenses = findWeakTenses(userData);
  const commonMistakes = findCommonMistakes(userData);
  const overallLevel = determineLevel(userData);
  const recommendedFocus = generateRecommendations(weakVerbs, weakTenses, commonMistakes);

  return {
    weakVerbs,
    weakTenses,
    commonMistakes,
    recommendedFocus,
    overallLevel,
  };
}

/**
 * Find verbs where the user's accuracy is below threshold.
 * Includes verbs with 0 attempts (unattempted) at the end.
 */
function findWeakVerbs(
  userData: UserData
): WeaknessReport['weakVerbs'] {
  const result: WeaknessReport['weakVerbs'] = [];
  const attemptedVerbIds = new Set<string>();

  // Check verbs with progress data
  for (const [verbId, verbProgress] of Object.entries(userData.verbProgress)) {
    attemptedVerbIds.add(verbId);

    let totalAttempts = 0;
    let totalCorrect = 0;

    for (const tenseProgress of Object.values(verbProgress)) {
      totalAttempts += tenseProgress.totalAttempts;
      totalCorrect += tenseProgress.correctAttempts;
    }

    if (totalAttempts === 0) continue;

    const accuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;

    if (totalAttempts >= MIN_ATTEMPTS && accuracy < WEAK_THRESHOLD) {
      result.push({ verbId, accuracy, attempts: totalAttempts });
    }
  }

  // Sort by accuracy ascending (weakest first)
  result.sort((a, b) => a.accuracy - b.accuracy);

  // Add unattempted verbs (limited to first 10 for sanity)
  const unattempted: WeaknessReport['weakVerbs'] = [];
  for (const verb of verbs) {
    if (!attemptedVerbIds.has(verb.id)) {
      unattempted.push({ verbId: verb.id, accuracy: 0, attempts: 0 });
    }
  }

  return [...result, ...unattempted.slice(0, 10)];
}

/**
 * Aggregate accuracy per tense across all verbs.
 * Find tenses where overall accuracy is below threshold.
 */
function findWeakTenses(
  userData: UserData
): WeaknessReport['weakTenses'] {
  const tenseStats: Record<string, { correct: number; total: number }> = {};

  // Initialize all tenses
  for (const tense of TENSES) {
    tenseStats[tense.key] = { correct: 0, total: 0 };
  }

  // Aggregate data
  for (const verbProgress of Object.values(userData.verbProgress)) {
    for (const [tense, tenseProgress] of Object.entries(verbProgress)) {
      if (!tenseStats[tense]) {
        tenseStats[tense] = { correct: 0, total: 0 };
      }
      tenseStats[tense].correct += tenseProgress.correctAttempts;
      tenseStats[tense].total += tenseProgress.totalAttempts;
    }
  }

  const result: WeaknessReport['weakTenses'] = [];

  for (const [tense, stats] of Object.entries(tenseStats)) {
    const accuracy = stats.total > 0 ? stats.correct / stats.total : 0;

    // Include tenses below threshold with enough attempts, or unattempted tenses
    if (stats.total === 0 || (stats.total >= MIN_ATTEMPTS && accuracy < WEAK_THRESHOLD)) {
      result.push({
        tense,
        accuracy,
        attempts: stats.total,
      });
    }
  }

  // Sort by accuracy ascending (weakest first), unattempted at end
  result.sort((a, b) => {
    if (a.attempts === 0 && b.attempts > 0) return 1;
    if (a.attempts > 0 && b.attempts === 0) return -1;
    return a.accuracy - b.accuracy;
  });

  return result;
}

/**
 * Find common mistake patterns.
 * Groups verbs by group (1/2/3) and checks if one group is weaker.
 */
function findCommonMistakes(
  userData: UserData
): WeaknessReport['commonMistakes'] {
  const patterns: WeaknessReport['commonMistakes'] = [];

  // Check verb groups
  const groupStats: Record<number, { correct: number; total: number; verbs: string[] }> = {
    1: { correct: 0, total: 0, verbs: [] },
    2: { correct: 0, total: 0, verbs: [] },
    3: { correct: 0, total: 0, verbs: [] },
  };

  for (const verb of verbs) {
    const progress = userData.verbProgress[verb.id];
    if (!progress) continue;

    let verbTotal = 0;
    let verbCorrect = 0;

    for (const tenseProgress of Object.values(progress)) {
      verbTotal += tenseProgress.totalAttempts;
      verbCorrect += tenseProgress.correctAttempts;
    }

    if (verbTotal > 0) {
      groupStats[verb.group].correct += verbCorrect;
      groupStats[verb.group].total += verbTotal;

      const verbAccuracy = verbCorrect / verbTotal;
      if (verbAccuracy < WEAK_THRESHOLD) {
        groupStats[verb.group].verbs.push(verb.id);
      }
    }
  }

  const groupNames: Record<number, string> = {
    1: '-er verbs (1st group)',
    2: '-ir verbs (2nd group)',
    3: 'irregular verbs (3rd group)',
  };

  for (const [group, stats] of Object.entries(groupStats)) {
    const groupNum = Number(group);
    if (stats.total >= MIN_ATTEMPTS) {
      const accuracy = stats.correct / stats.total;
      if (accuracy < WEAK_THRESHOLD) {
        patterns.push({
          pattern: `Weak in ${groupNames[groupNum]}`,
          frequency: stats.total - stats.correct,
          examples: stats.verbs.slice(0, 5),
        });
      }
    }
  }

  // Check compound tenses (passé composé, plus-que-parfait, etc.)
  const compoundTenses = [
    'PASSE_COMPOSE',
    'PLUS_QUE_PARFAIT',
    'FUTUR_ANTERIEUR',
    'CONDITIONNEL_PASSE',
    'SUBJONCTIF_PASSE',
  ];

  let compoundCorrect = 0;
  let compoundTotal = 0;
  const compoundWeakVerbs: string[] = [];

  for (const [verbId, verbProgress] of Object.entries(userData.verbProgress)) {
    for (const tense of compoundTenses) {
      const tp = verbProgress[tense];
      if (tp) {
        compoundTotal += tp.totalAttempts;
        compoundCorrect += tp.correctAttempts;
        if (tp.totalAttempts >= 2 && tp.correctAttempts / tp.totalAttempts < WEAK_THRESHOLD) {
          if (!compoundWeakVerbs.includes(verbId)) {
            compoundWeakVerbs.push(verbId);
          }
        }
      }
    }
  }

  if (compoundTotal >= MIN_ATTEMPTS && compoundCorrect / compoundTotal < WEAK_THRESHOLD) {
    patterns.push({
      pattern: 'Struggling with compound tenses',
      frequency: compoundTotal - compoundCorrect,
      examples: compoundWeakVerbs.slice(0, 5),
    });
  }

  // Check subjunctive specifically
  const subjTenses = ['SUBJONCTIF_PRESENT', 'SUBJONCTIF_PASSE'];
  let subjCorrect = 0;
  let subjTotal = 0;
  const subjWeakVerbs: string[] = [];

  for (const [verbId, verbProgress] of Object.entries(userData.verbProgress)) {
    for (const tense of subjTenses) {
      const tp = verbProgress[tense];
      if (tp) {
        subjTotal += tp.totalAttempts;
        subjCorrect += tp.correctAttempts;
        if (tp.totalAttempts >= 2 && tp.correctAttempts / tp.totalAttempts < WEAK_THRESHOLD) {
          if (!subjWeakVerbs.includes(verbId)) {
            subjWeakVerbs.push(verbId);
          }
        }
      }
    }
  }

  if (subjTotal >= MIN_ATTEMPTS && subjCorrect / subjTotal < WEAK_THRESHOLD) {
    patterns.push({
      pattern: 'Struggling with subjunctive mood',
      frequency: subjTotal - subjCorrect,
      examples: subjWeakVerbs.slice(0, 5),
    });
  }

  // Sort by frequency descending
  patterns.sort((a, b) => b.frequency - a.frequency);

  return patterns;
}

/**
 * Determine overall level from mastery distribution.
 */
function determineLevel(userData: UserData): WeaknessReport['overallLevel'] {
  const masteryLevels: number[] = [];

  for (const verbProgress of Object.values(userData.verbProgress)) {
    for (const tenseProgress of Object.values(verbProgress)) {
      masteryLevels.push(tenseProgress.masteryLevel);
    }
  }

  if (masteryLevels.length === 0) return 'beginner';

  const avgMastery = masteryLevels.reduce((a, b) => a + b, 0) / masteryLevels.length;
  const highMasteryCount = masteryLevels.filter((m) => m >= 4).length;
  const highMasteryRatio = highMasteryCount / masteryLevels.length;

  if (avgMastery >= 3.5 && highMasteryRatio >= 0.5) return 'advanced';
  if (avgMastery >= 2.0 || masteryLevels.length >= 20) return 'intermediate';
  return 'beginner';
}

/**
 * Generate ordered recommendations (most impactful first).
 */
function generateRecommendations(
  weakVerbs: WeaknessReport['weakVerbs'],
  weakTenses: WeaknessReport['weakTenses'],
  commonMistakes: WeaknessReport['commonMistakes']
): string[] {
  const recommendations: string[] = [];

  // Add weak tenses first (most impactful)
  for (const wt of weakTenses.slice(0, 3)) {
    const tenseInfo = TENSES.find((t) => t.key === wt.tense);
    const tenseName = tenseInfo?.frenchName ?? wt.tense;
    if (wt.attempts === 0) {
      recommendations.push(`Try practicing ${tenseName}`);
    } else {
      recommendations.push(`Focus on ${tenseName} (${Math.round(wt.accuracy * 100)}% accuracy)`);
    }
  }

  // Add common mistake patterns
  for (const cm of commonMistakes.slice(0, 2)) {
    recommendations.push(cm.pattern);
  }

  // Add specific weak verbs
  const weakVerbsWithAttempts = weakVerbs.filter((v) => v.attempts >= MIN_ATTEMPTS);
  if (weakVerbsWithAttempts.length > 0) {
    const verbList = weakVerbsWithAttempts.slice(0, 3).map((v) => v.verbId).join(', ');
    recommendations.push(`Practice weak verbs: ${verbList}`);
  }

  return recommendations.slice(0, 5);
}
