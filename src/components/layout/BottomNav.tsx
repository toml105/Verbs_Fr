import { useLocation, useNavigate } from 'react-router';
import { Home, BookOpen, Dumbbell, BarChart3, Settings } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/verbs', icon: BookOpen, label: 'Verbs' },
  { path: '/practice', icon: Dumbbell, label: 'Practice' },
  { path: '/progress', icon: BarChart3, label: 'Progress' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide nav on quiz pages
  if (location.pathname.startsWith('/quiz')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-warm-900/80 backdrop-blur-lg border-t border-warm-200 dark:border-warm-700 z-40 safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-1">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive =
            path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(path);

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px] ${
                isActive
                  ? 'text-coral-500'
                  : 'text-warm-400 hover:text-warm-600 dark:hover:text-warm-300'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
