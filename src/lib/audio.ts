import { textToSpeech } from './aiClient';

let cachedVoice: SpeechSynthesisVoice | null = null;
let voiceSearched = false;

// In-memory audio cache to avoid re-fetching identical TTS
const audioCache = new Map<string, string>(); // text -> objectURL
const MAX_CACHE_SIZE = 50;

export function isAudioSupported(): boolean {
  return typeof window !== 'undefined';
}

export function getFrenchVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = speechSynthesis.getVoices();
  cachedVoice =
    voices.find(v => v.lang === 'fr-FR' && v.localService) ??
    voices.find(v => v.lang === 'fr-FR') ??
    voices.find(v => v.lang.startsWith('fr')) ??
    null;
  voiceSearched = true;
  return cachedVoice;
}

/** Browser-native TTS fallback */
function speakBrowser(text: string, rate = 0.9): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = rate;
    utterance.pitch = 1;
    const voice = getFrenchVoice();
    if (voice) utterance.voice = voice;
    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      if (e.error === 'canceled') resolve();
      else reject(e);
    };
    speechSynthesis.speak(utterance);
  });
}

/** Cloud TTS via ElevenLabs — plays mp3 audio */
async function speakCloud(text: string): Promise<void> {
  // Check cache first
  let objectUrl = audioCache.get(text);

  if (!objectUrl) {
    const blob = await textToSpeech(text);
    objectUrl = URL.createObjectURL(blob);

    // Manage cache size
    if (audioCache.size >= MAX_CACHE_SIZE) {
      const firstKey = audioCache.keys().next().value!;
      URL.revokeObjectURL(audioCache.get(firstKey)!);
      audioCache.delete(firstKey);
    }
    audioCache.set(text, objectUrl);
  }

  return new Promise((resolve, reject) => {
    const audio = new Audio(objectUrl);
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error('Audio playback failed'));
    audio.play().catch(reject);
  });
}

/**
 * Speak French text. Tries cloud TTS (ElevenLabs) first,
 * falls back to browser SpeechSynthesis.
 */
export async function speak(text: string, rate = 0.9): Promise<void> {
  // Cancel any ongoing browser speech
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    speechSynthesis.cancel();
  }

  try {
    await speakCloud(text);
  } catch {
    // Cloud failed — fall back to browser TTS
    await speakBrowser(text, rate);
  }
}

// Pre-load voices for fallback
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null;
    voiceSearched = false;
    getFrenchVoice();
  };
}
