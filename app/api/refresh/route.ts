import { NextResponse } from "next/server";
import { fetchNews } from "@/lib/fetchers/news";
import { fetchRSS } from "@/lib/fetchers/rss";
import { fetchArxiv } from "@/lib/fetchers/arxiv";
import { supabaseAdmin } from "@/lib/supabase";
import { summarize } from "@/lib/summarizer";
import type { Article } from "@/types";

// Protect cron endpoint via Bearer token (set CRON_SECRET in Vercel env)
function isAuthorized(req: Request): boolean {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET) return true; // dev mode
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("🔄 TechPulse refresh started…");

    // Fetch all sources in parallel
    const [newsArticles, rssArticles, arxivArticles] = await Promise.all([
      fetchNews(),
      fetchRSS(),
      fetchArxiv(),
    ]);

    const allArticles = [...newsArticles, ...rssArticles, ...arxivArticles];
    console.log(`📰 Fetched ${allArticles.length} articles`);

    let saved = 0;
    let skipped = 0;

    // Process in batches to avoid rate limits
    const BATCH_SIZE = 10;
    for (let i = 0; i < allArticles.length; i += BATCH_SIZE) {
      const batch = allArticles.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (article) => {
          if (!article.title || !article.url) return;

          // Generate AI summary if excerpt is short
          let excerpt = article.excerpt ?? "";
          if (excerpt.length < 100 && process.env.GEMINI_API_KEY) {
            excerpt = await summarize(article.title + ". " + excerpt);
          }

          const payload: Partial<Article> = {
            title: article.title.slice(0, 500),
            excerpt: excerpt.slice(0, 1000),
            url: article.url,
            source: article.source ?? "Unknown",
            published_at: article.published_at ?? new Date().toISOString(),
            category: article.category ?? "Tech Updates",
            image: article.image ?? null,
            read_time: article.read_time ?? 3,
          };

          const { error } = await supabaseAdmin
            .from("articles")
            .upsert(payload, { onConflict: "url", ignoreDuplicates: true });

          if (error) {
            console.warn("Upsert skipped:", error.message);
            skipped++;
          } else {
            saved++;
          }
        })
      );
    }

    // Update last_refreshed timestamp in app_metadata
    await supabaseAdmin
      .from("app_metadata")
      .upsert({ key: "last_refreshed", value: new Date().toISOString() });

    console.log(`✅ Saved: ${saved}, Skipped: ${skipped}`);

    return NextResponse.json({
      success: true,
      fetched: allArticles.length,
      saved,
      skipped,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Refresh failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
