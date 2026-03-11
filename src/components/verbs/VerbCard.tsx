import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import type { VerbDef } from '../../types';
import { useProgress } from '../../context/UserProgressContext';
import Badge from '../ui/Badge';
import { getMasteryLabel } from '../../lib/srs';
import { getGroupLabel } from '../../lib/utils';

interface VerbCardProps {
  verb: VerbDef;
  index?: number;
}

function getMasteryBadgeVariant(level: number) {
  if (level >= 4) return 'emerald' as const;
  if (level >= 3) return 'amber' as const;
  if (level >= 1) return 'coral' as const;
  return 'default' as const;
}

export default function VerbCard({ verb, index = 0 }: VerbCardProps) {
  const navigate = useNavigate();
  const { getVerbMastery, userData } = useProgress();

  const mastery = getVerbMastery(verb.id);
  const verbProgress = userData.verbProgress[verb.id];
  const avgMastery = verbProgress
    ? Math.round(
        Object.values(verbProgress).reduce((s, t) => s + t.masteryLevel, 0) /
          Math.max(Object.values(verbProgress).length, 1)
      )
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      onClick={() => navigate(`/verbs/${verb.id}`)}
      className="bg-white dark:bg-warm-800 rounded-2xl p-4 shadow-sm border border-warm-100 dark:border-warm-700 hover:shadow-md hover:border-warm-200 dark:hover:border-warm-600 transition-all duration-200 cursor-pointer active:scale-[0.98]"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-warm-800 dark:text-warm-100 truncate">
            {verb.infinitive}
          </h3>
          <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
            {verb.english}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 ml-3">
          <Badge variant={getMasteryBadgeVariant(avgMastery)} size="sm">
            {getMasteryLabel(avgMastery)}
          </Badge>
          <span className="text-xs text-warm-400">
            {getGroupLabel(verb.group).split(' ')[0]} grp
          </span>
        </div>
      </div>
      {mastery > 0 && (
        <div className="mt-3 w-full h-1.5 bg-warm-200 dark:bg-warm-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-coral-500 rounded-full transition-all duration-500"
            style={{ width: `${mastery}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}
