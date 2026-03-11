import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { conjugations } from '../../data/conjugations';
import { TENSES } from '../../data/tenses';
import { PRONOUNS, formatConjugation } from '../../lib/utils';
import { useProgress } from '../../context/UserProgressContext';
import { getMasteryColor, getMasteryLabel } from '../../lib/srs';
import { speak, isAudioSupported } from '../../lib/audio';

interface ConjugationTableProps {
  verbId: string;
}

export default function ConjugationTable({ verbId }: ConjugationTableProps) {
  const [selectedTense, setSelectedTense] = useState('PRESENT');
  const { userData } = useProgress();

  const verbConj = conjugations[verbId];
  if (!verbConj) return null;

  const forms = verbConj[selectedTense];
  const verbProgress = userData.verbProgress[verbId];
  const tenseProgress = verbProgress?.[selectedTense];

  return (
    <div>
      {/* Tense selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TENSES.map((tense) => {
          const isActive = selectedTense === tense.key;
          const progress = verbProgress?.[tense.key];
          const level = progress?.masteryLevel ?? 0;

          return (
            <button
              key={tense.key}
              onClick={() => setSelectedTense(tense.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-coral-500 text-white shadow-sm'
                  : 'bg-warm-100 text-warm-600 hover:bg-warm-200 dark:bg-warm-800 dark:text-warm-400 dark:hover:bg-warm-700'
              }`}
            >
              {tense.frenchName}
              {level > 0 && !isActive && (
                <span className={`ml-1.5 inline-block w-2 h-2 rounded-full ${getMasteryColor(level)}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Conjugation grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTense}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-4 space-y-1"
        >
          {tenseProgress && (
            <div className="flex items-center gap-2 mb-3 text-sm text-warm-500 dark:text-warm-400">
              <span className={`w-2.5 h-2.5 rounded-full ${getMasteryColor(tenseProgress.masteryLevel)}`} />
              {getMasteryLabel(tenseProgress.masteryLevel)}
              {tenseProgress.totalAttempts > 0 && (
                <span className="text-warm-400">
                  ({tenseProgress.correctAttempts}/{tenseProgress.totalAttempts} correct)
                </span>
              )}
            </div>
          )}

          {forms ? (
            PRONOUNS.map((pronoun, i) => {
              const form = forms[i];
              if (!form) return null;
              const audioEnabled = userData.settings.audioEnabled && isAudioSupported();
              const fullForm = formatConjugation(PRONOUNS[i], form);

              return (
                <div
                  key={i}
                  className="flex items-center py-2.5 px-3 rounded-xl hover:bg-warm-50 dark:hover:bg-warm-800/50 transition-colors group"
                >
                  <span className="text-warm-500 dark:text-warm-400 w-24 text-sm">
                    {PRONOUNS[i]}
                  </span>
                  <span className="text-warm-800 dark:text-warm-100 font-medium text-base flex-1">
                    {form}
                  </span>
                  {audioEnabled && (
                    <button
                      onClick={() => speak(fullForm, userData.settings.audioRate)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-warm-100 dark:hover:bg-warm-700 transition-all"
                      title="Listen"
                    >
                      <Volume2 size={14} className="text-warm-400" />
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-warm-400 text-sm py-4 text-center">
              Conjugation not available for this tense.
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
