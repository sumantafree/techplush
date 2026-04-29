"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  ExternalLink, Bookmark, BookmarkCheck, Clock,
  Lightbulb, Loader2, Tag,
} from "lucide-react";
import Image from "next/image";
import type { Article, BlogIdea } from "@/types";
import { formatDate, cn } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  "Tech Updates": "bg-blue-500/15 text-blue-400 border-blue-500/20",
  "Artificial Intelligence": "bg-violet-500/15 text-violet-400 border-violet-500/20",
  "Digital Marketing": "bg-orange-500/15 text-orange-400 border-orange-500/20",
  "Social Media": "bg-pink-500/15 text-pink-400 border-pink-500/20",
  "Research & Papers": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  "Tech & Human Life": "bg-teal-500/15 text-teal-400 border-teal-500/20",
};

interface ArticleCardProps {
  article: Article;
  isSaved?: boolean;
  onSaved?: (id: string) => void;
}

export function ArticleCard({ article, isSaved: initialSaved = false, onSaved }: ArticleCardProps) {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);
  const [idea, setIdea] = useState<BlogIdea | null>(null);
  const [generatingIdea, setGeneratingIdea] = useState(false);
  const [showIdea, setShowIdea] = useState(false);

  const categoryColor = CATEGORY_COLORS[article.category] ?? "bg-gray-500/15 text-gray-400 border-gray-500/20";

  async function handleSave() {
    if (!session) {
      window.location.href = "/login";
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article_id: article.id }),
      });
      const data = await res.json();
      if (data.upgrade) {
        alert("Upgrade to Pro for unlimited saves!");
        return;
      }
      if (res.ok) {
        setSaved(true);
        onSaved?.(article.id);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateIdea() {
    if (!session) { window.location.href = "/login"; return; }
    setGeneratingIdea(true);
    try {
      const res = await fetch("/api/blog-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article }),
      });
      const data = await res.json();
      setIdea(data);
      setShowIdea(true);
    } finally {
      setGeneratingIdea(false);
    }
  }

  return (
    <article className={cn(
      "group relative flex flex-col rounded-2xl border border-border bg-card",
      "hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5",
      "transition-all duration-300 overflow-hidden"
    )}>
      {/* Image */}
      {article.image && (
        <div className="relative h-40 w-full overflow-hidden bg-muted">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
        </div>
      )}

      <div className="flex flex-col flex-1 p-5 space-y-3">
        {/* Category + Meta */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            categoryColor
          )}>
            {article.category}
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
            <Clock className="h-3 w-3" />
            {article.read_time} min read
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-indigo-400 transition-colors">
          {article.title}
        </h3>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
            {article.excerpt}
          </p>
        )}

        {/* Source + Date */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/70">{article.source}</span>
          <span>·</span>
          <span>{formatDate(article.published_at)}</span>
        </div>

        {/* Blog Idea Result */}
        {showIdea && idea && (
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3 space-y-2">
            <p className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
              <Lightbulb className="h-3 w-3" /> Blog Idea
            </p>
            <p className="text-sm font-medium text-foreground">{idea.headline}</p>
            <div className="flex flex-wrap gap-1">
              {idea.keywords?.slice(0, 4).map((kw) => (
                <span key={kw} className="inline-flex items-center gap-0.5 text-[10px] bg-muted rounded-full px-2 py-0.5 text-muted-foreground">
                  <Tag className="h-2.5 w-2.5" />{kw}
                </span>
              ))}
            </div>
            <button
              onClick={() => setShowIdea(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2",
              "bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium",
              "transition-colors duration-150"
            )}
          >
            <ExternalLink className="h-3 w-3" />
            Read Article
          </a>

          <button
            onClick={handleSave}
            disabled={saving || saved}
            title={saved ? "Saved!" : "Save for Blog"}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors duration-150",
              saved
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                : "border-border hover:border-indigo-500/40 hover:bg-indigo-500/10 text-muted-foreground hover:text-indigo-400"
            )}
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : saved ? (
              <BookmarkCheck className="h-3.5 w-3.5" />
            ) : (
              <Bookmark className="h-3.5 w-3.5" />
            )}
          </button>

          <button
            onClick={handleGenerateIdea}
            disabled={generatingIdea}
            title="Generate Blog Idea"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors duration-150",
              "border-border hover:border-amber-500/40 hover:bg-amber-500/10 text-muted-foreground hover:text-amber-400"
            )}
          >
            {generatingIdea ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Lightbulb className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
