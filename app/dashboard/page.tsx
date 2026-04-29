import { Suspense } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import { generateDailyDigest } from "@/lib/summarizer";
import { ArticleCard } from "@/components/article-card";
import { DashboardShell } from "@/components/dashboard-shell";
import { DashboardSkeleton } from "@/components/loading-skeleton";
import type { Article } from "@/types";
import { Zap, TrendingUp, Calendar } from "lucide-react";

export const revalidate = 3600; // revalidate every hour

async function getArticles() {
  const { data } = await supabaseAdmin
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(60);
  return (data ?? []) as Article[];
}

async function getLastRefreshed(): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("app_metadata")
    .select("value")
    .eq("key", "last_refreshed")
    .single();
  return data?.value ?? null;
}

async function DashboardContent() {
  const [articles, lastRefreshed] = await Promise.all([
    getArticles(),
    getLastRefreshed(),
  ]);

  const top5 = articles.slice(0, 5);
  const rest = articles.slice(5);
  const digest = await generateDailyDigest(top5.map((a) => a.title));

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero — Daily Digest */}
      <section className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 via-card to-card p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Good morning! ☀️</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {today}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {articles.length} articles today
          </div>
        </div>

        {/* Digest paragraph */}
        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
          {digest}
        </p>

        {/* Top 5 */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
              Today's Top 5
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {top5.map((article, i) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-1.5 rounded-xl border border-border bg-card/50 p-3 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all duration-200"
              >
                <span className="text-[10px] font-bold text-indigo-500">#{i + 1}</span>
                <p className="text-xs font-medium text-foreground line-clamp-3 group-hover:text-indigo-400 transition-colors">
                  {article.title}
                </p>
                <p className="text-[10px] text-muted-foreground mt-auto">{article.source}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
          Latest Articles
        </h2>
        {rest.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-muted-foreground">No articles yet.</p>
            <p className="text-sm text-muted-foreground">
              Click <strong>Refresh Now</strong> (↻ button above) to fetch today's content.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rest.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardShell>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </DashboardShell>
  );
}
