import { Outlet } from 'react-router';
import BottomNav from './BottomNav';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-900 transition-colors duration-300">
      <main className="max-w-lg mx-auto px-4 pb-24 pt-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
