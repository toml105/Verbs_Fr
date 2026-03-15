import { createClient } from "jsr:@supabase/supabase-js@2";

// --- Configuration ---
const GROQ_TRANSCRIBE_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const WHISPER_MODEL = "whisper-large-v3";
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
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
