import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Dumbbell } from 'lucide-react';
import { verbs } from '../data/verbs';
import { examples } from '../data/examples';
import { useProgress } from '../context/UserProgressContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ProgressRing from '../components/ui/ProgressRing';
import ConjugationTable from '../components/verbs/ConjugationTable';
import ExampleSentence from '../components/verbs/ExampleSentence';
import { getGroupLabel, getDifficultyLabel } from '../lib/utils';

export default function VerbDetail() {
  const { verbId } = useParams();
  const navigate = useNavigate();
  const { getVerbMastery } = useProgress();

  const verb = verbs.find((v) => v.id === verbId);
  if (!verb) {
    return (
      <div className="text-center py-12">
        <p className="text-warm-400">Verb not found.</p>
        <Button variant="ghost" onClick={() => navigate('/verbs')} className="mt-4">
          Back to verbs
        </Button>
      </div>
    );
  }

  const mastery = getVerbMastery(verb.id);
  const verbExamples = examples.filter((e) => e.verbId === verb.id);

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-warm-500 hover:text-warm-700 dark:hover:text-warm-300 transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="text-sm">Back</span>
      </button>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card padding="lg">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-warm-800 dark:text-warm-100">
                {verb.infinitive}
              </h1>
              <p className="text-lg text-warm-500 dark:text-warm-400 mt-1">
                {verb.english}
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Badge variant="coral">{getGroupLabel(verb.group)}</Badge>
                <Badge variant="amber">{getDifficultyLabel(verb.difficulty)}</Badge>
                <Badge variant="violet">{verb.auxiliary}</Badge>
                {verb.isReflexive && <Badge>reflexive</Badge>}
              </div>
            </div>
            <ProgressRing progress={mastery} size={64} strokeWidth={5}>
              <span className="text-sm font-bold text-warm-700 dark:text-warm-200">
                {mastery}%
              </span>
            </ProgressRing>
          </div>

          <Button
            onClick={() => navigate(`/practice?verb=${verb.id}`)}
            className="w-full mt-5"
            size="lg"
          >
            <Dumbbell size={18} className="mr-2" />
            Practice this verb
          </Button>
        </Card>
      </motion.div>

      {/* Conjugations */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <h2 className="text-lg font-semibold text-warm-800 dark:text-warm-100 mb-4">
            Conjugations
          </h2>
          <ConjugationTable verbId={verb.id} />
        </Card>
      </motion.div>

      {/* Examples */}
      {verbExamples.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <h2 className="text-lg font-semibold text-warm-800 dark:text-warm-100 mb-3">
              Examples
            </h2>
            {verbExamples.map((ex, i) => (
              <ExampleSentence key={i} example={ex} />
            ))}
          </Card>
        </motion.div>
      )}
    </div>
  );
}
