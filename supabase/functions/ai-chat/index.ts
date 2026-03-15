import { createClient } from "jsr:@supabase/supabase-js@2";

// --- Configuration ---
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const ALLOWED_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "meta-llama/llama-4-scout-17b-16e-instruct", "qwen/qwen3-32b"];
const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const MAX_TOKENS_CAP = 1024;
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // per user per window

// Daily quotas
const FREE_DAILY_CHAT_LIMIT = 50;
const PRO_DAILY_CHAT_LIMIT = 200;

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://toml1.github.io",
  "capacitor://localhost",
  "http://localhost",
];

// --- Rate Limiting (in-memory, per-instance) ---
const rateLimitMap = new Map<string, { timestamps: number[] }>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry) {
    rateLimitMap.set(userId, { timestamps: [now] });
    return false;
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS
  );
  if (entry.timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  entry.timestamps.push(now);
  return false;
}

// Clean up stale entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    entry.timestamps = entry.timestamps.filter(
      (ts) => now - ts < RATE_LIMIT_WINDOW_MS
    );
    if (entry.timestamps.length === 0) {
      rateLimitMap.delete(key);
    }
  }
}, 60_000);

// --- CORS Headers ---
function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
  };

  if (origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o))) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

// --- Input Validation ---
interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

function validateRequest(body: unknown): ChatRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body");
  }

  const req = body as Record<string, unknown>;

  if (!Array.isArray(req.messages) || req.messages.length === 0) {
    throw new Error("messages must be a non-empty array");
  }

  const validRoles = new Set(["system", "user", "assistant"]);
  for (const msg of req.messages) {
    if (
      !msg ||
      typeof msg !== "object" ||
      typeof (msg as ChatMessage).role !== "string" ||
      typeof (msg as ChatMessage).content !== "string" ||
      !validRoles.has((msg as ChatMessage).role)
    ) {
      throw new Error("Each message must have a valid role and content string");
    }
  }

  return {
    messages: req.messages as ChatMessage[],
    stream: typeof req.stream === "boolean" ? req.stream : false,
    temperature:
      typeof req.temperature === "number"
        ? Math.min(Math.max(req.temperature, 0), 2)
        : undefined,
    max_tokens:
      typeof req.max_tokens === "number"
        ? Math.min(req.max_tokens, MAX_TOKENS_CAP)
        : MAX_TOKENS_CAP,
  };
}

// --- Main Handler ---
Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
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
    // --- Authenticate the user ---
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // --- Rate limiting ---
    if (isRateLimited(user.id)) {
      return new Response(
        JSON.stringify({
          error: "Too many requests. Please wait a moment.",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // --- Daily quota check ---
    const today = new Date().toISOString().split("T")[0];
    const { data: usage } = await supabase
      .from("api_usage")
      .select("chat_messages")
      .eq("user_id", user.id)
      .eq("usage_date", today)
      .single();

    // Check subscription status for quota tier
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", user.id)
      .single();

    const isProUser =
      sub?.status === "active" &&
      new Date(sub.current_period_end) > new Date();

    const dailyLimit = isProUser ? PRO_DAILY_CHAT_LIMIT : FREE_DAILY_CHAT_LIMIT;
    const currentMessages = usage?.chat_messages ?? 0;

    if (currentMessages >= dailyLimit) {
      return new Response(
        JSON.stringify({
          error: isProUser
            ? "Daily chat limit reached. Try again tomorrow."
            : "Daily free chat limit reached. Upgrade to Pro for more.",
          code: "QUOTA_EXCEEDED",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // --- Validate input ---
    const body = await req.json();
    const chatReq = validateRequest(body);

    // --- Build Groq request ---
    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    if (!groqApiKey) {
      console.error("GROQ_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "AI service is not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const model = DEFAULT_MODEL;
    if (!ALLOWED_MODELS.includes(model)) {
      return new Response(JSON.stringify({ error: "Invalid model" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const groqBody = {
      model,
      messages: chatReq.messages,
      stream: chatReq.stream,
      max_tokens: chatReq.max_tokens,
      ...(chatReq.temperature !== undefined && {
        temperature: chatReq.temperature,
      }),
    };

    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(groqBody),
    });

    if (!groqRes.ok) {
      const errorText = await groqRes.text().catch(() => "Unknown error");
      console.error(`Groq API error: ${groqRes.status} ${errorText}`);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Track usage (fire and forget)
    supabase
      .rpc("increment_usage", { p_user_id: user.id, p_field: "chat_messages", p_amount: 1 })
      .then(({ error }) => {
        if (error) console.error("Usage tracking error:", error.message);
      });

    // --- Streaming response ---
    if (chatReq.stream) {
      // Pipe the SSE stream from Groq directly to the client
      return new Response(groqRes.body, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // --- Non-streaming response ---
    const data = (await groqRes.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);

    const message =
      err instanceof Error && err.message.startsWith("Invalid")
        ? err.message
        : "An unexpected error occurred";

    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...getCorsHeaders(null), "Content-Type": "application/json" },
    });
  }
});
