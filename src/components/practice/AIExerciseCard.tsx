import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import type { AIExercise } from '../../lib/aiExerciseGenerator';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface AIExerciseCardProps {
  exercise: AIExercise;
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
}

export default function AIExerciseCard({ exercise, onAnswer, onNext }: AIExerciseCardProps) {
  const [userInput, setUserInput] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when exercise changes
  useEffect(() => {
    setUserInput('');
    setSelectedOption(null);
    setShowResult(false);
    setIsCorrect(false);
    setShowHint(false);
    if (exercise.type !== 'multiple-choice') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [exercise.id, exercise.type]);

  const checkAnswer = () => {
    if (showResult) return;

    const answer = exercise.type === 'multiple-choice' ? (selectedOption ?? '') : userInput;
    const correct = answer.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();

    setIsCorrect(correct);
    setShowResult(true);
    onAnswer(correct);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userInput.trim()) {
      checkAnswer();
    }
  };

  const typeLabel: Record<AIExercise['type'], string> = {
    'fill-blank': 'Fill in the Blank',
    'translation': 'Translation',
    'error-correction': 'Error Correction',
    'multiple-choice': 'Multiple Choice',
  };

  const typeBg: Record<AIExercise['type'], string> = {
    'fill-blank': 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
    'translation': 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    'error-correction': 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    'multiple-choice': 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden">
        {/* Type badge */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeBg[exercise.type]}`}>
            {typeLabel[exercise.type]}
          </span>
          {exercise.hint && !showResult && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1 text-xs text-warm-400 hover:text-amber-500 transition-colors"
            >
              <Lightbulb size={14} />
              Hint
            </button>
          )}
        </div>

        {/* Hint */}
        <AnimatePresence>
          {showHint && exercise.hint && !showResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3"
            >
              <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
                {exercise.hint}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prompt */}
        <h3 className="text-lg font-semibold text-warm-800 dark:text-warm-100 mb-4 leading-relaxed">
          {exercise.prompt}
        </h3>

        {/* Answer area */}
        {exercise.type === 'multiple-choice' && exercise.options ? (
          <div className="space-y-2 mb-4">
            {exercise.options.map((option) => {
              let optionStyle =
                'bg-warm-50 dark:bg-warm-700/50 border-warm-200 dark:border-warm-600 hover:border-coral-300 dark:hover:border-coral-500';

              if (showResult) {
                if (option === exercise.correctAnswer) {
                  optionStyle =
                    'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-400';
                } else if (option === selectedOption && !isCorrect) {
                  optionStyle =
                    'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400';
                } else {
                  optionStyle = 'bg-warm-50 dark:bg-warm-700/50 border-warm-200 dark:border-warm-600 opacity-50';
                }
              } else if (option === selectedOption) {
                optionStyle = 'bg-coral-50 dark:bg-coral-900/30 border-coral-500';
              }

              return (
                <button
                  key={option}
                  onClick={() => {
                    if (!showResult) setSelectedOption(option);
                  }}
                  disabled={showResult}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-warm-700 dark:text-warm-200 font-medium ${optionStyle}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mb-4">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={showResult}
              placeholder="Type your answer..."
              autoComplete="off"
              autoCapitalize="off"
              className={`w-full px-4 py-3 rounded-xl border-2 text-lg font-medium transition-all focus:outline-none ${
                showResult
                  ? isCorrect
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  : 'border-warm-200 dark:border-warm-600 bg-warm-50 dark:bg-warm-700/50 text-warm-800 dark:text-warm-100 focus:border-coral-500 focus:ring-2 focus:ring-coral-500/20'
              }`}
            />
          </div>
        )}

        {/* Result feedback */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl mb-4 ${
                isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-900/20'
                  : 'bg-red-50 dark:bg-red-900/20'
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle size={22} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle size={22} className="text-red-500 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p
                    className={`font-semibold ${
                      isCorrect
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-red-700 dark:text-red-400'
                    }`}
                  >
                    {isCorrect ? 'Correct!' : 'Not quite right'}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      Correct answer: <strong>{exercise.correctAnswer}</strong>
                    </p>
                  )}
                  {exercise.explanation && (
                    <p className="text-sm text-warm-600 dark:text-warm-400 mt-2">
                      {exercise.explanation}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        {!showResult ? (
          <Button
            onClick={checkAnswer}
            disabled={
              exercise.type === 'multiple-choice' ? !selectedOption : !userInput.trim()
            }
            className="w-full"
            size="lg"
          >
            Check Answer
          </Button>
        ) : (
          <Button onClick={onNext} className="w-full" size="lg">
            Next
          </Button>
        )}
      </Card>
    </motion.div>
  );
}
