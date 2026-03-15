# Audio Upgrade Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace browser-native speech APIs with Groq Whisper (STT) and ElevenLabs (TTS) via Supabase Edge Functions for dramatically better French audio quality.

**Architecture:** Two new Edge Functions (`audio-transcribe`, `audio-tts`) follow the same secure proxy pattern as the existing `ai-chat` function. The frontend `speak()` and `listenForSpeech()` functions try cloud first, fall back to browser APIs — making this a transparent upgrade with zero consumer component changes.

**Tech Stack:** Supabase Edge Functions (Deno), Groq Whisper API, ElevenLabs API, MediaRecorder API

---

### Task 1: Create `audio-tts` Edge Function

**Files:**
- Create: `supabase/functions/audio-tts/index.ts`

**Step 1: Create the Edge Function file**

```typescript
import { createClient } from "jsr:@supabase/supabase-js@2";

// --- Configuration ---
const ELEVENLABS_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech";
const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Sarah
const MODEL_ID = "eleven_multilingual_v2";
const MAX_TEXT_LENGTH = 500;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://toml1.github.io",
  "capacitor://localhost",
  "http://localhost",
];

// --- Rate Limiting ---
const rateLimitMap = new Map<string, { timestamps: number[] }>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry) {
    rateLimitMap.set(userId, { timestamps: [now] });
    return false;
  }
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (entry.timestamps.length >= RATE_LIMIT_MAX_REQUESTS) return true;
  entry.timestamps.push(now);
  return false;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    entry.timestamps = entry.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
    if (entry.timestamps.length === 0) rateLimitMap.delete(key);
  }
}, 60_000);

// --- CORS ---
function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
  };
  if (origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o))) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

// --- Main Handler ---
Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // --- Auth ---
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Rate limit ---
    if (isRateLimited(user.id)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Validate input ---
    const body = await req.json() as { text?: unknown; voice_id?: unknown };
    if (!body.text || typeof body.text !== "string" || body.text.length === 0) {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const text = body.text.slice(0, MAX_TEXT_LENGTH);
    const voiceId = typeof body.voice_id === "string" ? body.voice_id : DEFAULT_VOICE_ID;

    // --- Call ElevenLabs ---
    const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!apiKey) {
      console.error("ELEVENLABS_API_KEY is not set");
      return new Response(JSON.stringify({ error: "TTS service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ttsRes = await fetch(`${ELEVENLABS_TTS_URL}/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    if (!ttsRes.ok) {
      const errText = await ttsRes.text().catch(() => "Unknown error");
      console.error(`ElevenLabs error: ${ttsRes.status} ${errText}`);
      return new Response(JSON.stringify({ error: "TTS service temporarily unavailable" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream audio back to client
    return new Response(ttsRes.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400", // Cache TTS for 24h
      },
    });
  } catch (err) {
    console.error("TTS edge function error:", err);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 400,
      headers: { ...getCorsHeaders(null), "Content-Type": "application/json" },
    });
  }
});
```

**Step 2: Deploy the Edge Function**

Run: `SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy audio-tts --no-verify-jwt --project-ref jrvueyojezmbcmlxzlfr`
Expected: "Deployed Functions on project jrvueyojezmbcmlxzlfr: audio-tts"

**Step 3: Commit**

```bash
git add supabase/functions/audio-tts/index.ts
git commit -m "feat: add audio-tts Edge Function for ElevenLabs TTS proxy"
```

---

### Task 2: Create `audio-transcribe` Edge Function

**Files:**
- Create: `supabase/functions/audio-transcribe/index.ts`

**Step 1: Create the Edge Function file**

```typescript
import { createClient } from "jsr:@supabase/supabase-js@2";

// --- Configuration ---
const GROQ_TRANSCRIBE_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const WHISPER_MODEL = "whisper-large-v3";
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_TYPES = ["audio/webm", "audio/mp3", "audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/m4a", "audio/x-m4a"];
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://toml1.github.io",
  "capacitor://localhost",
  "http://localhost",
];

// --- Rate Limiting ---
const rateLimitMap = new Map<string, { timestamps: number[] }>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry) {
    rateLimitMap.set(userId, { timestamps: [now] });
    return false;
  }
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (entry.timestamps.length >= RATE_LIMIT_MAX_REQUESTS) return true;
  entry.timestamps.push(now);
  return false;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    entry.timestamps = entry.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
    if (entry.timestamps.length === 0) rateLimitMap.delete(key);
  }
}, 60_000);

// --- CORS ---
function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
  };
  if (origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o))) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

// --- Main Handler ---
Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // --- Auth ---
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Rate limit ---
    if (isRateLimited(user.id)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Parse multipart form data ---
    const formData = await req.formData();
    const audioFile = formData.get("file");

    if (!audioFile || !(audioFile instanceof File)) {
      return new Response(JSON.stringify({ error: "Audio file is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate file size
    if (audioFile.size > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ error: "File too large (max 25MB)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Forward to Groq Whisper ---
    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    if (!groqApiKey) {
      console.error("GROQ_API_KEY is not set");
      return new Response(JSON.stringify({ error: "Transcription service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const groqForm = new FormData();
    groqForm.append("file", audioFile, audioFile.name || "audio.webm");
    groqForm.append("model", WHISPER_MODEL);
    groqForm.append("language", "fr");

    const groqRes = await fetch(GROQ_TRANSCRIBE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
      },
      body: groqForm,
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text().catch(() => "Unknown error");
      console.error(`Groq Whisper error: ${groqRes.status} ${errText}`);
      return new Response(JSON.stringify({ error: "Transcription service temporarily unavailable" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await groqRes.json() as { text: string };

    return new Response(JSON.stringify({ text: result.text?.trim() ?? "" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Transcribe edge function error:", err);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 400,
      headers: { ...getCorsHeaders(null), "Content-Type": "application/json" },
    });
  }
});
```

**Step 2: Deploy the Edge Function**

Run: `SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy audio-transcribe --no-verify-jwt --project-ref jrvueyojezmbcmlxzlfr`
Expected: "Deployed Functions on project jrvueyojezmbcmlxzlfr: audio-transcribe"

**Step 3: Commit**

```bash
git add supabase/functions/audio-transcribe/index.ts
git commit -m "feat: add audio-transcribe Edge Function for Groq Whisper STT proxy"
```

---

### Task 3: Add `transcribeAudio()` and `textToSpeech()` to aiClient.ts

**Files:**
- Modify: `src/lib/aiClient.ts` (append after line 183)

**Step 1: Add the two new functions**

Append to end of `src/lib/aiClient.ts`:

```typescript
/**
 * Get a base Edge Function URL from the Supabase URL.
 */
function getEdgeFunctionBaseUrl(): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) throw new Error('VITE_SUPABASE_URL is not configured');
  return `${supabaseUrl}/functions/v1`;
}

/**
 * Transcribe audio using Groq Whisper via Edge Function.
 * Sends audio blob, returns French transcript.
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const baseUrl = getEdgeFunctionBaseUrl();
  const token = await getAccessToken();

  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');

  const res = await fetch(`${baseUrl}/audio-transcribe`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(mapErrorMessage(res.status, (errorData as { error?: string }).error));
  }

  const data = (await res.json()) as { text: string };
  return data.text;
}

/**
 * Generate speech audio using ElevenLabs via Edge Function.
 * Sends text, returns mp3 audio blob.
 */
export async function textToSpeech(text: string): Promise<Blob> {
  const baseUrl = getEdgeFunctionBaseUrl();
  const token = await getAccessToken();

  const res = await fetch(`${baseUrl}/audio-tts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(mapErrorMessage(res.status, (errorData as { error?: string }).error));
  }

  return await res.blob();
}
```

Also refactor the existing `getEdgeFunctionUrl()` (line 17-21) to use the new base function:

Replace:
```typescript
function getEdgeFunctionUrl(): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) throw new Error('VITE_SUPABASE_URL is not configured');
  return `${supabaseUrl}/functions/v1/ai-chat`;
}
```

With:
```typescript
function getEdgeFunctionUrl(): string {
  return `${getEdgeFunctionBaseUrl()}/ai-chat`;
}
```

**Step 2: Verify the app still builds**

Run: `npm run build` (or check dev server for TS errors)
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/lib/aiClient.ts
git commit -m "feat: add transcribeAudio and textToSpeech client functions"
```

---

### Task 4: Upgrade `audio.ts` — cloud TTS with browser fallback

**Files:**
- Modify: `src/lib/audio.ts`

**Step 1: Modify speak() to try cloud TTS first**

Replace the entire `src/lib/audio.ts` with:

```typescript
import { textToSpeech } from './aiClient';

let cachedVoice: SpeechSynthesisVoice | null = null;
let voiceSearched = false;

// In-memory audio cache to avoid re-fetching identical TTS
const audioCache = new Map<string, string>(); // text -> objectURL
const MAX_CACHE_SIZE = 50;

export function isAudioSupported(): boolean {
  return typeof window !== 'undefined' && ('speechSynthesis' in window || true);
  // Always return true now — cloud TTS works everywhere
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
```

Key changes:
- `speak()` now tries cloud first, browser fallback
- In-memory audio cache (50 entries) avoids re-fetching same text
- `isAudioSupported()` always returns true (cloud TTS works everywhere)
- `speakBrowser()` extracted as explicit fallback function

**Step 2: Verify dev server shows no errors**

Run: check dev server console — no import errors
Test: open app, click any "Listen" button — should hear ElevenLabs audio

**Step 3: Commit**

```bash
git add src/lib/audio.ts
git commit -m "feat: upgrade TTS to use ElevenLabs cloud with browser fallback"
```

---

### Task 5: Upgrade `speechRecognition.ts` — cloud STT with browser fallback

**Files:**
- Modify: `src/lib/speechRecognition.ts`

**Step 1: Add MediaRecorder-based recording and Whisper transcription**

Add the following after the existing imports (line 5) in `src/lib/speechRecognition.ts`:

```typescript
import { transcribeAudio } from './aiClient';
```

Add the following function before the existing `listenForSpeech` function (before line 128):

```typescript
/** Record audio from microphone using MediaRecorder, then transcribe via Groq Whisper */
async function listenForSpeechCloud(): Promise<SpeechRecognitionResult> {
  // Check for MediaRecorder support
  if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    throw new Error('MediaRecorder not supported');
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  return new Promise((resolve, reject) => {
    // Prefer webm, fall back to whatever is supported
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
      // Stop all mic tracks
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
          confidence: text.trim() ? 0.95 : 0, // Whisper doesn't return confidence, assume high
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

    // Start recording with 250ms chunks
    recorder.start(250);

    // Auto-stop after 8 seconds (same as browser STT timeout)
    setTimeout(() => {
      if (recorder.state === 'recording') {
        recorder.stop();
      }
    }, 8000);
  });
}
```

Then modify the existing `listenForSpeech` function to try cloud first:

Replace the existing `listenForSpeech` (lines 128-136):

```typescript
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
```

**Step 2: Verify dev server shows no errors**

Run: check dev server console — no import errors
Test: open Speaking Practice, record speech — should use Whisper transcription

**Step 3: Commit**

```bash
git add src/lib/speechRecognition.ts
git commit -m "feat: upgrade STT to use Groq Whisper cloud with browser fallback"
```

---

### Task 6: Deploy both Edge Functions and verify end-to-end

**Step 1: Deploy both Edge Functions**

Run:
```bash
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy audio-tts --no-verify-jwt --project-ref jrvueyojezmbcmlxzlfr
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy audio-transcribe --no-verify-jwt --project-ref jrvueyojezmbcmlxzlfr
```

Expected: Both deployed successfully

**Step 2: Verify TTS in the app**

- Navigate to AI Tutor → start conversation
- Click "Listen" (Volume2) button on AI message
- Expected: natural-sounding ElevenLabs French audio plays

**Step 3: Verify STT in the app**

- Navigate to Speaking Practice
- Click microphone, say a French phrase
- Expected: accurate Whisper transcription appears (much better than browser STT)

**Step 4: Verify fallback**

- Sign out of the app
- Click a "Listen" button
- Expected: falls back to browser SpeechSynthesis (robotic but works)

**Step 5: Check network tab**

- Verify requests go to `/functions/v1/audio-tts` and `/functions/v1/audio-transcribe`
- Verify no CORS errors
- Verify TTS response is `audio/mpeg` content type

---

## Files Summary

| File | Action | Task |
|------|--------|------|
| `supabase/functions/audio-tts/index.ts` | CREATE | 1 |
| `supabase/functions/audio-transcribe/index.ts` | CREATE | 2 |
| `src/lib/aiClient.ts` | EDIT | 3 |
| `src/lib/audio.ts` | EDIT | 4 |
| `src/lib/speechRecognition.ts` | EDIT | 5 |
| **0 consumer components** | No changes needed | — |
