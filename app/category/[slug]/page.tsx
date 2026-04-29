import { Suspense } from "react";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { ArticleCard } from "@/components/article-card";
import { DashboardShell } from "@/components/dashboard-shell";
import { DashboardSkeleton } from "@/components/loading-skeleton";
import { CATEGORY_SLUGS } from "@/types";
import type { Article } from "@/types";
import type { Metadata } from "next";

export const revalidate = 3600;

interface Params { slug: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORY_SLUGS[slug];
  if (!category) return { title: "Not Found" };
  return {
    title: category,
    description: `Latest ${category} articles curated daily on TechPulse.`,
  };
}

async function CategoryContent({ slug }: { slug: string }) {
  const category = CATEGORY_SLUGS[slug];
  if (!category) notFound();

  const { data } = await supabaseAdmin
    .from("articles")
    .select("*")
    .eq("category", category)
    .order("published_at", { ascending: false })
    .limit(60);

  const articles = (data ?? []) as Article[];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{category}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {articles.length} articles · Updated daily
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No articles in this category yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Refresh the dashboard to fetch fresh content.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  return (
    <DashboardShell>
      <Suspense fallback={<DashboardSkeleton />}>
        <CategoryContent slug={slug} />
      </Suspense>
    </DashboardShell>
  );
}

export function generateStaticParams() {
  return Object.keys(CATEGORY_SLUGS).map((slug) => ({ slug }));
}
