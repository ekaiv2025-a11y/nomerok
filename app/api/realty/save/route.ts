import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { currentRealtor } from "@/lib/realty-auth";
import { createListing, getListing, updateListing } from "@/lib/realty-db";
import { DEALS, KINDS, MAX_PHOTOS, autoTitle, type Listing } from "@/lib/realty";
import { CITY_IDS } from "@/lib/cities";

const num = (v: unknown, max: number) => {
  const n = Number(String(v ?? "").replace(/[\s,]/g, ""));
  return Number.isFinite(n) && n > 0 && n <= max ? n : null;
};
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "") || null;

/** Создать или изменить объявление из кабинета риелтора. */
export async function POST(req: Request) {
  const m = await currentRealtor();
  if (!m) return NextResponse.json({ ok: false, error: "Войдите в кабинет риелтора" }, { status: 401 });
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ ok: false }, { status: 400 });
  const photos = (Array.isArray(b.photos) ? b.photos : []).filter((u: unknown): u is string => typeof u === "string" && (u.startsWith("https://") || u.startsWith("data:image/"))).slice(0, MAX_PHOTOS);
  const deal = (b.deal in DEALS ? b.deal : "rent") as Listing["deal"];
  const kind = (b.kind in KINDS ? b.kind : "apartment") as Listing["kind"];
  const rooms = b.rooms === "" || b.rooms == null ? null : Math.max(0, Math.min(20, Math.round(Number(b.rooms)) || 0));
  const data = {
    deal,
    kind,
    rooms,
    area: num(b.area, 100000),
    floor: str(b.floor, 20),
    price: num(b.price, 100_000_000),
    currency: (["USD", "GEL", "EUR"].includes(b.currency) ? b.currency : "USD") as Listing["currency"],
    city: (CITY_IDS as readonly string[]).includes(b.city) ? b.city : m.city ?? "batumi",
    district: str(b.district, 60),
    address: str(b.address, 200),
    description: str(b.description, 4000),
    photos,
  };
  const title = str(b.title, 120) ?? autoTitle(data, "ru");
  const status: Listing["status"] = b.publish === false ? "draft" : "published";
  if (status === "published" && !photos.length) return NextResponse.json({ ok: false, error: "Добавьте хотя бы одно фото" }, { status: 422 });
  if (b.id) {
    const l = await getListing(String(b.id));
    if (!l || l.master_id !== m.id) return NextResponse.json({ ok: false }, { status: 404 });
    await updateListing(l.id, { ...data, title, ...(l.status !== status || status === "draft" ? { status } : {}) });
    revalidatePath("/[lang]/realty", "page");
    return NextResponse.json({ ok: true, id: l.id });
  }
  const l = await createListing({ ...data, title, master_id: m.id, lat: null, lng: null, status, source: "site", tg_key: null, tg_link: null });
  revalidatePath("/[lang]/realty", "page");
  return NextResponse.json({ ok: true, id: l.id });
}
