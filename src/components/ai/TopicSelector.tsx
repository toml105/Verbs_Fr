import { motion } from 'framer-motion';
import { MessageSquare, Star } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import type { ConversationTopic } from '../../types';

const TOPICS: ConversationTopic[] = [
  {
    id: 'restaurant',
    title: 'At the Restaurant',
    titleFr: 'Au restaurant',
    description: 'Order food, ask for the menu, and chat with the waiter',
    icon: '🍽️',
    difficulty: 1,
    starterPrompt: 'Au restaurant',
  },
  {
    id: 'doctor',
    title: 'At the Doctor',
    titleFr: 'Chez le médecin',
    description: 'Describe symptoms and understand medical advice',
    icon: '🏥',
    difficulty: 2,
    starterPrompt: 'Chez le médecin',
  },
  {
    id: 'market',
    title: 'At the Market',
    titleFr: 'Au marché',
    description: 'Buy fruits, vegetables, and haggle prices',
    icon: '🛒',
    difficulty: 1,
    starterPrompt: 'Au marché',
  },
  {
    id: 'travel',
    title: 'Traveling',
    titleFr: 'Voyager',
    description: 'Ask for directions, book hotels, and navigate airports',
    icon: '✈️',
    difficulty: 2,
    starterPrompt: 'Voyager',
  },
  {
    id: 'family',
    title: 'Family',
    titleFr: 'La famille',
    description: 'Talk about family members, relationships, and gatherings',
    icon: '👨‍👩‍👧‍👦',
    difficulty: 1,
    starterPrompt: 'La famille',
  },
  {
    id: 'work',
    title: 'At Work',
    titleFr: 'Au travail',
    description: 'Discuss your job, meetings, and workplace conversations',
    icon: '💼',
    difficulty: 2,
    starterPrompt: 'Au travail',
  },
  {
    id: 'hobbies',
    title: 'Hobbies',
    titleFr: 'Les loisirs',
    description: 'Share your interests, sports, and free time activities',
    icon: '🎨',
    difficulty: 1,
    starterPrompt: 'Les loisirs',
  },
  {
    id: 'shopping',
    title: 'Shopping',
    titleFr: 'Faire les courses',
    description: 'Buy clothes, compare prices, and return items',
    icon: '🛍️',
    difficulty: 3,
    starterPrompt: 'Faire les courses',
  },
];

interface TopicSelectorProps {
  onSelectTopic: (topic: ConversationTopic | null) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

function DifficultyStars({ level }: { level: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          size={12}
          className={
            i <= level
              ? 'text-amber-400 fill-amber-400'
              : 'text-warm-300 dark:text-warm-600'
          }
        />
      ))}
    </div>
  );
}

export default function TopicSelector({ onSelectTopic }: TopicSelectorProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-3"
    >
      {/* Free Conversation - spans full width */}
      <motion.div variants={itemVariants}>
        <Card
          hover
          padding="lg"
          onClick={() => onSelectTopic(null)}
          className="border-coral-200 dark:border-coral-800/50 bg-gradient-to-r from-coral-50 to-white dark:from-coral-900/20 dark:to-warm-800"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-coral-100 dark:bg-coral-900/40">
              <MessageSquare size={22} className="text-coral-500" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-warm-800 dark:text-warm-100">
                Free Conversation
              </p>
              <p className="text-sm text-warm-500 dark:text-warm-400">
                Chat about anything you want in French
              </p>
            </div>
            <Badge variant="coral">Any topic</Badge>
          </div>
        </Card>
      </motion.div>

      {/* Topic grid - 2 columns */}
      <div className="grid grid-cols-2 gap-3">
        {TOPICS.map((topic) => (
          <motion.div key={topic.id} variants={itemVariants}>
            <Card
              hover
              padding="md"
              className="h-full"
              onClick={() => onSelectTopic(topic)}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{topic.icon}</span>
                  <DifficultyStars level={topic.difficulty} />
                </div>
                <div>
                  <p className="font-semibold text-warm-800 dark:text-warm-100 text-sm">
                    {topic.titleFr}
                  </p>
                  <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5">
                    {topic.title}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
