import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, Volume2 } from 'lucide-react';
import { CONFUSING_PAIRS } from '../data/confusingPairs';
import { useProgress } from '../context/UserProgressContext';
import { speak, isAudioSupported } from '../lib/audio';
import Card from '../components/ui/Card';

export default function ConfusingPairs() {
  const navigate = useNavigate();
  const { userData } = useProgress();
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null);
  const audioEnabled = userData.settings.audioEnabled && isAudioSupported();

  const selectedPair = CONFUSING_PAIRS.find(p => p.id === selectedPairId);

  if (selectedPair) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedPairId(null)}
          className="flex items-center gap-1.5 text-warm-500 hover:text-warm-700 dark:hover:text-warm-300 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Back to list</span>
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card padding="lg">
            <h2 className="text-xl font-bold text-warm-800 dark:text-warm-100">
              {selectedPair.title}
            </h2>
            <p className="text-warm-600 dark:text-warm-300 mt-3 leading-relaxed">
              {selectedPair.rule}
            </p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <h3 className="font-semibold text-warm-800 dark:text-warm-100 mb-3">
              Examples
            </h3>
            <div className="space-y-3">
              {selectedPair.examples.map((ex, i) => (
                <div key={i} className="p-3 rounded-xl bg-warm-50 dark:bg-warm-700/50">
                  <div className="flex items-center gap-2">
                    <p className="text-warm-800 dark:text-warm-100 font-medium">
                      {ex.french}
                    </p>
                    {audioEnabled && (
                      <button
                        onClick={() => speak(ex.french, userData.settings.audioRate)}
                        className="p-1 rounded hover:bg-warm-200 dark:hover:bg-warm-600 transition-colors"
                      >
                        <Volume2 size={14} className="text-warm-400" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-warm-500 dark:text-warm-400 mt-1">
                    {ex.english}
                  </p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-coral-50 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 mt-1 inline-block">
                    {ex.verb}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate('/practice')}
        className="flex items-center gap-1.5 text-warm-500 hover:text-warm-700 dark:hover:text-warm-300 transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="text-sm">Back</span>
      </button>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100">
          Tricky Verb Pairs
        </h1>
        <p className="text-warm-500 dark:text-warm-400 mt-1">
          Learn the subtle differences between commonly confused French verbs
        </p>
      </motion.div>

      <div className="space-y-2">
        {CONFUSING_PAIRS.map((pair, i) => (
          <motion.div
            key={pair.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <Card hover onClick={() => setSelectedPairId(pair.id)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-warm-800 dark:text-warm-100">
                    {pair.title}
                  </p>
                  <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5 line-clamp-1">
                    {pair.rule}
                  </p>
                </div>
                <ChevronRight size={18} className="text-warm-400 flex-shrink-0" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
