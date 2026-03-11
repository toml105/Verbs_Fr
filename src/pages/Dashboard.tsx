import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Flame, BookOpen, Dumbbell, ChevronRight, Sparkles } from 'lucide-react';
import { useProgress } from '../context/UserProgressContext';
import Card from '../components/ui/Card';
import ProgressRing from '../components/ui/ProgressRing';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';
import { verbs } from '../data/verbs';

export default function Dashboard() {
  const navigate = useNavigate();
  const { userData, getOverallMastery, getDueReviewCount } = useProgress();
  const { stats } = userData;

  const overallMastery = getOverallMastery();
  const dueCount = getDueReviewCount();
  const verbsStarted = Object.keys(userData.verbProgress).length;
  const dailyProgress = Math.min(
    100,
    Math.round((stats.todayReviews / stats.dailyGoal) * 100)
  );

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100">
            {greeting()} 👋
          </h1>
          <p className="text-warm-500 dark:text-warm-400 mt-0.5">
            Ready to practice French verbs?
          </p>
        </div>
        {stats.currentStreak > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-full">
            <Flame size={18} className="text-amber-500" />
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {stats.currentStreak}
            </span>
          </div>
        )}
      </motion.div>

      {/* Progress overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card padding="lg">
          <div className="flex items-center gap-5">
            <ProgressRing progress={overallMastery} size={88} strokeWidth={7}>
              <div className="text-center">
                <div className="text-xl font-bold text-warm-800 dark:text-warm-100">
                  {overallMastery}%
                </div>
              </div>
            </ProgressRing>
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-warm-500 dark:text-warm-400">
                    Today's goal
                  </span>
                  <span className="font-medium text-warm-700 dark:text-warm-300">
                    {stats.todayReviews}/{stats.dailyGoal}
                  </span>
                </div>
                <ProgressBar
                  progress={dailyProgress}
                  color={dailyProgress >= 100 ? 'bg-emerald-500' : 'bg-coral-500'}
                  height="h-2"
                />
              </div>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-warm-400">Verbs</span>
                  <p className="font-semibold text-warm-700 dark:text-warm-200">
                    {verbsStarted}/{verbs.length}
                  </p>
                </div>
                <div>
                  <span className="text-warm-400">Reviews</span>
                  <p className="font-semibold text-warm-700 dark:text-warm-200">
                    {stats.totalReviews}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Action cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Review due */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            hover
            padding="md"
            className="h-full"
            onClick={() => navigate('/practice?mode=review')}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/30">
                <Sparkles size={18} className="text-amber-500" />
              </div>
            </div>
            <p className="font-semibold text-warm-800 dark:text-warm-100">
              Review
            </p>
            <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
              {dueCount > 0
                ? `${dueCount} items due`
                : 'All caught up!'}
            </p>
          </Card>
        </motion.div>

        {/* Quick practice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card
            hover
            padding="md"
            className="h-full"
            onClick={() => navigate('/practice')}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-coral-50 dark:bg-coral-900/30">
                <Dumbbell size={18} className="text-coral-500" />
              </div>
            </div>
            <p className="font-semibold text-warm-800 dark:text-warm-100">
              Practice
            </p>
            <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
              Start a session
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Start practicing CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={() => navigate('/practice')}
          size="lg"
          className="w-full"
        >
          <Dumbbell size={20} className="mr-2" />
          Start Practicing
        </Button>
      </motion.div>

      {/* Explore verbs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card
          hover
          onClick={() => navigate('/verbs')}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-900/30">
              <BookOpen size={20} className="text-violet-500" />
            </div>
            <div>
              <p className="font-semibold text-warm-800 dark:text-warm-100">
                Explore Verbs
              </p>
              <p className="text-sm text-warm-500 dark:text-warm-400">
                Browse all {verbs.length} verbs
              </p>
            </div>
          </div>
          <ChevronRight size={20} className="text-warm-400" />
        </Card>
      </motion.div>
    </div>
  );
}
