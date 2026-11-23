/* Кабинет застройщика: типы и общие функции (и для сервера, и для браузера). */
import type { ImageKind, Project, ProjectStatus } from "./projects";

export type DevPhoto = { url: string; kind: ImageKind; caption?: string };
export type DevProgress = { date: string; text: string; photos: string[] };
export type DevModStatus = "draft" | "pending" | "published" | "hidden";

export type DevProject = {
  id: string;
  slug: string;
  linked_slug: string | null;
  owner_chat_id: number | null;
  master_id: string | null;
  name: string;
  developer: string;
  city: string;
  district: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  status: ProjectStatus;
  completion: string | null;
  floors: string | null;
  description: string | null;
  amenities: string[];
  payment: string[];
  photos: DevPhoto[];
  progress: DevProgress[];
  contact_name: string | null;
  contact_phone: string | null;
  mod_status: DevModStatus;
  created_at: string;
  updated_at: string;
};

export type UnitStatus = "free" | "reserved" | "sold";
export type DevUnit = {
  id: string;
  project_id: string;
  building: string;
  floor: number | null;
  number: string;
  rooms: number | null;
  area: number | null;
  price: number | null;
  currency: "USD" | "GEL";
  status: UnitStatus;
  plan_url: string | null;
  updated_at: string;
  created_at?: string;
};

export const UNIT_STATUS: Record<UnitStatus, { label: string; cls: string; dot: string }> = {
  free: { label: "Свободна", cls: "bg-brand-soft text-brand-dark", dot: "bg-brand" },
  reserved: { label: "Бронь", cls: "bg-[#fdf3dc] text-[#6b4f12]", dot: "bg-accent" },
  sold: { label: "Продана", cls: "bg-cream text-muted line-through", dot: "bg-[#c9c5bb]" },
};

export const roomsLabel = (r: number | null) => (r == null ? "—" : r === 0 ? "Студия" : `${r} ${r === 1 ? "спальня" : r < 5 ? "спальни" : "спален"}`);

/** «zhk-sea-tower-batumi» из названия и города. */
export function devSlug(name: string, city: string): string {
  const map: Record<string, string> = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ы: "y", э: "e", ю: "yu", я: "ya" };
  const lat = name
    .toLowerCase()
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  return `zhk-${lat || "proekt"}-${city}`;
}

/** Цены «от» по свободным квартирам (для карточки и шапки ЖК). */
export function unitsSummary(units: DevUnit[]) {
  const forSale = units.filter((u) => u.status !== "sold");
  const priced = forSale.filter((u) => u.price && u.price > 0);
  const usd = priced.filter((u) => u.currency === "USD");
  const from = usd.length ? Math.min(...usd.map((u) => u.price!)) : null;
  const perM2s = usd.filter((u) => u.area && u.area > 5).map((u) => u.price! / u.area!);
  const perM2 = perM2s.length ? Math.round(Math.min(...perM2s)) : null;
  const byRooms = new Map<number, { n: number; from: number | null; minArea: number | null; maxArea: number | null }>();
  for (const u of forSale) {
    if (u.rooms == null) continue;
    const x = byRooms.get(u.rooms) ?? { n: 0, from: null, minArea: null, maxArea: null };
    x.n++;
    if (u.price && u.currency === "USD") x.from = x.from == null ? u.price : Math.min(x.from, u.price);
    if (u.area) {
      x.minArea = x.minArea == null ? u.area : Math.min(x.minArea, u.area);
      x.maxArea = x.maxArea == null ? u.area : Math.max(x.maxArea, u.area);
    }
    byRooms.set(u.rooms, x);
  }
  return { total: units.length, free: units.filter((u) => u.status === "free").length, from, perM2, byRooms: [...byRooms.entries()].sort((a, b) => a[0] - b[0]) };
}

/**
 * ЖК застройщика → карточка каталога. Если застройщик дополняет ЖК из каталога (linked_slug),
 * его данные (фото, ход стройки, сроки, условия, цены по квартирам) ложатся поверх нашего описания.
 */
export function devAsProject(d: DevProject, base: Project | null, units: DevUnit[]): Project {
  const sum = unitsSummary(units);
  const today = d.updated_at.slice(0, 10);
  const paras = (d.description ?? "").split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
  const own: Partial<Project> = {
    ...(d.photos.length ? { images: d.photos.map((p) => ({ url: p.url, credit: `застройщик ${d.developer || d.name}`, src: "", kind: p.kind, caption: p.caption })) } : {}),
    ...(d.progress.length ? { progress: d.progress.map((x) => ({ date: x.date, text: x.text })) } : {}),
    ...(d.completion ? { completion: d.completion } : {}),
    ...(d.floors ? { floors: d.floors } : {}),
    ...(d.amenities.length ? { amenities: d.amenities } : {}),
    ...(d.payment.length ? { payment: d.payment } : {}),
    ...(units.length ? { units: units.length } : {}),
    ...(sum.from || sum.perM2 ? { price: { perM2: sum.perM2 ?? undefined, from: sum.from ?? undefined, currency: "USD" as const, date: today, src: "" } } : {}),
    status: d.status,
    updated: today,
  };
  if (base) return { ...base, ...own };
  return {
    slug: d.slug,
    name: d.name,
    city: d.city,
    district: d.district ?? undefined,
    address: d.address ?? undefined,
    coords: d.lat != null && d.lng != null ? [d.lat, d.lng] : undefined,
    developer: d.developer || d.name,
    lead: paras[0]?.slice(0, 400) ?? `Жилой комплекс ${d.name}.`,
    body: paras.slice(1).map((p) => ({ p })) as Project["body"],
    sources: [],
    added: d.created_at.slice(0, 10),
    ...own,
    updated: today,
  } as Project;
}
