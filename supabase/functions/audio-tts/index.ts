import { createClient } from "jsr:@supabase/supabase-js@2";

// --- Configuration ---
const ELEVENLABS_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech";
const DEFAULT_VOICE_ID = "txtf1EDouKke753vN8SL"; // Jeanne - Professional (native Parisian French)
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
        voice_settings: { stability: 0.65, similarity_boost: 0.80 },
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
        "Cache-Control": "public, max-age=86400",
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
