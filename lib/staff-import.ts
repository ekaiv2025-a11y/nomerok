import "server-only";
import { supabase, newToken, uploadPhoto } from "./db";
import { makeSlug } from "./slug";
import { normalizePhone } from "./phone";
import { getPlace } from "./places-db";
import { addMember } from "./org-db";
import { CATEGORIES } from "./categories";
import { notifyAdmin } from "./telegram";
import { randomBytes } from "crypto";
import { transliterate } from "./slug";
import STAFF from "@/data/staff-import.json";

/*
 * Анкеты специалистов по открытым данным (решение владельца, 06.11.2026: наполняем сайт сами).
 * Задача по расписанию (scripts/staff-bot.md) собирает персонал с сайта клиники и коммитит пачку в data/staff-import.json.
 * Ежедневный cron создаёт анкеты: контакт — телефон клиники, анкета в команде клиники (org_members, via = import),
 * источник — ссылка на страницу врача на сайте клиники. Повтор по source_url не создаётся.
 */

export type StaffItem = {
  name: string;
  category: string;
  extra_categories?: string[];
  title?: string; // должность как на сайте: «Кардиолог, эхокардиолог»
  services?: string;
  about?: string;
  credentials?: string;
  experience_years?: number | null;
  languages?: string[];
  photo?: string | null;
  source_url: string;
  place_id?: string; // филиал, если отличается от клиники пачки
};
/** Клиника, которой ещё нет в «Местах»: создаём её карточку по данным с её сайта. */
export type ClinicInput = { name: string; site: string; phones: string[]; addr_ru: string; sub?: string; hours?: string; desc_ru?: string; lat?: number; lng?: number; city?: string };
export type StaffBatch = { id: string; place_id?: string; clinic?: ClinicInput; staff: StaffItem[] };

const PER_RUN = 30; // не больше за один запуск cron (время работы функции)
const CAT_IDS = new Set<string>(CATEGORIES.map((c) => c.id));

async function onceDone(key: string): Promise<boolean> {
  const sb = supabase();
  if (!sb) return true;
  const r = await sb.from("_nm_once").select("key").eq("key", key).maybeSingle();
  return !!r.data || !!r.error;
}

export async function applyStaffImport(): Promise<{ created: number; skipped: number; batches: number }> {
  const out = { created: 0, skipped: 0, batches: 0 };
  const sb = supabase();
  if (!sb) return out;
  let budget = PER_RUN;
  for (const b of (STAFF as { batches: StaffBatch[] }).batches ?? []) {
    if (budget <= 0) break;
    const key = `staff:${b.id}`;
    if (await onceDone(key)) continue;
    const created: string[] = [];
    let left = 0;
    const placeId = b.place_id || (b.clinic ? await ensureClinic(b.clinic).catch(() => null) : null);
    if (!placeId) continue;
    for (const s of b.staff ?? []) {
      if (!s?.name || !s.source_url) continue;
      const exists = await sb.from("masters").select("id").eq("source_url", s.source_url).maybeSingle();
      if (exists.error) return out; // миграция 0048 ещё не выполнена — попробуем завтра
      if (exists.data) {
        out.skipped++;
        continue;
      }
      if (budget <= 0) {
        left++;
        continue;
      }
      const place = await getPlace(s.place_id || placeId).catch(() => null);
      const phone = place?.phones?.map((p) => normalizePhone(p)).find(Boolean);
      if (!place || !phone) {
        out.skipped++;
        continue;
      }
      const category = CAT_IDS.has(s.category) ? s.category : "doctor";
      const services = [s.title, s.services].filter(Boolean).join("\n").slice(0, 2000);
      const row = {
        name: s.name.slice(0, 80),
        slug: makeSlug(s.name, category),
        category,
        extra_categories: (s.extra_categories ?? []).filter((c) => CAT_IDS.has(c) && c !== category).slice(0, 3),
        services,
        about: (s.about ?? "").slice(0, 3000),
        credentials: (s.credentials ?? "").slice(0, 2000),
        experience_years: s.experience_years ?? null,
        languages: s.languages ?? [],
        price_from: null,
        price_unit: "",
        phone,
        telegram: null,
        whatsapp: false,
        photo_url: null,
        status: "published",
        consent_at: null,
        lang: "ru",
        admin_note: `Составлено редакцией по сайту клиники «${place.name}»: ${s.source_url}`,
        tg_link_token: newToken(),
        city: place.city ?? "batumi",
        work_mode: "at_place",
        place_address: place.addr_ru || place.addr || "",
        place_lat: place.lat ?? null,
        place_lng: place.lng ?? null,
        work_hours: place.hours ?? "",
        links: place.site ? { site: place.site } : {},
        source_url: s.source_url,
        imported_at: new Date().toISOString(),
      };
      const ins = await sb.from("masters").insert(row).select("id").single();
      if (ins.error || !ins.data) {
        out.skipped++;
        continue;
      }
      const id = ins.data.id as string;
      await addMember(place.id, id, "active", "import").catch(() => null);
      if (s.photo && /^https:\/\//.test(s.photo)) {
        try {
          const r = await fetch(s.photo, { signal: AbortSignal.timeout(8000) });
          const type = r.headers.get("content-type") ?? "";
          if (r.ok && type.startsWith("image/")) {
            const url = await uploadPhoto(id, await r.blob(), type.split("/")[1]?.replace("jpeg", "jpg") || "jpg");
            await sb.from("masters").update({ photo_url: url }).eq("id", id);
          }
        } catch {}
      }
      created.push(s.name);
      out.created++;
      budget--;
    }
    if (!left) {
      await sb.from("_nm_once").insert({ key });
      out.batches++;
    }
    if (created.length) await notifyAdmin(`🏥 Добавлены анкеты по сайту клиники (${created.length}): ${created.slice(0, 15).join(", ")}${created.length > 15 ? "…" : ""}${left ? `\nОстальные (${left}) — завтра.` : ""}`).catch(() => null);
  }
  return out;
}

/** Находит клинику по сайту или создаёт её карточку в «Местах» (данные с сайта клиники). */
async function ensureClinic(c: ClinicInput): Promise<string | null> {
  const sb = supabase();
  if (!sb || !c?.name || !c.site) return null;
  const domain = c.site.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
  const found = await sb.from("places").select("id").ilike("site", `%${domain}%`).eq("status", "published").limit(1);
  if (found.data?.[0]) return found.data[0].id as string;
  const id = "ORG-" + randomBytes(5).toString("hex").toUpperCase();
  const base = transliterate(c.name).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "clinic";
  const now = new Date().toISOString();
  const city = c.city ?? "batumi";
  const r = await sb.from("places").insert({
    id,
    slug: `${base}-${id.slice(4, 8).toLowerCase()}`,
    name: c.name.slice(0, 120),
    cat: "health",
    sub: c.sub ?? "Клиника",
    addr: c.addr_ru || null,
    addr_ru: c.addr_ru || null,
    phones: (c.phones ?? []).map((p) => normalizePhone(p)).filter(Boolean),
    site: c.site,
    hours: c.hours || null,
    desc_ru: c.desc_ru || null,
    lat: c.lat ?? null,
    lng: c.lng ?? null,
    city,
    area: city,
    status: "published",
    src: "import",
    edited: true,
    created_at: now,
    updated_at: now,
  });
  if (r.error) return null;
  await notifyAdmin(`🏥 Добавлена клиника в «Места» по её сайту: ${c.name} — ${c.site}`).catch(() => null);
  return id;
}
