import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Zap, Trophy, RotateCcw, Home } from 'lucide-react';
import { verbs } from '../../data/verbs';
import { conjugations } from '../../data/conjugations';
import { TENSES } from '../../data/tenses';
import { PRONOUNS, shuffleArray } from '../../lib/utils';
import { calculateXPForAnswer } from '../../lib/xp';
import { useProgress } from '../../context/UserProgressContext';
import { gradeFromUI } from '../../lib/srs';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface SpeedQuestion {
  verbId: string;
  tense: string;
  personIndex: number;
  correctAnswer: string;
  options: string[];
}

function generateSpeedQuestions(count: number): SpeedQuestion[] {
  const questions: SpeedQuestion[] = [];
  const easyTenses = TENSES.filter(t => t.difficulty <= 2).map(t => t.key);
  const easyVerbs = verbs.filter(v => v.difficulty <= 2);

  for (let i = 0; i < count; i++) {
    const verb = easyVerbs[Math.floor(Math.random() * easyVerbs.length)];
    const tense = easyTenses[Math.floor(Math.random() * easyTenses.length)];
    const verbConj = conjugations[verb.id];
    if (!verbConj?.[tense]) { i--; continue; }

    const forms = verbConj[tense];
    const validPersons = forms.map((f, idx) => f ? idx : -1).filter(idx => idx >= 0);
    if (validPersons.length === 0) { i--; continue; }

    const person = validPersons[Math.floor(Math.random() * validPersons.length)];
    const correct = forms[person];

    // Generate 3 distractors
    const distractors: string[] = [];
    const otherVerbs = shuffleArray(easyVerbs.filter(v => v.id !== verb.id));
    for (const other of otherVerbs) {
      if (distractors.length >= 3) break;
      const otherConj = conjugations[other.id];
      if (otherConj?.[tense]?.[person] && otherConj[tense][person] !== correct) {
        distractors.push(otherConj[tense][person]);
      }
    }

    // Pad if needed
    while (distractors.length < 3) {
      const otherPerson = validPersons[Math.floor(Math.random() * validPersons.length)];
      if (forms[otherPerson] && forms[otherPerson] !== correct && !distractors.includes(forms[otherPerson])) {
        distractors.push(forms[otherPerson]);
      } else break;
    }

    if (distractors.length < 2) { i--; continue; }

    questions.push({
      verbId: verb.id,
      tense,
      personIndex: person,
      correctAnswer: correct,
      options: shuffleArray([correct, ...distractors.slice(0, 3)]),
    });
  }

  return questions;
}

interface SpeedDrillProps {
  onFinish: (score: number, correct: number, total: number, xpEarned: number) => void;
  onBack: () => void;
}

export default function SpeedDrill({ onFinish, onBack }: SpeedDrillProps) {
  const { recordAnswer, userData } = useProgress();
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'done'>('countdown');
  const [countdownNum, setCountdownNum] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [questions] = useState(() => generateSpeedQuestions(100));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [combo, setCombo] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdownNum <= 0) {
      setPhase('playing');
      return;
    }
    const t = setTimeout(() => setCountdownNum(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdownNum]);

  // Game timer
  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setPhase('done');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase === 'done') {
      onFinish(score, correctCount, totalAnswered, xpEarned);
    }
  }, [phase]);

  const getComboMultiplier = () => {
    if (combo >= 7) return 3;
    if (combo >= 3) return 2;
    return 1;
  };

  const handleAnswer = useCallback((option: string) => {
    if (phase !== 'playing') return;
    const q = questions[currentIndex];
    const isCorrect = option === q.correctAnswer;

    setTotalAnswered(prev => prev + 1);

    if (isCorrect) {
      const multiplier = getComboMultiplier();
      const points = 10 * multiplier;
      setScore(prev => prev + points);
      setCorrectCount(prev => prev + 1);
      setCombo(prev => prev + 1);
      const xp = calculateXPForAnswer(true, combo, userData.stats.currentStreak);
      setXpEarned(prev => prev + xp);
      setLastResult('correct');

      const grade = gradeFromUI('good');
      recordAnswer(q.verbId, q.tense, grade);
    } else {
      setCombo(0);
      setLastResult('wrong');
      const xp = calculateXPForAnswer(false, 0, userData.stats.currentStreak);
      setXpEarned(prev => prev + xp);

      const grade = gradeFromUI('again');
      recordAnswer(q.verbId, q.tense, grade);
    }

    // Brief flash then next
    setTimeout(() => {
      setLastResult(null);
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setPhase('done');
      }
    }, 300);
  }, [phase, questions, currentIndex, combo, userData.stats.currentStreak, recordAnswer]);

  if (phase === 'countdown') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={countdownNum}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="text-7xl font-bold text-coral-500"
          >
            {countdownNum > 0 ? countdownNum : 'GO!'}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4"
      >
        <Card padding="lg" className="text-center">
          <div className="text-5xl mb-3">
            <Zap size={48} className="text-amber-500 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-warm-800 dark:text-warm-100">
            Speed Drill Complete!
          </h2>

          <div className="flex items-center justify-center gap-8 mt-6">
            <div className="text-center">
              <div className="flex items-center gap-1.5 text-amber-500">
                <Trophy size={18} />
                <span className="text-2xl font-bold">{score}</span>
              </div>
              <p className="text-xs text-warm-400 mt-0.5">Score</p>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-emerald-500">
                {correctCount}/{totalAnswered}
              </span>
              <p className="text-xs text-warm-400 mt-0.5">Correct</p>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-violet-500">
                +{xpEarned}
              </span>
              <p className="text-xs text-warm-400 mt-0.5">XP</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onBack} className="flex-1" size="lg">
            <Home size={18} className="mr-2" />
            Back
          </Button>
          <Button onClick={() => window.location.reload()} className="flex-1" size="lg">
            <RotateCcw size={18} className="mr-2" />
            Again
          </Button>
        </div>
      </motion.div>
    );
  }

  // Playing phase
  const q = questions[currentIndex];
  const timerColor = timeLeft <= 10 ? 'text-red-500' : timeLeft <= 20 ? 'text-amber-500' : 'text-emerald-500';
  const comboMultiplier = getComboMultiplier();

  return (
    <div className="space-y-4">
      {/* Timer + Score bar */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-warm-400 hover:text-warm-600 text-sm">
          Quit
        </button>
        <div className="flex items-center gap-4">
          {combo >= 3 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-sm font-bold text-amber-500"
            >
              {comboMultiplier}x
            </motion.span>
          )}
          <span className="font-bold text-warm-800 dark:text-warm-100">{score}</span>
          <div className={`flex items-center gap-1 ${timerColor} font-mono font-bold text-lg`}>
            <Timer size={18} />
            {timeLeft}s
          </div>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1.5 bg-warm-200 dark:bg-warm-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${timeLeft <= 10 ? 'bg-red-500' : timeLeft <= 20 ? 'bg-amber-500' : 'bg-emerald-500'}`}
          initial={{ width: '100%' }}
          animate={{ width: `${(timeLeft / 60) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
        >
          <Card
            padding="lg"
            className={`transition-colors duration-200 ${
              lastResult === 'correct' ? 'ring-2 ring-emerald-500' :
              lastResult === 'wrong' ? 'ring-2 ring-red-500' : ''
            }`}
          >
            <div className="text-center mb-4">
              <p className="text-sm text-warm-500">{PRONOUNS[q.personIndex]} · {TENSES.find(t => t.key === q.tense)?.frenchName ?? q.tense}</p>
              <h3 className="text-2xl font-bold text-coral-500 mt-1">{q.verbId}</h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {q.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className="px-4 py-3.5 rounded-xl border-2 border-warm-200 dark:border-warm-600 bg-warm-50 dark:bg-warm-700/50 text-warm-700 dark:text-warm-200 font-medium text-lg hover:border-coral-400 hover:bg-coral-50 dark:hover:bg-coral-900/20 transition-all active:scale-95"
                >
                  {option}
                </button>
              ))}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Combo indicator */}
      {combo > 0 && (
        <motion.div
          key={combo}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <span className="text-sm font-medium text-emerald-500">
            {combo} in a row! {combo >= 7 ? '🔥🔥🔥' : combo >= 3 ? '🔥' : ''}
          </span>
        </motion.div>
      )}
    </div>
  );
}
