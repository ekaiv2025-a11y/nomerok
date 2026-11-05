import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { idsInBatches } from "@/lib/places-enrich-auto";

/*
 * Список мест без описания — для задачи «Места: наполнение карточек».
 * Только то, что и так показано на сайте (название, раздел, адрес, телефон, сайт). /api/places-todo?city=batumi&cat=health&n=25
 */
const ORDER = ["health", "public", "education", "finance", "kids", "beauty", "sport", "coworking", "repair", "electronics", "services", "auto", "home", "pets", "food", "groceries", "culture", "tourism", "shops"];

export async function GET(req: Request) {
  const u = new URL(req.url);
  const city = u.searchParams.get("city") || "batumi";
  const only = u.searchParams.get("cat");
  const n = Math.min(40, Math.max(1, Number(u.searchParams.get("n")) || 25));
  const sb = supabase();
  if (!sb) return NextResponse.json({ items: [] });
  const skip = idsInBatches();
  const items: Record<string, unknown>[] = [];
  for (const cat of only ? [only] : ORDER) {
    if (items.length >= n) break;
    const r = await sb
      .from("places")
      .select("id,name,name_en,name_ka,cat,sub,addr,addr_ru,phones,site,ig,city")
      .eq("status", "published")
      .eq("city", city)
      .eq("cat", cat)
      .is("desc_ru", null)
      .is("checked", null)
      .order("site", { ascending: true, nullsFirst: false })
      .limit(n * 2);
    if (r.error) continue;
    for (const p of r.data ?? []) if (!skip.has(p.id as string) && items.length < n) items.push(p);
  }
  return NextResponse.json({ city, items }, { headers: { "Cache-Control": "public, max-age=600, s-maxage=1800" } });
}
