import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, ChevronRight, Sparkles } from 'lucide-react';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import { useProgress } from '../context/UserProgressContext';
import { verbs } from '../data/verbs';
import { grammarLessons } from '../data/grammarLessons';

export default function Learn() {
  const navigate = useNavigate();
  const { userData, getOverallMastery, getGrammarMastery } = useProgress();

  const verbMastery = getOverallMastery();
  const grammarMastery = getGrammarMastery();
  const verbsStarted = Object.keys(userData.verbProgress).length;
  const grammarStarted = Object.keys(userData.grammarProgress).length;
  const grammarCompleted = Object.values(userData.grammarProgress).filter(p => p.completed).length;

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100">
          Learn
        </h1>
        <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
          Build your French skills step by step
        </p>
      </motion.div>

      {/* Verbs section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card hover onClick={() => navigate('/verbs')}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex-shrink-0">
              <BookOpen size={24} className="text-violet-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-semibold text-warm-800 dark:text-warm-100">
                  Verb Conjugation
                </h2>
                <ChevronRight size={18} className="text-warm-400" />
              </div>
              <p className="text-xs text-warm-500 dark:text-warm-400 mb-2">
                {verbsStarted} of {verbs.length} verbs started
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <ProgressBar
                    progress={verbMastery}
                    color="bg-violet-500"
                    height="h-1.5"
                  />
                </div>
                <span className="text-xs text-warm-400 font-medium">{verbMastery}%</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Grammar section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card hover onClick={() => navigate('/grammar')}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex-shrink-0">
              <GraduationCap size={24} className="text-blue-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-semibold text-warm-800 dark:text-warm-100">
                  Grammar
                </h2>
                <div className="flex items-center gap-2">
                  {grammarCompleted > 0 && (
                    <span className="text-xs text-emerald-500 font-medium">
                      {grammarCompleted}/{grammarLessons.length} completed
                    </span>
                  )}
                  <ChevronRight size={18} className="text-warm-400" />
                </div>
              </div>
              <p className="text-xs text-warm-500 dark:text-warm-400 mb-2">
                {grammarStarted === 0
                  ? 'Master French sentence structure and rules'
                  : `${grammarStarted} of ${grammarLessons.length} lessons practiced`}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <ProgressBar
                    progress={grammarMastery}
                    color="bg-blue-500"
                    height="h-1.5"
                  />
                </div>
                <span className="text-xs text-warm-400 font-medium">{grammarMastery}%</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick links */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-semibold text-warm-600 dark:text-warm-300 mb-2">
          More Resources
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Card hover padding="sm" onClick={() => navigate('/confusing-pairs')}>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              <span className="text-sm font-medium text-warm-700 dark:text-warm-200">
                Confusing Pairs
              </span>
            </div>
          </Card>
          <Card hover padding="sm" onClick={() => navigate('/conversations')}>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-500" />
              <span className="text-sm font-medium text-warm-700 dark:text-warm-200">
                Conversations
              </span>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
