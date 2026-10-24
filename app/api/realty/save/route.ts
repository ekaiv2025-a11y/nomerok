import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { currentRealtor } from "@/lib/realty-auth";
import { createListing, getListing, updateListing } from "@/lib/realty-db";
import { AMENITIES, BUILDINGS, CONDITIONS, DEALS, HEATINGS, KINDS, MAX_PHOTOS, PARKINGS, autoTitle, listingQuality, rankAt, type Listing } from "@/lib/realty";
import { CITY_IDS } from "@/lib/cities";

const num = (v: unknown, max: number) => {
  const n = Number(String(v ?? "").replace(/[\s,]/g, ""));
  return Number.isFinite(n) && n > 0 && n <= max ? n : null;
};
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "") || null;
const int = (v: unknown, min: number, max: number) => {
  if (v === "" || v == null) return null;
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};
const pick = <T extends string>(v: unknown, dict: Record<T, unknown>): T | null => (typeof v === "string" && v in dict ? (v as T) : null);
const coord = (v: unknown, min: number, max: number) => {
  const n = Number(v);
  return v != null && v !== "" && Number.isFinite(n) && n > min && n < max ? Math.round(n * 1e6) / 1e6 : null;
};

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
    floor_n: int(b.floor_n, -2, 120),
    floors_total: int(b.floors_total, 1, 120),
    rooms_total: int(b.rooms_total, 1, 50),
    bathrooms: int(b.bathrooms, 0, 20),
    building: pick(b.building, BUILDINGS),
    condition: pick(b.condition, CONDITIONS),
    heating: pick(b.heating, HEATINGS),
    parking: pick(b.parking, PARKINGS),
    amenities: (Array.isArray(b.amenities) ? b.amenities : []).filter((a: unknown): a is string => typeof a === "string" && a in AMENITIES).slice(0, 30),
    deposit: deal === "rent" ? num(b.deposit, 10_000_000) : null,
    min_months: deal === "rent" ? int(b.min_months, 1, 60) : null,
    video: typeof b.video === "string" && /^https:\/\/(www\.)?(youtube\.com|youtu\.be|instagram\.com|tiktok\.com|vimeo\.com)\//.test(b.video.trim()) ? b.video.trim().slice(0, 300) : null,
    lat: coord(b.lat, 41, 43.7),
    lng: coord(b.lng, 39.9, 46.8),
  };
  // этаж текстом — для старых экранов и Telegram
  if (data.floor_n != null) data.floor = data.floors_total ? `${data.floor_n}/${data.floors_total}` : String(data.floor_n);
  const quality = listingQuality(data).percent;
  const title = str(b.title, 120) ?? autoTitle(data, "ru");
  const status: Listing["status"] = b.publish === false ? "draft" : "published";
  if (status === "published" && !photos.length) return NextResponse.json({ ok: false, error: "Добавьте хотя бы одно фото" }, { status: 422 });
  if (b.id) {
    const l = await getListing(String(b.id));
    if (!l || l.master_id !== m.id) return NextResponse.json({ ok: false }, { status: 404 });
    // порядок в списке: момент публикации (или прошлый) + бонус за заполненность
    const base = l.status !== "published" && status === "published" ? new Date().toISOString() : l.created_at;
    await updateListing(l.id, { ...data, title, quality, rank_at: rankAt(base, quality), ...(l.status !== status || status === "draft" ? { status } : {}) });
    revalidatePath("/[lang]/realty", "page");
    return NextResponse.json({ ok: true, id: l.id });
  }
  const l = await createListing({ ...data, title, quality, rank_at: rankAt(new Date().toISOString(), quality), master_id: m.id, status, source: "site", tg_key: null, tg_link: null });
  revalidatePath("/[lang]/realty", "page");
  return NextResponse.json({ ok: true, id: l.id });
}
