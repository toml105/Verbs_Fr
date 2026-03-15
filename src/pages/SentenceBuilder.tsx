import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, PenTool, Languages, MessageSquare, Image, RotateCcw, Sparkles } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import ProgressRing from '../components/ui/ProgressRing';
import SentenceExercise, {
  type SentenceMode,
  type SentenceExerciseData,
  type SentenceResult,
} from '../components/practice/SentenceExercise';
import { useAI } from '../context/AIContext';
import { SYSTEM_PROMPTS } from '../lib/aiPrompts';
import { examples } from '../data/examples';
import { verbs } from '../data/verbs';
import { shuffleArray } from '../lib/utils';
import type { ChatMessage } from '../lib/aiClient';

type PageMode = 'select' | 'exercise' | 'result';

// Emoji scenes for describe mode
const EMOJI_SCENES = [
  { emojis: '🏖️☀️🏊', description: 'A day at the beach with swimming and sunshine' },
  { emojis: '🍳🥐☕', description: 'French breakfast with coffee and croissants' },
  { emojis: '🚂🏔️🌲', description: 'A train trip through mountains and forests' },
  { emojis: '🎭🎵🌙', description: 'An evening at the theater with music' },
  { emojis: '📚✏️🎓', description: 'Studying and graduating from school' },
  { emojis: '🛒🍎🧀', description: 'Shopping for food at the market' },
  { emojis: '🌧️☂️🏠', description: 'A rainy day staying home with an umbrella' },
  { emojis: '🎂🎈🎁', description: 'A birthday party with cake and presents' },
  { emojis: '🏃‍♂️🌳🐕', description: 'Running in the park with a dog' },
  { emojis: '✈️🗼🇫🇷', description: 'Flying to visit the Eiffel Tower in France' },
];

// French questions for respond mode
const FRENCH_QUESTIONS = [
  'Comment allez-vous aujourd\'hui ?',
  'Qu\'est-ce que vous aimez faire le week-end ?',
  'Quel est votre plat français préféré ?',
  'Où habitez-vous ?',
  'Qu\'est-ce que vous avez fait hier ?',
  'Quel temps fait-il aujourd\'hui ?',
  'Avez-vous des frères ou des sœurs ?',
  'Qu\'est-ce que vous voulez faire demain ?',
  'Quel est votre film préféré ?',
  'Pourquoi apprenez-vous le français ?',
];

function generateLocalExercises(mode: SentenceMode, count: number): SentenceExerciseData[] {
  const exercises: SentenceExerciseData[] = [];

  if (mode === 'translate') {
    const shuffled = shuffleArray([...examples]);
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      const ex = shuffled[i];
      exercises.push({
        id: `translate-${i}`,
        mode: 'translate',
        prompt: ex.english,
        expectedAnswer: ex.french,
        hint: `Use the verb "${verbs.find(v => v.id === ex.verbId)?.infinitive ?? ex.verbId}"`,
      });
    }
  } else if (mode === 'complete') {
    const shuffled = shuffleArray([...examples]);
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      const ex = shuffled[i];
      const verb = verbs.find(v => v.id === ex.verbId);
      // Create fill-in-the-blank from the French sentence
      const words = ex.french.split(' ');
      if (words.length < 3) continue;
      // Replace a word (prefer verb forms)
      const blankIndex = Math.max(1, Math.floor(Math.random() * (words.length - 1)));
      const answer = words[blankIndex].replace(/[.,!?;:]$/, '');
      words[blankIndex] = '___';
      exercises.push({
        id: `complete-${i}`,
        mode: 'complete',
        prompt: `${words.join(' ')} (${verb?.infinitive ?? ex.verbId})`,
        expectedAnswer: answer,
        hint: ex.english,
      });
    }
  } else if (mode === 'describe') {
    const shuffled = shuffleArray([...EMOJI_SCENES]);
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      exercises.push({
        id: `describe-${i}`,
        mode: 'describe',
        prompt: shuffled[i].emojis,
        hint: shuffled[i].description,
      });
    }
  } else if (mode === 'respond') {
    const shuffled = shuffleArray([...FRENCH_QUESTIONS]);
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      exercises.push({
        id: `respond-${i}`,
        mode: 'respond',
        prompt: shuffled[i],
      });
    }
  }

  return exercises.slice(0, count);
}

interface ExerciseAnswer {
  exerciseId: string;
  correct: boolean;
}

export default function SentenceBuilder() {
  const navigate = useNavigate();
  const { isAIAvailable, chat } = useAI();
  const [pageMode, setPageMode] = useState<PageMode>('select');
  const [exerciseMode, setExerciseMode] = useState<SentenceMode>('translate');
  const [exercises, setExercises] = useState<SentenceExerciseData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exerciseAnswers, setExerciseAnswers] = useState<ExerciseAnswer[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentExercise = exercises[currentIndex];

  const startExercises = useCallback(async (mode: SentenceMode) => {
    setExerciseMode(mode);
    setCurrentIndex(0);
    setExerciseAnswers([]);

    // Try AI-generated exercises first, fallback to local
    if (isAIAvailable && (mode === 'translate' || mode === 'respond')) {
      setIsGenerating(true);
      try {
        const randomVerbs = shuffleArray([...verbs]).slice(0, 5).map(v => v.infinitive);
        const systemPrompt = SYSTEM_PROMPTS.sentenceBuilder(randomVerbs, 'present');

        const messages: ChatMessage[] = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate 5 ${mode === 'translate' ? 'sentences to translate from English to French' : 'questions in French for the student to answer'}. Respond with JSON.` },
        ];

        const response = await chat(messages);
        const jsonMatch = response.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as {
            sentences?: { french: string; english: string }[];
          };

          if (parsed.sentences && parsed.sentences.length > 0) {
            const aiExercises: SentenceExerciseData[] = parsed.sentences.map((s, i) => ({
              id: `ai-${mode}-${i}`,
              mode,
              prompt: mode === 'translate' ? s.english : s.french,
              expectedAnswer: mode === 'translate' ? s.french : undefined,
            }));

            setExercises(aiExercises);
            setPageMode('exercise');
            setIsGenerating(false);
            return;
          }
        }
      } catch {
        // Fall through to local generation
      }
      setIsGenerating(false);
    }

    // Local fallback
    const localExercises = generateLocalExercises(mode, 5);
    if (localExercises.length > 0) {
      setExercises(localExercises);
      setPageMode('exercise');
    }
  }, [isAIAvailable, chat]);

  const handleAnswer = useCallback(async (answer: string): Promise<SentenceResult> => {
    if (!currentExercise) {
      return { userAnswer: answer, isCorrect: false };
    }

    // If AI is available, get AI evaluation
    if (isAIAvailable) {
      try {
        const evaluatePrompt = currentExercise.mode === 'describe'
          ? `The student was asked to describe this emoji scene in French: ${currentExercise.prompt}\nTheir answer: "${answer}"\n\nEvaluate if the French sentence is grammatically correct and relevant to the scene.`
          : currentExercise.mode === 'respond'
          ? `The student was asked this question in French: "${currentExercise.prompt}"\nTheir answer: "${answer}"\n\nEvaluate if the answer is grammatically correct and a sensible response.`
          : currentExercise.expectedAnswer
          ? `Expected French: "${currentExercise.expectedAnswer}"\nStudent's answer: "${answer}"\n\nEvaluate if the student's answer is correct or a valid alternative translation.`
          : `Evaluate this French: "${answer}"\n\nIs it grammatically correct?`;

        const messages: ChatMessage[] = [
          {
            role: 'system',
            content: `You are a French language evaluator. Respond with ONLY valid JSON:
{
  "isCorrect": true/false,
  "explanation": "brief explanation of any errors or why it's correct",
  "naturalAlternative": "a more natural way to say it in French (or null if already natural)"
}
Be encouraging. Accept answers that are semantically correct even if not word-for-word matches.`,
          },
          { role: 'user', content: evaluatePrompt },
        ];

        const response = await chat(messages);
        const jsonMatch = response.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as {
            isCorrect?: boolean;
            explanation?: string;
            naturalAlternative?: string | null;
          };

          const result: SentenceResult = {
            userAnswer: answer,
            isCorrect: parsed.isCorrect ?? false,
            aiExplanation: parsed.explanation,
            naturalAlternative: parsed.naturalAlternative ?? undefined,
          };

          setExerciseAnswers(prev => [...prev, {
            exerciseId: currentExercise.id,
            correct: result.isCorrect,
          }]);

          return result;
        }
      } catch {
        // Fall through to basic evaluation
      }
    }

    // Basic local evaluation
    let isCorrect = false;
    if (currentExercise.expectedAnswer) {
      const normalize = (s: string) => s.toLowerCase().trim().replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ');
      isCorrect = normalize(answer) === normalize(currentExercise.expectedAnswer);
    }

    const result: SentenceResult = {
      userAnswer: answer,
      isCorrect,
      aiExplanation: currentExercise.expectedAnswer
        ? (isCorrect ? 'Your answer matches.' : `Expected: ${currentExercise.expectedAnswer}`)
        : 'AI is offline. Cannot fully evaluate this answer.',
    };

    setExerciseAnswers(prev => [...prev, {
      exerciseId: currentExercise.id,
      correct: result.isCorrect,
    }]);

    return result;
  }, [currentExercise, isAIAvailable, chat]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setPageMode('result');
    }
  }, [currentIndex, exercises.length]);

  // Result stats
  const correctCount = exerciseAnswers.filter(a => a.correct).length;
  const totalCount = exerciseAnswers.length;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  if (pageMode === 'result') {
    return (
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card padding="lg">
            <div className="text-center space-y-4">
              <ProgressRing progress={accuracy} size={80} strokeWidth={6}>
                <span className="text-lg font-bold text-warm-700 dark:text-warm-200">
                  {accuracy}%
                </span>
              </ProgressRing>
              <h2 className="text-xl font-bold text-warm-800 dark:text-warm-100">
                Session Complete!
              </h2>
              <div className="flex justify-center gap-6 text-sm">
                <div>
                  <p className="text-warm-400">Correct</p>
                  <p className="text-2xl font-bold text-emerald-500">{correctCount}</p>
                </div>
                <div>
                  <p className="text-warm-400">Total</p>
                  <p className="text-2xl font-bold text-warm-600 dark:text-warm-300">{totalCount}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setPageMode('select')} variant="secondary" className="flex-1">
                  <RotateCcw size={16} className="mr-1.5" /> Try Again
                </Button>
                <Button onClick={() => navigate('/practice')} className="flex-1">
                  Done
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (pageMode === 'exercise' && currentExercise) {
    const progress = ((currentIndex + 1) / exercises.length) * 100;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPageMode('select')}
            className="flex items-center gap-1.5 text-warm-500 hover:text-warm-700 dark:hover:text-warm-300"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-sm text-warm-500">{currentIndex + 1} / {exercises.length}</span>
        </div>

        <ProgressBar progress={progress} height="h-1.5" />

        <AnimatePresence mode="wait">
          <SentenceExercise
            key={currentExercise.id}
            exercise={currentExercise}
            onAnswer={handleAnswer}
            onNext={handleNext}
            isLast={currentIndex + 1 >= exercises.length}
          />
        </AnimatePresence>
      </div>
    );
  }

  // Mode selection
  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button
          onClick={() => navigate('/practice')}
          className="flex items-center gap-1.5 text-warm-500 hover:text-warm-700 dark:hover:text-warm-300 mb-3"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100 flex items-center gap-2">
          <PenTool size={24} className="text-coral-500" /> Sentence Builder
        </h1>
        <p className="text-warm-500 dark:text-warm-400 mt-1">
          Practice constructing French sentences
        </p>
      </motion.div>

      <div className="space-y-3">
        {/* Translate mode */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card
            hover
            padding="lg"
            onClick={() => !isGenerating && startExercises('translate')}
            className={isGenerating ? 'opacity-50 pointer-events-none' : ''}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                <Languages size={22} className="text-blue-500" />
              </div>
              <div>
                <p className="font-semibold text-warm-800 dark:text-warm-100">Translate</p>
                <p className="text-sm text-warm-500">English to French translation</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Complete mode */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card
            hover
            padding="lg"
            onClick={() => !isGenerating && startExercises('complete')}
            className={isGenerating ? 'opacity-50 pointer-events-none' : ''}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/30">
                <PenTool size={22} className="text-amber-500" />
              </div>
              <div>
                <p className="font-semibold text-warm-800 dark:text-warm-100">Complete</p>
                <p className="text-sm text-warm-500">Fill in the missing word</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Describe mode */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card
            hover
            padding="lg"
            onClick={() => !isGenerating && startExercises('describe')}
            className={isGenerating ? 'opacity-50 pointer-events-none' : ''}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                <Image size={22} className="text-emerald-500" />
              </div>
              <div>
                <p className="font-semibold text-warm-800 dark:text-warm-100">Describe</p>
                <p className="text-sm text-warm-500">Describe emoji scenes in French</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Respond mode */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card
            hover
            padding="lg"
            onClick={() => !isGenerating && startExercises('respond')}
            className={isGenerating ? 'opacity-50 pointer-events-none' : ''}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-900/30">
                <MessageSquare size={22} className="text-violet-500" />
              </div>
              <div>
                <p className="font-semibold text-warm-800 dark:text-warm-100">Respond</p>
                <p className="text-sm text-warm-500">Answer questions in French</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* AI indicator */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 py-3 text-sm text-violet-600 dark:text-violet-400"
        >
          <Sparkles size={16} className="animate-pulse" />
          Generating exercises with AI...
        </motion.div>
      )}

      <Card padding="md" className="bg-warm-50 dark:bg-warm-800/50">
        <p className="text-xs text-warm-500 dark:text-warm-400">
          <strong>Tip:</strong> {isAIAvailable
            ? 'AI will generate personalized exercises and evaluate your answers intelligently.'
            : 'Sign in to unlock AI-powered exercise generation and smart evaluation.'}
        </p>
      </Card>
    </div>
  );
}
