import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, WifiOff } from 'lucide-react';
import { useAI } from '../../context/AIContext';
import { SYSTEM_PROMPTS } from '../../lib/aiPrompts';

interface GrammarHelperProps {
  context: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function GrammarHelper({ context, isOpen, onClose }: GrammarHelperProps) {
  const { isAIAvailable, chat } = useAI();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || !isAIAvailable) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const systemPrompt = SYSTEM_PROMPTS.grammarExplainer(context);
      const chatMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: trimmed },
      ];

      const response = await chat(chatMessages);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, isAIAvailable, chat, context, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-warm-800 rounded-t-2xl shadow-xl max-h-[70vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-warm-100 dark:border-warm-700 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-coral-50 dark:bg-coral-900/30">
                  <Bot size={16} className="text-coral-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-warm-800 dark:text-warm-100">
                    Grammar Helper
                  </h3>
                  <p className="text-[10px] text-warm-400 truncate max-w-[200px]">
                    Ask about: {context}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-700 transition-colors"
              >
                <X size={18} className="text-warm-500" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px]"
            >
              {!isAIAvailable ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-warm-400 py-8">
                  <WifiOff size={28} />
                  <p className="text-sm font-medium">AI assistant unavailable</p>
                  <p className="text-xs text-center">
                    Sign in to use the grammar helper.
                  </p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-warm-400 py-8">
                  <Bot size={28} />
                  <p className="text-sm font-medium">Ask me anything!</p>
                  <p className="text-xs text-center text-warm-400">
                    I can explain grammar rules, give examples, and help you understand French grammar.
                  </p>
                </div>
              ) : (
                messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      msg.role === 'user'
                        ? 'bg-coral-100 dark:bg-coral-900/40'
                        : 'bg-violet-100 dark:bg-violet-900/40'
                    }`}>
                      {msg.role === 'user'
                        ? <User size={12} className="text-coral-600 dark:text-coral-400" />
                        : <Bot size={12} className="text-violet-600 dark:text-violet-400" />
                      }
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-coral-500 text-white rounded-br-md'
                        : 'bg-warm-100 dark:bg-warm-700 text-warm-800 dark:text-warm-100 rounded-bl-md'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </motion.div>
                ))
              )}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-violet-100 dark:bg-violet-900/40">
                    <Bot size={12} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="bg-warm-100 dark:bg-warm-700 rounded-2xl rounded-bl-md px-3 py-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-warm-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-warm-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-warm-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            {isAIAvailable && (
              <div className="px-4 py-3 border-t border-warm-100 dark:border-warm-700 flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about grammar..."
                    disabled={isLoading}
                    className="flex-1 px-3 py-2 rounded-xl bg-warm-50 dark:bg-warm-700 text-warm-800 dark:text-warm-100 text-sm placeholder:text-warm-400 border border-warm-200 dark:border-warm-600 focus:outline-none focus:ring-2 focus:ring-coral-500/30 focus:border-coral-400 disabled:opacity-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="p-2 rounded-xl bg-coral-500 text-white hover:bg-coral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
