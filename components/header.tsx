"use client";

import { useSession, signOut } from "next-auth/react";
import { Search, RefreshCw, LogIn, LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onSearchOpen?: () => void;
  lastUpdated?: string | null;
}

export function Header({ onSearchOpen, lastUpdated }: HeaderProps) {
  const { data: session } = useSession();
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await fetch("/api/refresh");
      window.location.reload();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6">
      {/* Search trigger */}
      <button
        onClick={onSearchOpen}
        className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors max-w-sm"
      >
        <Search className="h-3.5 w-3.5 flex-shrink-0" />
        <span>Search articles…</span>
        <kbd className="ml-auto hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium opacity-60">
          ⌘K
        </kbd>
      </button>

      <div className="flex items-center gap-2 ml-auto">
        {/* Last updated */}
        {lastUpdated && (
          <span className="hidden md:block text-xs text-muted-foreground">
            Updated {new Date(lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-lg",
            "text-muted-foreground hover:text-foreground hover:bg-accent",
            "transition-colors duration-200",
            refreshing && "animate-spin text-indigo-500"
          )}
          title="Refresh Now"
        >
          <RefreshCw className="h-4 w-4" />
        </button>

        <ThemeToggle />

        {/* Auth */}
        {session ? (
          <div className="flex items-center gap-2">
            <div className="relative group">
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "User"}
                  width={32}
                  height={32}
                  className="rounded-full cursor-pointer ring-2 ring-transparent group-hover:ring-indigo-500 transition-all"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center cursor-pointer">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
              <div className="absolute right-0 top-10 hidden group-hover:block w-48 rounded-xl border border-border bg-card shadow-xl py-1 z-50">
                <p className="px-3 py-2 text-xs text-muted-foreground truncate">
                  {session.user?.email}
                </p>
                <Link
                  href="/library"
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  My Library
                </Link>
                <hr className="my-1 border-border" />
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
