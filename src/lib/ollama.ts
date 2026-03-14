const OLLAMA_LOCAL = 'http://localhost:11434';
const SERVER_URL_KEY = 'conjugo_ollama_server_url';

function getOllamaBase(): string {
  try {
    const stored = localStorage.getItem(SERVER_URL_KEY);
    if (stored?.trim()) return stored.trim().replace(/\/+$/, '');
  } catch { /* ignore */ }
  return OLLAMA_LOCAL;
}

export function setOllamaServerUrl(url: string): void {
  try {
    if (url.trim()) {
      localStorage.setItem(SERVER_URL_KEY, url.trim().replace(/\/+$/, ''));
    } else {
      localStorage.removeItem(SERVER_URL_KEY);
    }
  } catch { /* ignore */ }
}

export function getOllamaServerUrl(): string {
  try {
    return localStorage.getItem(SERVER_URL_KEY) ?? '';
  } catch { return ''; }
}

// Types
export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaChatOptions {
  temperature?: number;
  top_p?: number;
  num_predict?: number; // max tokens
}

/**
 * Check if the Ollama server is running and reachable.
 * GET /api/tags with a 3-second timeout.
 */
export async function checkOllamaStatus(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${getOllamaBase()}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * List available models from the Ollama server.
 * GET /api/tags, parse response, return array of model names.
 */
export async function listModels(): Promise<string[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${getOllamaBase()}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const data = (await res.json()) as { models: { name: string }[] };
    return data.models.map((m) => m.name);
  } catch {
    return [];
  }
}

/**
 * Send a non-streaming chat request to Ollama.
 * POST /api/chat with { model, messages, stream: false, options }.
 * Returns the content string from the response.
 */
export async function chat(
  model: string,
  messages: OllamaMessage[],
  options?: OllamaChatOptions
): Promise<string> {
  const res = await fetch(`${getOllamaBase()}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options,
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama chat error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { message: { content: string } };
  return data.message.content;
}

/**
 * Send a streaming chat request to Ollama.
 * POST /api/chat with { model, messages, stream: true }.
 * Reads the NDJSON stream line by line, calling onToken for each content chunk.
 * Returns the full accumulated response.
 */
export async function chatStream(
  model: string,
  messages: OllamaMessage[],
  onToken: (token: string) => void
): Promise<string> {
  const res = await fetch(`${getOllamaBase()}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama chat stream error: ${res.status} ${res.statusText}`);
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

    // Process complete lines from the buffer (NDJSON: one JSON object per line)
    const lines = buffer.split('\n');
    // Keep the last potentially incomplete line in the buffer
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        const parsed = JSON.parse(trimmed) as {
          message: { content: string };
          done: boolean;
        };
        if (parsed.message?.content) {
          onToken(parsed.message.content);
          accumulated += parsed.message.content;
        }
      } catch {
        // Skip malformed lines
      }
    }
  }

  // Process any remaining buffer content
  if (buffer.trim()) {
    try {
      const parsed = JSON.parse(buffer.trim()) as {
        message: { content: string };
        done: boolean;
      };
      if (parsed.message?.content) {
        onToken(parsed.message.content);
        accumulated += parsed.message.content;
      }
    } catch {
      // Skip malformed trailing data
    }
  }

  return accumulated;
}
