import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { geminiGenerate, parseJsonLoose, isGeminiConfigured } from "@/lib/gemini";
import { buildIdeaPrompt } from "@/lib/blog-prompt";
import type { Article, BlogIdea } from "@/types";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { article }: { article: Article } = await req.json();

  if (!article?.title) {
    return NextResponse.json({ error: "Article required" }, { status: 400 });
  }

  if (!isGeminiConfigured()) {
    const fallback: BlogIdea = {
      headline: `The Complete Guide to: ${article.title}`,
      outline: [
        "Introduction & Why This Matters",
        "Key Insights & Breakdown",
        "Real-World Implications",
        "What This Means for Creators & Marketers",
        "Actionable Takeaways",
        "Conclusion",
      ],
      keywords: [
        article.category.toLowerCase(),
        "tech trends",
        "future of technology",
        article.source.toLowerCase(),
      ],
      meta_description: `Explore the full story behind "${article.title}". Learn what it means, why it matters, and how to use this insight to grow your blog.`,
    };
    return NextResponse.json(fallback);
  }

  try {
    const prompt = buildIdeaPrompt(article);
    const raw = await geminiGenerate(prompt, {
      model: "gemini-2.0-flash",
      temperature: 0.8,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
    });
    const idea = parseJsonLoose<BlogIdea>(raw);
    return NextResponse.json(idea);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
