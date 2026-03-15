import { supabase } from './supabase';

// Types
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  max_tokens?: number;
}

/**
 * Get the base Edge Function URL from the Supabase URL.
 */
function getEdgeFunctionBaseUrl(): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) throw new Error('VITE_SUPABASE_URL is not configured');
  return `${supabaseUrl}/functions/v1`;
}

function getEdgeFunctionUrl(): string {
  return `${getEdgeFunctionBaseUrl()}/ai-chat`;
}

/**
 * Get the current user's access token for authenticating with the Edge Function.
 */
async function getAccessToken(): Promise<string> {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Please sign in to use AI features');
  return session.access_token;
}

/**
 * Check if AI features are available (user is authenticated and Supabase is configured).
 */
export async function checkAIStatus(): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session?.access_token;
  } catch {
    return false;
  }
}

/**
 * Send a non-streaming chat request via the Supabase Edge Function.
 * Returns the content string from the response.
 */
export async function chat(
  messages: ChatMessage[],
  options?: ChatOptions
): Promise<string> {
  const url = getEdgeFunctionUrl();
  const token = await getAccessToken();

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      messages,
      stream: false,
      ...options,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw createAPIError(res.status, errorData as { error?: string; code?: string });
  }

  const data = (await res.json()) as { content: string };
  return data.content;
}

/**
 * Send a streaming chat request via the Supabase Edge Function.
 * Reads the SSE stream from Groq (proxied through the Edge Function),
 * calling onToken for each content chunk.
 * Returns the full accumulated response.
 */
export async function chatStream(
  messages: ChatMessage[],
  onToken: (token: string) => void
): Promise<string> {
  const url = getEdgeFunctionUrl();
  const token = await getAccessToken();

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      messages,
      stream: true,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw createAPIError(res.status, errorData as { error?: string; code?: string });
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error('No response body reader available');
  }

  const decoder = new TextDecoder();
  let accumulated = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Process complete SSE lines
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (!trimmed.startsWith('data: ')) continue;

      try {
        const json = JSON.parse(trimmed.slice(6)) as {
          choices: Array<{ delta: { content?: string } }>;
        };
        const content = json.choices?.[0]?.delta?.content;
        if (content) {
          onToken(content);
          accumulated += content;
        }
      } catch {
        // Skip malformed SSE lines
      }
    }
  }

  // Process remaining buffer
  if (buffer.trim() && buffer.trim() !== 'data: [DONE]' && buffer.trim().startsWith('data: ')) {
    try {
      const json = JSON.parse(buffer.trim().slice(6)) as {
        choices: Array<{ delta: { content?: string } }>;
      };
      const content = json.choices?.[0]?.delta?.content;
      if (content) {
        onToken(content);
        accumulated += content;
      }
    } catch {
      // Skip malformed trailing data
    }
  }

  return accumulated;
}

// Error codes returned by edge functions for quota/subscription issues
export const ERROR_CODES = {
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
} as const;

export type APIErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES] | undefined;

export class APIError extends Error {
  code?: APIErrorCode;
  status: number;

  constructor(message: string, status: number, code?: APIErrorCode) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Map HTTP error status codes to user-friendly messages.
 * Now also extracts error codes from the response body.
 */
function createAPIError(status: number, errorData: { error?: string; code?: string }): APIError {
  const code = errorData.code as APIErrorCode;

  if (code === ERROR_CODES.SUBSCRIPTION_REQUIRED) {
    return new APIError(
      errorData.error ?? 'This feature requires a Pro subscription.',
      status,
      code
    );
  }

  if (code === ERROR_CODES.QUOTA_EXCEEDED) {
    return new APIError(
      errorData.error ?? 'Daily usage limit reached. Try again tomorrow.',
      status,
      code
    );
  }

  switch (status) {
    case 401:
      return new APIError('Please sign in to use AI features', status);
    case 429:
      return new APIError('Too many requests — please wait a moment and try again', status);
    case 502:
      return new APIError('AI service is temporarily unavailable. Please try again later.', status);
    default:
      return new APIError(
        errorData.error ?? 'Could not reach the AI service. Please try again.',
        status
      );
  }
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
    throw createAPIError(res.status, errorData as { error?: string; code?: string });
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
    throw createAPIError(res.status, errorData as { error?: string; code?: string });
  }

  return await res.blob();
}
