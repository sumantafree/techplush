"use client";

import { useState, useMemo } from "react";
import {
  BookMarked, Search, Tag, Download, FileText,
  Trash2, Lightbulb, Loader2, ExternalLink,
} from "lucide-react";
import type { SavedArticle } from "@/types";
import { formatDate, exportMarkdown, exportCSV, cn } from "@/lib/utils";

interface LibraryClientProps {
  savedArticles: SavedArticle[];
}

export function LibraryClient({ savedArticles: initial }: LibraryClientProps) {
  const [articles, setArticles] = useState<SavedArticle[]>(initial);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [generating, setGenerating] = useState<string | null>(null);
  const [blogIdeas, setBlogIdeas] = useState<Record<string, any>>({});

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    articles.forEach((a) => a.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [articles]);

  const filtered = useMemo(() => {
    return articles.filter((sa) => {
      const article = sa.article!;
      const matchesSearch =
        !search ||
        article.title.toLowerCase().includes(search.toLowerCase()) ||
        sa.notes?.toLowerCase().includes(search.toLowerCase()) ||
        sa.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesTag = !filterTag || sa.tags?.includes(filterTag);
      return matchesSearch && matchesTag;
    });
  }, [articles, search, filterTag]);

  async function handleDelete(savedId: string) {
    if (!confirm("Remove from library?")) return;
    await fetch("/api/save", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ saved_id: savedId }),
    });
    setArticles((prev) => prev.filter((a) => a.id !== savedId));
  }

  async function handleGenerateIdea(sa: SavedArticle) {
    setGenerating(sa.id);
    try {
      const res = await fetch("/api/blog-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article: sa.article }),
      });
      const data = await res.json();
      setBlogIdeas((prev) => ({ ...prev, [sa.id]: data }));
    } finally {
      setGenerating(null);
    }
  }

  function handleExportMarkdown() {
    const md = filtered
      .map((sa) => {
        const a = sa.article!;
        return [
          `# ${a.title}`,
          `**Source:** ${a.source}`,
          `**Category:** ${a.category}`,
          `**Date:** ${formatDate(a.published_at)}`,
          `**URL:** ${a.url}`,
          sa.notes ? `\n**Notes:** ${sa.notes}` : "",
          sa.tags?.length ? `**Tags:** ${sa.tags.join(", ")}` : "",
          "",
          a.excerpt ?? "",
          "\n---\n",
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n");
    exportMarkdown(md, "techpulse-library");
  }

  function handleExportCSV() {
    const rows = filtered.map((sa) => ({
      title: sa.article?.title ?? "",
      source: sa.article?.source ?? "",
      category: sa.article?.category ?? "",
      url: sa.article?.url ?? "",
      notes: sa.notes ?? "",
      tags: sa.tags?.join(";") ?? "",
      saved_at: sa.created_at,
    }));
    exportCSV(rows, "techpulse-library");
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookMarked className="h-5 w-5 text-indigo-400" />
          <h1 className="text-2xl font-bold text-foreground">My Library</h1>
          <span className="rounded-full bg-indigo-500/15 text-indigo-400 text-xs px-2 py-0.5 font-medium">
            {articles.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportMarkdown}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Markdown
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border hover:bg-accent px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, notes, tags…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-muted/50 outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setFilterTag(filterTag === tag ? "" : tag)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-colors",
              filterTag === tag
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "border-border hover:border-indigo-500/40 text-muted-foreground hover:text-foreground"
            )}
          >
            <Tag className="h-2.5 w-2.5" />
            {tag}
          </button>
        ))}
      </div>

      {/* Articles */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookMarked className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">
            {articles.length === 0
              ? "Your library is empty. Save articles to get started!"
              : "No articles match your search."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sa) => {
            const article = sa.article!;
            const idea = blogIdeas[sa.id];

            return (
              <div
                key={sa.id}
                className="rounded-2xl border border-border bg-card p-5 space-y-3 hover:border-indigo-500/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-foreground hover:text-indigo-400 transition-colors line-clamp-2 flex items-start gap-1.5"
                    >
                      {article.title}
                      <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-muted-foreground" />
                    </a>
                    <p className="text-xs text-muted-foreground">
                      {article.source} · {article.category} · {formatDate(article.published_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(sa.id)}
                    className="flex-shrink-0 h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {sa.notes && (
                  <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                    {sa.notes}
                  </p>
                )}

                {sa.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {sa.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-0.5 text-[10px] bg-muted rounded-full px-2 py-0.5 text-muted-foreground"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Blog Idea */}
                {idea && (
                  <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 space-y-2">
                    <p className="text-xs font-semibold text-indigo-400">💡 Blog Idea</p>
                    <p className="text-sm font-semibold text-foreground">{idea.headline}</p>
                    <div className="space-y-0.5">
                      {idea.outline?.map((item: string, i: number) => (
                        <p key={i} className="text-xs text-muted-foreground">
                          {i + 1}. {item}
                        </p>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {idea.keywords?.slice(0, 5).map((kw: string) => (
                        <span key={kw} className="text-[10px] bg-indigo-500/10 text-indigo-400 rounded-full px-2 py-0.5">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleGenerateIdea(sa)}
                    disabled={generating === sa.id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    {generating === sa.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Lightbulb className="h-3.5 w-3.5" />
                    )}
                    Generate Blog Idea
                  </button>
                  <a
                    href={`/write?articleId=${article.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border hover:border-indigo-500/40 hover:bg-indigo-500/5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Write Blog Post
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
