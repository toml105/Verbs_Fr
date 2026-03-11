import { useCallback } from 'react';
import { Outlet } from 'react-router';
import BottomNav from './BottomNav';
import AchievementToast from '../ui/AchievementToast';
import Confetti from '../ui/Confetti';
import { useProgress } from '../../context/UserProgressContext';

export default function AppShell() {
  const { pendingAchievements, clearPendingAchievements } = useProgress();
  const showConfetti = pendingAchievements.length > 0;

  const handleAchievementsDone = useCallback(() => {
    clearPendingAchievements();
  }, [clearPendingAchievements]);

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-900 transition-colors duration-300">
      <Confetti active={showConfetti} />
      {pendingAchievements.length > 0 && (
        <AchievementToast
          achievements={pendingAchievements}
          onDone={handleAchievementsDone}
        />
      )}
      <main className="max-w-lg mx-auto px-4 pb-24 pt-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
