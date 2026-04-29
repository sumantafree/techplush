import { categorize, estimateReadTime } from "@/lib/categorizer";
import type { Article } from "@/types";

const TECH_QUERIES = [
  "artificial intelligence",
  "machine learning",
  "technology",
  "digital marketing",
  "social media algorithm",
  "cybersecurity",
  "blockchain",
  "startup",
];

interface NewsAPIArticle {
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: { name: string };
  content: string | null;
}

export async function fetchNews(): Promise<Partial<Article>[]> {
  if (!process.env.NEWSAPI_KEY) {
    console.warn("NEWSAPI_KEY not set — skipping NewsAPI fetch");
    return [];
  }

  const query = TECH_QUERIES.slice(0, 4).join(" OR ");
  const url = new URL("https://newsapi.org/v2/everything");
  url.searchParams.set("q", query);
  url.searchParams.set("sortBy", "publishedAt");
  url.searchParams.set("language", "en");
  url.searchParams.set("pageSize", "40");
  url.searchParams.set("apiKey", process.env.NEWSAPI_KEY!);

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(`NewsAPI error: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    const articles: NewsAPIArticle[] = data.articles ?? [];

    return articles
      .filter((a) => a.title && a.url && !a.title.includes("[Removed]"))
      .map((a) => ({
        title: a.title,
        excerpt: a.description ?? a.content?.slice(0, 300) ?? "",
        url: a.url,
        source: a.source.name,
        published_at: a.publishedAt,
        category: categorize(a.title, a.description ?? ""),
        image: a.urlToImage,
        read_time: estimateReadTime(a.content ?? a.description ?? a.title),
      }));
  } catch (err) {
    console.error("fetchNews error:", err);
    return [];
  }
}
