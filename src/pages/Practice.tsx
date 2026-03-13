import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, BookOpen, Shuffle, Timer, AlertTriangle, Ear, Mic, MessageCircle, Brain } from 'lucide-react';
import { verbs } from '../data/verbs';
import { TENSES } from '../data/tenses';
import { useProgress } from '../context/UserProgressContext';
import { useAI } from '../context/AIContext';
import { analyzeWeaknesses } from '../lib/weaknessAnalyzer';
import { generateQuizQuestions, generateReviewQuestions } from '../lib/quizEngine';
import { gradeFromUI } from '../lib/srs';
import type { QuizAnswer, QuizQuestion } from '../types';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import QuizCard from '../components/practice/QuizCard';
import QuizResult from '../components/practice/QuizResult';
import SpeedDrill from '../components/practice/SpeedDrill';

type PracticeMode = 'select' | 'quiz' | 'result' | 'speed-drill' | 'confusing-pairs';

export default function Practice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userData, recordAnswer, getDueItems, recordPerfectSession, recordSpeedDrill } = useProgress();
  const { isOllamaAvailable } = useAI();

  // Get quick weakness summary for Smart Practice card
  const weaknessSummary = useMemo(() => {
    const report = analyzeWeaknesses(userData);
    const focus = report.recommendedFocus.slice(0, 2);
    return focus.length > 0 ? focus.join(', ') : 'personalized exercises';
  }, [userData]);

  const [mode, setMode] = useState<PracticeMode>('select');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);

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

      const grade = gradeFromUI(isCorrect ? 'good' : 'again');
      recordAnswer(question.verbId, question.tense, grade, question.type);

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Check for perfect session
        const allAnswers = [...answers, quizAnswer];
        if (allAnswers.length >= 10 && allAnswers.every(a => a.isCorrect)) {
          recordPerfectSession();
        }
        setMode('result');
      }
    },
    [questions, currentIndex, recordAnswer, answers, recordPerfectSession]
  );

  const handleSpeedDrillFinish = useCallback((score: number, correct: number, total: number) => {
    recordSpeedDrill(score);
  }, [recordSpeedDrill]);

  if (mode === 'speed-drill') {
    return (
      <SpeedDrill
        onFinish={handleSpeedDrillFinish}
        onBack={() => setMode('select')}
      />
    );
  }

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

      {/* Smart Practice - AI-powered */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card hover padding="md" onClick={() => navigate('/smart-practice')}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-coral-50 to-violet-50 dark:from-coral-900/30 dark:to-violet-900/30">
              <Brain size={22} className="text-coral-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-warm-800 dark:text-warm-100">Smart Practice</p>
                {isOllamaAvailable && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-violet-100 to-coral-100 dark:from-violet-900/40 dark:to-coral-900/40 text-violet-600 dark:text-violet-400 uppercase tracking-wide">
                    AI
                  </span>
                )}
              </div>
              <p className="text-xs text-warm-500 mt-0.5 truncate">
                Focus: {weaknessSummary}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick modes - 2x2 grid */}
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card hover padding="md" className="h-full" onClick={() => setMode('speed-drill')}>
            <div className="p-2 rounded-xl bg-red-50 dark:bg-red-900/30 w-fit mb-2">
              <Timer size={20} className="text-red-500" />
            </div>
            <p className="font-semibold text-warm-800 dark:text-warm-100">Speed Drill</p>
            <p className="text-xs text-warm-500 mt-0.5">60s challenge</p>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card hover padding="md" className="h-full" onClick={() => navigate('/confusing-pairs')}>
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-900/30 w-fit mb-2">
              <AlertTriangle size={20} className="text-orange-500" />
            </div>
            <p className="font-semibold text-warm-800 dark:text-warm-100">Tricky Pairs</p>
            <p className="text-xs text-warm-500 mt-0.5">Savoir vs connaître</p>
          </Card>
        </motion.div>
      </div>

      {/* Speaking & Listening */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
        <h2 className="text-sm font-semibold text-warm-500 dark:text-warm-400 mb-2 uppercase tracking-wide">
          Speaking & Listening
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <Card hover padding="md" className="h-full" onClick={() => navigate('/listening')}>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 w-fit mb-2">
              <Ear size={20} className="text-blue-500" />
            </div>
            <p className="font-semibold text-warm-800 dark:text-warm-100 text-sm">Listen</p>
            <p className="text-xs text-warm-500 mt-0.5">Train your ear</p>
          </Card>
          <Card hover padding="md" className="h-full" onClick={() => navigate('/speaking')}>
            <div className="p-2 rounded-xl bg-coral-50 dark:bg-coral-900/30 w-fit mb-2">
              <Mic size={20} className="text-coral-500" />
            </div>
            <p className="font-semibold text-warm-800 dark:text-warm-100 text-sm">Speak</p>
            <p className="text-xs text-warm-500 mt-0.5">Pronunciation</p>
          </Card>
          <Card hover padding="md" className="h-full" onClick={() => navigate('/conversations')}>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 w-fit mb-2">
              <MessageCircle size={20} className="text-emerald-500" />
            </div>
            <p className="font-semibold text-warm-800 dark:text-warm-100 text-sm">Chat</p>
            <p className="text-xs text-warm-500 mt-0.5">Dialogues</p>
          </Card>
        </div>
      </motion.div>

      {/* Practice by tense */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
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
