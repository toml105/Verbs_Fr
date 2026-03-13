import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useProgress } from '../context/UserProgressContext';
import { grammarLessons } from '../data/grammarLessons';
import { grammarExercises } from '../data/grammarExercises';
import GrammarExerciseCard from '../components/grammar/GrammarExerciseCard';
import GrammarExerciseResult from '../components/grammar/GrammarExerciseResult';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';

const QUESTIONS_PER_SESSION = 10;

function shuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function GrammarPractice() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { recordGrammarResult } = useProgress();

  const lesson = grammarLessons.find(l => l.id === lessonId);

  const questions = useMemo(() => {
    const pool = grammarExercises.filter(e => e.lessonId === lessonId);
    const shuffled = shuffle(pool);
    return shuffled.slice(0, Math.min(QUESTIONS_PER_SESSION, shuffled.length));
  }, [lessonId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const handleAnswer = useCallback((isCorrect: boolean) => {
    const newResults = [...results, isCorrect];
    setResults(newResults);

    if (currentIndex + 1 >= questions.length) {
      // Session complete
      const correct = newResults.filter(Boolean).length;
      const total = newResults.length;
      const score = Math.round((correct / total) * 100);
      if (lessonId) {
        recordGrammarResult(lessonId, score, correct, total);
      }
      setIsFinished(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [results, currentIndex, questions.length, lessonId, recordGrammarResult]);

  const handleRetry = () => {
    setCurrentIndex(0);
    setResults([]);
    setIsFinished(false);
  };

  const nextLesson = useMemo(() => {
    if (!lesson) return null;
    const sameTier = grammarLessons.filter(l => l.tier === lesson.tier).sort((a, b) => a.order - b.order);
    const idx = sameTier.findIndex(l => l.id === lesson.id);
    if (idx < sameTier.length - 1) return sameTier[idx + 1];
    const nextTier = grammarLessons.filter(l => l.tier === (lesson.tier + 1) as 1 | 2 | 3).sort((a, b) => a.order - b.order);
    return nextTier[0] ?? null;
  }, [lesson]);

  if (!lesson || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-warm-500">
          {!lesson ? 'Lesson not found.' : 'No exercises available for this lesson yet.'}
        </p>
        <Button onClick={() => navigate('/grammar')} variant="ghost" className="mt-4">
          Back to Grammar
        </Button>
      </div>
    );
  }

  if (isFinished) {
    const correct = results.filter(Boolean).length;
    const total = results.length;
    const score = Math.round((correct / total) * 100);
    const xpEarned = correct * 10;

    return (
      <div className="max-w-md mx-auto">
        <GrammarExerciseResult
          score={score}
          correct={correct}
          total={total}
          xpEarned={xpEarned}
          lessonTitle={lesson.title}
          onRetry={handleRetry}
          onBack={() => navigate('/grammar')}
          onContinue={nextLesson ? () => navigate(`/grammar/${nextLesson.id}`) : undefined}
        />
      </div>
    );
  }

  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <button
          onClick={() => navigate(`/grammar/${lessonId}`)}
          className="p-2 -ml-2 rounded-xl hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
        >
          <ArrowLeft size={20} className="text-warm-600 dark:text-warm-300" />
        </button>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-warm-800 dark:text-warm-100">
            {lesson.title}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1">
              <ProgressBar progress={progress} color="bg-coral-500" height="h-1.5" />
            </div>
            <span className="text-xs text-warm-400">
              {currentIndex + 1}/{questions.length}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Exercise */}
      <GrammarExerciseCard
        exercise={questions[currentIndex]}
        onAnswer={handleAnswer}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
      />
    </div>
  );
}
