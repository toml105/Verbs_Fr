import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Dumbbell, Sparkles, BookOpen, Shuffle } from 'lucide-react';
import { verbs } from '../data/verbs';
import { TENSES } from '../data/tenses';
import { useProgress } from '../context/UserProgressContext';
import { generateQuizQuestions, generateReviewQuestions } from '../lib/quizEngine';
import { gradeFromUI } from '../lib/srs';
import type { QuizAnswer, QuizQuestion } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import QuizCard from '../components/practice/QuizCard';
import QuizResult from '../components/practice/QuizResult';

type PracticeMode = 'select' | 'quiz' | 'result';

export default function Practice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { recordAnswer, getDueItems } = useProgress();

  const [mode, setMode] = useState<PracticeMode>('select');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedTense, setSelectedTense] = useState<string>('PRESENT');

  const preselectedVerb = searchParams.get('verb');
  const preselectedMode = searchParams.get('mode');

  const startQuiz = useCallback(
    (quizQuestions: QuizQuestion[]) => {
      if (quizQuestions.length === 0) return;
      setQuestions(quizQuestions);
      setCurrentIndex(0);
      setAnswers([]);
      setMode('quiz');
    },
    []
  );

  const startReview = useCallback(() => {
    const dueItems = getDueItems();
    const qs = generateReviewQuestions(dueItems, verbs, verbs, 10);
    if (qs.length === 0) {
      // Nothing to review - start random practice
      startRandomPractice();
      return;
    }
    startQuiz(qs);
  }, [getDueItems, startQuiz]);

  const startTensePractice = useCallback(
    (tense: string) => {
      const targetVerbs = preselectedVerb
        ? verbs.filter((v) => v.id === preselectedVerb)
        : verbs.slice(0, 50);
      const qs = generateQuizQuestions(targetVerbs, [tense], 10, verbs);
      startQuiz(qs);
    },
    [preselectedVerb, startQuiz]
  );

  const startVerbPractice = useCallback(() => {
    if (!preselectedVerb) return;
    const verb = verbs.filter((v) => v.id === preselectedVerb);
    const tenseKeys = TENSES.map((t) => t.key);
    const qs = generateQuizQuestions(verb, tenseKeys, 10, verbs);
    startQuiz(qs);
  }, [preselectedVerb, startQuiz]);

  const startRandomPractice = useCallback(() => {
    const randomVerbs = verbs.sort(() => Math.random() - 0.5).slice(0, 20);
    const tenseKeys = TENSES.filter((t) => t.difficulty <= 2).map((t) => t.key);
    const qs = generateQuizQuestions(randomVerbs, tenseKeys, 10, verbs);
    startQuiz(qs);
  }, [startQuiz]);

  // Auto-start if mode specified
  useMemo(() => {
    if (preselectedMode === 'review' && mode === 'select') {
      startReview();
    } else if (preselectedVerb && !preselectedMode && mode === 'select') {
      startVerbPractice();
    }
  }, []);

  const handleAnswer = useCallback(
    (answer: string, isCorrect: boolean) => {
      const question = questions[currentIndex];
      const quizAnswer: QuizAnswer = {
        question,
        userAnswer: answer,
        isCorrect,
        timeSpent: 0,
      };

      setAnswers((prev) => [...prev, quizAnswer]);

      // Record SRS
      const grade = gradeFromUI(isCorrect ? 'good' : 'again');
      recordAnswer(question.verbId, question.tense, grade);

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setMode('result');
      }
    },
    [questions, currentIndex, recordAnswer]
  );

  if (mode === 'quiz') {
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMode('select')}
            className="flex items-center gap-1.5 text-warm-500 hover:text-warm-700 dark:hover:text-warm-300"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-sm text-warm-500">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <ProgressBar progress={progress} height="h-1.5" />

        <AnimatePresence mode="wait">
          <QuizCard
            key={currentIndex}
            question={questions[currentIndex]}
            onAnswer={handleAnswer}
          />
        </AnimatePresence>
      </div>
    );
  }

  if (mode === 'result') {
    return (
      <div className="space-y-4">
        <QuizResult
          answers={answers}
          onRestart={() => {
            setMode('select');
          }}
          onHome={() => navigate('/')}
        />
      </div>
    );
  }

  // Mode selection
  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100">
          Practice
        </h1>
        <p className="text-warm-500 dark:text-warm-400 mt-1">
          Choose your practice mode
        </p>
      </motion.div>

      {/* Quick modes */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card hover padding="md" className="h-full" onClick={startReview}>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 w-fit mb-2">
              <Sparkles size={20} className="text-amber-500" />
            </div>
            <p className="font-semibold text-warm-800 dark:text-warm-100">SRS Review</p>
            <p className="text-xs text-warm-500 mt-0.5">Due items first</p>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card hover padding="md" className="h-full" onClick={startRandomPractice}>
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-900/30 w-fit mb-2">
              <Shuffle size={20} className="text-violet-500" />
            </div>
            <p className="font-semibold text-warm-800 dark:text-warm-100">Random Mix</p>
            <p className="text-xs text-warm-500 mt-0.5">Surprise me</p>
          </Card>
        </motion.div>
      </div>

      {/* Practice by tense */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <h2 className="font-semibold text-warm-800 dark:text-warm-100 mb-3 flex items-center gap-2">
            <BookOpen size={18} />
            Practice by Tense
          </h2>
          <div className="space-y-1.5">
            {TENSES.map((tense) => (
              <button
                key={tense.key}
                onClick={() => startTensePractice(tense.key)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-warm-50 dark:hover:bg-warm-700/50 transition-colors text-left"
              >
                <div>
                  <span className="font-medium text-warm-700 dark:text-warm-200">
                    {tense.frenchName}
                  </span>
                  <span className="text-sm text-warm-400 ml-2">
                    {tense.englishName}
                  </span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    tense.difficulty === 1
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : tense.difficulty === 2
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-coral-50 text-coral-600 dark:bg-coral-900/30 dark:text-coral-400'
                  }`}
                >
                  {tense.difficulty === 1 ? 'Easy' : tense.difficulty === 2 ? 'Medium' : 'Hard'}
                </span>
              </button>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
