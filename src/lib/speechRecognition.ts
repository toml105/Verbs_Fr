// Speech Recognition wrapper for Web Speech API + native Capacitor fallback.
// Web Speech API works in Chrome/Edge. Native fallback for iOS WKWebView.

import { Capacitor } from '@capacitor/core';
import { SpeechRecognition as NativeSpeechRecognition } from '@capacitor-community/speech-recognition';
import { transcribeAudio } from './aiClient';

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
  if (typeof window === 'undefined') return false;
  // Cloud STT works anywhere with MediaRecorder (mic access)
  if (typeof navigator.mediaDevices?.getUserMedia === 'function') return true;
  if (getSpeechRecognitionConstructor() !== null) return true;
  if (Capacitor.isNativePlatform()) return true;
  return false;
}

function listenForSpeechWeb(lang: string): Promise<SpeechRecognitionResult> {
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

async function listenForSpeechNative(lang: string): Promise<SpeechRecognitionResult> {
  try {
    const perm = await NativeSpeechRecognition.requestPermissions();
    if (perm.speechRecognition !== 'granted') {
      return { transcript: '', confidence: 0 };
    }
    const available = await NativeSpeechRecognition.available();
    if (!available.available) {
      return { transcript: '', confidence: 0 };
    }
    const result = await NativeSpeechRecognition.start({
      language: lang,
      maxResults: 1,
      partialResults: false,
      popup: false,
    });
    const transcript = result.matches?.[0] ?? '';
    return { transcript: transcript.trim(), confidence: transcript ? 0.9 : 0 };
  } catch {
    return { transcript: '', confidence: 0 };
  }
}

/** Record audio from microphone using MediaRecorder, then transcribe via Groq Whisper */
async function listenForSpeechCloud(): Promise<SpeechRecognitionResult> {
  if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    throw new Error('MediaRecorder not supported');
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  return new Promise((resolve, reject) => {
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks: Blob[] = [];
    let resolved = false;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());

      if (resolved) return;
      resolved = true;

      if (chunks.length === 0) {
        resolve({ transcript: '', confidence: 0 });
        return;
      }

      const blob = new Blob(chunks, { type: mimeType });

      try {
        const text = await transcribeAudio(blob);
        resolve({
          transcript: text.trim(),
          confidence: text.trim() ? 0.95 : 0,
        });
      } catch (err) {
        reject(err);
      }
    };

    recorder.onerror = () => {
      stream.getTracks().forEach(t => t.stop());
      if (!resolved) {
        resolved = true;
        reject(new Error('Recording failed'));
      }
    };

    recorder.start(250);

    // Auto-stop after 8 seconds (same as browser STT timeout)
    setTimeout(() => {
      if (recorder.state === 'recording') {
        recorder.stop();
      }
    }, 8000);
  });
}

export async function listenForSpeech(lang = 'fr-FR'): Promise<SpeechRecognitionResult> {
  // Try cloud STT first (Groq Whisper — much better French recognition)
  try {
    return await listenForSpeechCloud();
  } catch {
    // Fall back to browser/native STT
  }

  if (getSpeechRecognitionConstructor()) {
    return listenForSpeechWeb(lang);
  }
  if (Capacitor.isNativePlatform()) {
    return listenForSpeechNative(lang);
  }
  throw new Error('Speech recognition not supported');
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
