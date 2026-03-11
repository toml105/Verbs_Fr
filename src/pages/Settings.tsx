import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Target, Trash2, Info } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/UserProgressContext';
import Card from '../components/ui/Card';
import Toggle from '../components/ui/Toggle';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const DAILY_GOALS = [10, 20, 30, 50];

export default function Settings() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { userData, setDailyGoal, resetProgress } = useProgress();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100">
          Settings
        </h1>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <h2 className="font-semibold text-warm-800 dark:text-warm-100 mb-4 flex items-center gap-2">
            <Moon size={18} />
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <span className="text-warm-600 dark:text-warm-300">Dark Mode</span>
            <Toggle checked={darkMode} onChange={toggleDarkMode} />
          </div>
        </Card>
      </motion.div>

      {/* Daily Goal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <h2 className="font-semibold text-warm-800 dark:text-warm-100 mb-4 flex items-center gap-2">
            <Target size={18} />
            Daily Goal
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {DAILY_GOALS.map((goal) => (
              <button
                key={goal}
                onClick={() => setDailyGoal(goal)}
                className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                  userData.settings.dailyGoal === goal
                    ? 'bg-coral-500 text-white shadow-sm'
                    : 'bg-warm-100 text-warm-600 hover:bg-warm-200 dark:bg-warm-700 dark:text-warm-300'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
          <p className="text-xs text-warm-400 mt-2">
            Reviews per day
          </p>
        </Card>
      </motion.div>

      {/* Reset */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <h2 className="font-semibold text-warm-800 dark:text-warm-100 mb-4 flex items-center gap-2">
            <Trash2 size={18} />
            Data
          </h2>
          <Button
            variant="danger"
            onClick={() => setShowResetConfirm(true)}
            className="w-full"
          >
            Reset All Progress
          </Button>
        </Card>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
          <h2 className="font-semibold text-warm-800 dark:text-warm-100 mb-3 flex items-center gap-2">
            <Info size={18} />
            About
          </h2>
          <p className="text-sm text-warm-500 dark:text-warm-400 leading-relaxed">
            Conjugo helps you master French verb conjugations using spaced
            repetition (SM-2 algorithm) and active recall techniques. Practice
            300+ verbs across 11 tenses to build lasting fluency.
          </p>
          <p className="text-xs text-warm-400 mt-3">Version 1.0.0</p>
        </Card>
      </motion.div>

      {/* Reset confirmation modal */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Reset Progress"
      >
        <p className="text-warm-600 dark:text-warm-300 mb-4">
          This will permanently delete all your learning progress, streaks, and
          statistics. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowResetConfirm(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              resetProgress();
              setShowResetConfirm(false);
            }}
            className="flex-1"
          >
            Reset
          </Button>
        </div>
      </Modal>
    </div>
  );
}
