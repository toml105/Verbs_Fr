import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowLeft, Zap, RefreshCw, Trophy, Target, Sparkles } from 'lucide-react';
import { useProgress } from '../context/UserProgressContext';
import { useAI } from '../context/AIContext';
import { analyzeWeaknesses } from '../lib/weaknessAnalyzer';
import { generateExercises, type AIExercise } from '../lib/aiExerciseGenerator';
import { gradeFromUI } from '../lib/srs';
import type { WeaknessReport } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import AIExerciseCard from '../components/practice/AIExerciseCard';

type PageState = 'loading' | 'ready' | 'practicing' | 'results';

const XP_PER_CORRECT = 10;
const XP_PER_INCORRECT = 2;

export default function SmartPractice() {
  const navigate = useNavigate();
  const { userData, recordAnswer, awardBonusXP } = useProgress();
  const { isAIAvailable, chat } = useAI();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [weaknesses, setWeaknesses] = useState<WeaknessReport | null>(null);
  const [exercises, setExercises] = useState<AIExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Analyze weaknesses and generate exercises on mount
  useEffect(() => {
    const init = async () => {
      const report = analyzeWeaknesses(userData);
      setWeaknesses(report);

      const chatFn = isAIAvailable ? chat : undefined;
      const exs = await generateExercises(report, chatFn);
      setExercises(exs);
      setPageState('ready');
    };

    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startPractice = useCallback(() => {
    setCurrentIndex(0);
    setResults([]);
    setPageState('practicing');
  }, []);

  const handleAnswer = useCallback(
    (correct: boolean) => {
      setResults((prev) => [...prev, correct]);

      // Record answer for SRS tracking when possible
      // Try to extract verb/tense info from the exercise
      const exercise = exercises[currentIndex];
      if (exercise) {
        // Use a generic recording for smart practice
        const grade = gradeFromUI(correct ? 'good' : 'again');
        // Try to find verb info from the exercise prompt
        const weakVerb = weaknesses?.weakVerbs[currentIndex % (weaknesses.weakVerbs.length || 1)];
        const weakTense = weaknesses?.weakTenses[currentIndex % (weaknesses.weakTenses.length || 1)];
        if (weakVerb?.verbId && weakVerb.attempts > 0 && weakTense?.tense) {
          recordAnswer(weakVerb.verbId, weakTense.tense, grade, 'smart-practice');
        }
      }
    },
    [exercises, currentIndex, weaknesses, recordAnswer]
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setPageState('results');
    }
  }, [currentIndex, exercises.length]);

  const handleGenerateMore = useCallback(async () => {
    if (!weaknesses) return;

    setIsGenerating(true);
    const chatFn = isAIAvailable ? chat : undefined;
    const newExercises = await generateExercises(weaknesses, chatFn);
    setExercises(newExercises);
    setCurrentIndex(0);
    setResults([]);
    setIsGenerating(false);
    setPageState('practicing');
  }, [weaknesses, isAIAvailable, chat]);

  // Compute results stats
  const score = useMemo(() => {
    const correct = results.filter(Boolean).length;
    const total = results.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const xpEarned = correct * XP_PER_CORRECT + (total - correct) * XP_PER_INCORRECT;
    return { correct, total, percentage, xpEarned };
  }, [results]);

  // Top 3 weak areas as badge labels
  const weakAreaBadges = useMemo(() => {
    if (!weaknesses) return [];
    return weaknesses.recommendedFocus.slice(0, 3);
  }, [weaknesses]);

  // === LOADING STATE ===
  if (pageState === 'loading') {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/practice')}
            className="text-warm-500 hover:text-warm-700 dark:hover:text-warm-300"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Brain size={24} className="text-coral-500" />
            <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100">Smart Practice</h1>
          </div>
        </div>

        <Card className="text-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <Brain size={40} className="text-coral-400" />
          </motion.div>
          <p className="text-warm-600 dark:text-warm-400 font-medium">
            Analyzing your weaknesses...
          </p>
          <p className="text-sm text-warm-400 dark:text-warm-500 mt-1">
            Generating personalized exercises
          </p>
        </Card>
      </div>
    );
  }

  // === READY STATE (show summary before starting) ===
  if (pageState === 'ready') {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/practice')}
            className="text-warm-500 hover:text-warm-700 dark:hover:text-warm-300"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Brain size={24} className="text-coral-500" />
            <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100">Smart Practice</h1>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Target size={18} className="text-coral-500" />
              <h2 className="font-semibold text-warm-800 dark:text-warm-100">Focus Areas</h2>
            </div>

            {weakAreaBadges.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {weakAreaBadges.map((area, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-coral-50 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400"
                  >
                    {area}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-warm-500 mb-4">
                Keep practicing to build your weakness profile!
              </p>
            )}

            <div className="flex items-center gap-2 mb-4 text-sm text-warm-500">
              {isAIAvailable ? (
                <>
                  <Sparkles size={14} className="text-amber-500" />
                  <span>AI-powered exercises</span>
                </>
              ) : (
                <>
                  <Zap size={14} className="text-violet-500" />
                  <span>Targeted exercises based on your progress</span>
                </>
              )}
            </div>

            <div className="text-sm text-warm-500 dark:text-warm-400 mb-4">
              Level: <span className="font-semibold text-warm-700 dark:text-warm-200 capitalize">
                {weaknesses?.overallLevel ?? 'beginner'}
              </span>
              {' '} | Exercises: <span className="font-semibold text-warm-700 dark:text-warm-200">
                {exercises.length}
              </span>
            </div>

            <Button onClick={startPractice} className="w-full" size="lg" disabled={exercises.length === 0}>
              <Brain size={18} className="mr-2" />
              Start Smart Practice
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  // === PRACTICING STATE ===
  if (pageState === 'practicing') {
    const progress = exercises.length > 0 ? ((currentIndex + 1) / exercises.length) * 100 : 0;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPageState('ready')}
            className="flex items-center gap-1.5 text-warm-500 hover:text-warm-700 dark:hover:text-warm-300"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-coral-500" />
            <span className="text-sm text-warm-500">
              {currentIndex + 1} / {exercises.length}
            </span>
          </div>
        </div>

        <ProgressBar progress={progress} height="h-1.5" />

        <AnimatePresence mode="wait">
          {exercises[currentIndex] && (
            <AIExerciseCard
              key={exercises[currentIndex].id}
              exercise={exercises[currentIndex]}
              onAnswer={handleAnswer}
              onNext={handleNext}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // === RESULTS STATE ===
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/practice')}
          className="text-warm-500 hover:text-warm-700 dark:hover:text-warm-300"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-warm-800 dark:text-warm-100">Results</h1>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="mb-4"
          >
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
              score.percentage >= 80
                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                : score.percentage >= 50
                  ? 'bg-amber-100 dark:bg-amber-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <Trophy
                size={36}
                className={
                  score.percentage >= 80
                    ? 'text-emerald-500'
                    : score.percentage >= 50
                      ? 'text-amber-500'
                      : 'text-red-500'
                }
              />
            </div>
          </motion.div>

          <h2 className="text-3xl font-bold text-warm-800 dark:text-warm-100 mb-1">
            {score.percentage}%
          </h2>
          <p className="text-warm-500 dark:text-warm-400 mb-4">
            {score.correct} of {score.total} correct
          </p>

          <div className="flex justify-center gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-500">+{score.xpEarned}</p>
              <p className="text-xs text-warm-400">XP Earned</p>
            </div>
          </div>

          {/* Weakness areas improved */}
          {weakAreaBadges.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-warm-500 dark:text-warm-400 mb-2">Areas practiced:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {weakAreaBadges.map((area, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-coral-50 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Button
              onClick={handleGenerateMore}
              className="w-full"
              size="lg"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block mr-2"
                  >
                    <RefreshCw size={18} />
                  </motion.span>
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw size={18} className="mr-2" />
                  Generate More Exercises
                </>
              )}
            </Button>
            <Button
              onClick={() => navigate('/practice')}
              variant="secondary"
              className="w-full"
              size="lg"
            >
              Back to Practice
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
