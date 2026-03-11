import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import type { UserData, TenseProgress, SRSGrade, DailyActivity } from '../types';
import { loadUserData, saveUserData, getDefaultUserData, clearUserData } from '../lib/storage';
import { calculateSRS, calculateMasteryLevel, getDefaultTenseProgress, isDueForReview } from '../lib/srs';
import { todayString } from '../lib/utils';
import { calculateXPForAnswer, XP_DAILY_GOAL_BONUS } from '../lib/xp';
import { checkNewAchievements, type Achievement } from '../lib/achievements';

type Action =
  | { type: 'RECORD_ANSWER'; verbId: string; tense: string; grade: SRSGrade; quizType?: string }
  | { type: 'SET_DAILY_GOAL'; goal: number }
  | { type: 'RESET_PROGRESS' }
  | { type: 'SET_DARK_MODE'; darkMode: boolean }
  | { type: 'AWARD_BONUS_XP'; amount: number; reason: string }
  | { type: 'RECORD_PERFECT_SESSION' }
  | { type: 'RECORD_SPEED_DRILL'; score: number }
  | { type: 'COMPLETE_DAILY_CHALLENGE'; challengeId: string }
  | { type: 'COMPLETE_ONBOARDING'; level?: string }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<UserData['settings']> }
  | { type: 'UNLOCK_ACHIEVEMENTS'; ids: string[] };

function updateDailyActivity(state: UserData, xpEarned: number, isCorrect: boolean): DailyActivity[] {
  const today = todayString();
  const history = [...state.activityHistory];
  const todayIndex = history.findIndex(a => a.date === today);

  if (todayIndex >= 0) {
    history[todayIndex] = {
      ...history[todayIndex],
      reviews: history[todayIndex].reviews + 1,
      correct: history[todayIndex].correct + (isCorrect ? 1 : 0),
      xpEarned: history[todayIndex].xpEarned + xpEarned,
    };
  } else {
    history.push({
      date: today,
      reviews: 1,
      correct: isCorrect ? 1 : 0,
      xpEarned,
    });
  }

  // Keep last 365 days
  if (history.length > 365) history.splice(0, history.length - 365);
  return history;
}

function reducer(state: UserData, action: Action): UserData {
  switch (action.type) {
    case 'RECORD_ANSWER': {
      const { verbId, tense, grade, quizType } = action;
      const verbProgress = { ...state.verbProgress };
      const currentVerb = verbProgress[verbId] ? { ...verbProgress[verbId] } : {};
      const currentTense: TenseProgress = currentVerb[tense]
        ? { ...currentVerb[tense] }
        : getDefaultTenseProgress();

      // Update SRS
      const srsResult = calculateSRS(currentTense, grade);
      currentTense.easeFactor = srsResult.easeFactor;
      currentTense.interval = srsResult.interval;
      currentTense.repetitions = srsResult.repetitions;
      currentTense.nextReview = srsResult.nextReview;
      currentTense.lastReview = todayString();
      currentTense.totalAttempts += 1;
      const isCorrect = grade >= 3;
      if (isCorrect) currentTense.correctAttempts += 1;
      currentTense.masteryLevel = calculateMasteryLevel(currentTense);

      currentVerb[tense] = currentTense;
      verbProgress[verbId] = currentVerb;

      // Update stats
      const today = todayString();
      const stats = { ...state.stats };
      stats.totalReviews += 1;
      stats.todayReviews += 1;

      if (stats.lastPracticeDate !== today) {
        if (stats.lastPracticeDate) {
          const last = new Date(stats.lastPracticeDate);
          const now = new Date(today);
          const diff = Math.floor((now.getTime() - last.getTime()) / 86400000);
          if (diff === 1) {
            stats.currentStreak += 1;
          } else if (diff > 1) {
            stats.currentStreak = 1;
          }
        } else {
          stats.currentStreak = 1;
        }
        stats.lastPracticeDate = today;
        stats.todayDate = today;
      }

      if (stats.currentStreak > stats.longestStreak) {
        stats.longestStreak = stats.currentStreak;
      }

      // XP calculation
      const sessionStreak = isCorrect ? state.sessionCorrectStreak : 0;
      const xpEarned = calculateXPForAnswer(isCorrect, sessionStreak, stats.currentStreak);
      let totalXP = state.totalXP + xpEarned;

      // Daily goal bonus
      const wasGoalMet = state.stats.todayReviews >= stats.dailyGoal;
      const isGoalNowMet = stats.todayReviews >= stats.dailyGoal;
      if (!wasGoalMet && isGoalNowMet) {
        totalXP += XP_DAILY_GOAL_BONUS;
      }

      // Update session streak
      const newSessionStreak = isCorrect ? state.sessionCorrectStreak + 1 : 0;

      // Activity history
      const activityHistory = updateDailyActivity(state, xpEarned, isCorrect);

      // Track quiz types
      const quizTypesUsed = [...state.quizTypesUsed];
      if (quizType && !quizTypesUsed.includes(quizType)) {
        quizTypesUsed.push(quizType);
      }

      return {
        ...state,
        verbProgress,
        stats,
        totalXP,
        sessionCorrectStreak: newSessionStreak,
        activityHistory,
        quizTypesUsed,
      };
    }

    case 'SET_DAILY_GOAL': {
      return {
        ...state,
        stats: { ...state.stats, dailyGoal: action.goal },
        settings: { ...state.settings, dailyGoal: action.goal },
      };
    }

    case 'RESET_PROGRESS': {
      clearUserData();
      return getDefaultUserData();
    }

    case 'SET_DARK_MODE': {
      return {
        ...state,
        settings: { ...state.settings, darkMode: action.darkMode },
      };
    }

    case 'AWARD_BONUS_XP': {
      return {
        ...state,
        totalXP: state.totalXP + action.amount,
      };
    }

    case 'RECORD_PERFECT_SESSION': {
      return {
        ...state,
        perfectSessions: state.perfectSessions + 1,
      };
    }

    case 'RECORD_SPEED_DRILL': {
      return {
        ...state,
        speedDrillBest: Math.max(state.speedDrillBest, action.score),
      };
    }

    case 'COMPLETE_DAILY_CHALLENGE': {
      if (state.completedChallenges.includes(action.challengeId)) return state;
      return {
        ...state,
        completedChallenges: [...state.completedChallenges, action.challengeId],
        totalXP: state.totalXP + 50,
      };
    }

    case 'COMPLETE_ONBOARDING': {
      return {
        ...state,
        hasCompletedOnboarding: true,
      };
    }

    case 'UPDATE_SETTINGS': {
      return {
        ...state,
        settings: { ...state.settings, ...action.settings },
      };
    }

    case 'UNLOCK_ACHIEVEMENTS': {
      const today = todayString();
      const newDates = { ...state.achievementDates };
      for (const id of action.ids) {
        newDates[id] = today;
      }
      return {
        ...state,
        unlockedAchievements: [...state.unlockedAchievements, ...action.ids],
        achievementDates: newDates,
      };
    }

    default:
      return state;
  }
}

interface ProgressContextType {
  userData: UserData;
  recordAnswer: (verbId: string, tense: string, grade: SRSGrade, quizType?: string) => void;
  setDailyGoal: (goal: number) => void;
  resetProgress: () => void;
  getVerbMastery: (verbId: string) => number;
  getOverallMastery: () => number;
  getDueReviewCount: () => number;
  getDueItems: () => { verbId: string; tense: string }[];
  awardBonusXP: (amount: number, reason: string) => void;
  recordPerfectSession: () => void;
  recordSpeedDrill: (score: number) => void;
  completeDailyChallenge: (challengeId: string) => void;
  completeOnboarding: (level?: string) => void;
  updateSettings: (settings: Partial<UserData['settings']>) => void;
  pendingAchievements: Achievement[];
  clearPendingAchievements: () => void;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [userData, dispatch] = useReducer(reducer, null, loadUserData);
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);

  // Auto-save on changes
  useEffect(() => {
    saveUserData(userData);
  }, [userData]);

  // Check achievements after every state change
  useEffect(() => {
    const newAchievements = checkNewAchievements(userData);
    if (newAchievements.length > 0) {
      setPendingAchievements(prev => [...prev, ...newAchievements]);
      dispatch({ type: 'UNLOCK_ACHIEVEMENTS', ids: newAchievements.map(a => a.id) });
    }
  }, [userData.stats.totalReviews, userData.totalXP, userData.sessionCorrectStreak, userData.perfectSessions, userData.speedDrillBest]);

  const recordAnswer = useCallback(
    (verbId: string, tense: string, grade: SRSGrade, quizType?: string) => {
      dispatch({ type: 'RECORD_ANSWER', verbId, tense, grade, quizType });
    },
    []
  );

  const setDailyGoal = useCallback((goal: number) => {
    dispatch({ type: 'SET_DAILY_GOAL', goal });
  }, []);

  const resetProgress = useCallback(() => {
    dispatch({ type: 'RESET_PROGRESS' });
  }, []);

  const awardBonusXP = useCallback((amount: number, reason: string) => {
    dispatch({ type: 'AWARD_BONUS_XP', amount, reason });
  }, []);

  const recordPerfectSession = useCallback(() => {
    dispatch({ type: 'RECORD_PERFECT_SESSION' });
  }, []);

  const recordSpeedDrill = useCallback((score: number) => {
    dispatch({ type: 'RECORD_SPEED_DRILL', score });
  }, []);

  const completeDailyChallenge = useCallback((challengeId: string) => {
    dispatch({ type: 'COMPLETE_DAILY_CHALLENGE', challengeId });
  }, []);

  const completeOnboarding = useCallback((level?: string) => {
    dispatch({ type: 'COMPLETE_ONBOARDING', level });
  }, []);

  const updateSettings = useCallback((settings: Partial<UserData['settings']>) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings });
  }, []);

  const clearPendingAchievements = useCallback(() => {
    setPendingAchievements([]);
  }, []);

  const getVerbMastery = useCallback(
    (verbId: string): number => {
      const progress = userData.verbProgress[verbId];
      if (!progress) return 0;
      const levels = Object.values(progress).map((t) => t.masteryLevel);
      if (levels.length === 0) return 0;
      return Math.round(
        (levels.reduce<number>((a, b) => a + b, 0) / (levels.length * 5)) * 100
      );
    },
    [userData.verbProgress]
  );

  const getOverallMastery = useCallback((): number => {
    const entries = Object.values(userData.verbProgress);
    if (entries.length === 0) return 0;

    let totalMastery = 0;
    let totalItems = 0;

    for (const verbProg of entries) {
      for (const tenseProgress of Object.values(verbProg)) {
        totalMastery += tenseProgress.masteryLevel;
        totalItems += 1;
      }
    }

    if (totalItems === 0) return 0;
    return Math.round((totalMastery / (totalItems * 5)) * 100);
  }, [userData.verbProgress]);

  const getDueItems = useCallback((): { verbId: string; tense: string }[] => {
    const items: { verbId: string; tense: string }[] = [];
    for (const [verbId, verbProg] of Object.entries(userData.verbProgress)) {
      for (const [tense, tenseProgress] of Object.entries(verbProg)) {
        if (isDueForReview(tenseProgress)) {
          items.push({ verbId, tense });
        }
      }
    }
    return items;
  }, [userData.verbProgress]);

  const getDueReviewCount = useCallback((): number => {
    return getDueItems().length;
  }, [getDueItems]);

  return (
    <ProgressContext.Provider
      value={{
        userData,
        recordAnswer,
        setDailyGoal,
        resetProgress,
        getVerbMastery,
        getOverallMastery,
        getDueReviewCount,
        getDueItems,
        awardBonusXP,
        recordPerfectSession,
        recordSpeedDrill,
        completeDailyChallenge,
        completeOnboarding,
        updateSettings,
        pendingAchievements,
        clearPendingAchievements,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
