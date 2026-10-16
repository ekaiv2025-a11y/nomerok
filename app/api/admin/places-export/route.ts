import { isAdmin } from "@/lib/admin-auth";
import { dbMode, readLocal, supabase } from "@/lib/db";
import { toCsv } from "@/lib/places-enrich";
import type { Place } from "@/lib/places";

/** Выгрузка пачки ещё не проверенных мест (CSV): /api/admin/places-export?cat=food&from=1&n=25 (only=all — все) */
export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Нет доступа", { status: 403 });
  const u = new URL(req.url);
  const cat = u.searchParams.get("cat") || "";
  const from = Math.max(0, (Number(u.searchParams.get("from")) || 1) - 1); // в форме — с 1
  const n = Math.min(500, Math.max(1, Number(u.searchParams.get("n")) || 25));
  const onlyNoDesc = u.searchParams.get("only") !== "all";
  let items: Place[] = [];
  const sb = supabase();
  if (sb) {
    let q = sb.from("places").select("*");
    if (cat) q = q.eq("cat", cat);
    if (onlyNoDesc) q = q.is("desc_ru", null).is("checked", null);
    const r = await q.order("id").range(from, from + n - 1);
    items = (r.data as Place[]) ?? [];
  } else if (dbMode() !== "none") {
    items = ((await readLocal()).places ?? [])
      .filter((p) => (!cat || p.cat === cat) && (!onlyNoDesc || (!p.desc_ru && !p.checked)))
      .sort((a, b) => a.id.localeCompare(b.id))
      .slice(from, from + n);
  }
  const rows = [
    ["id", "name", "name_en", "name_ka", "type", "address", "lat", "lng", "phones", "site", "instagram", "other_links", "hours", "on_site"],
    ...items.map((p) => [p.id, p.name, p.name_en, p.name_ka, p.sub, p.addr, p.lat, p.lng, (p.phones ?? []).join("; "), p.site, p.ig, (p.socials ?? []).join(" "), p.hours, p.status === "published" ? "да" : "скрыто"]),
  ];
  return new Response(toCsv(rows), {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="nomerok-places-${cat || "all"}-${from + 1}-${from + items.length}.csv"` },
  });
}
