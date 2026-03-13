import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, Ear, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import { verbs } from '../data/verbs';
import { conjugations } from '../data/conjugations';
import { examples } from '../data/examples';
import { TENSES } from '../data/tenses';
import { speak, isAudioSupported } from '../lib/audio';
import { useProgress } from '../context/UserProgressContext';
import { gradeFromUI } from '../lib/srs';
import { checkAnswer, PRONOUNS, shuffleArray } from '../lib/utils';

type ListeningMode = 'select' | 'dictation' | 'sentence-fill' | 'translate' | 'result';

interface ListeningQuestion {
  type: 'dictation' | 'sentence-fill' | 'translate';
  audioText: string;       // What to speak aloud
  prompt: string;          // What the user sees
  correctAnswer: string;
  hint?: string;
  verbId: string;
  tense: string;
  options?: string[];      // For multiple-choice variants
}

function generateDictationQuestions(count: number): ListeningQuestion[] {
  const questions: ListeningQuestion[] = [];
  const allVerbs = shuffleArray([...verbs]);

  for (const verb of allVerbs) {
    if (questions.length >= count) break;
    const conjData = conjugations[verb.id];
    if (!conjData) continue;

    const tenseKeys = Object.keys(conjData);
    const tense = tenseKeys[Math.floor(Math.random() * tenseKeys.length)];
    const forms = conjData[tense];
    if (!forms) continue;

    const validPersons = forms.map((f, i) => (f ? i : -1)).filter(i => i >= 0);
    if (validPersons.length === 0) continue;

    const person = validPersons[Math.floor(Math.random() * validPersons.length)];
    const form = forms[person];
    const fullPhrase = `${PRONOUNS[person]} ${form}`;

    questions.push({
      type: 'dictation',
      audioText: fullPhrase,
      prompt: 'Listen and type what you hear',
      correctAnswer: fullPhrase,
      hint: `${verb.english} — ${TENSES.find(t => t.key === tense)?.frenchName ?? tense}`,
      verbId: verb.id,
      tense,
    });
  }

  return questions.slice(0, count);
}

function generateSentenceFillQuestions(count: number): ListeningQuestion[] {
  const questions: ListeningQuestion[] = [];
  const shuffledExamples = shuffleArray([...examples]);

  for (const example of shuffledExamples) {
    if (questions.length >= count) break;
    const verb = verbs.find(v => v.id === example.verbId);
    if (!verb) continue;

    const conjData = conjugations[verb.id];
    if (!conjData?.[example.tense]) continue;

    const forms = conjData[example.tense];
    let blankWord = '';

    for (let i = 0; i < forms.length; i++) {
      if (forms[i] && example.french.toLowerCase().includes(forms[i].toLowerCase())) {
        blankWord = forms[i];
        break;
      }
    }

    if (!blankWord) continue;

    const template = example.french.replace(
      new RegExp(blankWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
      '______'
    );

    questions.push({
      type: 'sentence-fill',
      audioText: example.french,
      prompt: `Listen to the sentence, then fill in the blank:\n${template}`,
      correctAnswer: blankWord,
      hint: example.english,
      verbId: verb.id,
      tense: example.tense,
    });
  }

  return questions.slice(0, count);
}

function generateTranslateQuestions(count: number): ListeningQuestion[] {
  const questions: ListeningQuestion[] = [];
  const shuffledExamples = shuffleArray([...examples]);

  for (const example of shuffledExamples) {
    if (questions.length >= count) break;

    // Generate multiple choice options
    const otherExamples = shuffleArray(
      examples.filter(e => e.verbId !== example.verbId)
    ).slice(0, 3);

    const options = shuffleArray([
      example.english,
      ...otherExamples.map(e => e.english),
    ]);

    questions.push({
      type: 'translate',
      audioText: example.french,
      prompt: 'Listen and choose the correct translation',
      correctAnswer: example.english,
      hint: example.french,
      verbId: example.verbId,
      tense: example.tense,
      options,
    });
  }

  return questions.slice(0, count);
}

export default function ListeningPractice() {
  const navigate = useNavigate();
  const { recordAnswer, userData } = useProgress();
  const [mode, setMode] = useState<ListeningMode>('select');
  const [questions, setQuestions] = useState<ListeningQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answers, setAnswers] = useState<{ correct: boolean }[]>([]);
  const [hasPlayed, setHasPlayed] = useState(false);

  const audioRate = userData.settings.audioRate;
  const audioSupported = isAudioSupported();

  const startMode = useCallback((type: 'dictation' | 'sentence-fill' | 'translate') => {
    let qs: ListeningQuestion[] = [];
    if (type === 'dictation') qs = generateDictationQuestions(10);
    else if (type === 'sentence-fill') qs = generateSentenceFillQuestions(10);
    else qs = generateTranslateQuestions(10);

    if (qs.length === 0) return;
    setQuestions(qs);
    setCurrentIndex(0);
    setAnswers([]);
    setUserInput('');
    setSelectedOption(null);
    setShowResult(false);
    setHasPlayed(false);
    setMode(type);
  }, []);

  const currentQuestion = questions[currentIndex];

  const playAudio = useCallback(() => {
    if (!currentQuestion || !audioSupported) return;
    speak(currentQuestion.audioText, audioRate);
    setHasPlayed(true);
  }, [currentQuestion, audioSupported, audioRate]);

  const playSlowAudio = useCallback(() => {
    if (!currentQuestion || !audioSupported) return;
    speak(currentQuestion.audioText, Math.max(0.5, audioRate - 0.3));
    setHasPlayed(true);
  }, [currentQuestion, audioSupported, audioRate]);

  // Auto-play audio when question changes
  useEffect(() => {
    if (currentQuestion && mode !== 'select' && mode !== 'result') {
      const timer = setTimeout(() => playAudio(), 300);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, mode]);

  const handleSubmit = useCallback(() => {
    if (showResult || !currentQuestion) return;

    const answer = currentQuestion.type === 'translate'
      ? (selectedOption ?? '')
      : userInput;

    const correct = checkAnswer(answer, currentQuestion.correctAnswer);
    setIsCorrect(correct);
    setShowResult(true);

    const grade = gradeFromUI(correct ? 'good' : 'again');
    recordAnswer(currentQuestion.verbId, currentQuestion.tense, grade, 'listening');

    setAnswers(prev => [...prev, { correct }]);

    if (navigator.vibrate) {
      navigator.vibrate(correct ? 10 : [50, 50, 50]);
    }
  }, [showResult, currentQuestion, selectedOption, userInput, recordAnswer]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setSelectedOption(null);
      setShowResult(false);
      setIsCorrect(false);
      setHasPlayed(false);
    } else {
      setMode('result');
    }
  }, [currentIndex, questions.length]);

  if (!audioSupported) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate('/practice')} className="flex items-center gap-1.5 text-warm-500 hover:text-warm-700 dark:hover:text-warm-300">
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <Card padding="lg">
          <p className="text-warm-600 dark:text-warm-300">Audio is not supported in your browser. Listening practice requires text-to-speech support.</p>
        </Card>
      </div>
    );
  }

  if (mode === 'result') {
    const correctCount = answers.filter(a => a.correct).length;
    const accuracy = Math.round((correctCount / answers.length) * 100);

    return (
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card padding="lg">
            <div className="text-center space-y-4">
              <div className="text-4xl">{accuracy >= 80 ? '🎧' : accuracy >= 50 ? '👂' : '🔄'}</div>
              <h2 className="text-xl font-bold text-warm-800 dark:text-warm-100">Listening Complete!</h2>
              <div className="flex justify-center gap-6 text-sm">
                <div>
                  <p className="text-warm-400">Correct</p>
                  <p className="text-2xl font-bold text-emerald-500">{correctCount}</p>
                </div>
                <div>
                  <p className="text-warm-400">Total</p>
                  <p className="text-2xl font-bold text-warm-600 dark:text-warm-300">{answers.length}</p>
                </div>
                <div>
                  <p className="text-warm-400">Accuracy</p>
                  <p className="text-2xl font-bold text-violet-500">{accuracy}%</p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setMode('select')} variant="secondary" className="flex-1">
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

  if (mode === 'select') {
    return (
      <div className="space-y-5">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button onClick={() => navigate('/practice')} className="flex items-center gap-1.5 text-warm-500 hover:text-warm-700 dark:hover:text-warm-300 mb-3">
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100 flex items-center gap-2">
            <Ear size={24} className="text-blue-500" /> Listening Practice
          </h1>
          <p className="text-warm-500 dark:text-warm-400 mt-1">Train your ear for French</p>
        </motion.div>

        <div className="space-y-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card hover padding="lg" onClick={() => startMode('dictation')}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                  <span className="text-xl">✍️</span>
                </div>
                <div>
                  <p className="font-semibold text-warm-800 dark:text-warm-100">Dictation</p>
                  <p className="text-sm text-warm-500">Hear a verb form and type exactly what you hear</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card hover padding="lg" onClick={() => startMode('sentence-fill')}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                  <span className="text-xl">📝</span>
                </div>
                <div>
                  <p className="font-semibold text-warm-800 dark:text-warm-100">Sentence Fill</p>
                  <p className="text-sm text-warm-500">Listen to a sentence and fill in the missing verb</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card hover padding="lg" onClick={() => startMode('translate')}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-900/30">
                  <span className="text-xl">🎧</span>
                </div>
                <div>
                  <p className="font-semibold text-warm-800 dark:text-warm-100">Listen & Translate</p>
                  <p className="text-sm text-warm-500">Hear French and pick the correct English translation</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Active quiz mode
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setMode('select')} className="flex items-center gap-1.5 text-warm-500 hover:text-warm-700 dark:hover:text-warm-300">
          <ArrowLeft size={18} />
        </button>
        <span className="text-sm text-warm-500">{currentIndex + 1} / {questions.length}</span>
      </div>

      <ProgressBar progress={progress} height="h-1.5" />

      <AnimatePresence mode="wait">
        {currentQuestion && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="bg-white dark:bg-warm-800 rounded-2xl p-6 shadow-sm border border-warm-100 dark:border-warm-700"
          >
            {/* Question type badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium">
                {currentQuestion.type === 'dictation' ? 'Dictation' :
                 currentQuestion.type === 'sentence-fill' ? 'Fill the Blank' : 'Translate'}
              </span>
            </div>

            {/* Audio controls */}
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={playAudio}
                className="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium"
              >
                <Volume2 size={20} />
                {hasPlayed ? 'Replay' : 'Listen'}
              </button>
              <button
                onClick={playSlowAudio}
                className="flex items-center gap-2 px-3 py-3 bg-warm-50 dark:bg-warm-700/50 text-warm-600 dark:text-warm-300 rounded-xl hover:bg-warm-100 dark:hover:bg-warm-700 transition-colors text-sm"
              >
                🐢 Slow
              </button>
            </div>

            {/* Prompt */}
            <p className="text-warm-600 dark:text-warm-300 mb-4 whitespace-pre-line">
              {currentQuestion.prompt}
            </p>

            {/* Answer area */}
            {currentQuestion.type === 'translate' && currentQuestion.options ? (
              <div className="space-y-2 mb-4">
                {currentQuestion.options.map((option) => {
                  let optionStyle = 'bg-warm-50 dark:bg-warm-700/50 border-warm-200 dark:border-warm-600 hover:border-blue-300';
                  if (showResult) {
                    if (option === currentQuestion.correctAnswer) {
                      optionStyle = 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-400';
                    } else if (option === selectedOption && !isCorrect) {
                      optionStyle = 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400';
                    }
                  } else if (option === selectedOption) {
                    optionStyle = 'bg-blue-50 dark:bg-blue-900/30 border-blue-500';
                  }

                  return (
                    <button
                      key={option}
                      onClick={() => { if (!showResult) setSelectedOption(option); }}
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
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && userInput.trim()) handleSubmit(); }}
                  disabled={showResult}
                  placeholder="Type what you hear..."
                  autoComplete="off"
                  autoCapitalize="off"
                  className={`w-full px-4 py-3 rounded-xl border-2 text-lg font-medium transition-all focus:outline-none ${
                    showResult
                      ? isCorrect
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      : 'border-warm-200 dark:border-warm-600 bg-warm-50 dark:bg-warm-700/50 text-warm-800 dark:text-warm-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
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
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle size={18} />
                      <p className="font-medium">Correct!</p>
                    </>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <XCircle size={18} />
                        <p className="font-medium">Not quite.</p>
                      </div>
                      <p className="text-sm mt-1">
                        Correct answer: <strong>{currentQuestion.correctAnswer}</strong>
                      </p>
                    </div>
                  )}
                </div>
                {currentQuestion.hint && (
                  <p className="text-sm mt-2 opacity-75">{currentQuestion.hint}</p>
                )}
              </motion.div>
            )}

            {/* Action buttons */}
            {showResult ? (
              <Button onClick={handleNext} className="w-full" size="lg">
                {currentIndex + 1 < questions.length ? 'Next' : 'See Results'}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={currentQuestion.type === 'translate' ? !selectedOption : !userInput.trim()}
                className="w-full"
                size="lg"
              >
                Check Answer
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
