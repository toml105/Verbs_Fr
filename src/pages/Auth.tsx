import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

type AuthMode = 'signin' | 'signup';

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    if (mode === 'signup') {
      const result = await signUp(email, password);
      setLoading(false);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccessMessage(
          'Account created! Check your email to confirm, then sign in.'
        );
        setMode('signin');
        setPassword('');
      }
    } else {
      const result = await signIn(email, password);
      setLoading(false);
      if (result.error) {
        setError(result.error);
      } else {
        navigate('/');
      }
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-900 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-coral-500 text-white shadow-lg mb-2"
          >
            <BookOpen size={32} />
          </motion.div>
          <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100">
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-sm text-warm-500 dark:text-warm-400">
            {mode === 'signin'
              ? 'Sign in to sync your progress across devices'
              : 'Start your French learning journey'}
          </p>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Success message */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-sm rounded-xl px-4 py-3"
              >
                {successMessage}
              </motion.div>
            )}

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 text-sm rounded-xl px-4 py-3"
              >
                {error}
              </motion.div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-warm-700 dark:text-warm-300"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400"
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warm-200 dark:border-warm-600 bg-warm-50 dark:bg-warm-700 text-warm-800 dark:text-warm-100 placeholder:text-warm-400 dark:placeholder:text-warm-500 focus:outline-none focus:ring-2 focus:ring-coral-500/50 focus:border-coral-500 transition-colors text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-warm-700 dark:text-warm-300"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400"
                />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                  required
                  minLength={6}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warm-200 dark:border-warm-600 bg-warm-50 dark:bg-warm-700 text-warm-800 dark:text-warm-100 placeholder:text-warm-400 dark:placeholder:text-warm-500 focus:outline-none focus:ring-2 focus:ring-coral-500/50 focus:border-coral-500 transition-colors text-sm"
                />
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2"
              size="lg"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : mode === 'signin' ? (
                <LogIn size={18} />
              ) : (
                <UserPlus size={18} />
              )}
              {loading
                ? 'Please wait...'
                : mode === 'signin'
                  ? 'Sign In'
                  : 'Create Account'}
            </Button>
          </form>

          {/* Toggle mode */}
          <div className="mt-4 pt-4 border-t border-warm-100 dark:border-warm-700 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-warm-500 dark:text-warm-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors"
            >
              {mode === 'signin'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </Card>

        {/* Continue as Guest */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-200 transition-colors"
          >
            Continue as Guest
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
