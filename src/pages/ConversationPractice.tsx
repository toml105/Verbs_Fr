import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mic, Volume2, RotateCcw, MessageCircle, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import { conversationScenarios, type ConversationScenario, type DialogueLine } from '../data/conversationScenarios';
import { speak, isAudioSupported } from '../lib/audio';
import { isSpeechRecognitionSupported, listenForSpeech, compareSpeech } from '../lib/speechRecognition';
import { useProgress } from '../context/UserProgressContext';
import { gradeFromUI } from '../lib/srs';

type ConvoMode = 'select' | 'dialogue' | 'result';
type InputMethod = 'speak' | 'type';

export default function ConversationPractice() {
  const navigate = useNavigate();
  const { recordAnswer, userData } = useProgress();
  const [mode, setMode] = useState<ConvoMode>('select');
  const [scenario, setScenario] = useState<ConversationScenario | null>(null);
  const [lineIndex, setLineIndex] = useState(0);
  const [inputMethod, setInputMethod] = useState<InputMethod>(
    isSpeechRecognitionSupported() ? 'speak' : 'type'
  );
  const [isListening, setIsListening] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [spokenText, setSpokenText] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [similarity, setSimilarity] = useState(0);
  const [completedLines, setCompletedLines] = useState<{ line: DialogueLine; correct: boolean; userText: string }[]>([]);
  const [waitingForNext, setWaitingForNext] = useState(false);

  const audioRate = userData.settings.audioRate;
  const speechSupported = isSpeechRecognitionSupported();
  const audioSupported = isAudioSupported();

  const startScenario = useCallback((s: ConversationScenario) => {
    setScenario(s);
    setLineIndex(0);
    setCompletedLines([]);
    setShowResult(false);
    setUserInput('');
    setSpokenText('');
    setWaitingForNext(false);
    setMode('dialogue');
  }, []);

  const currentLine = scenario?.dialogue[lineIndex] ?? null;
  const totalLines = scenario?.dialogue.length ?? 0;
  const userTurnLines = scenario?.dialogue.filter(l => l.speaker === 'user').length ?? 0;
  const correctUserLines = completedLines.filter(c => c.line.speaker === 'user' && c.correct).length;

  // Auto-play French speaker lines
  useEffect(() => {
    if (currentLine?.speaker === 'french' && mode === 'dialogue' && audioSupported) {
      const timer = setTimeout(() => {
        speak(currentLine.french, audioRate);
        // Auto-advance after playing
        const advanceTimer = setTimeout(() => {
          setCompletedLines(prev => [...prev, { line: currentLine, correct: true, userText: '' }]);
          setWaitingForNext(false);
          setLineIndex(prev => prev + 1);
        }, 2000);
        return () => clearTimeout(advanceTimer);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [lineIndex, mode, currentLine, audioSupported, audioRate]);

  // Check if we've finished all lines
  useEffect(() => {
    if (scenario && lineIndex >= totalLines && mode === 'dialogue') {
      setMode('result');
    }
  }, [lineIndex, totalLines, scenario, mode]);

  const handleSpeak = useCallback(async () => {
    if (isListening || !speechSupported || !currentLine) return;
    setIsListening(true);
    setSpokenText('');

    try {
      const result = await listenForSpeech('fr-FR');
      setSpokenText(result.transcript);

      if (result.transcript) {
        const comparison = compareSpeech(result.transcript, currentLine.french);
        setIsCorrect(comparison.isMatch);
        setSimilarity(comparison.similarity);
        setShowResult(true);

        // Record progress for key verbs
        for (const verbId of scenario?.keyVerbs ?? []) {
          const grade = gradeFromUI(comparison.isMatch ? 'good' : 'again');
          recordAnswer(verbId, 'PRESENT', grade, 'conversation');
        }

        setCompletedLines(prev => [...prev, { line: currentLine, correct: comparison.isMatch, userText: result.transcript }]);

        if (navigator.vibrate) {
          navigator.vibrate(comparison.isMatch ? 10 : [50, 50, 50]);
        }
      }
    } catch {
      // Speech recognition failed
    } finally {
      setIsListening(false);
    }
  }, [isListening, speechSupported, currentLine, scenario, recordAnswer]);

  const handleTypeSubmit = useCallback(() => {
    if (!currentLine || !userInput.trim()) return;

    const comparison = compareSpeech(userInput, currentLine.french);
    setIsCorrect(comparison.isMatch);
    setSimilarity(comparison.similarity);
    setShowResult(true);

    for (const verbId of scenario?.keyVerbs ?? []) {
      const grade = gradeFromUI(comparison.isMatch ? 'good' : 'again');
      recordAnswer(verbId, 'PRESENT', grade, 'conversation');
    }

    setCompletedLines(prev => [...prev, { line: currentLine, correct: comparison.isMatch, userText: userInput }]);

    if (navigator.vibrate) {
      navigator.vibrate(comparison.isMatch ? 10 : [50, 50, 50]);
    }
  }, [currentLine, userInput, scenario, recordAnswer]);

  const handleNext = useCallback(() => {
    setShowResult(false);
    setUserInput('');
    setSpokenText('');
    setIsCorrect(false);
    setSimilarity(0);
    setLineIndex(prev => prev + 1);
  }, []);

  const replayLine = useCallback((text: string) => {
    if (audioSupported) speak(text, audioRate);
  }, [audioSupported, audioRate]);

  // --- RENDER ---

  if (mode === 'result' && scenario) {
    const accuracy = userTurnLines > 0 ? Math.round((correctUserLines / userTurnLines) * 100) : 0;

    return (
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card padding="lg">
            <div className="text-center space-y-4">
              <div className="text-4xl">{scenario.icon}</div>
              <h2 className="text-xl font-bold text-warm-800 dark:text-warm-100">
                {scenario.title} — Complete!
              </h2>
              <div className="flex justify-center gap-6 text-sm">
                <div>
                  <p className="text-warm-400">Correct</p>
                  <p className="text-2xl font-bold text-emerald-500">{correctUserLines}</p>
                </div>
                <div>
                  <p className="text-warm-400">Your Lines</p>
                  <p className="text-2xl font-bold text-warm-600 dark:text-warm-300">{userTurnLines}</p>
                </div>
                <div>
                  <p className="text-warm-400">Accuracy</p>
                  <p className="text-2xl font-bold text-violet-500">{accuracy}%</p>
                </div>
              </div>

              {/* Dialogue replay */}
              <div className="text-left space-y-2 mt-4 max-h-60 overflow-y-auto">
                {completedLines.map((cl, i) => (
                  <div key={i} className={`flex gap-2 text-sm ${cl.line.speaker === 'user' ? 'justify-end' : ''}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-xl ${
                      cl.line.speaker === 'user'
                        ? cl.correct
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                          : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        : 'bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-200'
                    }`}>
                      <p>{cl.line.french}</p>
                      <p className="text-xs opacity-60 mt-0.5">{cl.line.english}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={() => startScenario(scenario)} variant="secondary" className="flex-1">
                  <RotateCcw size={16} className="mr-1.5" /> Redo
                </Button>
                <Button onClick={() => setMode('select')} className="flex-1">
                  More Scenarios
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
            <MessageCircle size={24} className="text-emerald-500" /> Conversations
          </h1>
          <p className="text-warm-500 dark:text-warm-400 mt-1">Practice real-life French dialogues</p>
        </motion.div>

        {/* Input method toggle */}
        {speechSupported && (
          <div className="flex bg-warm-100 dark:bg-warm-700/50 rounded-xl p-1">
            <button
              onClick={() => setInputMethod('speak')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                inputMethod === 'speak'
                  ? 'bg-white dark:bg-warm-600 text-warm-800 dark:text-warm-100 shadow-sm'
                  : 'text-warm-500'
              }`}
            >
              <Mic size={14} className="inline mr-1" /> Speak
            </button>
            <button
              onClick={() => setInputMethod('type')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                inputMethod === 'type'
                  ? 'bg-white dark:bg-warm-600 text-warm-800 dark:text-warm-100 shadow-sm'
                  : 'text-warm-500'
              }`}
            >
              Type
            </button>
          </div>
        )}

        <div className="space-y-3">
          {conversationScenarios.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <Card hover padding="md" onClick={() => startScenario(s)}>
                <div className="flex items-center gap-3">
                  <div className="text-2xl w-10 text-center">{s.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-warm-800 dark:text-warm-100">{s.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        s.difficulty === 1
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : s.difficulty === 2
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-coral-50 text-coral-600 dark:bg-coral-900/30 dark:text-coral-400'
                      }`}>
                        {s.difficulty === 1 ? 'Easy' : s.difficulty === 2 ? 'Medium' : 'Hard'}
                      </span>
                    </div>
                    <p className="text-sm text-warm-500">{s.description}</p>
                  </div>
                  <ChevronRight size={16} className="text-warm-400" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Dialogue mode
  if (!currentLine || !scenario) return null;

  const dialogueProgress = ((lineIndex + 1) / totalLines) * 100;

  // If it's a French speaker line, show a waiting state
  if (currentLine.speaker === 'french') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setMode('select')} className="flex items-center gap-1.5 text-warm-500 hover:text-warm-700 dark:hover:text-warm-300">
            <ArrowLeft size={18} />
          </button>
          <span className="text-sm text-warm-500">{scenario.titleFr}</span>
        </div>
        <ProgressBar progress={dialogueProgress} height="h-1.5" />
        <div className="flex items-center justify-center py-12">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-center"
          >
            <Volume2 size={32} className="text-blue-500 mx-auto mb-2" />
            <p className="text-warm-500">Listening...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  // User turn
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setMode('select')} className="flex items-center gap-1.5 text-warm-500 hover:text-warm-700 dark:hover:text-warm-300">
          <ArrowLeft size={18} />
        </button>
        <span className="text-sm text-warm-500">{scenario.titleFr}</span>
      </div>

      <ProgressBar progress={dialogueProgress} height="h-1.5" />

      {/* Previous lines context */}
      {completedLines.length > 0 && (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {completedLines.slice(-4).map((cl, i) => (
            <div key={i} className={`flex gap-2 text-sm ${cl.line.speaker === 'user' ? 'justify-end' : ''}`}>
              <button
                onClick={() => replayLine(cl.line.french)}
                className={`max-w-[80%] px-3 py-2 rounded-xl text-left ${
                  cl.line.speaker === 'user'
                    ? 'bg-coral-50 dark:bg-coral-900/20 text-coral-700 dark:text-coral-400'
                    : 'bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-200'
                }`}
              >
                <p>{cl.line.french}</p>
              </button>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={lineIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="bg-white dark:bg-warm-800 rounded-2xl p-6 shadow-sm border border-warm-100 dark:border-warm-700"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              Your turn
            </span>
          </div>

          {/* English prompt */}
          <p className="text-warm-600 dark:text-warm-300 mb-1">{currentLine.english}</p>

          {/* Hint */}
          {currentLine.hint && (
            <p className="text-sm text-warm-400 mb-4">
              Hint: <span className="italic">{currentLine.hint}</span>
            </p>
          )}

          {/* Input area */}
          {inputMethod === 'speak' && speechSupported ? (
            <div className="flex flex-col items-center gap-3 my-4">
              <motion.button
                onClick={handleSpeak}
                disabled={isListening || showResult}
                whileTap={{ scale: 0.95 }}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : showResult
                    ? 'bg-warm-200 dark:bg-warm-600 text-warm-400'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30'
                }`}
              >
                <Mic size={28} />
              </motion.button>
              <p className="text-xs text-warm-500">
                {isListening ? 'Listening...' : showResult ? '' : 'Tap to speak'}
              </p>

              {spokenText && (
                <div className="w-full p-2 rounded-lg bg-warm-50 dark:bg-warm-700/50 text-sm">
                  <p className="text-xs text-warm-400">You said:</p>
                  <p className="text-warm-800 dark:text-warm-100">{spokenText}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-4">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && userInput.trim()) handleTypeSubmit(); }}
                disabled={showResult}
                placeholder="Type your response in French..."
                autoComplete="off"
                autoCapitalize="off"
                className={`w-full px-4 py-3 rounded-xl border-2 text-lg font-medium transition-all focus:outline-none ${
                  showResult
                    ? isCorrect
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'border-warm-200 dark:border-warm-600 bg-warm-50 dark:bg-warm-700/50 text-warm-800 dark:text-warm-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                }`}
              />
            </div>
          )}

          {/* Result */}
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
              <div className="flex items-center gap-2 mb-1">
                {isCorrect ? <CheckCircle size={18} /> : <XCircle size={18} />}
                <p className="font-medium">
                  {isCorrect ? 'Great job!' : 'Not quite'}
                </p>
              </div>
              {!isCorrect && (
                <p className="text-sm mt-1">
                  Expected: <strong>{currentLine.french}</strong>
                </p>
              )}
              {audioSupported && (
                <button
                  onClick={() => replayLine(currentLine.french)}
                  className="flex items-center gap-1.5 mt-2 text-sm hover:opacity-80"
                >
                  <Volume2 size={14} /> Listen
                </button>
              )}
            </motion.div>
          )}

          {/* Action buttons */}
          {showResult ? (
            <Button onClick={handleNext} className="w-full" size="lg">
              Continue
            </Button>
          ) : inputMethod === 'type' ? (
            <Button
              onClick={handleTypeSubmit}
              disabled={!userInput.trim()}
              className="w-full"
              size="lg"
            >
              Check
            </Button>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
