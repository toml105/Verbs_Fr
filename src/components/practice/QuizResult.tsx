import { motion } from 'framer-motion';
import { Trophy, Target, TrendingUp, RotateCcw, Home } from 'lucide-react';
import type { QuizAnswer } from '../../types';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface QuizResultProps {
  answers: QuizAnswer[];
  onRestart: () => void;
  onHome: () => void;
}

export default function QuizResult({ answers, onRestart, onHome }: QuizResultProps) {
  const total = answers.length;
  const correct = answers.filter((a) => a.isCorrect).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const getMessage = () => {
    if (accuracy >= 90) return { emoji: '🎉', text: 'Outstanding!', sub: 'You really know your verbs!' };
    if (accuracy >= 70) return { emoji: '💪', text: 'Great job!', sub: 'Keep up the good work!' };
    if (accuracy >= 50) return { emoji: '👍', text: 'Good effort!', sub: 'Practice makes perfect.' };
    return { emoji: '📚', text: 'Keep learning!', sub: "Every attempt helps you improve." };
  };

  const message = getMessage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      {/* Score card */}
      <Card padding="lg" className="text-center">
        <div className="text-5xl mb-3">{message.emoji}</div>
        <h2 className="text-2xl font-bold text-warm-800 dark:text-warm-100">
          {message.text}
        </h2>
        <p className="text-warm-500 dark:text-warm-400 mt-1">{message.sub}</p>

        <div className="flex items-center justify-center gap-8 mt-6">
          <div className="text-center">
            <div className="flex items-center gap-1.5 text-emerald-500">
              <Target size={18} />
              <span className="text-2xl font-bold">{accuracy}%</span>
            </div>
            <p className="text-xs text-warm-400 mt-0.5">Accuracy</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1.5 text-coral-500">
              <Trophy size={18} />
              <span className="text-2xl font-bold">{correct}/{total}</span>
            </div>
            <p className="text-xs text-warm-400 mt-0.5">Correct</p>
          </div>
        </div>
      </Card>

      {/* Missed verbs */}
      {answers.some((a) => !a.isCorrect) && (
        <Card>
          <h3 className="font-semibold text-warm-700 dark:text-warm-200 mb-3 flex items-center gap-2">
            <TrendingUp size={16} />
            Review these
          </h3>
          <div className="space-y-2">
            {answers
              .filter((a) => !a.isCorrect)
              .map((a, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-2 px-3 rounded-lg bg-warm-50 dark:bg-warm-700/50"
                >
                  <div>
                    <span className="font-medium text-warm-800 dark:text-warm-100">
                      {a.question.verbId}
                    </span>
                    <span className="text-warm-400 mx-2">→</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      {a.question.correctAnswer}
                    </span>
                  </div>
                  <span className="text-xs text-warm-400">
                    {a.question.tense.replace(/_/g, ' ').toLowerCase()}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onHome} className="flex-1" size="lg">
          <Home size={18} className="mr-2" />
          Home
        </Button>
        <Button onClick={onRestart} className="flex-1" size="lg">
          <RotateCcw size={18} className="mr-2" />
          Practice Again
        </Button>
      </div>
    </motion.div>
  );
}
