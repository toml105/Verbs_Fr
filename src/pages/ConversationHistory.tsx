import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { History, ArrowLeft, MessageSquare, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import type { AIMessage } from '../types';

export interface ConversationRecord {
  id: string;
  title: string;
  topic: string | null;
  difficulty: number | null;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'conjugo_conversations';

function getLocalConversations(): ConversationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ConversationRecord[];
  } catch {
    return [];
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function DifficultyStars({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          size={10}
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

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function ConversationHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConversations() {
      let records: ConversationRecord[] = [];

      if (user && supabase) {
        try {
          const { data } = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

          if (data && data.length > 0) {
            records = data.map((row) => ({
              id: row.id,
              title: row.title ?? 'Untitled',
              topic: row.topic ?? null,
              difficulty: row.difficulty ?? null,
              messages: (row.messages ?? []) as AIMessage[],
              createdAt: row.created_at,
              updatedAt: row.updated_at,
            }));
          }
        } catch {
          // Fall back to localStorage on error
          records = getLocalConversations();
        }
      } else {
        records = getLocalConversations();
      }

      // Sort by most recent first
      records.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      setConversations(records);
      setLoading(false);
    }

    loadConversations();
  }, [user]);

  const handleOpenConversation = (id: string) => {
    navigate('/ai-tutor', { state: { conversationId: id } });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <button
          onClick={() => navigate('/ai-tutor')}
          className="p-2 -ml-2 rounded-xl text-warm-500 hover:text-warm-700 hover:bg-warm-100 dark:hover:bg-warm-700 transition-colors"
          aria-label="Back to AI Tutor"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="p-2.5 rounded-xl bg-coral-50 dark:bg-coral-900/30">
          <History size={22} className="text-coral-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100">
            Conversation History
          </h1>
          <p className="text-sm text-warm-500 dark:text-warm-400">
            Browse and resume past conversations
          </p>
        </div>
      </motion.div>

      {/* Loading state */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-warm-500 dark:text-warm-400"
        >
          Loading conversations...
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && conversations.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="p-4 rounded-full bg-warm-100 dark:bg-warm-700 inline-block mb-4">
            <MessageSquare
              size={32}
              className="text-warm-400 dark:text-warm-500"
            />
          </div>
          <p className="text-warm-600 dark:text-warm-300 font-medium">
            No conversations yet.
          </p>
          <p className="text-sm text-warm-500 dark:text-warm-400 mt-1">
            Start chatting with your AI tutor!
          </p>
        </motion.div>
      )}

      {/* Conversation list */}
      {!loading && conversations.length > 0 && (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {conversations.map((conv) => {
            const messageCount = conv.messages.filter(
              (m) => m.role !== 'system'
            ).length;

            return (
              <motion.div key={conv.id} variants={itemVariants}>
                <Card
                  hover
                  padding="sm"
                  onClick={() => handleOpenConversation(conv.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-coral-50 dark:bg-coral-900/30 flex-shrink-0">
                      <MessageSquare
                        size={18}
                        className="text-coral-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-warm-800 dark:text-warm-100 truncate text-sm">
                        {conv.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-warm-500 dark:text-warm-400">
                          {formatDate(conv.updatedAt)}
                        </span>
                        <span className="text-xs text-warm-400 dark:text-warm-500">
                          {messageCount} message{messageCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    {conv.difficulty != null && (
                      <Badge variant="amber">
                        <DifficultyStars level={conv.difficulty} />
                      </Badge>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
