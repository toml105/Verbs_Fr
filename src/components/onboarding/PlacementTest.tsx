import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { verbs } from '../../data/verbs';
import { conjugations } from '../../data/conjugations';
import { PRONOUNS, shuffleArray } from '../../lib/utils';
import ProgressBar from '../ui/ProgressBar';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface PlacementTestProps {
  onComplete: (level: 'beginner' | 'intermediate' | 'advanced') => void;
  onSkip: () => void;
}

interface TestQuestion {
  verbId: string;
  tense: string;
  personIndex: number;
  correctAnswer: string;
  options: string[];
  difficulty: number;
}

function generatePlacementQuestions(): TestQuestion[] {
  const questions: TestQuestion[] = [];
  const tensesByDiff: Record<number, string[]> = {
    1: ['PRESENT'],
    2: ['PASSE_COMPOSE', 'IMPARFAIT', 'FUTUR_SIMPLE'],
    3: ['SUBJONCTIF_PRESENT', 'CONDITIONNEL_PRESENT'],
  };

  // 5 easy, 5 medium, 5 hard
  for (const [diff, tenses] of Object.entries(tensesByDiff)) {
    const d = Number(diff);
    const targetVerbs = verbs.filter(v => v.difficulty <= d);

    for (let i = 0; i < 5; i++) {
      const verb = targetVerbs[Math.floor(Math.random() * targetVerbs.length)];
      const tense = tenses[Math.floor(Math.random() * tenses.length)];
      const verbConj = conjugations[verb.id];
      if (!verbConj?.[tense]) { i--; continue; }

      const forms = verbConj[tense];
      const validPersons = forms.map((f, idx) => f ? idx : -1).filter(idx => idx >= 0);
      if (validPersons.length === 0) { i--; continue; }

      const person = validPersons[Math.floor(Math.random() * validPersons.length)];
      const correct = forms[person];

      const distractors: string[] = [];
      const others = shuffleArray(verbs.filter(v => v.id !== verb.id));
      for (const other of others) {
        if (distractors.length >= 3) break;
        const otherConj = conjugations[other.id];
        if (otherConj?.[tense]?.[person] && otherConj[tense][person] !== correct) {
          distractors.push(otherConj[tense][person]);
        }
      }

      if (distractors.length < 2) { i--; continue; }

      questions.push({
        verbId: verb.id,
        tense,
        personIndex: person,
        correctAnswer: correct,
        options: shuffleArray([correct, ...distractors.slice(0, 3)]),
        difficulty: d,
      });
    }
  }

  return questions;
}

export default function PlacementTest({ onComplete, onSkip }: PlacementTestProps) {
  const questions = useMemo(() => generatePlacementQuestions(), []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctByDiff, setCorrectByDiff] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0 });
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleAnswer = (option: string) => {
    if (showResult) return;
    setSelectedOption(option);
    setShowResult(true);

    const q = questions[currentIndex];
    if (option === q.correctAnswer) {
      setCorrectByDiff(prev => ({ ...prev, [q.difficulty]: prev[q.difficulty] + 1 }));
    }

    setTimeout(() => {
      setShowResult(false);
      setSelectedOption(null);
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Determine level
        const easy = correctByDiff[1] + (option === questions[currentIndex].correctAnswer && questions[currentIndex].difficulty === 1 ? 1 : 0);
        const medium = correctByDiff[2] + (option === questions[currentIndex].correctAnswer && questions[currentIndex].difficulty === 2 ? 1 : 0);
        const hard = correctByDiff[3] + (option === questions[currentIndex].correctAnswer && questions[currentIndex].difficulty === 3 ? 1 : 0);

        if (hard >= 3) onComplete('advanced');
        else if (medium >= 3) onComplete('intermediate');
        else onComplete('beginner');
      }
    }, 1200);
  };

  const q = questions[currentIndex];
  if (!q) return null;

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const tenseName = q.tense.replace(/_/g, ' ').toLowerCase();

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-900 px-6 py-8 flex flex-col max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-warm-500">
          {currentIndex + 1} / {questions.length}
        </span>
        <button
          onClick={onSkip}
          className="text-sm text-warm-400 hover:text-warm-600"
        >
          Skip test
        </button>
      </div>

      <ProgressBar progress={progress} height="h-1.5" />

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 flex-1"
      >
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2.5 py-1 rounded-full bg-coral-50 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 text-xs font-medium">
              {tenseName}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-warm-100 dark:bg-warm-700 text-warm-500 text-xs">
              {PRONOUNS[q.personIndex]}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-warm-800 dark:text-warm-100 mb-1">
            Conjugate the verb
          </h3>
          <p className="text-coral-500 font-bold text-xl mb-6">{q.verbId}</p>

          <div className="space-y-2">
            {q.options.map((option) => {
              let style = 'bg-warm-50 dark:bg-warm-700/50 border-warm-200 dark:border-warm-600';
              if (showResult) {
                if (option === q.correctAnswer) {
                  style = 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-400';
                } else if (option === selectedOption) {
                  style = 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400';
                }
              } else if (option === selectedOption) {
                style = 'bg-coral-50 dark:bg-coral-900/30 border-coral-500';
              }

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={showResult}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-warm-700 dark:text-warm-200 font-medium ${style}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
