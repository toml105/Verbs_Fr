import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Dumbbell, Lightbulb, ChevronRight, Brain } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import GrammarHelper from '../components/ai/GrammarHelper';
import { useProgress } from '../context/UserProgressContext';
import { useAI } from '../context/AIContext';
import { grammarLessons } from '../data/grammarLessons';
import { getMasteryLabel } from '../lib/srs';

type Tab = 'learn' | 'practice';

export default function GrammarLesson() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { userData } = useProgress();
  const { isAIAvailable } = useAI();
  const [activeTab, setActiveTab] = useState<Tab>('learn');
  const [showGrammarHelper, setShowGrammarHelper] = useState(false);

  const lesson = grammarLessons.find(l => l.id === lessonId);
  const progress = lessonId ? userData.grammarProgress[lessonId] : undefined;

  const nextLesson = useMemo(() => {
    if (!lesson) return null;
    const sameTier = grammarLessons.filter(l => l.tier === lesson.tier).sort((a, b) => a.order - b.order);
    const currentIdx = sameTier.findIndex(l => l.id === lesson.id);
    if (currentIdx < sameTier.length - 1) return sameTier[currentIdx + 1];
    // Try next tier
    const nextTier = grammarLessons.filter(l => l.tier === (lesson.tier + 1) as 1 | 2 | 3).sort((a, b) => a.order - b.order);
    return nextTier[0] ?? null;
  }, [lesson]);

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <p className="text-warm-500">Lesson not found.</p>
        <Button onClick={() => navigate('/grammar')} variant="ghost" className="mt-4">
          Back to Grammar
        </Button>
      </div>
    );
  }

  const tierColors = {
    1: { badge: 'emerald' as const, label: 'Foundations' },
    2: { badge: 'amber' as const, label: 'Intermediate' },
    3: { badge: 'coral' as const, label: 'Advanced' },
  };
  const tier = tierColors[lesson.tier];
  const masteryLevel = progress?.masteryLevel ?? 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => navigate('/grammar')}
          className="flex items-center gap-1 text-warm-500 hover:text-warm-700 dark:hover:text-warm-300 transition-colors mb-2"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Grammar</span>
        </button>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold text-warm-800 dark:text-warm-100">
            {lesson.title}
          </h1>
          <Badge variant={tier.badge} size="sm">{tier.label}</Badge>
        </div>
        <p className="text-sm text-warm-500 dark:text-warm-400">
          {lesson.shortDescription}
        </p>
        {progress && (
          <div className="flex items-center gap-2 mt-2">
            <ProgressBar
              progress={(masteryLevel / 5) * 100}
              color={masteryLevel >= 4 ? 'bg-emerald-500' : masteryLevel >= 2 ? 'bg-amber-500' : 'bg-warm-300'}
              height="h-1.5"
            />
            <span className="text-xs text-warm-400">{getMasteryLabel(masteryLevel)}</span>
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-warm-100 dark:bg-warm-800 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('learn')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'learn'
              ? 'bg-white dark:bg-warm-700 text-warm-800 dark:text-warm-100 shadow-sm'
              : 'text-warm-500 hover:text-warm-700 dark:hover:text-warm-300'
          }`}
        >
          <BookOpen size={16} />
          Learn
        </button>
        <button
          onClick={() => setActiveTab('practice')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'practice'
              ? 'bg-white dark:bg-warm-700 text-warm-800 dark:text-warm-100 shadow-sm'
              : 'text-warm-500 hover:text-warm-700 dark:hover:text-warm-300'
          }`}
        >
          <Dumbbell size={16} />
          Practice
        </button>
      </div>

      {/* Learn tab content */}
      {activeTab === 'learn' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Introduction */}
          <Card>
            <p className="text-sm text-warm-700 dark:text-warm-200 leading-relaxed">
              {lesson.introduction}
            </p>
          </Card>

          {/* Rules */}
          {lesson.rules.map((rule, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card>
                <h3 className="font-semibold text-warm-800 dark:text-warm-100 mb-2">
                  {rule.title}
                </h3>
                {rule.formula && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 mb-3">
                    <p className="text-sm font-mono font-medium text-blue-700 dark:text-blue-300">
                      {rule.formula}
                    </p>
                  </div>
                )}
                <p className="text-sm text-warm-600 dark:text-warm-300 mb-3 leading-relaxed">
                  {rule.explanation}
                </p>
                <div className="space-y-2">
                  {rule.examples.map((ex, exIdx) => (
                    <div key={exIdx} className="flex gap-3 text-sm">
                      <span className="font-medium text-warm-800 dark:text-warm-100 flex-1">
                        {ex.french}
                      </span>
                      <span className="text-warm-400 flex-1">
                        {ex.english}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}

          {/* Tips */}
          {lesson.tips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: lesson.rules.length * 0.05 }}
            >
              <Card className="border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={18} className="text-amber-500" />
                  <h3 className="font-semibold text-warm-800 dark:text-warm-100">
                    Common Mistakes to Avoid
                  </h3>
                </div>
                <ul className="space-y-2">
                  {lesson.tips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-warm-600 dark:text-warm-300 leading-relaxed flex gap-2">
                      <span className="text-amber-500 flex-shrink-0">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          )}

          {/* CTA to practice */}
          <Button
            onClick={() => setActiveTab('practice')}
            className="w-full"
            size="lg"
          >
            <Dumbbell size={18} className="mr-2" />
            Practice This Lesson
          </Button>
        </motion.div>
      )}

      {/* Practice tab content */}
      {activeTab === 'practice' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <Card>
            <div className="text-center py-4">
              <Dumbbell size={32} className="text-coral-500 mx-auto mb-3" />
              <h3 className="font-semibold text-warm-800 dark:text-warm-100 mb-1">
                Ready to practice?
              </h3>
              <p className="text-sm text-warm-500 dark:text-warm-400 mb-4">
                You'll answer 10 questions on {lesson.title.toLowerCase()}.
                Mix of fill-in-the-blank, multiple choice, and more.
              </p>
              {progress && progress.bestScore > 0 && (
                <p className="text-xs text-warm-400 mb-4">
                  Your best score: <span className="font-semibold text-warm-600 dark:text-warm-300">{progress.bestScore}%</span>
                </p>
              )}
              <Button
                onClick={() => navigate(`/grammar/${lessonId}/practice`)}
                size="lg"
                className="w-full"
              >
                Start Practice
              </Button>
            </div>
          </Card>

          {/* Next lesson suggestion */}
          {nextLesson && (
            <Card hover onClick={() => navigate(`/grammar/${nextLesson.id}`)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-warm-400 mb-0.5">Next lesson</p>
                  <p className="font-medium text-warm-800 dark:text-warm-100 text-sm">
                    {nextLesson.title}
                  </p>
                </div>
                <ChevronRight size={18} className="text-warm-400" />
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {/* Floating Ask AI button */}
      {isAIAvailable && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          onClick={() => setShowGrammarHelper(true)}
          className="fixed bottom-20 right-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-coral-500 text-white shadow-lg shadow-coral-500/30 hover:bg-coral-600 active:bg-coral-700 transition-colors"
        >
          <Brain size={18} />
          <span className="text-sm font-medium">Ask AI</span>
        </motion.button>
      )}

      {/* Grammar Helper bottom sheet */}
      <GrammarHelper
        context={`${lesson.title} - ${lesson.introduction}`}
        isOpen={showGrammarHelper}
        onClose={() => setShowGrammarHelper(false)}
      />
    </div>
  );
}
