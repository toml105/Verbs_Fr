import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useProgress } from '../context/UserProgressContext';
import { grammarLessons } from '../data/grammarLessons';
import GrammarLessonCard from '../components/grammar/GrammarLessonCard';
import ProgressBar from '../components/ui/ProgressBar';

const tiers = [
  { id: 1 as const, title: 'Foundations', color: 'text-emerald-600 dark:text-emerald-400', bgBar: 'bg-emerald-500' },
  { id: 2 as const, title: 'Intermediate', color: 'text-amber-600 dark:text-amber-400', bgBar: 'bg-amber-500' },
  { id: 3 as const, title: 'Advanced', color: 'text-coral-600 dark:text-coral-400', bgBar: 'bg-coral-500' },
];

export default function Grammar() {
  const navigate = useNavigate();
  const { userData } = useProgress();
  const [expandedTiers, setExpandedTiers] = useState<Set<number>>(new Set([1, 2, 3]));

  const toggleTier = (tier: number) => {
    setExpandedTiers(prev => {
      const next = new Set(prev);
      if (next.has(tier)) next.delete(tier);
      else next.add(tier);
      return next;
    });
  };

  const totalCompleted = Object.values(userData.grammarProgress).filter(p => p.completed).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <button
          onClick={() => navigate('/learn')}
          className="p-2 -ml-2 rounded-xl hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
        >
          <ArrowLeft size={20} className="text-warm-600 dark:text-warm-300" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100">
            Grammar
          </h1>
          <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
            {totalCompleted} of {grammarLessons.length} lessons completed
          </p>
        </div>
      </motion.div>

      {/* Overall progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <ProgressBar
              progress={(totalCompleted / grammarLessons.length) * 100}
              color="bg-blue-500"
              height="h-2"
            />
          </div>
          <span className="text-xs text-warm-400 font-medium">
            {Math.round((totalCompleted / grammarLessons.length) * 100)}%
          </span>
        </div>
      </motion.div>

      {/* Tier sections */}
      {tiers.map((tier, tierIdx) => {
        const tierLessons = grammarLessons.filter(l => l.tier === tier.id).sort((a, b) => a.order - b.order);
        const tierCompleted = tierLessons.filter(l => userData.grammarProgress[l.id]?.completed).length;
        const isExpanded = expandedTiers.has(tier.id);

        return (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + tierIdx * 0.05 }}
          >
            {/* Tier header */}
            <button
              onClick={() => toggleTier(tier.id)}
              className="w-full flex items-center justify-between py-2 mb-2"
            >
              <div className="flex items-center gap-2">
                <h2 className={`font-bold ${tier.color}`}>
                  {tier.title}
                </h2>
                <span className="text-xs text-warm-400">
                  {tierCompleted}/{tierLessons.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16">
                  <ProgressBar
                    progress={tierLessons.length > 0 ? (tierCompleted / tierLessons.length) * 100 : 0}
                    color={tier.bgBar}
                    height="h-1"
                  />
                </div>
                {isExpanded ? (
                  <ChevronUp size={18} className="text-warm-400" />
                ) : (
                  <ChevronDown size={18} className="text-warm-400" />
                )}
              </div>
            </button>

            {/* Lesson cards */}
            {isExpanded && (
              <div className="space-y-2">
                {tierLessons.map((lesson, idx) => (
                  <GrammarLessonCard
                    key={lesson.id}
                    lesson={lesson}
                    progress={userData.grammarProgress[lesson.id]}
                    onClick={() => navigate(`/grammar/${lesson.id}`)}
                    index={tierIdx * 8 + idx}
                  />
                ))}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
