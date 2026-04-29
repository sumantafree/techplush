"use client";

import { useState } from "react";
import {
  FileText, Loader2, Copy, Download, RefreshCw,
  ChevronDown, Sparkles, Check,
} from "lucide-react";
import type { Article, BlogPost } from "@/types";
import { exportMarkdown, cn } from "@/lib/utils";

interface BlogWriterClientProps {
  initialArticle: Article | null;
}

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "seo-heavy", label: "SEO-Heavy" },
  { value: "storytelling", label: "Storytelling" },
];

const LENGTH_OPTIONS = [
  { value: "short", label: "Short (800-1200 words)" },
  { value: "long", label: "Long (1500-2000 words)" },
];

export function BlogWriterClient({ initialArticle }: BlogWriterClientProps) {
  const [article] = useState<Article | null>(initialArticle);
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("long");
  const [audience, setAudience] = useState("tech bloggers and content creators");
  const [loading, setLoading] = useState(false);
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!article) return;
    setLoading(true);
    setError(null);
    setBlog(null);

    try {
      const res = await fetch("/api/write-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article, tone, length, audience }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setBlog(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!blog) return;
    await navigator.clipboard.writeText(blog.content.replace(/<[^>]+>/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleExport() {
    if (!blog) return;
    const md = `# ${blog.title}\n\n${blog.content.replace(/<[^>]+>/g, "")}\n\n## FAQ\n${blog.faq
      .map((f) => `**Q: ${f.question}**\nA: ${f.answer}`)
      .join("\n\n")}`;
    exportMarkdown(md, blog.title);
  }

  if (!article) {
    return (
      <div className="text-center py-20 space-y-3">
        <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto" />
        <h2 className="text-lg font-semibold text-foreground">AI Blog Writer</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Open an article from your Library and click <strong>Write Blog Post</strong> to generate
          a full SEO-optimized blog post in seconds.
        </p>
        <a
          href="/library"
          className="inline-flex items-center gap-1.5 mt-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-medium transition-colors"
        >
          Go to Library
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-indigo-400" />
          AI Blog Writer
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate a full SEO-optimized blog post from your saved article.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
          Source Article
        </p>
        <p className="font-semibold text-foreground">{article.title}</p>
        <p className="text-xs text-muted-foreground">{article.source} · {article.category}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Tone</label>
          <div className="relative">
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors pr-8"
            >
              {TONE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Length</label>
          <div className="relative">
            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors pr-8"
            >
              {LENGTH_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Target Audience</label>
          <input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
            placeholder="e.g. tech bloggers"
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className={cn(
          "w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold",
          "transition-all duration-200",
          loading
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating your blog post…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Blog Post
          </>
        )}
      </button>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {blog && (
        <div className="space-y-4 animate-fade-in">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-lg font-bold text-foreground">{blog.title}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border hover:bg-accent px-3 py-1.5 text-xs transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleExport}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border hover:bg-accent px-3 py-1.5 text-xs transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export .md
                </button>
                <button
                  onClick={handleGenerate}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border hover:bg-accent px-3 py-1.5 text-xs transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  SEO Meta Title
                </p>
                <p className="text-sm text-foreground">{blog.meta_title}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Meta Description
                </p>
                <p className="text-sm text-foreground">{blog.meta_description}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Keywords
              </p>
              <div className="flex flex-wrap gap-1.5">
                {blog.keywords?.map((kw) => (
                  <span
                    key={kw}
                    className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-2.5 py-0.5"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div
              className="prose-blog"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          {blog.faq?.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <h3 className="font-semibold text-foreground">Frequently Asked Questions</h3>
              <div className="space-y-3">
                {blog.faq.map((item, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Q: {item.question}</p>
                    <p className="text-sm text-muted-foreground">A: {item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
