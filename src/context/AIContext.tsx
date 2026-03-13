import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  checkOllamaStatus,
  listModels,
  chat as ollamaChat,
  chatStream as ollamaChatStream,
  type OllamaMessage,
  type OllamaChatOptions,
} from '../lib/ollama';

const LOCAL_STORAGE_KEY = 'conjugo_ai_model';
const STATUS_CHECK_INTERVAL = 30_000; // 30 seconds
const DEFAULT_MODEL = 'mistral';

interface AIContextType {
  isOllamaAvailable: boolean;
  isChecking: boolean;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  availableModels: string[];
  chat: (messages: OllamaMessage[], options?: OllamaChatOptions) => Promise<string>;
  chatStream: (messages: OllamaMessage[], onToken: (token: string) => void) => Promise<string>;
  refreshStatus: () => Promise<void>;
}

const AIContext = createContext<AIContextType>({
  isOllamaAvailable: false,
  isChecking: true,
  selectedModel: '',
  setSelectedModel: () => {},
  availableModels: [],
  chat: async () => '',
  chatStream: async () => '',
  refreshStatus: async () => {},
});

export function AIProvider({ children }: { children: ReactNode }) {
  const [isOllamaAvailable, setIsOllamaAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModelState] = useState<string>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY) ?? '';
    } catch {
      return '';
    }
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Check Ollama status and fetch available models.
   * Sets isChecking only on the initial check (when isChecking is already true).
   */
  const checkStatus = useCallback(async (isInitial: boolean) => {
    if (isInitial) setIsChecking(true);

    const available = await checkOllamaStatus();
    setIsOllamaAvailable(available);

    if (available) {
      const models = await listModels();
      setAvailableModels(models);

      // Auto-select model if none is selected yet
      setSelectedModelState((current) => {
        if (current && models.includes(current)) return current;
        // Prefer mistral if available, otherwise first model
        const defaultChoice = models.find((m) => m.startsWith(DEFAULT_MODEL));
        const chosen = defaultChoice ?? models[0] ?? '';
        if (chosen) {
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, chosen);
          } catch {
            // Ignore localStorage errors
          }
        }
        return chosen;
      });
    } else {
      setAvailableModels([]);
    }

    if (isInitial) setIsChecking(false);
  }, []);

  // Initial check on mount
  useEffect(() => {
    checkStatus(true);
  }, [checkStatus]);

  // Periodic re-check every 30 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      checkStatus(false);
    }, STATUS_CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkStatus]);

  const setSelectedModel = useCallback((model: string) => {
    setSelectedModelState(model);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, model);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const chat = useCallback(
    async (messages: OllamaMessage[], options?: OllamaChatOptions): Promise<string> => {
      if (!selectedModel) {
        throw new Error('No AI model selected');
      }
      return ollamaChat(selectedModel, messages, options);
    },
    [selectedModel]
  );

  const chatStream = useCallback(
    async (messages: OllamaMessage[], onToken: (token: string) => void): Promise<string> => {
      if (!selectedModel) {
        throw new Error('No AI model selected');
      }
      return ollamaChatStream(selectedModel, messages, onToken);
    },
    [selectedModel]
  );

  const refreshStatus = useCallback(async () => {
    await checkStatus(false);
  }, [checkStatus]);

  return (
    <AIContext.Provider
      value={{
        isOllamaAvailable,
        isChecking,
        selectedModel,
        setSelectedModel,
        availableModels,
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
