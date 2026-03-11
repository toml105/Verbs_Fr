import type { UserData } from '../types';

const STORAGE_KEY = 'conjugo_user_data';
const CURRENT_VERSION = 1;

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
    },
    version: CURRENT_VERSION,
  };
}

export function loadUserData(): UserData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultUserData();

    const data = JSON.parse(raw) as UserData;

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
