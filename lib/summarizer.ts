import { geminiGenerate, isGeminiConfigured } from "./gemini";

export async function summarize(text: string): Promise<string> {
  if (!text || text.length < 50) return text;
  if (!isGeminiConfigured()) return truncateFallback(text);

  try {
    const out = await geminiGenerate(`Summarize this: ${text.slice(0, 800)}`, {
      model: "gemini-2.0-flash",
      system:
        "You are a concise tech journalist. Summarize the given text in exactly 2-3 sentences. Be informative and direct. No fluff.",
      temperature: 0.3,
      maxOutputTokens: 160,
    });
    return out.trim() || truncateFallback(text);
  } catch {
    return truncateFallback(text);
  }
}

export async function generateDailyDigest(
  headlines: string[]
): Promise<string> {
  if (!isGeminiConfigured()) {
    return `Today's top tech stories cover ${headlines.slice(0, 3).join(", ")}, and more breaking updates from across the technology landscape.`;
  }

  try {
    const out = await geminiGenerate(
      `Today's top headlines:\n${headlines.slice(0, 8).join("\n")}`,
      {
        model: "gemini-2.0-flash",
        system:
          "You are a sharp daily tech brief writer. Write a 3-4 sentence engaging morning digest about today's top tech stories. Sound like a smart friend, not a robot.",
        temperature: 0.6,
        maxOutputTokens: 260,
      }
    );
    return out.trim();
  } catch {
    return `Today's dashboard is packed with fresh insights across AI, marketing, and tech. Stay ahead of the curve — your morning briefing is ready.`;
  }
}

function truncateFallback(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 220 ? clean.slice(0, 217) + "..." : clean;
}
