import { useCallback } from 'react';
import { Outlet, Link } from 'react-router';
import BottomNav from './BottomNav';
import AchievementToast from '../ui/AchievementToast';
import Confetti from '../ui/Confetti';
import { useProgress } from '../../context/UserProgressContext';
import { useAuth } from '../../context/AuthContext';

export default function AppShell() {
  const { pendingAchievements, clearPendingAchievements } = useProgress();
  const { user } = useAuth();
  const showConfetti = pendingAchievements.length > 0;

  const handleAchievementsDone = useCallback(() => {
    clearPendingAchievements();
  }, [clearPendingAchievements]);

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-900 transition-colors duration-300 safe-area-top">
      <Confetti active={showConfetti} />
      {pendingAchievements.length > 0 && (
        <AchievementToast
          achievements={pendingAchievements}
          onDone={handleAchievementsDone}
        />
      )}
      {/* User indicator in top-right corner */}
      <div className="max-w-lg mx-auto px-4 pt-3 flex justify-end">
        {user ? (
          <Link
            to="/settings"
            className="w-8 h-8 rounded-full bg-coral-500 text-white flex items-center justify-center text-xs font-semibold uppercase hover:bg-coral-600 transition-colors"
            title={user.email ?? 'Account'}
          >
            {user.email?.charAt(0) ?? '?'}
          </Link>
        ) : (
          <Link
            to="/auth"
            className="text-xs text-warm-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors py-1 px-2"
          >
            Sign in
          </Link>
        )}
      </div>
      <main className="max-w-lg mx-auto px-4 pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
