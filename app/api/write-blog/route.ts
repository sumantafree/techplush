import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { geminiGenerate, parseJsonLoose, isGeminiConfigured } from "@/lib/gemini";
import { buildBlogPrompt, type BlogTone, type BlogLength } from "@/lib/blog-prompt";
import type { Article, BlogPost } from "@/types";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    article,
    tone = "professional",
    length = "long",
    audience = "tech bloggers and content creators",
  }: {
    article: Article;
    tone: BlogTone;
    length: BlogLength;
    audience: string;
  } = await req.json();

  if (!article?.title) {
    return NextResponse.json({ error: "Article required" }, { status: 400 });
  }

  if (!isGeminiConfigured()) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 503 }
    );
  }

  try {
    const prompt = buildBlogPrompt(article, tone, length, audience);
    const raw = await geminiGenerate(prompt, {
      model: "gemini-2.5-pro",
      temperature: 0.7,
      maxOutputTokens: 8000,
      responseMimeType: "application/json",
    });

    const blog = parseJsonLoose<BlogPost>(raw);
    return NextResponse.json(blog);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
