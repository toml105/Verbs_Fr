import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Dumbbell, Volume2, Lightbulb, GitBranch, ChevronRight } from 'lucide-react';
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
import { speak, isAudioSupported } from '../lib/audio';
import { getVerbFamily } from '../data/verbFamilies';
import { getMnemonicsForVerb } from '../data/mnemonics';

export default function VerbDetail() {
  const { verbId } = useParams();
  const navigate = useNavigate();
  const { getVerbMastery, userData } = useProgress();

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
  const family = getVerbFamily(verb.id);
  const mnemonics = getMnemonicsForVerb(verb.id);
  const audioEnabled = userData.settings.audioEnabled && isAudioSupported();

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
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-warm-800 dark:text-warm-100">
                  {verb.infinitive}
                </h1>
                {audioEnabled && (
                  <button
                    onClick={() => speak(verb.infinitive, userData.settings.audioRate)}
                    className="p-1.5 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-700 transition-colors"
                    title="Listen"
                  >
                    <Volume2 size={18} className="text-coral-500" />
                  </button>
                )}
              </div>
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

      {/* Memory Tips */}
      {mnemonics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
            <div className="flex items-start gap-3">
              <Lightbulb size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-warm-800 dark:text-warm-100 text-sm">
                  {mnemonics[0].title}
                </h3>
                <p className="text-sm text-warm-600 dark:text-warm-300 mt-1 leading-relaxed">
                  {mnemonics[0].tip}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

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

      {/* Verb Family */}
      {family && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <h2 className="text-lg font-semibold text-warm-800 dark:text-warm-100 mb-2 flex items-center gap-2">
              <GitBranch size={18} />
              {family.name}
            </h2>
            <p className="text-sm text-warm-500 dark:text-warm-400 mb-3">
              {family.explanation}
            </p>
            <div className="space-y-1">
              {family.verbs
                .filter(v => v !== verb.id)
                .map(relatedId => {
                  const related = verbs.find(v => v.id === relatedId);
                  if (!related) return null;
                  return (
                    <button
                      key={relatedId}
                      onClick={() => navigate(`/verbs/${relatedId}`)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-warm-50 dark:hover:bg-warm-700/50 transition-colors text-left"
                    >
                      <div>
                        <span className="font-medium text-coral-500">{related.infinitive}</span>
                        <span className="text-sm text-warm-400 ml-2">{related.english}</span>
                      </div>
                      <ChevronRight size={16} className="text-warm-400" />
                    </button>
                  );
                })}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
