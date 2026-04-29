/**
 * Thin wrapper around Google's Generative Language REST API.
 * No npm dependency — uses fetch, so it works on Vercel Edge + Node runtimes.
 *
 * Docs: https://ai.google.dev/api/rest/v1beta/models/generateContent
 */

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export type GeminiModel =
  | "gemini-2.5-pro"
  | "gemini-2.0-flash"
  | "gemini-1.5-flash"
  | "gemini-1.5-pro";

interface GenerateOptions {
  model?: GeminiModel;
  system?: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: "text/plain" | "application/json";
}

/**
 * Generate text from Gemini. Returns the raw string or throws.
 * Throws if GEMINI_API_KEY is missing so callers can decide to fall back.
 */
export async function geminiGenerate(
  prompt: string,
  opts: GenerateOptions = {}
): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not configured");

  const model = opts.model ?? "gemini-2.0-flash";
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${key}`;

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: opts.temperature ?? 0.6,
      maxOutputTokens: opts.maxOutputTokens ?? 1024,
      ...(opts.responseMimeType
        ? { responseMimeType: opts.responseMimeType }
        : {}),
    },
  };

  if (opts.system) {
    body.systemInstruction = { parts: [{ text: opts.system }] };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gemini ${res.status}: ${text.slice(0, 200)}`);
  }

  const json = await res.json();
  const text =
    json?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ??
    "";
  return text;
}

/** Strip ```json fences and parse. */
export function parseJsonLoose<T>(raw: string): T {
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

export const isGeminiConfigured = () => Boolean(process.env.GEMINI_API_KEY);
