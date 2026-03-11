import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Brain, Trophy, ChevronRight, ChevronLeft } from 'lucide-react';
import Button from '../ui/Button';

interface WelcomeProps {
  onStartPlacement: () => void;
  onSkip: () => void;
}

const screens = [
  {
    icon: BookOpen,
    color: 'text-coral-500',
    bg: 'bg-coral-50 dark:bg-coral-900/30',
    title: 'Master French Verbs',
    subtitle: '300+ verbs across 11 tenses',
    description: 'Build lasting fluency with the most comprehensive French verb trainer. From être to résoudre, we\'ve got you covered.',
  },
  {
    icon: Brain,
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-900/30',
    title: 'Smart Practice',
    subtitle: 'Powered by spaced repetition',
    description: 'Our SM-2 algorithm knows exactly when to quiz you. Multiple exercise types keep practice engaging and effective.',
  },
  {
    icon: Trophy,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    title: 'Track Your Journey',
    subtitle: 'XP, levels, and achievements',
    description: 'Earn XP for every answer, level up through 50 ranks, and unlock achievements. Daily challenges keep you coming back.',
  },
];

export default function Welcome({ onStartPlacement, onSkip }: WelcomeProps) {
  const [currentScreen, setCurrentScreen] = useState(0);

  const screen = screens[currentScreen];
  const Icon = screen.icon;
  const isLast = currentScreen === screens.length - 1;

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-900 flex flex-col items-center justify-center px-6 py-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center text-center max-w-sm"
        >
          <div className={`p-6 rounded-3xl ${screen.bg} mb-8`}>
            <Icon size={64} className={screen.color} />
          </div>

          <h1 className="text-3xl font-bold text-warm-800 dark:text-warm-100">
            {screen.title}
          </h1>
          <p className="text-coral-500 font-medium mt-2">{screen.subtitle}</p>
          <p className="text-warm-500 dark:text-warm-400 mt-4 leading-relaxed">
            {screen.description}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="flex gap-2 mt-10">
        {screens.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === currentScreen
                ? 'bg-coral-500 w-6'
                : 'bg-warm-300 dark:bg-warm-600'
            }`}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="w-full max-w-sm mt-10 space-y-3">
        {isLast ? (
          <>
            <Button onClick={onStartPlacement} size="lg" className="w-full">
              Take Placement Test
            </Button>
            <Button variant="ghost" onClick={onSkip} size="lg" className="w-full">
              Skip — I'm a beginner
            </Button>
          </>
        ) : (
          <div className="flex gap-3">
            {currentScreen > 0 && (
              <Button
                variant="secondary"
                onClick={() => setCurrentScreen(prev => prev - 1)}
                size="lg"
              >
                <ChevronLeft size={18} />
              </Button>
            )}
            <Button
              onClick={() => setCurrentScreen(prev => prev + 1)}
              size="lg"
              className="flex-1"
            >
              Next
              <ChevronRight size={18} className="ml-2" />
            </Button>
          </div>
        )}

        {!isLast && (
          <button
            onClick={onSkip}
            className="w-full text-center text-sm text-warm-400 hover:text-warm-600 py-2"
          >
            Skip intro
          </button>
        )}
      </div>
    </div>
  );
}
