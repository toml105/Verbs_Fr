import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mic, MicOff, Volume2, RotateCcw, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import ProgressRing from '../components/ui/ProgressRing';
import { verbs } from '../data/verbs';
import { conjugations } from '../data/conjugations';
import { examples } from '../data/examples';
import { TENSES } from '../data/tenses';
import { speak, isAudioSupported } from '../lib/audio';
import { isSpeechRecognitionSupported, listenForSpeech, compareSpeech } from '../lib/speechRecognition';
import { analyzeSpeech, type SpeechFeedback } from '../lib/aiSpeechAnalyzer';
import { useProgress } from '../context/UserProgressContext';
import { useAI } from '../context/AIContext';
import { gradeFromUI } from '../lib/srs';
import { PRONOUNS, shuffleArray } from '../lib/utils';

type SpeakingMode = 'select' | 'verb-speak' | 'sentence-read' | 'result';

interface SpeakingQuestion {
  type: 'verb-speak' | 'sentence-read';
  french: string;         // What the user should say
  english: string;        // English translation shown as prompt
  verbId: string;
  tense: string;
}

function generateVerbSpeakQuestions(count: number): SpeakingQuestion[] {
  const questions: SpeakingQuestion[] = [];
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
    const tenseName = TENSES.find(t => t.key === tense)?.frenchName ?? tense;

    questions.push({
      type: 'verb-speak',
      french: `${PRONOUNS[person]} ${form}`,
      english: `Say "${verb.english}" in ${tenseName} for ${PRONOUNS[person]}`,
      verbId: verb.id,
      tense,
    });
  }

  return questions.slice(0, count);
}

function generateSentenceReadQuestions(count: number): SpeakingQuestion[] {
  const questions: SpeakingQuestion[] = [];
  const shuffledExamples = shuffleArray([...examples]);

  for (const example of shuffledExamples) {
    if (questions.length >= count) break;

    questions.push({
      type: 'sentence-read',
      french: example.french,
      english: example.english,
      verbId: example.verbId,
      tense: example.tense,
    });
  }

  return questions.slice(0, count);
}

export default function SpeakingPractice() {
  const navigate = useNavigate();
  const { recordAnswer, userData } = useProgress();
  const { isOllamaAvailable, chat } = useAI();
  const [mode, setMode] = useState<SpeakingMode>('select');
  const [questions, setQuestions] = useState<SpeakingQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [similarity, setSimilarity] = useState(0);
  const [answers, setAnswers] = useState<{ correct: boolean }[]>([]);
  const [showFrench, setShowFrench] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<SpeechFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const audioRate = userData.settings.audioRate;
  const speechSupported = isSpeechRecognitionSupported();
  const audioSupported = isAudioSupported();

  const startMode = useCallback((type: 'verb-speak' | 'sentence-read') => {
    const qs = type === 'verb-speak'
      ? generateVerbSpeakQuestions(10)
      : generateSentenceReadQuestions(10);

    if (qs.length === 0) return;
    setQuestions(qs);
    setCurrentIndex(0);
    setAnswers([]);
    setSpokenText('');
    setShowResult(false);
    setShowFrench(false);
    setMode(type);
  }, []);

  const currentQuestion = questions[currentIndex];

  const handleListen = useCallback(async () => {
    if (isListening || !speechSupported) return;
    setIsListening(true);
    setSpokenText('');
    setAiFeedback(null);

    try {
      const result = await listenForSpeech('fr-FR');
      setSpokenText(result.transcript);

      if (result.transcript && currentQuestion) {
        const comparison = compareSpeech(result.transcript, currentQuestion.french);
        setIsCorrect(comparison.isMatch);
        setSimilarity(comparison.similarity);
        setShowResult(true);

        const grade = gradeFromUI(comparison.isMatch ? 'good' : 'again');
        recordAnswer(currentQuestion.verbId, currentQuestion.tense, grade, 'speaking');
        setAnswers(prev => [...prev, { correct: comparison.isMatch }]);

        if (navigator.vibrate) {
          navigator.vibrate(comparison.isMatch ? 10 : [50, 50, 50]);
        }

        // AI-enhanced feedback if available
        if (isOllamaAvailable) {
          setIsAnalyzing(true);
          try {
            const feedback = await analyzeSpeech(result.transcript, currentQuestion.french, chat);
            setAiFeedback(feedback);
          } catch {
            // AI analysis failed, basic feedback still shows
          } finally {
            setIsAnalyzing(false);
          }
        }
      }
    } catch {
      // Speech recognition failed silently
    } finally {
      setIsListening(false);
    }
  }, [isListening, speechSupported, currentQuestion, recordAnswer, isOllamaAvailable, chat]);

  const handlePlayCorrect = useCallback(() => {
    if (!currentQuestion || !audioSupported) return;
    speak(currentQuestion.french, audioRate);
  }, [currentQuestion, audioSupported, audioRate]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSpokenText('');
      setShowResult(false);
      setIsCorrect(false);
      setSimilarity(0);
      setShowFrench(false);
      setAiFeedback(null);
    } else {
      setMode('result');
    }
  }, [currentIndex, questions.length]);

  const handleSkip = useCallback(() => {
    if (!currentQuestion) return;
    // Record as incorrect when skipping
    const grade = gradeFromUI('again');
    recordAnswer(currentQuestion.verbId, currentQuestion.tense, grade, 'speaking');
    setAnswers(prev => [...prev, { correct: false }]);
    handleNext();
  }, [currentQuestion, recordAnswer, handleNext]);

  if (!speechSupported) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate('/practice')} className="flex items-center gap-1.5 text-warm-500 hover:text-warm-700 dark:hover:text-warm-300">
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <Card padding="lg">
          <div className="text-center space-y-3">
            <MicOff size={40} className="text-warm-400 mx-auto" />
            <h2 className="font-semibold text-warm-800 dark:text-warm-100">Speech Recognition Not Available</h2>
            <p className="text-warm-500 dark:text-warm-400 text-sm">
              Speaking practice requires Chrome or Edge browser with microphone access.
            </p>
            <Button onClick={() => navigate('/practice')} variant="secondary">
              Back to Practice
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (mode === 'result') {
    const correctCount = answers.filter(a => a.correct).length;
    const accuracy = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;

    return (
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card padding="lg">
            <div className="text-center space-y-4">
              <div className="text-4xl">{accuracy >= 80 ? '🎤' : accuracy >= 50 ? '🗣️' : '🔄'}</div>
              <h2 className="text-xl font-bold text-warm-800 dark:text-warm-100">Speaking Complete!</h2>
              <div className="flex justify-center gap-6 text-sm">
                <div>
                  <p className="text-warm-400">Matched</p>
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
            <Mic size={24} className="text-coral-500" /> Speaking Practice
          </h1>
          <p className="text-warm-500 dark:text-warm-400 mt-1">Practice your French pronunciation</p>
        </motion.div>

        <div className="space-y-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card hover padding="lg" onClick={() => startMode('verb-speak')}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-coral-50 dark:bg-coral-900/30">
                  <span className="text-xl">🗣️</span>
                </div>
                <div>
                  <p className="font-semibold text-warm-800 dark:text-warm-100">Verb Pronunciation</p>
                  <p className="text-sm text-warm-500">See the English prompt, speak the French verb form</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card hover padding="lg" onClick={() => startMode('sentence-read')}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-900/30">
                  <span className="text-xl">📖</span>
                </div>
                <div>
                  <p className="font-semibold text-warm-800 dark:text-warm-100">Sentence Reading</p>
                  <p className="text-sm text-warm-500">Read French sentences aloud and check your pronunciation</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <Card padding="md" className="bg-warm-50 dark:bg-warm-800/50">
          <p className="text-xs text-warm-500 dark:text-warm-400">
            <strong>Tip:</strong> Make sure to allow microphone access when prompted. Speak clearly and at a natural pace for best results.
          </p>
        </Card>
      </div>
    );
  }

  // Active speaking mode
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
              <span className="px-2.5 py-1 rounded-full bg-coral-50 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 text-xs font-medium">
                {currentQuestion.type === 'verb-speak' ? 'Verb Pronunciation' : 'Read Aloud'}
              </span>
            </div>

            {/* Prompt */}
            <h3 className="text-lg font-semibold text-warm-800 dark:text-warm-100 mb-2">
              {currentQuestion.type === 'verb-speak' ? 'Say this in French:' : 'Read this aloud:'}
            </h3>

            {currentQuestion.type === 'verb-speak' ? (
              <p className="text-warm-600 dark:text-warm-300 mb-2">{currentQuestion.english}</p>
            ) : (
              <p className="text-xl font-medium text-warm-800 dark:text-warm-100 mb-2">{currentQuestion.french}</p>
            )}

            {/* Show/hide French text for verb-speak mode */}
            {currentQuestion.type === 'verb-speak' && (
              <button
                onClick={() => setShowFrench(!showFrench)}
                className="text-sm text-blue-500 hover:text-blue-600 mb-4 underline"
              >
                {showFrench ? 'Hide French' : 'Show French (hint)'}
              </button>
            )}

            {showFrench && currentQuestion.type === 'verb-speak' && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-warm-500 dark:text-warm-400 text-sm mb-4 p-2 bg-warm-50 dark:bg-warm-700/50 rounded-lg"
              >
                {currentQuestion.french}
              </motion.p>
            )}

            {/* Microphone button */}
            <div className="flex flex-col items-center gap-3 my-6">
              <motion.button
                onClick={handleListen}
                disabled={isListening || showResult}
                whileTap={{ scale: 0.95 }}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : showResult
                    ? 'bg-warm-200 dark:bg-warm-600 text-warm-400'
                    : 'bg-coral-500 text-white hover:bg-coral-600 shadow-lg shadow-coral-500/30'
                }`}
              >
                {isListening ? <Mic size={32} /> : <Mic size={32} />}
              </motion.button>
              <p className="text-sm text-warm-500">
                {isListening ? 'Listening...' : showResult ? '' : 'Tap to speak'}
              </p>
            </div>

            {/* Spoken text display */}
            {spokenText && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-warm-50 dark:bg-warm-700/50 mb-4"
              >
                <p className="text-xs text-warm-400 mb-1">You said:</p>
                <p className="text-warm-800 dark:text-warm-100 font-medium">{spokenText}</p>
              </motion.div>
            )}

            {/* Result feedback */}
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 space-y-3"
              >
                {/* Basic feedback bar */}
                <div className={`p-3 rounded-xl ${
                  isCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {isCorrect ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    <p className="font-medium">
                      {isCorrect ? 'Great pronunciation!' : 'Not quite right'}
                    </p>
                  </div>
                  {!aiFeedback && (
                    <p className="text-sm">
                      Match: {Math.round(similarity * 100)}%
                    </p>
                  )}
                  {!isCorrect && !aiFeedback && (
                    <p className="text-sm mt-1">
                      Expected: <strong>{currentQuestion.french}</strong>
                    </p>
                  )}
                </div>

                {/* AI analyzing indicator */}
                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400"
                  >
                    <Sparkles size={16} className="animate-pulse" />
                    <p className="text-sm">AI is analyzing your speech...</p>
                  </motion.div>
                )}

                {/* AI-enhanced feedback card */}
                {aiFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-warm-800 border border-warm-100 dark:border-warm-700 rounded-xl p-4 space-y-3"
                  >
                    {/* Score ring */}
                    <div className="flex items-center gap-4">
                      <ProgressRing
                        progress={aiFeedback.overallScore}
                        size={56}
                        strokeWidth={5}
                        color={aiFeedback.overallScore >= 70 ? 'stroke-emerald-500' : aiFeedback.overallScore >= 40 ? 'stroke-amber-500' : 'stroke-red-500'}
                      >
                        <span className="text-xs font-bold text-warm-700 dark:text-warm-200">
                          {aiFeedback.overallScore}
                        </span>
                      </ProgressRing>
                      <div>
                        <p className="font-medium text-sm text-warm-800 dark:text-warm-100">
                          AI Feedback
                        </p>
                        <p className="text-xs text-warm-500">
                          {aiFeedback.grammarCorrect ? 'Grammar is correct' : 'Grammar needs work'}
                        </p>
                      </div>
                    </div>

                    {/* Corrections */}
                    {aiFeedback.corrections.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-1.5">
                          Corrections
                        </p>
                        <div className="space-y-1.5">
                          {aiFeedback.corrections.map((c, i) => (
                            <div key={i} className="text-sm bg-red-50 dark:bg-red-900/10 rounded-lg px-2.5 py-1.5">
                              <span className="line-through text-red-400">{c.original}</span>
                              {' '}
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">{c.corrected}</span>
                              {c.explanation && (
                                <p className="text-xs text-warm-500 mt-0.5">{c.explanation}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pronunciation tips */}
                    {aiFeedback.pronunciationTips.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-1.5">
                          Pronunciation Tips
                        </p>
                        <ul className="space-y-1">
                          {aiFeedback.pronunciationTips.map((tip, i) => (
                            <li key={i} className="text-sm text-warm-600 dark:text-warm-300 flex gap-2">
                              <span className="text-coral-500 flex-shrink-0">*</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Encouragement */}
                    {aiFeedback.encouragement && (
                      <p className="text-sm italic text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 rounded-lg px-3 py-2">
                        {aiFeedback.encouragement}
                      </p>
                    )}

                    {/* Listen & Try Again buttons */}
                    <div className="flex gap-2">
                      {audioSupported && (
                        <button
                          onClick={handlePlayCorrect}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-200 hover:bg-warm-200 dark:hover:bg-warm-600 transition-colors"
                        >
                          <Volume2 size={14} /> Listen Again
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Basic fallback: Listen to correct pronunciation (when no AI feedback) */}
                {!aiFeedback && !isAnalyzing && audioSupported && (
                  <button
                    onClick={handlePlayCorrect}
                    className="flex items-center gap-1.5 text-sm text-warm-500 hover:text-warm-700 dark:hover:text-warm-300 transition-colors"
                  >
                    <Volume2 size={14} /> Listen to correct pronunciation
                  </button>
                )}
              </motion.div>
            )}

            {/* Action buttons */}
            {showResult ? (
              <Button onClick={handleNext} className="w-full" size="lg">
                {currentIndex + 1 < questions.length ? 'Next' : 'See Results'}
              </Button>
            ) : !isListening && !spokenText ? (
              <button
                onClick={handleSkip}
                className="w-full text-center text-sm text-warm-400 hover:text-warm-600 dark:hover:text-warm-300 py-2"
              >
                Skip this one
              </button>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
