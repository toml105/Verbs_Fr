import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Flame, BookOpen } from 'lucide-react';
import { useProgress } from '../context/UserProgressContext';
import { verbs } from '../data/verbs';
import { TENSES } from '../data/tenses';
import Card from '../components/ui/Card';
import ProgressRing from '../components/ui/ProgressRing';
import ProgressBar from '../components/ui/ProgressBar';
import { getMasteryLabel, getMasteryColor } from '../lib/srs';

export default function Progress() {
  const { userData, getOverallMastery } = useProgress();
  const { stats, verbProgress } = userData;

  const overallMastery = getOverallMastery();
  const verbsStarted = Object.keys(verbProgress).length;

  // Tense progress breakdown
  const tenseStats = useMemo(() => {
    return TENSES.map((tense) => {
      let total = 0;
      let masterySum = 0;

      for (const vp of Object.values(verbProgress)) {
        if (vp[tense.key]) {
          total += 1;
          masterySum += vp[tense.key].masteryLevel;
        }
      }

      return {
        ...tense,
        practiced: total,
        avgMastery: total > 0 ? Math.round((masterySum / (total * 5)) * 100) : 0,
      };
    });
  }, [verbProgress]);

  // Mastery distribution
  const masteryDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0, 0]; // levels 0-5
    for (const vp of Object.values(verbProgress)) {
      for (const tp of Object.values(vp)) {
        dist[tp.masteryLevel] += 1;
      }
    }
    return dist;
  }, [verbProgress]);

  const totalAccuracy = useMemo(() => {
    let correct = 0;
    let total = 0;
    for (const vp of Object.values(verbProgress)) {
      for (const tp of Object.values(vp)) {
        correct += tp.correctAttempts;
        total += tp.totalAttempts;
      }
    }
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  }, [verbProgress]);

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100">
          Your Progress
        </h1>
      </motion.div>

      {/* Overview stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card padding="lg" className="text-center">
          <ProgressRing progress={overallMastery} size={120} strokeWidth={8}>
            <div>
              <div className="text-3xl font-bold text-warm-800 dark:text-warm-100">
                {overallMastery}%
              </div>
              <div className="text-xs text-warm-400">mastery</div>
            </div>
          </ProgressRing>

          <div className="grid grid-cols-4 gap-2 mt-6">
            <div className="text-center">
              <Flame size={18} className="text-amber-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-warm-800 dark:text-warm-100">
                {stats.currentStreak}
              </div>
              <div className="text-xs text-warm-400">Streak</div>
            </div>
            <div className="text-center">
              <Trophy size={18} className="text-coral-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-warm-800 dark:text-warm-100">
                {stats.totalReviews}
              </div>
              <div className="text-xs text-warm-400">Reviews</div>
            </div>
            <div className="text-center">
              <Target size={18} className="text-emerald-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-warm-800 dark:text-warm-100">
                {totalAccuracy}%
              </div>
              <div className="text-xs text-warm-400">Accuracy</div>
            </div>
            <div className="text-center">
              <BookOpen size={18} className="text-violet-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-warm-800 dark:text-warm-100">
                {verbsStarted}
              </div>
              <div className="text-xs text-warm-400">Verbs</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Mastery distribution */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <h2 className="font-semibold text-warm-800 dark:text-warm-100 mb-3">
            Mastery Distribution
          </h2>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1, 0].map((level) => (
              <div key={level} className="flex items-center gap-3">
                <span className="text-sm text-warm-500 w-20">{getMasteryLabel(level)}</span>
                <div className="flex-1 h-5 bg-warm-100 dark:bg-warm-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getMasteryColor(level)}`}
                    style={{
                      width: `${
                        masteryDistribution.reduce((a, b) => a + b, 0) > 0
                          ? (masteryDistribution[level] / masteryDistribution.reduce((a, b) => a + b, 0)) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-warm-600 dark:text-warm-300 w-8 text-right">
                  {masteryDistribution[level]}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Tense breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <h2 className="font-semibold text-warm-800 dark:text-warm-100 mb-3">
            Progress by Tense
          </h2>
          <div className="space-y-3">
            {tenseStats.map((tense) => (
              <div key={tense.key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-warm-700 dark:text-warm-200">
                    {tense.frenchName}
                  </span>
                  <span className="text-xs text-warm-400">
                    {tense.practiced} verbs · {tense.avgMastery}%
                  </span>
                </div>
                <ProgressBar
                  progress={tense.avgMastery}
                  color={
                    tense.avgMastery >= 70
                      ? 'bg-emerald-500'
                      : tense.avgMastery >= 40
                      ? 'bg-amber-500'
                      : 'bg-coral-500'
                  }
                  height="h-1.5"
                />
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
