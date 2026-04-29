import { estimateReadTime } from "@/lib/categorizer";
import type { Article } from "@/types";

const ARXIV_QUERIES = [
  "ti:artificial+intelligence",
  "ti:machine+learning",
  "ti:large+language+model",
];

interface ArxivEntry {
  title: string;
  summary: string;
  link: string;
  published: string;
  author: string | string[];
}

export async function fetchArxiv(): Promise<Partial<Article>[]> {
  const allArticles: Partial<Article>[] = [];

  for (const query of ARXIV_QUERIES) {
    try {
      const url = `https://export.arxiv.org/api/query?search_query=${query}&start=0&max_results=5&sortBy=submittedDate&sortOrder=descending`;
      const res = await fetch(url, { next: { revalidate: 43200 } }); // cache 12h

      if (!res.ok) continue;

      const xml = await res.text();
      const entries = parseArxivXML(xml);

      for (const entry of entries) {
        const cleanTitle = entry.title.replace(/\s+/g, " ").trim();
        const cleanSummary = entry.summary.replace(/\s+/g, " ").trim();

        allArticles.push({
          title: cleanTitle,
          excerpt: cleanSummary.slice(0, 400),
          url: entry.link,
          source: "arXiv",
          published_at: entry.published,
          category: "Research & Papers",
          image: null,
          read_time: estimateReadTime(cleanSummary),
        });
      }
    } catch (err) {
      console.warn("arXiv fetch failed:", err);
    }
  }

  return allArticles;
}

function parseArxivXML(xml: string): ArxivEntry[] {
  const entries: ArxivEntry[] = [];

  // Basic XML parsing without external lib
  const entryBlocks = xml.match(/<entry>([\s\S]*?)<\/entry>/g) ?? [];

  for (const block of entryBlocks) {
    const title = extract(block, "title");
    const summary = extract(block, "summary");
    const published = extract(block, "published");
    const linkMatch = block.match(/<id>(.*?)<\/id>/);
    const link = linkMatch?.[1]?.replace("abs", "pdf").trim() ?? "#";

    if (title && summary) {
      entries.push({ title, summary, link, published, author: "" });
    }
  }

  return entries;
}

function extract(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\s\S]*?)<\/${tag}>`));
  return match?.[1]?.trim() ?? "";
}
