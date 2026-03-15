/**
 * Builds a UserProfile from SRS data for AI prompt personalization.
 * Bridges the gap between raw mastery numbers and natural language context
 * that the LLM can use to tailor its responses.
 */

import { analyzeWeaknesses } from './weaknessAnalyzer';
import type { UserData } from '../types';

export interface UserProfile {
  level: 'beginner' | 'intermediate' | 'advanced';
  /** Granular 0-100 mastery score for adaptive difficulty */
  masteryScore: number;
  weakTenses: string[];
  weakVerbs: string[];
  recentMistakes: string[];
  streakDays: number;
  totalReviews: number;
  conversationSummary?: string;
}

/**
 * Map a numeric mastery score (0-100) to a 5-tier difficulty label.
 * More granular than the 3-level system — gives the AI finer control
 * over language complexity.
 */
export function getGranularLevel(score: number): string {
  if (score <= 20) return 'pure beginner';
  if (score <= 40) return 'early learner';
  if (score <= 60) return 'intermediate';
  if (score <= 80) return 'upper intermediate';
  return 'advanced';
}

/**
 * Build a UserProfile from existing SRS data.
 * Reuses analyzeWeaknesses() which already computes weak verbs, tenses, and level.
 */
export function buildUserProfile(
  userData: UserData,
  masteryScore: number,
  recentSummaries?: string[]
): UserProfile {
  const weakness = analyzeWeaknesses(userData);

  return {
    level: weakness.overallLevel,
    masteryScore,
    weakTenses: weakness.weakTenses
      .filter((t) => t.attempts > 0)
      .slice(0, 5)
      .map((t) => t.tense),
    weakVerbs: weakness.weakVerbs
      .filter((v) => v.attempts > 0)
      .slice(0, 5)
      .map((v) => v.verbId),
    recentMistakes: weakness.commonMistakes.map((m) => m.pattern),
    streakDays: userData.stats.currentStreak,
    totalReviews: userData.stats.totalReviews,
    conversationSummary: recentSummaries?.length
      ? recentSummaries.join(' | ')
      : undefined,
  };
}
