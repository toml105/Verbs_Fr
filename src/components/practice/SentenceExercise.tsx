import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Volume2, Mic, CheckCircle, XCircle, ArrowRight, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import { speak, isAudioSupported } from '../../lib/audio';
import { isSpeechRecognitionSupported, listenForSpeech } from '../../lib/speechRecognition';

export type SentenceMode = 'translate' | 'complete' | 'describe' | 'respond';

export interface SentenceExerciseData {
  id: string;
  mode: SentenceMode;
  prompt: string;           // What to show the user
  expectedAnswer?: string;  // For local validation (optional)
  hint?: string;
}

export interface SentenceResult {
  userAnswer: string;
  isCorrect: boolean;
  aiExplanation?: string;
  naturalAlternative?: string;
}

interface SentenceExerciseProps {
  exercise: SentenceExerciseData;
  onAnswer: (answer: string) => Promise<SentenceResult>;
  onNext: () => void;
  isLast: boolean;
}

const modeLabels: Record<SentenceMode, string> = {
  translate: 'Translate to French',
  complete: 'Complete the Sentence',
  describe: 'Describe the Scene',
  respond: 'Answer in French',
};

const modeColors: Record<SentenceMode, string> = {
  translate: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  complete: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  describe: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  respond: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
};

export default function SentenceExercise({ exercise, onAnswer, onNext, isLast }: SentenceExerciseProps) {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SentenceResult | null>(null);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const audioSupported = isAudioSupported();
  const speechSupported = isSpeechRecognitionSupported();

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 200);
  }, [exercise.id]);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await onAnswer(trimmed);
      setResult(res);
    } catch {
      setResult({
        userAnswer: trimmed,
        isCorrect: false,
        aiExplanation: 'Could not evaluate your answer. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSpeech = async () => {
    if (isListening || !speechSupported) return;
    setIsListening(true);
    try {
      const speechResult = await listenForSpeech('fr-FR');
      if (speechResult.transcript) {
        setInput(speechResult.transcript);
      }
    } catch {
      // Speech recognition failed
    } finally {
      setIsListening(false);
    }
  };

  const handleListenPrompt = () => {
    if (!audioSupported) return;
    // For respond mode, speak the prompt in French
    if (exercise.mode === 'respond') {
      speak(exercise.prompt);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="bg-white dark:bg-warm-800 rounded-2xl p-5 shadow-sm border border-warm-100 dark:border-warm-700"
    >
      {/* Mode badge */}
      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${modeColors[exercise.mode]}`}>
        {modeLabels[exercise.mode]}
      </span>

      {/* Prompt */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-warm-800 dark:text-warm-100 leading-relaxed">
          {exercise.prompt}
        </h3>
        {exercise.hint && !result && (
          <p className="text-xs text-warm-400 mt-1">
            Hint: {exercise.hint}
          </p>
        )}
        {exercise.mode === 'respond' && audioSupported && (
          <button
            onClick={handleListenPrompt}
            className="flex items-center gap-1 mt-2 text-sm text-coral-500 hover:text-coral-600 transition-colors"
          >
            <Volume2 size={14} /> Listen
          </button>
        )}
      </div>

      {/* Input area (before submission) */}
      {!result && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer in French..."
              disabled={isSubmitting}
              className="flex-1 px-3 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-700 text-warm-800 dark:text-warm-100 text-sm placeholder:text-warm-400 border border-warm-200 dark:border-warm-600 focus:outline-none focus:ring-2 focus:ring-coral-500/30 focus:border-coral-400 disabled:opacity-50"
            />
            {speechSupported && (
              <button
                onClick={handleSpeech}
                disabled={isListening || isSubmitting}
                className={`p-2.5 rounded-xl transition-colors ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-warm-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-600'
                } disabled:opacity-50`}
              >
                <Mic size={18} />
              </button>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Sparkles size={16} className="mr-2 animate-pulse" />
                Checking...
              </>
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Submit Answer
              </>
            )}
          </Button>
        </div>
      )}

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Correct/Incorrect banner */}
          <div className={`p-3 rounded-xl ${
            result.isCorrect
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
          }`}>
            <div className="flex items-center gap-2">
              {result.isCorrect ? <CheckCircle size={18} /> : <XCircle size={18} />}
              <p className="font-medium">
                {result.isCorrect ? 'Correct!' : 'Not quite right'}
              </p>
            </div>
            <p className="text-sm mt-1">
              Your answer: <strong>{result.userAnswer}</strong>
            </p>
          </div>

          {/* AI explanation */}
          {result.aiExplanation && (
            <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-700/50">
              <p className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-1">
                Explanation
              </p>
              <p className="text-sm text-warm-700 dark:text-warm-200 leading-relaxed">
                {result.aiExplanation}
              </p>
            </div>
          )}

          {/* Natural alternative */}
          {result.naturalAlternative && (
            <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20">
              <p className="text-xs font-semibold text-violet-500 uppercase tracking-wide mb-1">
                Natural French
              </p>
              <p className="text-sm text-violet-700 dark:text-violet-300 font-medium">
                {result.naturalAlternative}
              </p>
              {audioSupported && (
                <button
                  onClick={() => speak(result.naturalAlternative!)}
                  className="flex items-center gap-1 mt-1.5 text-xs text-violet-500 hover:text-violet-600"
                >
                  <Volume2 size={12} /> Listen
                </button>
              )}
            </div>
          )}

          {/* Next button */}
          <Button onClick={onNext} className="w-full" size="lg">
            {isLast ? 'See Results' : 'Next'}
            {!isLast && <ArrowRight size={16} className="ml-2" />}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
