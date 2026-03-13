import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Flame, BookOpen, Dumbbell, ChevronRight, Sparkles, Star, Target, Zap, Ear, MessageCircle, GraduationCap, Brain, PenTool } from 'lucide-react';
import { useProgress } from '../context/UserProgressContext';
import { useAI } from '../context/AIContext';
import Card from '../components/ui/Card';
import ProgressRing from '../components/ui/ProgressRing';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';
import HeatMap from '../components/ui/HeatMap';
import { verbs } from '../data/verbs';
import { grammarLessons } from '../data/grammarLessons';
import { getLevelFromXP } from '../lib/xp';
import { getTodayChallenge } from '../data/dailyChallenges';
import { todayString } from '../lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { userData, getOverallMastery, getDueReviewCount, getDueGrammarLessons } = useProgress();
  const { isOllamaAvailable } = useAI();
  const { stats } = userData;

  const overallMastery = getOverallMastery();
  const dueCount = getDueReviewCount();
  const dueGrammarCount = getDueGrammarLessons().length;
  const verbsStarted = Object.keys(userData.verbProgress).length;
  const grammarCompleted = Object.values(userData.grammarProgress).filter(p => p.completed).length;
  const dailyProgress = Math.min(
    100,
    Math.round((stats.todayReviews / stats.dailyGoal) * 100)
  );

  const levelInfo = getLevelFromXP(userData.totalXP);
  const todayChallenge = getTodayChallenge();
  const todayChallengeKey = `${todayString()}_${todayChallenge.id}`;
  const isChallengeCompleted = userData.completedChallenges.includes(todayChallengeKey);

  // Today's XP earned
  const todayXP = useMemo(() => {
    const today = todayString();
    const todayActivity = userData.activityHistory.find(a => a.date === today);
    return todayActivity?.xpEarned ?? 0;
  }, [userData.activityHistory]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-5">
      {/* Header with Level */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100">
            {greeting()} 👋
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm font-medium text-violet-500">
              Lvl {levelInfo.level} · {levelInfo.title}
            </span>
            {todayXP > 0 && (
              <span className="text-xs text-amber-500 font-medium">
                +{todayXP} XP today
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* AI status indicator */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-warm-50 dark:bg-warm-700/50" title={isOllamaAvailable ? 'AI Online' : 'AI Offline'}>
            <Sparkles size={14} className={isOllamaAvailable ? 'text-coral-500' : 'text-warm-400'} />
            <span className={`w-2 h-2 rounded-full ${isOllamaAvailable ? 'bg-emerald-500' : 'bg-warm-300 dark:bg-warm-500'}`} />
          </div>
          {stats.currentStreak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-full">
              <Flame size={18} className="text-amber-500" />
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {stats.currentStreak}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* XP Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="flex items-center gap-3">
          <Star size={16} className="text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-warm-500">Level {levelInfo.level}</span>
              <span className="text-warm-400">{levelInfo.currentXP}/{levelInfo.nextLevelXP} XP</span>
            </div>
            <ProgressBar
              progress={levelInfo.progress}
              color="bg-gradient-to-r from-amber-400 to-amber-500"
              height="h-1.5"
            />
          </div>
        </div>
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

      {/* Daily Challenge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card
          hover={!isChallengeCompleted}
          onClick={isChallengeCompleted ? undefined : () => navigate('/practice')}
          className={isChallengeCompleted ? 'border-emerald-200 dark:border-emerald-800' : ''}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isChallengeCompleted ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-amber-50 dark:bg-amber-900/30'}`}>
              {isChallengeCompleted
                ? <Target size={20} className="text-emerald-500" />
                : <Zap size={20} className="text-amber-500" />
              }
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-warm-800 dark:text-warm-100 text-sm">
                  Daily Challenge
                </p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-medium">
                  +50 XP
                </span>
              </div>
              <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
                {isChallengeCompleted ? 'Completed!' : todayChallenge.description}
              </p>
            </div>
            {!isChallengeCompleted && <ChevronRight size={16} className="text-warm-400" />}
          </div>
        </Card>
      </motion.div>

      {/* AI-Powered Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-coral-500" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-warm-400 dark:text-warm-500">
            AI-Powered
          </h2>
          <div className="flex-1 h-px bg-warm-100 dark:bg-warm-700" />
        </div>

        {/* AI Tutor */}
        <Card
          hover
          onClick={() => navigate('/ai-tutor')}
          className="flex items-center justify-between mb-3"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-coral-50 dark:bg-coral-900/30">
              <Sparkles size={20} className="text-coral-500" />
            </div>
            <div>
              <p className="font-semibold text-warm-800 dark:text-warm-100">
                AI French Tutor
              </p>
              <p className="text-sm text-warm-500 dark:text-warm-400">
                Practice conversational French
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOllamaAvailable ? (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            ) : (
              <span className="text-xs text-warm-400">(Offline)</span>
            )}
            <ChevronRight size={16} className="text-warm-400" />
          </div>
        </Card>

        {/* Smart Practice & Sentence Builder */}
        <div className="grid grid-cols-2 gap-3">
          <Card
            hover
            padding="md"
            className="h-full"
            onClick={() => navigate('/smart-practice')}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-900/30">
                <Brain size={18} className="text-violet-500" />
              </div>
            </div>
            <p className="font-semibold text-warm-800 dark:text-warm-100">
              Smart Practice
            </p>
            <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
              AI-guided drills
            </p>
          </Card>

          <Card
            hover
            padding="md"
            className="h-full"
            onClick={() => navigate('/sentence-builder')}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-900/30">
                <PenTool size={18} className="text-teal-500" />
              </div>
            </div>
            <p className="font-semibold text-warm-800 dark:text-warm-100">
              Sentence Builder
            </p>
            <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
              Build French sentences
            </p>
          </Card>
        </div>
      </motion.div>

      {/* Action cards */}
      <div className="grid grid-cols-2 gap-3">
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
              {dueCount > 0 || dueGrammarCount > 0
                ? `${dueCount > 0 ? `${dueCount} verb${dueCount !== 1 ? 's' : ''}` : ''}${dueCount > 0 && dueGrammarCount > 0 ? ' + ' : ''}${dueGrammarCount > 0 ? `${dueGrammarCount} grammar` : ''} due`
                : 'All caught up!'}
            </p>
          </Card>
        </motion.div>

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

      {/* Heat Map */}
      {userData.activityHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <h3 className="font-semibold text-warm-800 dark:text-warm-100 text-sm mb-3">
              Activity
            </h3>
            <div className="overflow-x-auto">
              <HeatMap activityHistory={userData.activityHistory} />
            </div>
          </Card>
        </motion.div>
      )}

      {/* Start practicing CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
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

      {/* Speaking & Listening */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.37 }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Card
            hover
            padding="md"
            onClick={() => navigate('/listening')}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                <Ear size={18} className="text-blue-500" />
              </div>
            </div>
            <p className="font-semibold text-warm-800 dark:text-warm-100">
              Listening
            </p>
            <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
              Train your ear
            </p>
          </Card>
          <Card
            hover
            padding="md"
            onClick={() => navigate('/conversations')}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                <MessageCircle size={18} className="text-emerald-500" />
              </div>
            </div>
            <p className="font-semibold text-warm-800 dark:text-warm-100">
              Conversations
            </p>
            <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
              Practice dialogues
            </p>
          </Card>
        </div>
      </motion.div>

      {/* Grammar progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card
          hover
          onClick={() => navigate('/grammar')}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30">
              <GraduationCap size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="font-semibold text-warm-800 dark:text-warm-100">
                Grammar
              </p>
              <p className="text-sm text-warm-500 dark:text-warm-400">
                {grammarCompleted > 0
                  ? `${grammarCompleted}/${grammarLessons.length} lessons completed`
                  : `${grammarLessons.length} lessons to master`}
              </p>
            </div>
          </div>
          <ChevronRight size={20} className="text-warm-400" />
        </Card>
      </motion.div>

      {/* Explore verbs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.43 }}
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
