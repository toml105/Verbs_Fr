import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react';
import type { UserData, TenseProgress, SRSGrade } from '../types';
import { loadUserData, saveUserData, getDefaultUserData, clearUserData } from '../lib/storage';
import { calculateSRS, calculateMasteryLevel, getDefaultTenseProgress, isDueForReview } from '../lib/srs';
import { todayString } from '../lib/utils';

type Action =
  | { type: 'RECORD_ANSWER'; verbId: string; tense: string; grade: SRSGrade }
  | { type: 'SET_DAILY_GOAL'; goal: number }
  | { type: 'RESET_PROGRESS' }
  | { type: 'SET_DARK_MODE'; darkMode: boolean };

function reducer(state: UserData, action: Action): UserData {
  switch (action.type) {
    case 'RECORD_ANSWER': {
      const { verbId, tense, grade } = action;
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
      if (grade >= 3) currentTense.correctAttempts += 1;
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

      return { ...state, verbProgress, stats };
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

    default:
      return state;
  }
}

interface ProgressContextType {
  userData: UserData;
  recordAnswer: (verbId: string, tense: string, grade: SRSGrade) => void;
  setDailyGoal: (goal: number) => void;
  resetProgress: () => void;
  getVerbMastery: (verbId: string) => number;
  getOverallMastery: () => number;
  getDueReviewCount: () => number;
  getDueItems: () => { verbId: string; tense: string }[];
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [userData, dispatch] = useReducer(reducer, null, loadUserData);

  // Auto-save on changes
  useEffect(() => {
    saveUserData(userData);
  }, [userData]);

  const recordAnswer = useCallback(
    (verbId: string, tense: string, grade: SRSGrade) => {
      dispatch({ type: 'RECORD_ANSWER', verbId, tense, grade });
    },
    []
  );

  const setDailyGoal = useCallback((goal: number) => {
    dispatch({ type: 'SET_DAILY_GOAL', goal });
  }, []);

  const resetProgress = useCallback(() => {
    dispatch({ type: 'RESET_PROGRESS' });
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
