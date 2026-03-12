// Speech Recognition wrapper for Web Speech API
// Works in Chrome/Edge. Graceful fallback for unsupported browsers.

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

// Browser compatibility types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function getSpeechRecognitionConstructor(): (new () => SpeechRecognitionInstance) | null {
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    | (new () => SpeechRecognitionInstance)
    | null;
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && getSpeechRecognitionConstructor() !== null;
}

export function listenForSpeech(lang = 'fr-FR'): Promise<SpeechRecognitionResult> {
  return new Promise((resolve, reject) => {
    const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionCtor) {
      reject(new Error('Speech recognition not supported in this browser'));
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let resolved = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (resolved) return;
      resolved = true;
      const result = event.results[0][0];
      resolve({
        transcript: result.transcript.trim(),
        confidence: result.confidence,
      });
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (resolved) return;
      resolved = true;
      if (event.error === 'no-speech') {
        resolve({ transcript: '', confidence: 0 });
      } else {
        reject(new Error(`Speech recognition error: ${event.error}`));
      }
    };

    recognition.onend = () => {
      if (!resolved) {
        resolved = true;
        resolve({ transcript: '', confidence: 0 });
      }
    };

    recognition.start();

    // Safety timeout after 8 seconds
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        try { recognition.stop(); } catch { /* ignore */ }
        resolve({ transcript: '', confidence: 0 });
      }
    }, 8000);
  });
}

// Normalize French text for comparison (handle accents, apostrophes, etc.)
export function normalizeFrench(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\u2019\u2018']/g, "'") // normalize apostrophes
    .replace(/\s+/g, ' ')
    .replace(/\s*[.,!?;:]+\s*/g, '') // remove punctuation
    .trim();
}

export function compareSpeech(spoken: string, expected: string): {
  isMatch: boolean;
  similarity: number;
} {
  const normalSpoken = normalizeFrench(spoken);
  const normalExpected = normalizeFrench(expected);

  if (normalSpoken === normalExpected) {
    return { isMatch: true, similarity: 1.0 };
  }

  // Levenshtein distance for partial matching
  const distance = levenshtein(normalSpoken, normalExpected);
  const maxLen = Math.max(normalSpoken.length, normalExpected.length);
  const similarity = maxLen > 0 ? 1 - distance / maxLen : 0;

  // Be lenient: 75% similarity is a pass
  return {
    isMatch: similarity >= 0.75,
    similarity,
  };
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[m][n];
}
