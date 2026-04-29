import type { Article } from "@/types";

export type BlogTone = "professional" | "casual" | "seo-heavy" | "storytelling";
export type BlogLength = "short" | "long";

export function buildBlogPrompt(
  article: Article,
  tone: BlogTone = "professional",
  length: BlogLength = "long",
  audience = "tech readers and bloggers"
): string {
  const wordTarget = length === "long" ? "1500-2000" : "800-1200";

  const toneGuide: Record<BlogTone, string> = {
    professional: "authoritative, clear, data-driven, suitable for LinkedIn and industry blogs",
    casual: "friendly, conversational, approachable, like talking to a smart friend",
    "seo-heavy": "SEO-optimized with natural keyword integration, scannable headers, and clear CTAs",
    storytelling: "narrative-driven with anecdotes, analogies, and a compelling arc",
  };

  return `You are an expert SEO blog writer and tech journalist.

Write a high-quality, original blog post based on:

TITLE: ${article.title}
SUMMARY: ${article.excerpt ?? ""}
CATEGORY: ${article.category}
SOURCE: ${article.source}

Requirements:
- Word count: ${wordTarget} words
- Tone: ${toneGuide[tone]}
- Target audience: ${audience}
- Use proper H1 (blog title), H2, H3 heading hierarchy
- Include: Introduction, 3-5 detailed sections with insights, practical takeaways, Conclusion
- Add a 5-question FAQ section at the end
- Include real-world examples or scenarios
- SEO best practices throughout

Return ONLY valid JSON in this exact structure:
{
  "title": "Engaging blog post title (H1)",
  "meta_title": "SEO meta title under 60 chars",
  "meta_description": "Compelling meta description 150-160 chars",
  "keywords": ["keyword1", "keyword2", ...up to 10 keywords],
  "content": "Full HTML blog post with proper heading tags",
  "faq": [
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." }
  ],
  "word_count": 1500
}`;
}

export function buildIdeaPrompt(article: Article): string {
  return `You are a creative tech content strategist.

Based on this article:
TITLE: ${article.title}
SUMMARY: ${article.excerpt ?? ""}
CATEGORY: ${article.category}

Generate a unique, engaging blog post idea that goes deeper or takes a fresh angle.

Return ONLY valid JSON:
{
  "headline": "Compelling click-worthy headline",
  "outline": ["Section 1 title", "Section 2 title", "Section 3 title", "Section 4 title", "Conclusion"],
  "keywords": ["primary keyword", "secondary keyword 1", "secondary keyword 2", "long-tail keyword"],
  "meta_description": "SEO meta description 150-160 chars",
  "content_opportunity": "Why this topic has high SEO/viral potential in 1-2 sentences",
  "estimated_traffic": "low | medium | high"
}`;
}
