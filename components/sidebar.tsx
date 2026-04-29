"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap, Brain, Megaphone, Share2, FlaskConical,
  HeartHandshake, BookMarked, LayoutDashboard,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tech Updates", href: "/category/tech-updates", icon: Zap },
  { label: "Artificial Intelligence", href: "/category/artificial-intelligence", icon: Brain },
  { label: "Digital Marketing", href: "/category/digital-marketing", icon: Megaphone },
  { label: "Social Media", href: "/category/social-media", icon: Share2 },
  { label: "Research & Papers", href: "/category/research-papers", icon: FlaskConical },
  { label: "Tech & Human Life", href: "/category/tech-human-life", icon: HeartHandshake },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen border-r border-border bg-card",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
        <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Zap className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight text-foreground">
            TechPulse
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                "transition-all duration-150 group",
                active
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "flex-shrink-0 h-4 w-4 transition-transform duration-150",
                  active ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Library Link */}
      <div className="px-2 pb-3 border-t border-border pt-3">
        <Link
          href="/library"
          title={collapsed ? "My Library" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
            "transition-all duration-150 group",
            pathname === "/library"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <BookMarked className="flex-shrink-0 h-4 w-4" />
          {!collapsed && <span>My Library</span>}
        </Link>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -right-3 top-[72px] h-6 w-6 rounded-full",
          "bg-background border border-border shadow-sm",
          "flex items-center justify-center",
          "hover:bg-accent transition-colors duration-150 z-10"
        )}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </aside>
  );
}
