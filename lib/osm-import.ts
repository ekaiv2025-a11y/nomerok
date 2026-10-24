import "server-only";
import { CITIES, cityLabel } from "./cities";
import { normalizePhone } from "./phone";
import { transliterate } from "./slug";
import type { Place } from "./places";

/*
 * Полезные контакты городов из OpenStreetMap (свободная лицензия ODbL — указываем «© OpenStreetMap contributors»).
 * Запрос делает сервер сайта к Overpass API. Группы: медицина, госуслуги и нотариусы, образование.
 * Дубли с уже загруженными местами (рядом и с похожим названием) не создаём — дополняем существующую карточку.
 */
export const OSM_GROUPS = {
  health: { label: "🏥 Клиники, больницы, стоматологии, аптеки, лаборатории" },
  public: { label: "🏛 Дом юстиции, мэрия, нотариусы, полиция, суды, почта, посольства" },
  education: { label: "🎓 Школы, детские сады, колледжи и университеты" },
} as const;
export type OsmGroup = keyof typeof OSM_GROUPS;

const RADIUS: Record<string, number> = { tbilisi: 14000, batumi: 8000, kutaisi: 7000, rustavi: 6000 };
const API = process.env.OVERPASS_API || "https://overpass-api.de/api/interpreter";
const MIRROR = "https://overpass.kumi.systems/api/interpreter";

const FILTERS: Record<OsmGroup, string[]> = {
  health: ['["amenity"~"^(hospital|clinic|doctors|dentist|pharmacy)$"]', '["healthcare"~"^(laboratory|hospital|clinic|centre|dentist)$"]'],
  public: ['["office"="notary"]', '["amenity"~"^(townhall|police|courthouse|post_office|embassy)$"]', '["office"~"^(government|diplomatic)$"]'],
  education: ['["amenity"~"^(kindergarten|school|college|university)$"]'],
};

export function overpassQuery(city: string, groups: OsmGroup[]): string {
  const c = CITIES.find((x) => x.id === city);
  if (!c) throw new Error("Неизвестный город");
  const around = `(around:${RADIUS[city] ?? 4500},${c.center[0]},${c.center[1]})`;
  const parts = groups.flatMap((g) => FILTERS[g]).map((f) => `  nwr${f}["name"]${around};`);
  return `[out:json][timeout:120];\n(\n${parts.join("\n")}\n);\nout center tags;`;
}

type El = { type: "node" | "way" | "relation"; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };

const JUSTICE = /public service hall|იუსტიციის სახლი|дом юстиции|community center|თემის ცენტრ/i;

/** Раздел и вид места по тегам OSM. null — не наш случай. */
export function classify(t: Record<string, string>): { cat: string; sub: string } | null {
  const a = t.amenity ?? "";
  const h = t.healthcare ?? "";
  const o = t.office ?? "";
  if (a === "hospital" || h === "hospital") return { cat: "health", sub: "Больница" };
  if (a === "dentist" || h === "dentist") return { cat: "health", sub: "Стоматология" };
  if (a === "pharmacy") return { cat: "health", sub: "Аптека" };
  if (h === "laboratory") return { cat: "health", sub: "Диагностика и лаборатория" };
  if (a === "clinic" || a === "doctors" || h === "clinic" || h === "centre") return { cat: "health", sub: "Клиника" };
  if (o === "notary") return { cat: "public", sub: "Нотариус" };
  if (JUSTICE.test(`${t.name ?? ""} ${t["name:en"] ?? ""} ${t["name:ru"] ?? ""}`)) return { cat: "public", sub: "Дом юстиции" };
  if (a === "townhall") return { cat: "public", sub: "Мэрия и администрация" };
  if (a === "police") return { cat: "public", sub: "Полиция" };
  if (a === "courthouse") return { cat: "public", sub: "Суд" };
  if (a === "post_office") return { cat: "public", sub: "Почта" };
  if (a === "embassy" || o === "diplomatic") return { cat: "public", sub: "Посольство и консульство" };
  if (o === "government") return { cat: "public", sub: "Госучреждение" };
  if (a === "kindergarten") return { cat: "education", sub: "Детский сад" };
  if (a === "school") return { cat: "education", sub: "Школа" };
  if (a === "college" || a === "university") return { cat: "education", sub: "Колледж, университет" };
  return null;
}

const split = (v?: string) => (v ?? "").split(/[;,]/).map((x) => x.trim()).filter(Boolean);
const url = (v?: string) => (v ? (/^https?:\/\//i.test(v) ? v : `https://${v}`) : null);

export type OsmRow = Partial<Place> & { id: string; slug: string; name: string; cat: string };

/** Ответ Overpass → строки для importPlaces. */
export function osmToRows(json: unknown, city: string): OsmRow[] {
  const els = ((json as { elements?: El[] })?.elements ?? []) as El[];
  const out: OsmRow[] = [];
  const seen = new Set<string>();
  for (const el of els) {
    const t = el.tags ?? {};
    const k = classify(t);
    const name = (t["name:ru"] || t.name || t["name:en"] || "").trim();
    if (!k || !name) continue;
    const lat = el.lat ?? el.center?.lat ?? null;
    const lng = el.lon ?? el.center?.lon ?? null;
    const id = `OSM-${el.type[0]}${el.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const phones = [...new Set([...split(t.phone), ...split(t["contact:phone"]), ...split(t.mobile), ...split(t["contact:mobile"])].map((p) => normalizePhone(p)).filter((p): p is string => !!p))].slice(0, 4);
    const street = t["addr:street"] ? `${t["addr:street"]}${t["addr:housenumber"] ? ` ${t["addr:housenumber"]}` : ""}` : null;
    const ig = url(t["contact:instagram"]);
    const fb = url(t["contact:facebook"] || t.facebook);
    const base = transliterate(t["name:en"] || name).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "place";
    out.push({
      id,
      slug: `${base}-${city}-${String(el.id).slice(-5)}`,
      name,
      name_en: t["name:en"] && t["name:en"] !== name ? t["name:en"] : null,
      name_ka: t["name:ka"] || (/[Ⴀ-ჿ]/.test(t.name ?? "") ? t.name : null) || null,
      cat: k.cat,
      sub: k.sub,
      addr: street,
      lat,
      lng,
      phones,
      site: url(t.website || t["contact:website"]),
      ig,
      socials: fb ? [fb] : [],
      email: t.email || t["contact:email"] || null,
      hours: t.opening_hours || null,
      src: "OSM",
      area: city,
      city,
    });
  }
  return out;
}

const norm = (s?: string | null) =>
  transliterate(String(s ?? ""))
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(the|ltd|llc|clinic|klinika|hospital|apteka|pharmacy|aptiaki|notary|notarius|shps|gmbh)\b/g, " ")
    .trim();
const dist = (a: [number, number], b: [number, number]) => {
  const dy = (a[0] - b[0]) * 111_000;
  const dx = (a[1] - b[1]) * 111_000 * Math.cos((a[0] * Math.PI) / 180);
  return Math.hypot(dx, dy);
};

/** Карточка уже есть (рядом, похожее название)? Тогда новые данные пишем в неё, а не создаём дубль. */
export function matchExisting(row: OsmRow, existing: Pick<Place, "id" | "slug" | "name" | "name_en" | "name_ka" | "lat" | "lng">[]): string | null {
  if (row.lat == null || row.lng == null) return null;
  const names = [row.name, row.name_en, row.name_ka].map(norm).filter((x) => x.length >= 3);
  for (const p of existing) {
    if (p.lat == null || p.lng == null) continue;
    const d = dist([row.lat, row.lng], [p.lat, p.lng]);
    if (d > 120) continue;
    const other = [p.name, p.name_en, p.name_ka].map(norm).filter((x) => x.length >= 3);
    const similar = names.some((a) => other.some((b) => a === b || a.includes(b) || b.includes(a)));
    if (similar) return p.id;
  }
  return null;
}

/** Запрос к Overpass (основной адрес, при ошибке — зеркало). */
export async function fetchOverpass(city: string, groups: OsmGroup[]): Promise<unknown> {
  const body = new URLSearchParams({ data: overpassQuery(city, groups) });
  let last = "";
  for (const api of [API, MIRROR]) {
    try {
      const r = await fetch(api, {
        method: "POST",
        body,
        headers: { "User-Agent": "NomerOk.ge/1.0 (https://nomerok.ge/ru/contacts)", "Content-Type": "application/x-www-form-urlencoded" },
        signal: AbortSignal.timeout(110_000),
        cache: "no-store",
      });
      if (r.ok) return await r.json();
      last = `${r.status}`;
    } catch (e) {
      last = e instanceof Error ? e.message : "сеть";
    }
  }
  throw new Error(`OpenStreetMap не ответил (${last}) для «${cityLabel(city, "ru")}» — попробуйте ещё раз через минуту`);
}
