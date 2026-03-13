import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, Lightbulb } from 'lucide-react';
import Button from '../ui/Button';
import type { GrammarExercise } from '../../types';

interface Props {
  exercise: GrammarExercise;
  onAnswer: (isCorrect: boolean) => void;
  questionNumber: number;
  totalQuestions: number;
}

export default function GrammarExerciseCard({ exercise, onAnswer, questionNumber, totalQuestions }: Props) {
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [orderedWords, setOrderedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUserAnswer('');
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setShowExplanation(false);
    if (exercise.type === 'reorder' && exercise.words) {
      setAvailableWords([...exercise.words]);
      setOrderedWords([]);
    }
    // Focus input for text-entry types
    if (['fill-blank', 'translation', 'rule-application', 'error-correction'].includes(exercise.type)) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [exercise]);

  const normalizeAnswer = (s: string) =>
    s.trim().toLowerCase()
      .replace(/[\u2019\u2018']/g, "'")
      .replace(/\s+/g, ' ')
      .replace(/[.!?;,]+$/, '');

  const checkAnswer = () => {
    if (isAnswered) return;

    let answer = '';
    if (exercise.type === 'multiple-choice') {
      answer = selectedOption ?? '';
    } else if (exercise.type === 'reorder') {
      answer = orderedWords.join(' ');
    } else {
      answer = userAnswer;
    }

    const correct = normalizeAnswer(answer) === normalizeAnswer(exercise.correctAnswer);
    setIsCorrect(correct);
    setIsAnswered(true);
  };

  const handleNext = () => {
    onAnswer(isCorrect);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isAnswered) handleNext();
      else checkAnswer();
    }
  };

  const addWord = (word: string, idx: number) => {
    setOrderedWords(prev => [...prev, word]);
    setAvailableWords(prev => prev.filter((_, i) => i !== idx));
  };

  const removeWord = (word: string, idx: number) => {
    setAvailableWords(prev => [...prev, word]);
    setOrderedWords(prev => prev.filter((_, i) => i !== idx));
  };

  const canSubmit = () => {
    if (exercise.type === 'multiple-choice') return selectedOption !== null;
    if (exercise.type === 'reorder') return orderedWords.length > 0 && availableWords.length === 0;
    return userAnswer.trim().length > 0;
  };

  const typeLabel = {
    'fill-blank': 'Fill in the blank',
    'multiple-choice': 'Choose the correct answer',
    'error-correction': 'Fix the error',
    'reorder': 'Put the words in order',
    'translation': 'Translate to French',
    'rule-application': 'Apply the rule',
  }[exercise.type];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={exercise.id}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        className="space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-warm-400">
            {questionNumber} of {totalQuestions}
          </span>
          <span className="text-xs font-medium text-warm-400 px-2 py-1 bg-warm-100 dark:bg-warm-800 rounded-full">
            {typeLabel}
          </span>
        </div>

        {/* Prompt */}
        <div className="bg-white dark:bg-warm-800 rounded-2xl border border-warm-200 dark:border-warm-700 p-4">
          <p className="text-warm-800 dark:text-warm-100 font-medium leading-relaxed">
            {exercise.prompt}
          </p>
          {exercise.hint && !isAnswered && (
            <p className="text-xs text-warm-400 mt-2 flex items-center gap-1">
              <Lightbulb size={12} />
              {exercise.hint}
            </p>
          )}
        </div>

        {/* Answer Area */}
        {exercise.type === 'multiple-choice' && exercise.options && (
          <div className="grid grid-cols-1 gap-2">
            {exercise.options.map((option) => {
              let btnClass = 'w-full text-left p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ';
              if (isAnswered) {
                if (option === exercise.correctAnswer) {
                  btnClass += 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
                } else if (option === selectedOption && !isCorrect) {
                  btnClass += 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300';
                } else {
                  btnClass += 'border-warm-200 dark:border-warm-700 text-warm-400 opacity-50';
                }
              } else if (option === selectedOption) {
                btnClass += 'border-coral-500 bg-coral-50 dark:bg-coral-900/30 text-coral-700 dark:text-coral-300';
              } else {
                btnClass += 'border-warm-200 dark:border-warm-700 text-warm-700 dark:text-warm-200 hover:border-warm-300 dark:hover:border-warm-600';
              }

              return (
                <button
                  key={option}
                  onClick={() => !isAnswered && setSelectedOption(option)}
                  className={btnClass}
                  disabled={isAnswered}
                >
                  {option}
                </button>
              );
            })}
          </div>
        )}

        {exercise.type === 'reorder' && (
          <div className="space-y-3">
            {/* Answer area */}
            <div className="min-h-[52px] p-3 rounded-xl border-2 border-dashed border-warm-300 dark:border-warm-600 bg-warm-50 dark:bg-warm-800/50 flex flex-wrap gap-2">
              {orderedWords.length === 0 && (
                <span className="text-xs text-warm-400">Tap words below to build the sentence...</span>
              )}
              {orderedWords.map((word, idx) => (
                <button
                  key={`ordered-${idx}`}
                  onClick={() => !isAnswered && removeWord(word, idx)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isAnswered
                      ? isCorrect
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      : 'bg-coral-100 dark:bg-coral-900/30 text-coral-700 dark:text-coral-300'
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>
            {/* Available words */}
            <div className="flex flex-wrap gap-2">
              {availableWords.map((word, idx) => (
                <button
                  key={`available-${idx}`}
                  onClick={() => !isAnswered && addWord(word, idx)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-200 hover:bg-warm-200 dark:hover:bg-warm-600 transition-all"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {['fill-blank', 'translation', 'rule-application', 'error-correction'].includes(exercise.type) && (
          <input
            ref={inputRef}
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              exercise.type === 'fill-blank' ? 'Type the missing word(s)...' :
              exercise.type === 'translation' ? 'Type the French translation...' :
              exercise.type === 'error-correction' ? 'Type the corrected sentence...' :
              'Type your answer...'
            }
            disabled={isAnswered}
            className={`w-full p-3 rounded-xl border-2 text-sm font-medium transition-all outline-none ${
              isAnswered
                ? isCorrect
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                : 'border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-800 text-warm-800 dark:text-warm-100 focus:border-coral-500 focus:ring-2 focus:ring-coral-500/20'
            }`}
          />
        )}

        {/* Result feedback */}
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-4 ${
              isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <Check size={18} className="text-emerald-500" />
              ) : (
                <X size={18} className="text-red-500" />
              )}
              <span className={`font-semibold text-sm ${
                isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'
              }`}>
                {isCorrect ? 'Correct!' : 'Not quite'}
              </span>
            </div>
            {!isCorrect && (
              <p className="text-sm text-warm-600 dark:text-warm-300 mb-2">
                Correct answer: <span className="font-semibold">{exercise.correctAnswer}</span>
              </p>
            )}
            {/* Explanation toggle */}
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-xs text-warm-500 hover:text-warm-700 dark:hover:text-warm-300 font-medium underline"
            >
              {showExplanation ? 'Hide explanation' : 'Why?'}
            </button>
            {showExplanation && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-xs text-warm-600 dark:text-warm-400 mt-2 leading-relaxed"
              >
                {exercise.explanation}
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Action button */}
        {!isAnswered ? (
          <Button
            onClick={checkAnswer}
            disabled={!canSubmit()}
            className="w-full"
          >
            Check
          </Button>
        ) : (
          <Button onClick={handleNext} className="w-full">
            Continue <ArrowRight size={16} className="ml-1" />
          </Button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
