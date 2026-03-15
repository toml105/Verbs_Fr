import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  checkAIStatus,
  chat as aiChat,
  chatStream as aiChatStream,
  type ChatMessage,
  type ChatOptions,
} from '../lib/aiClient';
import { useAuth } from './AuthContext';

interface AIContextType {
  isAIAvailable: boolean;
  isChecking: boolean;
  chat: (messages: ChatMessage[], options?: ChatOptions) => Promise<string>;
  chatStream: (messages: ChatMessage[], onToken: (token: string) => void) => Promise<string>;
  refreshStatus: () => Promise<void>;
}

const AIContext = createContext<AIContextType>({
  isAIAvailable: false,
  isChecking: true,
  chat: async () => '',
  chatStream: async () => '',
  refreshStatus: async () => {},
});

export function AIProvider({ children }: { children: ReactNode }) {
  const [isAIAvailable, setIsAIAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { user } = useAuth();

  // Check AI availability when auth state changes
  useEffect(() => {
    let cancelled = false;

    async function check() {
      setIsChecking(true);
      const available = await checkAIStatus();
      if (!cancelled) {
        setIsAIAvailable(available);
        setIsChecking(false);
      }
    }

    check();
    return () => { cancelled = true; };
  }, [user]);

  const chat = useCallback(
    async (messages: ChatMessage[], options?: ChatOptions): Promise<string> => {
      return aiChat(messages, options);
    },
    []
  );

  const chatStream = useCallback(
    async (messages: ChatMessage[], onToken: (token: string) => void): Promise<string> => {
      return aiChatStream(messages, onToken);
    },
    []
  );

  const refreshStatus = useCallback(async () => {
    const available = await checkAIStatus();
    setIsAIAvailable(available);
  }, []);

  return (
    <AIContext.Provider
      value={{
        isAIAvailable,
        isChecking,
        chat,
        chatStream,
        refreshStatus,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  return useContext(AIContext);
}
