import type { UserData, VerbProgress } from '../types';
import { supabase } from './supabase';

const STORAGE_KEY = 'conjugo_user_data';
const CURRENT_VERSION = 4;

export function getDefaultUserData(): UserData {
  return {
    verbProgress: {},
    grammarProgress: {},
    stats: {
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: '',
      totalReviews: 0,
      dailyGoal: 20,
      todayReviews: 0,
      todayDate: new Date().toISOString().split('T')[0],
    },
    settings: {
      darkMode: false,
      dailyGoal: 20,
      audioEnabled: true,
      audioAutoPlay: false,
      audioRate: 0.9,
    },
    version: CURRENT_VERSION,
    totalXP: 0,
    activityHistory: [],
    unlockedAchievements: [],
    achievementDates: {},
    sessionCorrectStreak: 0,
    perfectSessions: 0,
    quizTypesUsed: [],
    completedChallenges: [],
    speedDrillBest: 0,
    hasCompletedOnboarding: false,
  };
}

function migrate(data: UserData): UserData {
  if (!data.version || data.version < 2) {
    const defaults = getDefaultUserData();
    data.totalXP = data.totalXP ?? defaults.totalXP;
    data.activityHistory = data.activityHistory ?? defaults.activityHistory;
    data.unlockedAchievements = data.unlockedAchievements ?? defaults.unlockedAchievements;
    data.achievementDates = data.achievementDates ?? defaults.achievementDates;
    data.sessionCorrectStreak = data.sessionCorrectStreak ?? defaults.sessionCorrectStreak;
    data.perfectSessions = data.perfectSessions ?? defaults.perfectSessions;
    data.quizTypesUsed = data.quizTypesUsed ?? defaults.quizTypesUsed;
    data.completedChallenges = data.completedChallenges ?? defaults.completedChallenges;
    data.speedDrillBest = data.speedDrillBest ?? defaults.speedDrillBest;
    data.hasCompletedOnboarding = data.hasCompletedOnboarding ?? defaults.hasCompletedOnboarding;
    data.settings.audioEnabled = data.settings.audioEnabled ?? defaults.settings.audioEnabled;
    data.settings.audioAutoPlay = data.settings.audioAutoPlay ?? defaults.settings.audioAutoPlay;
    data.settings.audioRate = data.settings.audioRate ?? defaults.settings.audioRate;
  }
  if (!data.version || data.version < 3) {
    data.grammarProgress = data.grammarProgress ?? {};
  }
  data.version = CURRENT_VERSION;
  return data;
}

export function loadUserData(): UserData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultUserData();

    let data = JSON.parse(raw) as UserData;
    data = migrate(data);

    // Reset today's reviews if it's a new day
    const today = new Date().toISOString().split('T')[0];
    if (data.stats.todayDate !== today) {
      // Check streak
      const lastDate = data.stats.lastPracticeDate;
      if (lastDate) {
        const last = new Date(lastDate);
        const now = new Date(today);
        const diffDays = Math.floor(
          (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays > 1) {
          data.stats.currentStreak = 0;
        }
      }
      data.stats.todayReviews = 0;
      data.stats.todayDate = today;
      data.sessionCorrectStreak = 0;
    }

    return data;
  } catch {
    return getDefaultUserData();
  }
}

export function saveUserData(data: UserData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable - silently fail
  }
}

export function clearUserData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ---------------------------------------------------------------------------
// Cloud sync helpers
// ---------------------------------------------------------------------------

/**
 * Upsert user progress to the Supabase `user_progress` table.
 * Fire-and-forget: callers should not await this in the critical path.
 */
export async function syncToCloud(userId: string, data: UserData): Promise<void> {
  if (!supabase) return;

  try {
    const { error } = await supabase.from('user_progress').upsert(
      {
        user_id: userId,
        progress_data: data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
    if (error) {
      console.warn('[cloud-sync] Failed to sync to cloud:', error.message);
    }
  } catch (err) {
    console.warn('[cloud-sync] Unexpected error syncing to cloud:', err);
  }
}

/**
 * Fetch user progress from the Supabase `user_progress` table.
 * Returns `null` when no row exists or supabase is unavailable.
 */
export async function loadFromCloud(userId: string): Promise<UserData | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('progress_data')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    return data.progress_data as UserData;
  } catch (err) {
    console.warn('[cloud-sync] Unexpected error loading from cloud:', err);
    return null;
  }
}

/**
 * Merge two UserData snapshots deterministically.
 *
 * Strategy:
 * - Top-level winner: whichever snapshot has more totalReviews wins the base
 *   stats/XP/achievements etc.  If equal, the one with higher XP wins.
 * - verbProgress: for each verb+tense combination, take the entry with more
 *   totalAttempts. If equal, keep the entry from the top-level winner.
 * - grammarProgress: same logic as verbProgress (more totalAttempts wins).
 * - Arrays like unlockedAchievements, completedChallenges and quizTypesUsed
 *   are merged (union, preserving deterministic order).
 * - activityHistory is merged by date, keeping the entry with higher reviews.
 */
export function mergeProgress(local: UserData, cloud: UserData): UserData {
  // Determine which dataset is the "primary" (more reviews / higher XP)
  const localWins =
    local.stats.totalReviews > cloud.stats.totalReviews ||
    (local.stats.totalReviews === cloud.stats.totalReviews &&
      local.totalXP >= cloud.totalXP);

  const primary = localWins ? local : cloud;
  const secondary = localWins ? cloud : local;

  // Start with the primary as the base
  const merged: UserData = { ...primary };

  // ---------- verbProgress: per verb+tense, take the one with more attempts ----------
  const mergedVerbProgress: Record<string, VerbProgress> = { ...primary.verbProgress };
  for (const [verbId, secondaryVerb] of Object.entries(secondary.verbProgress)) {
    if (!mergedVerbProgress[verbId]) {
      mergedVerbProgress[verbId] = secondaryVerb;
      continue;
    }
    const mergedVerb: VerbProgress = { ...mergedVerbProgress[verbId] };
    for (const [tense, secondaryTense] of Object.entries(secondaryVerb)) {
      const primaryTense = mergedVerb[tense];
      if (!primaryTense) {
        mergedVerb[tense] = secondaryTense;
      } else if (secondaryTense.totalAttempts > primaryTense.totalAttempts) {
        mergedVerb[tense] = secondaryTense;
      }
      // If equal, keep primary (already in mergedVerb)
    }
    mergedVerbProgress[verbId] = mergedVerb;
  }
  merged.verbProgress = mergedVerbProgress;

  // ---------- grammarProgress: per lesson, take the one with more attempts ----------
  const mergedGrammarProgress = { ...primary.grammarProgress };
  for (const [lessonId, secondaryLesson] of Object.entries(secondary.grammarProgress)) {
    const primaryLesson = mergedGrammarProgress[lessonId];
    if (!primaryLesson) {
      mergedGrammarProgress[lessonId] = secondaryLesson;
    } else if (secondaryLesson.totalAttempts > primaryLesson.totalAttempts) {
      mergedGrammarProgress[lessonId] = secondaryLesson;
    }
  }
  merged.grammarProgress = mergedGrammarProgress;

  // ---------- Union arrays (deterministic: sorted) ----------
  merged.unlockedAchievements = Array.from(
    new Set([...local.unlockedAchievements, ...cloud.unlockedAchievements])
  ).sort();

  merged.completedChallenges = Array.from(
    new Set([...local.completedChallenges, ...cloud.completedChallenges])
  ).sort();

  merged.quizTypesUsed = Array.from(
    new Set([...local.quizTypesUsed, ...cloud.quizTypesUsed])
  ).sort();

  // ---------- achievementDates: merge, keep earliest date per achievement ----------
  const mergedDates: Record<string, string> = { ...cloud.achievementDates, ...local.achievementDates };
  for (const id of Object.keys(mergedDates)) {
    const localDate = local.achievementDates[id];
    const cloudDate = cloud.achievementDates[id];
    if (localDate && cloudDate) {
      mergedDates[id] = localDate < cloudDate ? localDate : cloudDate;
    }
  }
  merged.achievementDates = mergedDates;

  // ---------- activityHistory: merge by date, keep entry with more reviews ----------
  const activityMap = new Map<string, (typeof local.activityHistory)[number]>();
  for (const entry of local.activityHistory) {
    activityMap.set(entry.date, entry);
  }
  for (const entry of cloud.activityHistory) {
    const existing = activityMap.get(entry.date);
    if (!existing || entry.reviews > existing.reviews) {
      activityMap.set(entry.date, entry);
    }
  }
  merged.activityHistory = Array.from(activityMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // ---------- Scalars: take the max ----------
  merged.totalXP = Math.max(local.totalXP, cloud.totalXP);
  merged.perfectSessions = Math.max(local.perfectSessions, cloud.perfectSessions);
  merged.speedDrillBest = Math.max(local.speedDrillBest, cloud.speedDrillBest);

  // ---------- Misc ----------
  merged.hasCompletedOnboarding = local.hasCompletedOnboarding || cloud.hasCompletedOnboarding;
  merged.version = CURRENT_VERSION;

  return merged;
}
