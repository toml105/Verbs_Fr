# Audio Upgrade: Groq Whisper STT + ElevenLabs TTS

## Context

Conjugo currently uses browser-native APIs for speech:
- **TTS**: `SpeechSynthesis` API — robotic French voices, quality varies by browser/OS
- **STT**: `SpeechRecognition` API — Chrome/Edge only, mediocre French accuracy

**Goal**: Replace both with cloud services for dramatically better French audio quality, routed through Supabase Edge Functions (same secure proxy pattern as `ai-chat`).

## Solution

- **STT**: Groq Whisper (`whisper-large-v3`) — free tier, excellent French transcription
- **TTS**: ElevenLabs (`eleven_multilingual_v2`) — natural French voices, $5-22/month

---

## Architecture

```
┌─────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│   Browser    │────▶│ audio-transcribe EF │────▶│ Groq Whisper API │
│ (record mic) │     │ (JWT + rate limit)  │     │ (whisper-large-v3)│
└─────────────┘     └─────────────────────┘     └──────────────────┘

┌─────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│   Browser    │────▶│   audio-tts EF      │────▶│ ElevenLabs API   │
│ (play audio) │◀───│ (JWT + rate limit)  │◀───│ (multilingual_v2)│
└─────────────┘     └─────────────────────┘     └──────────────────┘
```

Both Edge Functions follow the same security model as `ai-chat`:
- JWT auth via `supabase.auth.getUser(token)`
- Per-user rate limiting (in-memory sliding window)
- CORS restricted to app origins
- API keys stored as Supabase secrets

---

## Edge Function: `audio-transcribe`

**Endpoint**: `POST /functions/v1/audio-transcribe`

**Request**: `multipart/form-data` with audio file
- Accepts: webm, mp3, wav, ogg, m4a (formats Whisper supports)
- Max file size: 25MB (Whisper limit)

**Response**: `{ "text": "transcribed text" }`

**Configuration**:
- Model: `whisper-large-v3`
- Language: `fr` (hardcoded — this is a French learning app)
- Rate limit: 20 req/min per user

**Security**:
- JWT validation (same as ai-chat)
- File type validation (reject non-audio)
- Size limit enforcement
- GROQ_API_KEY from Supabase secrets (already set)

---

## Edge Function: `audio-tts`

**Endpoint**: `POST /functions/v1/audio-tts`

**Request**: JSON `{ "text": string, "voice_id"?: string }`
- Max text length: 500 characters per request
- Default voice: `EXAVITQu4vr4xnSDxMaL` (Sarah — clear, professional)

**Response**: Binary mp3 audio (streamed back to client)

**Configuration**:
- Model: `eleven_multilingual_v2`
- Output format: mp3_44100_128
- Voice settings: stability 0.5, similarity_boost 0.75
- Rate limit: 30 req/min per user

**Security**:
- JWT validation
- Text length cap (500 chars) to protect ElevenLabs quota
- ELEVENLABS_API_KEY from Supabase secrets

---

## Frontend Changes

### `src/lib/aiClient.ts`
Add two new functions:
- `transcribeAudio(audioBlob: Blob): Promise<string>` — sends audio to `audio-transcribe`
- `textToSpeech(text: string): Promise<Blob>` — gets mp3 from `audio-tts`

### `src/lib/audio.ts`
- Add `cloudSpeak(text: string, rate?: number): Promise<void>` — calls `textToSpeech()`, plays mp3 via `Audio` element
- Keep existing `speak()` as fallback
- Export a unified `smartSpeak()` that tries cloud first, falls back to browser

### `src/lib/speechRecognition.ts`
- Add `cloudListen(): Promise<{ transcript: string; confidence: number }>` — records mic → sends blob to `transcribeAudio()`
- Keep existing `listenForSpeech()` as fallback
- Export a unified `smartListen()` that tries cloud first, falls back to browser
- Need `MediaRecorder` API to capture audio as webm blob

### Consumer pages (use new unified functions)
| Page | TTS Change | STT Change |
|------|-----------|-----------|
| `AITutor.tsx` | Listen buttons → `smartSpeak()` | Mic input → `smartListen()` |
| `SpeakingPractice.tsx` | Correct answer playback → `smartSpeak()` | Recording → `smartListen()` |
| `ConversationPractice.tsx` | Auto-play dialogue → `smartSpeak()` | User responses → `smartListen()` |
| `ListeningPractice.tsx` | Audio prompts → `smartSpeak()` | N/A |
| `VerbDetail.tsx` | Verb pronunciation → `smartSpeak()` | N/A |
| `ChatMessage.tsx` | Listen button → `smartSpeak()` | N/A |
| `SentenceBuilder.tsx` | N/A | Mic input → `smartListen()` |
| `components/ui/ConjugationTable.tsx` | Conjugation audio → `smartSpeak()` | N/A |
| `components/quiz/QuizCard.tsx` | Auto-play answers → `smartSpeak()` | N/A |

---

## Fallback Strategy

- If user is not authenticated → use browser APIs (current behavior)
- If cloud TTS fails → fall back to browser `SpeechSynthesis`
- If cloud STT fails → fall back to browser `SpeechRecognition`
- Graceful degradation — never blocks the user

---

## Cost Estimate

- **Groq Whisper**: Free tier (14,400 req/day)
- **ElevenLabs**: $5/month starter (30K chars) — ~400 French sentences/month
- **Supabase Edge Functions**: Included in free plan

---

## Files Summary

| File | Action |
|------|--------|
| `supabase/functions/audio-transcribe/index.ts` | CREATE |
| `supabase/functions/audio-tts/index.ts` | CREATE |
| `src/lib/aiClient.ts` | EDIT — add `transcribeAudio()`, `textToSpeech()` |
| `src/lib/audio.ts` | EDIT — add `cloudSpeak()`, `smartSpeak()` |
| `src/lib/speechRecognition.ts` | EDIT — add `cloudListen()`, `smartListen()` |
| ~9 consumer components | EDIT — swap to `smartSpeak()`/`smartListen()` |
