import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { QuizQuestion } from '../../types';
import { checkAnswer, PRONOUNS } from '../../lib/utils';
import { TENSES } from '../../data/tenses';
import Button from '../ui/Button';

interface QuizCardProps {
  question: QuizQuestion;
  onAnswer: (answer: string, isCorrect: boolean) => void;
}

export default function QuizCard({ question, onAnswer }: QuizCardProps) {
  const [userInput, setUserInput] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const tenseName = TENSES.find(t => t.key === question.tense)?.frenchName ?? question.tense;

  useEffect(() => {
    setUserInput('');
    setSelectedOption(null);
    setShowResult(false);
    setIsCorrect(false);
    if (question.type !== 'multiple-choice') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [question]);

  const handleSubmit = () => {
    if (showResult) return;

    const answer = question.type === 'multiple-choice' ? (selectedOption ?? '') : userInput;
    const correct = checkAnswer(answer, question.correctAnswer);

    setIsCorrect(correct);
    setShowResult(true);

    setTimeout(() => {
      onAnswer(answer, correct);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userInput.trim()) {
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="bg-white dark:bg-warm-800 rounded-2xl p-6 shadow-sm border border-warm-100 dark:border-warm-700"
    >
      {/* Tense & verb info */}
      <div className="flex items-center gap-2 mb-4">
        <span className="px-2.5 py-1 rounded-full bg-coral-50 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 text-xs font-medium">
          {tenseName}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-warm-100 dark:bg-warm-700 text-warm-500 text-xs">
          {PRONOUNS[question.personIndex]}
        </span>
      </div>

      {/* Prompt */}
      <h3 className="text-lg font-semibold text-warm-800 dark:text-warm-100 mb-2">
        {question.type === 'fill-blank' ? 'Complete the sentence' : 'Conjugate the verb'}
      </h3>

      {question.type === 'fill-blank' && question.sentenceTemplate ? (
        <p className="text-warm-600 dark:text-warm-300 text-base mb-4 leading-relaxed">
          {question.sentenceTemplate}
        </p>
      ) : (
        <p className="text-warm-600 dark:text-warm-300 mb-4">
          <span className="font-semibold text-coral-500">{question.verbId}</span>
          <span className="text-warm-400 ml-2">({question.hint})</span>
        </p>
      )}

      {/* Answer area */}
      {question.type === 'multiple-choice' && question.options ? (
        <div className="space-y-2 mb-4">
          {question.options.map((option) => {
            let optionStyle = 'bg-warm-50 dark:bg-warm-700/50 border-warm-200 dark:border-warm-600 hover:border-coral-300';
            if (showResult) {
              if (option === question.correctAnswer) {
                optionStyle = 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-400';
              } else if (option === selectedOption && !isCorrect) {
                optionStyle = 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400';
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
      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-xl mb-4 ${
            isCorrect
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
          }`}
        >
          {isCorrect ? (
            <p className="font-medium">Correct!</p>
          ) : (
            <div>
              <p className="font-medium">Not quite.</p>
              <p className="text-sm mt-1">
                Correct answer: <strong>{question.correctAnswer}</strong>
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Submit button */}
      {!showResult && (
        <Button
          onClick={handleSubmit}
          disabled={
            question.type === 'multiple-choice'
              ? !selectedOption
              : !userInput.trim()
          }
          className="w-full"
          size="lg"
        >
          Check Answer
        </Button>
      )}
    </motion.div>
  );
}
