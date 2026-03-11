import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Zap, Crown, Star, Award, Globe, GraduationCap, Brain, Timer, CheckCircle, Search, Calendar, Hash, TrendingUp } from 'lucide-react';
import type { Achievement } from '../../lib/achievements';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Flame, Zap, Crown, Star, Award, Globe, GraduationCap, Brain, Timer,
  CheckCircle, Search, Calendar, Hash, TrendingUp, Trophy,
  Sparkles: Star, Footprints: TrendingUp, Clock: Timer, History: Timer,
  Rewind: Timer, FastForward: Timer,
};

interface AchievementToastProps {
  achievements: Achievement[];
  onDone: () => void;
}

export default function AchievementToast({ achievements, onDone }: AchievementToastProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (currentIndex >= achievements.length) {
      onDone();
      return;
    }

    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 300);
    }, 3500);

    return () => clearTimeout(timer);
  }, [currentIndex, achievements.length, onDone]);

  if (currentIndex >= achievements.length) return null;
  const achievement = achievements[currentIndex];
  const IconComp = ICON_MAP[achievement.icon] ?? Trophy;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -100, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -100, opacity: 0, scale: 0.8 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[90] w-[90vw] max-w-sm"
        >
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/40 dark:to-yellow-900/40 border-2 border-amber-300 dark:border-amber-600 rounded-2xl p-4 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-800/50">
                <IconComp size={24} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                  Achievement Unlocked!
                </p>
                <p className="font-bold text-warm-800 dark:text-warm-100">
                  {achievement.name}
                </p>
                <p className="text-sm text-warm-500 dark:text-warm-400">
                  {achievement.description}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
