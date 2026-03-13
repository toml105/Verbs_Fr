import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { speak } from '../../lib/audio';
import type { AIMessage } from '../../types';

interface ChatMessageProps {
  message: AIMessage;
  isStreaming?: boolean;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-warm-400 dark:bg-warm-500"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function CorrectionBlock({
  original,
  corrected,
  explanation,
}: {
  original: string;
  corrected: string;
  explanation: string;
}) {
  return (
    <div className="mt-2 px-3 py-2 rounded-lg bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/40">
      <div className="flex items-center gap-2 flex-wrap text-sm">
        <span className="line-through text-red-400 dark:text-red-400">
          {original}
        </span>
        <span className="text-warm-400">&rarr;</span>
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {corrected}
        </span>
      </div>
      <p className="text-xs text-warm-500 dark:text-warm-400 mt-1">
        {explanation}
      </p>
    </div>
  );
}

export default function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // Don't render system messages
  if (message.role === 'system') return null;

  const handleSpeak = () => {
    speak(message.content);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] ${isUser ? 'order-1' : 'order-1'}`}
      >
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isUser
              ? 'bg-coral-500 text-white rounded-br-md'
              : 'bg-warm-100 dark:bg-warm-700 text-warm-800 dark:text-warm-100 rounded-bl-md'
          }`}
        >
          {isStreaming && !message.content ? (
            <TypingIndicator />
          ) : (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
          )}
        </div>

        {/* Corrections below AI messages */}
        {isAssistant &&
          message.corrections &&
          message.corrections.length > 0 && (
            <div className="mt-1 space-y-1">
              {message.corrections.map((correction, i) => (
                <CorrectionBlock
                  key={i}
                  original={correction.original}
                  corrected={correction.corrected}
                  explanation={correction.explanation}
                />
              ))}
            </div>
          )}

        {/* Footer: timestamp + TTS button */}
        <div
          className={`flex items-center gap-2 mt-1 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}
        >
          <span className="text-[10px] text-warm-400 dark:text-warm-500">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {isAssistant && message.content && !isStreaming && (
            <button
              onClick={handleSpeak}
              className="p-1 rounded-lg text-warm-400 hover:text-coral-500 hover:bg-warm-100 dark:hover:bg-warm-700 transition-colors"
              aria-label="Listen to message"
            >
              <Volume2 size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
