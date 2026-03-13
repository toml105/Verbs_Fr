import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, Sparkles, Star } from 'lucide-react';
import { useAI } from '../context/AIContext';
import { useProgress } from '../context/UserProgressContext';
import { SYSTEM_PROMPTS } from '../lib/aiPrompts';
import TopicSelector from '../components/ai/TopicSelector';
import ChatMessage from '../components/ai/ChatMessage';
import ChatInput from '../components/ai/ChatInput';
import Badge from '../components/ui/Badge';
import type { AIMessage, ConversationTopic, GrammarCorrection } from '../types';

/** Parse [CORRECTION: "..." -> "..." (...)] patterns from AI response text */
function parseCorrections(text: string): GrammarCorrection[] {
  const corrections: GrammarCorrection[] = [];
  const regex = /\[CORRECTION:\s*"([^"]+)"\s*(?:->|-->|\u2192)\s*"([^"]+)"\s*\(([^)]+)\)\]/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    corrections.push({
      original: match[1],
      corrected: match[2],
      explanation: match[3],
    });
  }
  return corrections;
}

/** Remove correction markers from the display text */
function stripCorrections(text: string): string {
  return text
    .replace(/\[CORRECTION:\s*"[^"]+"\s*(?:->|-->|\u2192)\s*"[^"]+"\s*\([^)]+\)\]/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

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
  const { isOllamaAvailable, chatStream } = useAI();
  const { getOverallMastery } = useProgress();

  const [selectedTopic, setSelectedTopic] = useState<ConversationTopic | null | undefined>(undefined);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Determine user level from mastery
  const getUserLevel = useCallback((): string => {
    const mastery = getOverallMastery();
    if (mastery > 60) return 'advanced';
    if (mastery > 30) return 'intermediate';
    return 'beginner';
  }, [getOverallMastery]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // When a topic is selected, create system message and trigger AI opening
  const handleSelectTopic = useCallback(
    async (topic: ConversationTopic | null) => {
      setSelectedTopic(topic);

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
        const ollamaMessages = [
          { role: 'system' as const, content: systemContent },
          {
            role: 'user' as const,
            content: topic
              ? `Start a conversation about "${topic.titleFr}" (${topic.title}). Begin by greeting me and setting the scene in French.`
              : 'Start a free conversation. Greet me in French and ask what I would like to talk about.',
          },
        ];

        let accumulated = '';
        await chatStream(ollamaMessages, (token) => {
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

        // Parse corrections from final response
        const corrections = parseCorrections(accumulated);
        const cleanContent = stripCorrections(accumulated);

        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: cleanContent,
            corrections: corrections.length > 0 ? corrections : undefined,
          };
          return updated;
        });
      } catch {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: 'Sorry, I could not connect to the AI. Please check that Ollama is running.',
          };
          return updated;
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [chatStream, getUserLevel]
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
        // Build the full messages array for Ollama
        const ollamaMessages = messages
          .filter((m) => m.role === 'system' || m.content.length > 0)
          .map((m) => ({
            role: m.role as 'system' | 'user' | 'assistant',
            content: m.content,
          }));

        // Add the new user message
        ollamaMessages.push({ role: 'user', content: text });

        let accumulated = '';
        await chatStream(ollamaMessages, (token) => {
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

        // Parse corrections from final response
        const corrections = parseCorrections(accumulated);
        const cleanContent = stripCorrections(accumulated);

        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: cleanContent,
            corrections: corrections.length > 0 ? corrections : undefined,
          };
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
    [chatStream, isGenerating, messages]
  );

  // Go back to topic selection
  const handleBack = () => {
    setSelectedTopic(undefined);
    setMessages([]);
    setIsGenerating(false);
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
            <div>
              <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100">
                AI French Tutor
              </h1>
              <p className="text-sm text-warm-500 dark:text-warm-400">
                Practice conversational French with your AI tutor
              </p>
            </div>
          </div>
        </motion.div>

        {/* Ollama status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          {isOllamaAvailable ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              AI tutor is online and ready
            </div>
          ) : (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
              <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  AI Tutor Offline
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                  Ollama is not running. Start it to use the AI tutor.
                  Visit{' '}
                  <a
                    href="https://ollama.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-amber-800"
                  >
                    ollama.ai
                  </a>{' '}
                  for setup instructions.
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
            {selectedTopic ? selectedTopic.titleFr : 'Free Conversation'}
          </p>
          {selectedTopic && (
            <p className="text-xs text-warm-500 dark:text-warm-400">
              {selectedTopic.title}
            </p>
          )}
        </div>
        {selectedTopic && (
          <Badge variant="amber">
            <DifficultyStars level={selectedTopic.difficulty} />
          </Badge>
        )}
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
        disabled={isGenerating || !isOllamaAvailable}
        isRecording={isRecording}
      />
    </div>
  );
}
