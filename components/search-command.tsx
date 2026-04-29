"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, FileText, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Article } from "@/types";
import { cn } from "@/lib/utils";

interface SearchCommandProps {
  open: boolean;
  onClose: () => void;
}

export function SearchCommand({ open, onClose }: SearchCommandProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`);
        const data = await res.json();
        setResults(data.results ?? []);
        setSelectedIndex(0);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      if (e.key === "ArrowUp") setSelectedIndex((i) => Math.max(i - 1, 0));
      if (e.key === "Enter" && results[selectedIndex]) {
        window.open(results[selectedIndex].url, "_blank");
        onClose();
      }
    },
    [open, onClose, results, selectedIndex]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-xl mx-4 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-fade-in">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, topics, sources…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {loading && (
            <div className="h-4 w-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          )}
          <kbd className="hidden sm:inline-flex text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <ul className="py-2 max-h-80 overflow-y-auto">
            {results.map((article, i) => (
              <li key={article.id}>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 text-sm transition-colors",
                    i === selectedIndex ? "bg-accent" : "hover:bg-accent/50"
                  )}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <FileText className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground line-clamp-1">{article.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {article.source} · {article.category}
                    </p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                </a>
              </li>
            ))}
          </ul>
        ) : query.length >= 2 && !loading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No articles found for "{query}"
          </div>
        ) : (
          <div className="px-4 py-4 text-xs text-muted-foreground">
            <p>Quick tips: try "AI", "ChatGPT", "marketing", "research"…</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border bg-muted/30 text-[10px] text-muted-foreground">
          <span><kbd className="font-mono">↑↓</kbd> Navigate</span>
          <span><kbd className="font-mono">↵</kbd> Open</span>
          <span><kbd className="font-mono">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
