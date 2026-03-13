import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';
import { getMasteryLabel } from '../../lib/srs';
import type { GrammarLesson, GrammarLessonProgress } from '../../types';

const tierColors = {
  1: { badge: 'emerald' as const, bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', label: 'Foundations' },
  2: { badge: 'amber' as const, bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', label: 'Intermediate' },
  3: { badge: 'coral' as const, bg: 'bg-coral-50 dark:bg-coral-900/30', text: 'text-coral-600 dark:text-coral-400', label: 'Advanced' },
};

interface Props {
  lesson: GrammarLesson;
  progress?: GrammarLessonProgress;
  onClick: () => void;
  index: number;
}

export default function GrammarLessonCard({ lesson, progress, onClick, index }: Props) {
  const tier = tierColors[lesson.tier];
  const masteryLevel = progress?.masteryLevel ?? 0;
  const masteryPercent = (masteryLevel / 5) * 100;
  const isCompleted = progress?.completed ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
    >
      <Card hover onClick={onClick}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl ${tier.bg} flex-shrink-0 mt-0.5`}>
            {isCompleted ? (
              <CheckCircle2 size={20} className="text-emerald-500" />
            ) : (
              <BookOpen size={20} className={tier.text} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-semibold text-warm-800 dark:text-warm-100 text-sm truncate">
                {lesson.title}
              </h3>
              <Badge variant={tier.badge} size="sm">
                {tier.label}
              </Badge>
            </div>
            <p className="text-xs text-warm-500 dark:text-warm-400 mb-2">
              {lesson.shortDescription}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ProgressBar
                  progress={masteryPercent}
                  color={
                    masteryLevel >= 4
                      ? 'bg-emerald-500'
                      : masteryLevel >= 2
                        ? 'bg-amber-500'
                        : 'bg-warm-300'
                  }
                  height="h-1.5"
                />
              </div>
              <span className="text-[10px] text-warm-400 font-medium whitespace-nowrap">
                {getMasteryLabel(masteryLevel)}
              </span>
            </div>
            {progress && progress.bestScore > 0 && (
              <p className="text-[10px] text-warm-400 mt-1">
                Best: {progress.bestScore}%
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
