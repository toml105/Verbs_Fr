import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Cpu, Download, Terminal, Wifi, Check, X, Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { checkOllamaStatus, listModels } from '../lib/ollama';

export default function AISetup() {
  const navigate = useNavigate();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'connected' | 'failed'>('idle');
  const [models, setModels] = useState<string[]>([]);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult('idle');
    setModels([]);

    const connected = await checkOllamaStatus();
    if (connected) {
      const available = await listModels();
      setModels(available);
      setTestResult('connected');
    } else {
      setTestResult('failed');
    }
    setTesting(false);
  };

  const staggerDelay = (i: number) => ({ delay: 0.1 + i * 0.08 });

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <button
          onClick={() => navigate('/settings')}
          className="p-2 -ml-2 rounded-xl hover:bg-warm-100 dark:hover:bg-warm-700 transition-colors"
        >
          <ArrowLeft size={20} className="text-warm-600 dark:text-warm-300" />
        </button>
        <div className="flex items-center gap-2">
          <Cpu size={22} className="text-coral-500" />
          <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100">
            AI Setup Guide
          </h1>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="text-sm text-warm-500 dark:text-warm-400 leading-relaxed"
      >
        Conjugo uses Ollama to run AI features locally on your machine. Follow these steps to get started.
      </motion.p>

      {/* Step 1: Install Ollama */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={staggerDelay(0)}
      >
        <Card>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-coral-500 text-white flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Download size={18} className="text-coral-500" />
                <h3 className="font-semibold text-warm-800 dark:text-warm-100">
                  Install Ollama
                </h3>
              </div>
              <p className="text-sm text-warm-500 dark:text-warm-400 mb-3">
                Download and install Ollama from{' '}
                <a
                  href="https://ollama.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-coral-500 hover:text-coral-600 dark:hover:text-coral-400 underline"
                >
                  ollama.com
                </a>
              </p>

              <div className="space-y-2">
                <div>
                  <span className="text-xs font-medium text-warm-400 uppercase tracking-wider">macOS / Linux</span>
                  <div className="mt-1 bg-warm-800 dark:bg-warm-900 text-warm-100 rounded-lg p-3 font-mono text-sm overflow-x-auto">
                    curl -fsSL https://ollama.com/install.sh | sh
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-warm-400 uppercase tracking-wider">Windows</span>
                  <div className="mt-1 bg-warm-800 dark:bg-warm-900 text-warm-100 rounded-lg p-3 font-mono text-sm">
                    Download from{' '}
                    <a
                      href="https://ollama.com/download"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-coral-400 hover:text-coral-300 underline"
                    >
                      ollama.com/download
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Step 2: Download a Model */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={staggerDelay(1)}
      >
        <Card>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-coral-500 text-white flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Terminal size={18} className="text-coral-500" />
                <h3 className="font-semibold text-warm-800 dark:text-warm-100">
                  Download a Model
                </h3>
              </div>
              <p className="text-sm text-warm-500 dark:text-warm-400 mb-3">
                Download the Mistral model (recommended for French):
              </p>
              <div className="bg-warm-800 dark:bg-warm-900 text-warm-100 rounded-lg p-3 font-mono text-sm">
                ollama pull mistral
              </div>
              <p className="text-xs text-warm-400 mt-2">
                This is ~4GB and requires 8GB RAM
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Step 3: Start Ollama with CORS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={staggerDelay(2)}
      >
        <Card>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-coral-500 text-white flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Wifi size={18} className="text-coral-500" />
                <h3 className="font-semibold text-warm-800 dark:text-warm-100">
                  Start Ollama with CORS
                </h3>
              </div>
              <p className="text-sm text-warm-500 dark:text-warm-400 mb-3">
                To allow the web app to connect, start Ollama with CORS enabled:
              </p>

              <div className="space-y-2">
                <div>
                  <span className="text-xs font-medium text-warm-400 uppercase tracking-wider">macOS / Linux</span>
                  <div className="mt-1 bg-warm-800 dark:bg-warm-900 text-warm-100 rounded-lg p-3 font-mono text-sm overflow-x-auto">
                    OLLAMA_ORIGINS=* ollama serve
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-warm-400 uppercase tracking-wider">Windows</span>
                  <div className="mt-1 bg-warm-800 dark:bg-warm-900 text-warm-100 rounded-lg p-3 font-mono text-sm overflow-x-auto">
                    set OLLAMA_ORIGINS=* && ollama serve
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Step 4: Test Connection */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={staggerDelay(3)}
      >
        <Card>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-coral-500 text-white flex items-center justify-center text-sm font-bold">
              4
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Wifi size={18} className="text-coral-500" />
                <h3 className="font-semibold text-warm-800 dark:text-warm-100">
                  Test Connection
                </h3>
              </div>
              <p className="text-sm text-warm-500 dark:text-warm-400 mb-3">
                Verify that Ollama is running and accessible:
              </p>

              <Button
                onClick={handleTestConnection}
                disabled={testing}
                className="w-full gap-2"
              >
                {testing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Wifi size={18} />
                    Test Connection
                  </>
                )}
              </Button>

              {/* Result */}
              {testResult === 'connected' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Check size={18} className="text-emerald-500" />
                    <span className="font-medium text-emerald-700 dark:text-emerald-300 text-sm">
                      Connected successfully!
                    </span>
                  </div>
                  {models.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                        Available models:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {models.map((model) => (
                          <span
                            key={model}
                            className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300 rounded-md text-xs font-mono"
                          >
                            {model}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {testResult === 'failed' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                >
                  <div className="flex items-center gap-2">
                    <X size={18} className="text-red-500" />
                    <span className="font-medium text-red-700 dark:text-red-300 text-sm">
                      Could not connect to Ollama
                    </span>
                  </div>
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    Make sure Ollama is running with CORS enabled (Step 3).
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
