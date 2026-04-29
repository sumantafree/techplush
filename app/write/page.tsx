import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { DashboardShell } from "@/components/dashboard-shell";
import { BlogWriterClient } from "@/components/blog-writer-client";
import { redirect } from "next/navigation";
import type { Article } from "@/types";

export const dynamic = "force-dynamic";

export default async function WritePage({
  searchParams,
}: {
  searchParams: { articleId?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  let article: Article | null = null;
  if (searchParams.articleId) {
    const { data } = await supabaseAdmin
      .from("articles")
      .select("*")
      .eq("id", searchParams.articleId)
      .single();
    article = data as Article;
  }

  return (
    <DashboardShell>
      <BlogWriterClient initialArticle={article} />
    </DashboardShell>
  );
}
