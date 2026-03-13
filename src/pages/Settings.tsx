import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Moon, Target, Trash2, Info, Volume2, User, LogOut, ArrowRight, Brain } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAI } from '../context/AIContext';
import { useProgress } from '../context/UserProgressContext';
import Card from '../components/ui/Card';
import Toggle from '../components/ui/Toggle';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { isAudioSupported, speak } from '../lib/audio';

const DAILY_GOALS = [10, 20, 30, 50];
const SPEECH_RATES = [
  { label: 'Slow', value: 0.6 },
  { label: 'Normal', value: 0.9 },
  { label: 'Fast', value: 1.2 },
];

export default function Settings() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, signOut } = useAuth();
  const { isOllamaAvailable, isChecking, selectedModel, setSelectedModel, availableModels, refreshStatus } = useAI();
  const { userData, setDailyGoal, resetProgress, updateSettings } = useProgress();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const audioSupported = isAudioSupported();

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100">
          Settings
        </h1>
      </motion.div>

      {/* Account */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card>
          <h2 className="font-semibold text-warm-800 dark:text-warm-100 mb-4 flex items-center gap-2">
            <User size={18} />
            Account
          </h2>
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-coral-500 text-white flex items-center justify-center font-semibold text-sm uppercase">
                  {user.email?.charAt(0) ?? '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-warm-800 dark:text-warm-100 truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-warm-400">Signed in</p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => signOut()}
                className="w-full gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </div>
          ) : (
            <Link to="/auth" className="block">
              <div className="flex items-center justify-between p-3 -m-1 rounded-xl bg-coral-50 dark:bg-coral-900/20 border border-coral-100 dark:border-coral-800 hover:bg-coral-100 dark:hover:bg-coral-900/30 transition-colors">
                <div>
                  <p className="text-sm font-medium text-warm-800 dark:text-warm-100">
                    Sign in to sync progress
                  </p>
                  <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5">
                    Keep your data across devices
                  </p>
                </div>
                <ArrowRight size={18} className="text-coral-500 flex-shrink-0" />
              </div>
            </Link>
          )}
        </Card>
      </motion.div>

      {/* AI Assistant */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.075 }}
      >
        <Card>
          <h2 className="font-semibold text-warm-800 dark:text-warm-100 mb-4 flex items-center gap-2">
            <Brain size={18} />
            AI Assistant
          </h2>
          <div className="space-y-3">
            {/* Status indicator */}
            <div className="flex items-center gap-2">
              {isChecking ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-warm-300 dark:bg-warm-500 animate-pulse" />
                  <span className="text-sm text-warm-500 dark:text-warm-400">Checking...</span>
                </>
              ) : isOllamaAvailable ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-sm text-warm-600 dark:text-warm-300">Connected</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-sm text-warm-600 dark:text-warm-300">Offline</span>
                </>
              )}
              <button
                onClick={() => refreshStatus()}
                className="ml-auto text-xs text-coral-500 hover:text-coral-600 dark:hover:text-coral-400 transition-colors"
              >
                Refresh
              </button>
            </div>

            {/* Model selector or setup instructions */}
            {isOllamaAvailable && availableModels.length > 0 ? (
              <div>
                <label
                  htmlFor="ai-model-select"
                  className="text-sm text-warm-600 dark:text-warm-300 block mb-1.5"
                >
                  Model
                </label>
                <select
                  id="ai-model-select"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full rounded-xl border border-warm-200 dark:border-warm-600 bg-warm-50 dark:bg-warm-700 text-warm-800 dark:text-warm-100 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-colors"
                >
                  {availableModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            ) : !isChecking && !isOllamaAvailable ? (
              <div className="space-y-2">
                <p className="text-sm text-warm-500 dark:text-warm-400 leading-relaxed">
                  Ollama is not running. Set up local AI to unlock the AI Tutor, Smart Practice, and Sentence Builder.
                </p>
                <Link
                  to="/ai-setup"
                  className="inline-flex items-center gap-1.5 text-sm text-coral-500 hover:text-coral-600 dark:hover:text-coral-400 font-medium transition-colors"
                >
                  View Setup Guide
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : null}
          </div>
        </Card>
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

      {/* Audio */}
      {audioSupported && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <h2 className="font-semibold text-warm-800 dark:text-warm-100 mb-4 flex items-center gap-2">
              <Volume2 size={18} />
              Audio
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-warm-600 dark:text-warm-300">Enable Audio</span>
                <Toggle
                  checked={userData.settings.audioEnabled}
                  onChange={(v) => updateSettings({ audioEnabled: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-warm-600 dark:text-warm-300">Auto-play on answer</span>
                <Toggle
                  checked={userData.settings.audioAutoPlay}
                  onChange={(v) => updateSettings({ audioAutoPlay: v })}
                />
              </div>
              <div>
                <span className="text-warm-600 dark:text-warm-300 text-sm">Speech Rate</span>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {SPEECH_RATES.map((rate) => (
                    <button
                      key={rate.value}
                      onClick={() => {
                        updateSettings({ audioRate: rate.value });
                        speak('bonjour', rate.value);
                      }}
                      className={`py-2 rounded-xl text-sm font-medium transition-all ${
                        userData.settings.audioRate === rate.value
                          ? 'bg-coral-500 text-white shadow-sm'
                          : 'bg-warm-100 text-warm-600 hover:bg-warm-200 dark:bg-warm-700 dark:text-warm-300'
                      }`}
                    >
                      {rate.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Reset */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
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
          <p className="text-xs text-warm-400 mt-3">Version 2.0.0</p>
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
