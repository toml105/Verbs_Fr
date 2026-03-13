import { motion } from 'framer-motion';
import { Trophy, RotateCcw, Home, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import ProgressRing from '../ui/ProgressRing';

interface Props {
  score: number;
  correct: number;
  total: number;
  xpEarned: number;
  lessonTitle: string;
  onRetry: () => void;
  onBack: () => void;
  onContinue?: () => void;
}

export default function GrammarExerciseResult({
  score,
  correct,
  total,
  xpEarned,
  lessonTitle,
  onRetry,
  onBack,
  onContinue,
}: Props) {
  const getMessage = () => {
    if (score >= 90) return { text: 'Outstanding!', sub: "You've mastered this grammar rule." };
    if (score >= 75) return { text: 'Great job!', sub: "You're getting the hang of it." };
    if (score >= 60) return { text: 'Good progress!', sub: 'Keep practicing to strengthen your understanding.' };
    if (score >= 40) return { text: 'Keep going!', sub: 'Review the lesson and try again.' };
    return { text: "Don't give up!", sub: 'Read through the lesson carefully and practice again.' };
  };

  const message = getMessage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 text-center"
    >
      {/* Score ring */}
      <div className="flex flex-col items-center gap-3">
        <ProgressRing
          progress={score}
          size={120}
          strokeWidth={8}
          color={score >= 75 ? 'stroke-emerald-500' : score >= 50 ? 'stroke-amber-500' : 'stroke-red-500'}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-warm-800 dark:text-warm-100">
              {score}%
            </div>
          </div>
        </ProgressRing>

        <div>
          <h2 className="text-xl font-bold text-warm-800 dark:text-warm-100">
            {message.text}
          </h2>
          <p className="text-sm text-warm-500 dark:text-warm-400 mt-1">
            {message.sub}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white dark:bg-warm-800 rounded-2xl border border-warm-200 dark:border-warm-700 p-4">
        <h3 className="text-sm font-semibold text-warm-800 dark:text-warm-100 mb-3">
          {lessonTitle}
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold text-warm-800 dark:text-warm-100">
              {correct}/{total}
            </p>
            <p className="text-xs text-warm-400">Correct</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-warm-800 dark:text-warm-100">
              {score}%
            </p>
            <p className="text-xs text-warm-400">Accuracy</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <Trophy size={16} className="text-amber-500" />
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                +{xpEarned}
              </p>
            </div>
            <p className="text-xs text-warm-400">XP earned</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button onClick={onRetry} className="w-full" variant="primary">
          <RotateCcw size={16} className="mr-2" />
          Practice Again
        </Button>
        {onContinue && (
          <Button onClick={onContinue} className="w-full" variant="secondary">
            Next Lesson <ArrowRight size={16} className="ml-1" />
          </Button>
        )}
        <Button onClick={onBack} className="w-full" variant="ghost">
          <Home size={16} className="mr-2" />
          Back to Grammar
        </Button>
      </div>
    </motion.div>
  );
}
