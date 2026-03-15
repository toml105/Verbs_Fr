import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, Clock, Sparkles, Star } from 'lucide-react';
import { useAI } from '../context/AIContext';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/UserProgressContext';
import { supabase } from '../lib/supabase';
import { SYSTEM_PROMPTS } from '../lib/aiPrompts';
import TopicSelector from '../components/ai/TopicSelector';
import ChatMessage from '../components/ai/ChatMessage';
import ChatInput from '../components/ai/ChatInput';
import Badge from '../components/ui/Badge';
import type { AIMessage, ConversationTopic, GrammarCorrection } from '../types';
import type { ConversationRecord } from './ConversationHistory';

const STORAGE_KEY = 'conjugo_conversations';

/** Parse [CORRECTION: "..." -> "..." (...)] patterns from AI response text */
function parseCorrections(text: string): GrammarCorrection[] {
  const corrections: GrammarCorrection[] = [];

  // Pattern 1: Exact arrow format  [CORRECTION: "X" → "Y" (reason)]
  const arrowRegex = /\[CORRECTION:\s*["\u201c]([^"\u201d]+)["\u201d]\s*(?:->|-->|\u2192)\s*["\u201c]([^"\u201d]+)["\u201d]\s*\(([^)]+)\)\]/gi;
  let match;
  while ((match = arrowRegex.exec(text)) !== null) {
    corrections.push({
      original: match[1],
      corrected: match[2],
      explanation: match[3],
    });
  }

  // Pattern 2: Prose-style [CORRECTION: "X" is incorrect. The correct phrase is "Y". (reason)]
  if (corrections.length === 0) {
    const proseRegex = /\[CORRECTION:\s*["\u201c]([^"\u201d]+)["\u201d]\s*(?:is incorrect|should be|needs to be)[^"]*["\u201c]([^"\u201d]+)["\u201d][^)]*\(([^)]+)\)\s*\]/gi;
    while ((match = proseRegex.exec(text)) !== null) {
      corrections.push({
        original: match[1],
        corrected: match[2],
        explanation: match[3],
      });
    }
  }

  return corrections;
}

/** Remove ALL [CORRECTION: ...] blocks from display text, regardless of internal format */
function stripCorrections(text: string): string {
  return text
    .replace(/\[CORRECTION:[^\]]*\]/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Clean leaked system prompt instructions from AI output.
 * Smaller models (e.g. Mistral 7B) sometimes echo bracketed meta-instructions
 * like "[If the student responds in English, ...]" in their responses.
 */
function cleanLeakedInstructions(text: string): string {
  return text
    // Remove lines that are entirely a bracketed instruction
    .replace(/^\s*\[(?:If|When|Note|Remember|Always|Do not|Don't|The student|In this)[^\]]*\]\s*$/gim, '')
    // Remove inline bracketed instructions (not corrections)
    .replace(/\[(?:If|When|Note|Remember|Always|Do not|Don't|The student|In this)[^\]]*\]/gi, '')
    // Remove stage directions like *waits for response* or (thinking)
    .replace(/^\s*\*[^*]+\*\s*$/gm, '')
    // Collapse resulting blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// --------------- localStorage helpers ---------------

function getLocalConversations(): ConversationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ConversationRecord[];
  } catch {
    return [];
  }
}

function saveLocalConversation(record: ConversationRecord): void {
  const all = getLocalConversations();
  const idx = all.findIndex((c) => c.id === record.id);
  if (idx >= 0) {
    all[idx] = record;
  } else {
    all.unshift(record);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

// --------------- Supabase helpers ---------------

async function upsertSupabaseConversation(
  record: ConversationRecord,
  userId: string,
  isNew: boolean
): Promise<void> {
  if (!supabase) return;

  if (isNew) {
    await supabase.from('conversations').insert({
      id: record.id,
      user_id: userId,
      title: record.title,
      messages: record.messages,
      topic: record.topic,
      difficulty: record.difficulty,
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    });
  } else {
    await supabase
      .from('conversations')
      .update({
        messages: record.messages,
        updated_at: record.updatedAt,
      })
      .eq('id', record.id);
  }
}

// --------------- Components ---------------

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

export default function AITutor() {
  const { isAIAvailable, chatStream } = useAI();
  const { user } = useAuth();
  const { getOverallMastery } = useProgress();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedTopic, setSelectedTopic] = useState<ConversationTopic | null | undefined>(undefined);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording] = useState(false);

  // Title displayed in the header for loaded conversations
  const [conversationTitle, setConversationTitle] = useState<string>('Free Conversation');
  const [conversationDifficulty, setConversationDifficulty] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Track current conversation id and whether it has been persisted (INSERT vs UPDATE)
  const conversationIdRef = useRef<string | null>(null);
  const isNewConversationRef = useRef(true);

  // Determine user level from mastery
  const getUserLevel = useCallback((): string => {
    const mastery = getOverallMastery();
    if (mastery > 60) return 'advanced';
    if (mastery > 30) return 'intermediate';
    return 'beginner';
  }, [getOverallMastery]);

  // --------- Persistence: save conversation after message exchange ---------

  const saveConversation = useCallback(
    (currentMessages: AIMessage[]) => {
      const convId = conversationIdRef.current;
      if (!convId) return;

      const now = new Date().toISOString();
      const title = selectedTopic
        ? selectedTopic.titleFr
        : conversationTitle !== 'Free Conversation'
          ? conversationTitle
          : 'Free Conversation';

      const record: ConversationRecord = {
        id: convId,
        title,
        topic: selectedTopic?.id ?? null,
        difficulty: selectedTopic?.difficulty ?? conversationDifficulty,
        messages: currentMessages,
        createdAt: isNewConversationRef.current ? now : now, // will be overwritten on update
        updatedAt: now,
      };

      // Always save to localStorage
      saveLocalConversation(record);

      // Also save to Supabase if authenticated
      if (user) {
        upsertSupabaseConversation(record, user.id, isNewConversationRef.current);
      }

      // After first save, switch to update mode
      if (isNewConversationRef.current) {
        isNewConversationRef.current = false;
      }
    },
    [selectedTopic, conversationTitle, conversationDifficulty, user]
  );

  // --------- Load conversation from state if navigated with conversationId ---------

  useEffect(() => {
    const state = location.state as { conversationId?: string } | null;
    if (!state?.conversationId) return;

    async function loadConversation(id: string) {
      let record: ConversationRecord | undefined;

      // Try Supabase first if authenticated
      if (user && supabase) {
        try {
          const { data } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', id)
            .single();

          if (data) {
            record = {
              id: data.id,
              title: data.title ?? 'Untitled',
              topic: data.topic ?? null,
              difficulty: data.difficulty ?? null,
              messages: (data.messages ?? []) as AIMessage[],
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            };
          }
        } catch {
          // Fall through to localStorage
        }
      }

      // Fallback: localStorage
      if (!record) {
        const local = getLocalConversations();
        record = local.find((c) => c.id === id);
      }

      if (!record) return;

      // Restore state
      conversationIdRef.current = record.id;
      isNewConversationRef.current = false;
      setConversationTitle(record.title);
      setConversationDifficulty(record.difficulty);
      setMessages(record.messages);
      // Set selectedTopic to null (not undefined) to show the chat view
      setSelectedTopic(null);
    }

    loadConversation(state.conversationId);

    // Clear the location state so reloading doesn't re-trigger
    window.history.replaceState({}, document.title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // When a topic is selected, create system message and trigger AI opening
  const handleSelectTopic = useCallback(
    async (topic: ConversationTopic | null) => {
      setSelectedTopic(topic);

      // Assign a new conversation ID
      const newId = crypto.randomUUID();
      conversationIdRef.current = newId;
      isNewConversationRef.current = true;

      const title = topic ? topic.titleFr : 'Free Conversation';
      setConversationTitle(title);
      setConversationDifficulty(topic?.difficulty ?? null);

      const level = getUserLevel();
      const topicName = topic?.starterPrompt ?? undefined;
      const systemContent = SYSTEM_PROMPTS.conversationTutor(level, topicName);

      const systemMessage: AIMessage = {
        id: crypto.randomUUID(),
        role: 'system',
        content: systemContent,
        timestamp: new Date().toISOString(),
      };

      // Create a placeholder for the AI's opening message
      const aiPlaceholder: AIMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };

      setMessages([systemMessage, aiPlaceholder]);
      setIsGenerating(true);

      try {
        const chatMessages = [
          { role: 'system' as const, content: systemContent },
          {
            role: 'user' as const,
            content: topic
              ? `Start a conversation about "${topic.titleFr}" (${topic.title}). Begin by greeting me and setting the scene in French.`
              : 'Start a free conversation. Greet me in French and ask what I would like to talk about.',
          },
        ];

        let accumulated = '';
        await chatStream(chatMessages, (token) => {
          accumulated += token;
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: accumulated,
            };
            return updated;
          });
        });

        // Parse corrections and clean up leaked instructions from final response
        const corrections = parseCorrections(accumulated);
        const cleanContent = cleanLeakedInstructions(stripCorrections(accumulated));

        const finalMessages: AIMessage[] = [
          systemMessage,
          {
            ...aiPlaceholder,
            content: cleanContent,
            corrections: corrections.length > 0 ? corrections : undefined,
          },
        ];

        setMessages(finalMessages);

        // Save after the first exchange
        const record: ConversationRecord = {
          id: newId,
          title,
          topic: topic?.id ?? null,
          difficulty: topic?.difficulty ?? null,
          messages: finalMessages,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        saveLocalConversation(record);
        if (user) {
          upsertSupabaseConversation(record, user.id, true);
        }
        isNewConversationRef.current = false;
      } catch {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: 'Sorry, I could not connect to the AI service. Please try again.',
          };
          return updated;
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [chatStream, getUserLevel, user]
  );

  // Handle sending a user message
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (isGenerating) return;

      const userMessage: AIMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      };

      const aiPlaceholder: AIMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage, aiPlaceholder]);
      setIsGenerating(true);

      try {
        // Build the full messages array for AI
        const chatMessages = messages
          .filter((m) => m.role === 'system' || m.content.length > 0)
          .map((m) => ({
            role: m.role as 'system' | 'user' | 'assistant',
            content: m.content,
          }));

        // Add the new user message
        chatMessages.push({ role: 'user', content: text });

        let accumulated = '';
        await chatStream(chatMessages, (token) => {
          accumulated += token;
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: accumulated,
            };
            return updated;
          });
        });

        // Parse corrections and clean up leaked instructions from final response
        const corrections = parseCorrections(accumulated);
        const cleanContent = cleanLeakedInstructions(stripCorrections(accumulated));

        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: cleanContent,
            corrections: corrections.length > 0 ? corrections : undefined,
          };

          // Save conversation after each exchange
          saveConversation(updated);
          return updated;
        });
      } catch {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: 'Sorry, something went wrong. Please try again.',
          };
          return updated;
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [chatStream, isGenerating, messages, saveConversation]
  );

  // Go back to topic selection
  const handleBack = () => {
    conversationIdRef.current = null;
    isNewConversationRef.current = true;
    setSelectedTopic(undefined);
    setMessages([]);
    setIsGenerating(false);
    setConversationTitle('Free Conversation');
    setConversationDifficulty(null);
  };

  // ----------- STATE 1: Topic Selection -----------
  if (selectedTopic === undefined) {
    return (
      <div className="space-y-5">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-coral-50 dark:bg-coral-900/30">
              <Sparkles size={22} className="text-coral-500" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100">
                AI French Tutor
              </h1>
              <p className="text-sm text-warm-500 dark:text-warm-400">
                Practice conversational French with your AI tutor
              </p>
            </div>
            <button
              onClick={() => navigate('/conversations/history')}
              className="p-2 rounded-xl text-warm-500 hover:text-warm-700 hover:bg-warm-100 dark:hover:bg-warm-700 transition-colors"
              aria-label="Conversation history"
            >
              <Clock size={20} />
            </button>
          </div>
        </motion.div>

        {/* AI status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          {isAIAvailable ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              AI tutor is online and ready
            </div>
          ) : (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
              <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  AI Tutor Unavailable
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                  Sign in to use the AI tutor and unlock all AI-powered features.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Topic selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-semibold text-warm-600 dark:text-warm-400 mb-3">
            Choose a topic
          </h2>
          <TopicSelector onSelectTopic={handleSelectTopic} />
        </motion.div>
      </div>
    );
  }

  // ----------- STATE 2: Active Chat -----------
  const displayTitle = selectedTopic ? selectedTopic.titleFr : conversationTitle;
  const displaySubtitle = selectedTopic ? selectedTopic.title : undefined;
  const displayDifficulty = selectedTopic?.difficulty ?? conversationDifficulty;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -mx-4 -mt-4 sm:-mx-6 sm:-mt-6">
      {/* Chat header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-4 py-3 border-b border-warm-100 dark:border-warm-700 bg-white dark:bg-warm-800"
      >
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-xl text-warm-500 hover:text-warm-700 hover:bg-warm-100 dark:hover:bg-warm-700 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-warm-800 dark:text-warm-100 truncate text-sm">
            {displayTitle}
          </p>
          {displaySubtitle && (
            <p className="text-xs text-warm-500 dark:text-warm-400">
              {displaySubtitle}
            </p>
          )}
        </div>
        {displayDifficulty != null && (
          <Badge variant="amber">
            <DifficultyStars level={displayDifficulty as 1 | 2 | 3} />
          </Badge>
        )}
        <button
          onClick={() => navigate('/conversations/history')}
          className="p-2 rounded-xl text-warm-500 hover:text-warm-700 hover:bg-warm-100 dark:hover:bg-warm-700 transition-colors"
          aria-label="Conversation history"
        >
          <Clock size={18} />
        </button>
      </motion.div>

      {/* Messages area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {messages
          .filter((m) => m.role !== 'system')
          .map((message, idx) => (
            <ChatMessage
              key={message.id}
              message={message}
              isStreaming={
                isGenerating &&
                message.role === 'assistant' &&
                idx ===
                  messages.filter((m) => m.role !== 'system').length - 1
              }
            />
          ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <ChatInput
        onSend={handleSendMessage}
        disabled={isGenerating || !isAIAvailable}
        isRecording={isRecording}
      />
    </div>
  );
}
