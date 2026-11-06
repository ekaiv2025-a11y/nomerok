import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";

/*
 * Поиск места (клиники) для задач по расписанию: /api/place-find?site=medcenter.ge, ?q=Medcenter,
 * или список клиник с сайтом: ?cat=health&city=batumi&withSite=1. Только то, что и так показано на сайте.
 */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const q = (u.searchParams.get("q") ?? "").trim().slice(0, 60);
  const site = (u.searchParams.get("site") ?? "").replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").slice(0, 60);
  const cat = u.searchParams.get("cat");
  const city = u.searchParams.get("city");
  const withSite = u.searchParams.get("withSite") === "1";
  const sb = supabase();
  if (!sb) return NextResponse.json({ items: [] });
  let r = sb.from("places").select("id,slug,name,name_en,name_ka,cat,sub,city,addr,addr_ru,phones,site").eq("status", "published").limit(50);
  if (site) r = r.ilike("site", `%${site}%`);
  if (q) r = r.or(`name.ilike.%${q.replace(/[,()%]/g, " ")}%,name_en.ilike.%${q.replace(/[,()%]/g, " ")}%`);
  if (cat) r = r.eq("cat", cat);
  if (city) r = r.eq("city", city);
  if (withSite) r = r.not("site", "is", null);
  const res = await r;
  return NextResponse.json({ items: res.data ?? [] }, { headers: { "Cache-Control": "public, max-age=600, s-maxage=1800" } });
}
