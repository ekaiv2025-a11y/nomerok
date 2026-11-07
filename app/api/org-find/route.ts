import { NextResponse } from "next/server";
import { listPlaces } from "@/lib/places-db";

/** Поиск организации по названию или адресу — для кабинета организации (без входа). */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const q = (u.searchParams.get("q") ?? "").trim().slice(0, 60);
  if (q.length < 2) return NextResponse.json({ items: [] });
  const city = u.searchParams.get("city") || undefined;
  const r = await listPlaces({ q, city }).catch(() => ({ items: [] }));
  const items = r.items.slice(0, 10).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    name_en: p.name_en ?? null,
    name_ka: p.name_ka ?? null,
    cat: p.cat,
    city: p.city ?? "batumi",
    addr: p.addr_ru || p.addr || null,
    verified: !!p.owner_verified_at,
  }));
  return NextResponse.json({ items }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
}
