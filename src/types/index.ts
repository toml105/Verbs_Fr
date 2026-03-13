// Verb data types
export interface VerbDef {
  id: string;
  infinitive: string;
  english: string;
  group: 1 | 2 | 3;
  auxiliary: 'avoir' | 'être';
  difficulty: 1 | 2 | 3;
  tags: string[];
  isReflexive: boolean;
  thematicGroup: string;
}

export interface TenseInfo {
  key: string;
  frenchName: string;
  englishName: string;
  description: string;
  difficulty: 1 | 2 | 3;
}

export interface Example {
  verbId: string;
  french: string;
  english: string;
  tense: string;
}

export interface ThematicGroup {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// Grammar types
export type GrammarExerciseType = 'fill-blank' | 'multiple-choice' | 'error-correction' | 'reorder' | 'translation' | 'rule-application';

export interface GrammarExercise {
  id: string;
  lessonId: string;
  type: GrammarExerciseType;
  prompt: string;
  correctAnswer: string;
  options?: string[];           // for multiple-choice
  words?: string[];             // for reorder exercises
  explanation: string;          // shown after answering
  hint?: string;
}

export interface GrammarRule {
  title: string;
  formula?: string;            // e.g. "ne + verb + pas"
  explanation: string;
  examples: { french: string; english: string }[];
}

export interface GrammarLesson {
  id: string;
  title: string;
  shortDescription: string;
  tier: 1 | 2 | 3;
  order: number;               // position within tier
  introduction: string;
  rules: GrammarRule[];
  tips: string[];              // common mistakes to avoid
  relatedLessons?: string[];   // IDs of related lessons
}

export interface GrammarLessonProgress {
  lessonId: string;
  totalAttempts: number;
  correctAttempts: number;
  bestScore: number;           // 0-100
  masteryLevel: 0 | 1 | 2 | 3 | 4 | 5;
  lastPracticed: string;
  completed: boolean;          // scored 60%+ at least once
  // SRS fields
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
}

// User progress types
export interface TenseProgress {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
  lastReview: string;
  totalAttempts: number;
  correctAttempts: number;
  masteryLevel: 0 | 1 | 2 | 3 | 4 | 5;
}

export interface VerbProgress {
  [tenseKey: string]: TenseProgress;
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string;
  totalReviews: number;
  dailyGoal: number;
  todayReviews: number;
  todayDate: string;
}

export interface DailyActivity {
  date: string;
  reviews: number;
  correct: number;
  xpEarned: number;
}

export interface UserSettings {
  darkMode: boolean;
  dailyGoal: number;
  audioEnabled: boolean;
  audioAutoPlay: boolean;
  audioRate: number;
}

export interface UserData {
  verbProgress: Record<string, VerbProgress>;
  grammarProgress: Record<string, GrammarLessonProgress>;
  stats: UserStats;
  settings: UserSettings;
  version: number;
  // XP & Leveling
  totalXP: number;
  activityHistory: DailyActivity[];
  // Achievements
  unlockedAchievements: string[];
  achievementDates: Record<string, string>;
  // Session tracking
  sessionCorrectStreak: number;
  perfectSessions: number;
  quizTypesUsed: string[];
  // Daily challenges
  completedChallenges: string[];
  // Speed drill
  speedDrillBest: number;
  // Onboarding
  hasCompletedOnboarding: boolean;
}

// Quiz types
export type QuizType = 'conjugation' | 'multiple-choice' | 'fill-blank' | 'context-match' | 'listening' | 'speaking' | 'conversation';

export interface QuizQuestion {
  type: QuizType;
  verbId: string;
  tense: string;
  personIndex: number;
  prompt: string;
  correctAnswer: string;
  options?: string[];
  sentenceTemplate?: string;
  hint?: string;
}

export interface QuizSession {
  questions: QuizQuestion[];
  currentIndex: number;
  answers: QuizAnswer[];
  mode: 'review' | 'practice-tense' | 'practice-verb' | 'random';
}

export interface QuizAnswer {
  question: QuizQuestion;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

// SRS types
export interface SRSResult {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
}

export type SRSGrade = 0 | 1 | 2 | 3 | 4 | 5;

// Weakness Analysis types
export interface WeaknessReport {
  weakVerbs: { verbId: string; accuracy: number; attempts: number }[];
  weakTenses: { tense: string; accuracy: number; attempts: number }[];
  commonMistakes: { pattern: string; frequency: number; examples: string[] }[];
  recommendedFocus: string[];
  overallLevel: 'beginner' | 'intermediate' | 'advanced';
}

// AI Tutor types
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  corrections?: GrammarCorrection[];
}

export interface GrammarCorrection {
  original: string;
  corrected: string;
  explanation: string;
  rule?: string;
}

export interface ConversationTopic {
  id: string;
  title: string;
  titleFr: string;
  description: string;
  icon: string;
  difficulty: 1 | 2 | 3;
  starterPrompt: string;
}
