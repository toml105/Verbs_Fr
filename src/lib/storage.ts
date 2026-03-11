import type { UserData } from '../types';

const STORAGE_KEY = 'conjugo_user_data';
const CURRENT_VERSION = 2;

export function getDefaultUserData(): UserData {
  return {
    verbProgress: {},
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
    data.version = CURRENT_VERSION;
  }
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
