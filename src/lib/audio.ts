let cachedVoice: SpeechSynthesisVoice | null = null;
let voiceSearched = false;

export function isAudioSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function getFrenchVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  if (!isAudioSupported()) return null;

  const voices = speechSynthesis.getVoices();
  // Prefer native French voices
  cachedVoice =
    voices.find(v => v.lang === 'fr-FR' && v.localService) ??
    voices.find(v => v.lang === 'fr-FR') ??
    voices.find(v => v.lang.startsWith('fr')) ??
    null;
  voiceSearched = true;
  return cachedVoice;
}

export function speak(text: string, rate = 0.9): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isAudioSupported()) {
      resolve();
      return;
    }

    // Cancel any ongoing speech
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

// Pre-load voices (they load async on some browsers)
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null;
    voiceSearched = false;
    getFrenchVoice();
  };
}
