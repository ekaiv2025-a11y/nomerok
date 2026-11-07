import "server-only";
import { supabase, newToken, uploadPhoto } from "./db";
import { makeSlug } from "./slug";
import { normalizePhone } from "./phone";
import { CATEGORIES } from "./categories";
import { isCity } from "./cities";
import { notifyAdmin } from "./telegram";
import DATA from "@/data/registry-import.json";

/*
 * Анкеты по открытым официальным реестрам (решение владельца: наполняем сайт сами).
 * Первый — реестр Нотариальной палаты Грузии (notary.ge): нотариус, адрес бюро, рабочий телефон, часы.
 * Задача (scripts/notary-bot.md) коммитит пачки в data/registry-import.json, ежедневный cron создаёт анкеты.
 * Повтор по source_url не создаётся. Контакт — телефон бюро из реестра.
 */
export type RegistryItem = {
  name: string;
  category: string;
  title?: string;
  services?: string;
  about?: string;
  languages?: string[];
  phones: string[];
  address_ru: string;
  city: string;
  hours?: string;
  /** официальное фото из реестра (полный размер), если есть */
  photo?: string | null;
  source_url: string;
};

/** Скачивает фото из реестра и ставит в анкету. */
async function setPhoto(id: string, url: string): Promise<boolean> {
  const sb = supabase();
  if (!sb || !/^https:\/\//.test(url)) return false;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const type = r.headers.get("content-type") ?? "";
    if (!r.ok || !type.startsWith("image/")) return false;
    const blob = await r.blob();
    if (blob.size < 2000) return false; // заглушка вместо фото
    const photo = await uploadPhoto(id, blob, type.split("/")[1]?.replace("jpeg", "jpg") || "jpg");
    await sb.from("masters").update({ photo_url: photo }).eq("id", id);
    return true;
  } catch {
    return false;
  }
}
type Batch = { id: string; source: string; items: RegistryItem[] };

const PER_RUN = 150;
const CAT_IDS = new Set<string>(CATEGORIES.map((c) => c.id));

export async function applyRegistryImport(): Promise<{ created: number; skipped: number; photos: number }> {
  const out = { created: 0, skipped: 0, photos: 0 };
  const sb = supabase();
  if (!sb) return out;
  let budget = PER_RUN;
  const names: string[] = [];
  let left = 0;
  for (const b of (DATA as { batches: Batch[] }).batches ?? []) {
    for (const s of b.items ?? []) {
      if (!s?.name || !s.source_url || !CAT_IDS.has(s.category)) continue;
      const ex = await sb.from("masters").select("id, photo_url").eq("source_url", s.source_url).maybeSingle();
      if (ex.error) return out;
      if (ex.data) {
        // анкета уже есть — дозаполняем фото, если его не было
        const d = ex.data as { id: string; photo_url: string | null };
        if (s.photo && !d.photo_url && budget > 0 && (await setPhoto(d.id, s.photo))) {
          out.photos++;
          budget--;
        } else out.skipped++;
        continue;
      }
      if (budget <= 0) {
        left++;
        continue;
      }
      // мобильный удобнее для звонка — ставим первым, если есть
      const phones = (s.phones ?? []).map((p) => normalizePhone(p)).filter((p): p is string => !!p);
      const phone = phones.find((p) => /^\+9955/.test(p)) ?? phones[0];
      if (!phone) {
        out.skipped++;
        continue;
      }
      const row = {
        name: s.name.slice(0, 80),
        slug: makeSlug(s.name, s.category),
        category: s.category,
        extra_categories: [],
        services: [s.title, s.services].filter(Boolean).join("\n").slice(0, 2000),
        about: (s.about ?? "").slice(0, 3000),
        credentials: "",
        experience_years: null,
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
        admin_note: `Составлено редакцией по открытому реестру (${b.source}): ${s.source_url}${phones.length > 1 ? `\nДругие телефоны: ${phones.filter((p) => p !== phone).join(", ")}` : ""}`,
        tg_link_token: newToken(),
        city: isCity(s.city) ? s.city : "tbilisi",
        work_mode: "at_place",
        place_address: (s.address_ru ?? "").slice(0, 200),
        place_lat: null,
        place_lng: null,
        work_hours: (s.hours ?? "").slice(0, 200),
        links: {},
        source_url: s.source_url,
        imported_at: new Date().toISOString(),
      };
      const ins = await sb.from("masters").insert(row).select("id").single();
      if (ins.error || !ins.data) {
        out.skipped++;
        continue;
      }
      if (s.photo) await setPhoto(ins.data.id as string, s.photo);
      names.push(s.name);
      out.created++;
      budget--;
    }
  }
  if (out.photos) await notifyAdmin(`🖼 Нотариусам добавлены фото из реестра: ${out.photos}`).catch(() => null);
  if (names.length) await notifyAdmin(`🖋 Добавлены анкеты из открытого реестра (${names.length}): ${names.slice(0, 12).join(", ")}${names.length > 12 ? "…" : ""}${left ? `\nОстальные (${left}) — завтра.` : ""}`).catch(() => null);
  return out;
}

/** Для анкеты из реестра: рабочие телефоны (основной + остальные из заметки). */
export function registryPhones(m: { phone: string; admin_note?: string | null }): string[] {
  const more = /Другие телефоны: ([^\n]+)/.exec(m.admin_note ?? "")?.[1]?.split(",").map((x) => x.trim()).filter(Boolean) ?? [];
  return [m.phone, ...more].slice(0, 3);
}
