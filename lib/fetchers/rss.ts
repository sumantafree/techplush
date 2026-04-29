import Parser from "rss-parser";
import { categorize, estimateReadTime } from "@/lib/categorizer";
import type { Article } from "@/types";

const RSS_FEEDS = [
  { url: "https://techcrunch.com/feed/", source: "TechCrunch" },
  { url: "https://www.theverge.com/rss/index.xml", source: "The Verge" },
  { url: "https://feeds.wired.com/wired/index", source: "Wired" },
  { url: "https://feeds.feedburner.com/venturebeat/SZYF", source: "VentureBeat" },
  { url: "https://www.technologyreview.com/feed/", source: "MIT Tech Review" },
  { url: "https://www.socialmediatoday.com/rss.xml", source: "Social Media Today" },
  { url: "https://marketingland.com/feed", source: "Marketing Land" },
  { url: "https://www.artificialintelligence-news.com/feed/", source: "AI News" },
  { url: "https://feeds.nature.com/nature/rss/current", source: "Nature" },
  { url: "https://hnrss.org/frontpage", source: "Hacker News" },
];

type Parser_Item = {
  title?: string;
  link?: string;
  contentSnippet?: string;
  pubDate?: string;
  isoDate?: string;
  enclosure?: { url?: string };
  "media:content"?: { $?: { url?: string } };
};

export async function fetchRSS(): Promise<Partial<Article>[]> {
  const parser = new Parser({
    customFields: {
      item: [["media:content", "media:content", { keepArray: false }]],
    },
    timeout: 10000,
  });

  const results = await Promise.allSettled(
    RSS_FEEDS.map(async ({ url, source }) => {
      const feed = await parser.parseURL(url);

      return (feed.items as Parser_Item[])
        .slice(0, 10)
        .filter((item) => item.title && item.link)
        .map((item) => {
          const excerpt = item.contentSnippet?.slice(0, 400) ?? "";
          const image =
            item.enclosure?.url ??
            (item["media:content"] as any)?.$?.url ??
            null;

          return {
            title: item.title!,
            excerpt,
            url: item.link!,
            source,
            published_at:
              item.isoDate ?? item.pubDate ?? new Date().toISOString(),
            category: categorize(item.title!, excerpt),
            image,
            read_time: estimateReadTime(excerpt),
          } satisfies Partial<Article>;
        });
    })
  );

  const articles: Partial<Article>[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    } else {
      console.warn("RSS feed failed:", result.reason?.message);
    }
  }

  return articles;
}
