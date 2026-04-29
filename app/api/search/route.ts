import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();
  const category = searchParams.get("category");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  let dbQuery = supabaseAdmin
    .from("articles")
    .select("id, title, excerpt, url, source, published_at, category, image, read_time")
    .or(
      `title.ilike.%${query}%,excerpt.ilike.%${query}%,source.ilike.%${query}%`
    )
    .order("published_at", { ascending: false })
    .limit(limit);

  if (category) {
    dbQuery = dbQuery.eq("category", category);
  }

  const { data, error } = await dbQuery;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ results: data ?? [] });
}
