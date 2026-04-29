import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { DashboardShell } from "@/components/dashboard-shell";
import { LibraryClient } from "@/components/library-client";
import { redirect } from "next/navigation";
import type { SavedArticle } from "@/types";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!user) redirect("/login");

  const { data } = await supabaseAdmin
    .from("saved_articles")
    .select("*, article:articles(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <DashboardShell>
      <LibraryClient savedArticles={(data ?? []) as SavedArticle[]} />
    </DashboardShell>
  );
}
