import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, SendHorizontal } from 'lucide-react';
import { isSpeechRecognitionSupported, listenForSpeech } from '../../lib/speechRecognition';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  isRecording: boolean;
}

export default function ChatInput({ onSend, disabled, isRecording: externalIsRecording }: ChatInputProps) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const recording = externalIsRecording || isRecording;
  const canSend = text.trim().length > 0 && !disabled;
  const speechSupported = isSpeechRecognitionSupported();

  const handleSend = useCallback(() => {
    if (!canSend) return;
    onSend(text.trim());
    setText('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [canSend, onSend, text]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-expand textarea up to 3 lines
    const el = e.target;
    el.style.height = 'auto';
    const lineHeight = 20; // approximate line height in px
    const maxHeight = lineHeight * 3 + 16; // 3 lines + padding
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  };

  const handleMic = async () => {
    if (recording || disabled) return;
    setIsRecording(true);
    try {
      const result = await listenForSpeech('fr-FR');
      if (result.transcript) {
        setText((prev) => (prev ? prev + ' ' + result.transcript : result.transcript));
        // Auto-resize after setting text
        if (textareaRef.current) {
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.style.height = 'auto';
              const lineHeight = 20;
              const maxHeight = lineHeight * 3 + 16;
              textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
            }
          }, 0);
        }
      }
    } catch {
      // Speech recognition error - silently handle
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <div className="border-t border-warm-100 dark:border-warm-700 bg-white dark:bg-warm-800 px-4 py-3">
      <div className="flex items-end gap-2">
        {/* Microphone button */}
        {speechSupported && (
          <button
            onClick={handleMic}
            disabled={disabled || recording}
            className={`flex-shrink-0 p-2.5 rounded-xl transition-all duration-200 ${
              recording
                ? 'bg-red-500 text-white'
                : 'text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-700 disabled:opacity-50'
            }`}
            aria-label={recording ? 'Recording...' : 'Start recording'}
          >
            {recording ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Mic size={20} />
              </motion.div>
            ) : (
              <Mic size={20} />
            )}
          </button>
        )}

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              disabled
                ? 'Waiting for response...'
                : 'Type your message in French...'
            }
            rows={1}
            className="w-full resize-none rounded-xl border border-warm-200 dark:border-warm-600 bg-warm-50 dark:bg-warm-900 px-4 py-2.5 text-sm text-warm-800 dark:text-warm-100 placeholder-warm-400 dark:placeholder-warm-500 focus:outline-none focus:ring-2 focus:ring-coral-500/30 focus:border-coral-400 disabled:opacity-50 transition-colors"
            style={{ minHeight: '40px', maxHeight: '76px' }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="flex-shrink-0 p-2.5 rounded-xl bg-coral-500 text-white hover:bg-coral-600 active:bg-coral-700 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
          aria-label="Send message"
        >
          <SendHorizontal size={20} />
        </button>
      </div>
    </div>
  );
}
