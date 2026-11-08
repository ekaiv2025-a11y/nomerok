import "server-only";
import { supabase } from "./db";
import { CITIES, cityLabel, isCity } from "./cities";

/*
 * Координаты по адресу (OpenStreetMap Nominatim, не чаще 1 запроса в секунду) — для анкет из открытых реестров,
 * чтобы они были на карте. Проверяем, что найден тот же город и район, иначе не ставим.
 */
const ALIAS: Record<string, string[]> = {
  "Старый Тбилиси": ["Сололаки", "Старый", "Кала", "Абанотубани", "Ортачала", "Метехи"],
  Сандзона: ["Санзона", "Надзаладеви"],
  Вере: ["Вера", "Ваке", "Мтацминда"],
  Варкетили: ["Варкетили", "Самгори"],
  Темка: ["Темка", "Глдани", "Надзаладеви"],
  Мухиани: ["Мухиани", "Глдани"],
  Вазисубани: ["Вазисубани", "Исани", "Самгори"],
  Дигоми: ["Дигоми", "Дидубе", "Сабуртало"],
  "Диди Дигоми": ["Дигоми", "Дидубе", "Сабуртало"],
  "Квемо Чугурети": ["Чугурети"],
  "Земо Чугурети": ["Чугурети"],
  Авлабари: ["Авлабари", "Исани"],
  Исани: ["Исани", "Авлабари"],
};
const STREET = /^(ул\.|пр\.|пр-т|просп|пл\.|пер\.|наб\.|шоссе|туп\.|улица|проспект)/i;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function nominatim(q: string) {
  const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ge&accept-language=ru&q=${encodeURIComponent(q)}`, {
    headers: { "User-Agent": "NomerOk.ge catalog (geocoding of public registry addresses)" },
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  await sleep(1100);
  if (!r?.ok) return null;
  const j = (await r.json().catch(() => [])) as { lat: string; lon: string; display_name: string }[];
  return j[0] ?? null;
}

export async function geocodeAddress(addressRu: string, city: string): Promise<{ lat: number; lng: number } | null> {
  if (!isCity(city)) return null;
  const cityRu = cityLabel(city, "ru");
  const parts = addressRu.split(",").map((s) => s.trim());
  const i = parts.findIndex((p) => STREET.test(p));
  if (i < 0) return null; // без улицы (микрорайон, «у метро») — точку не ставим
  const street = parts[i].replace(/^пр\. /, "проспект ").replace(/^ул\. /, "улица ");
  const num = (parts[i + 1] ?? "").match(/^\d+[а-яa-z]?/i)?.[0];
  const district = parts[1] && parts[1] !== parts[i] && !/^\d/.test(parts[1]) ? parts[1] : null;
  const c = CITIES.find((x) => x.id === city)!.center;
  const near = (lat: number, lng: number) => Math.hypot((lat - c[0]) * 111, (lng - c[1]) * 83) <= (city === "tbilisi" ? 15 : 8);
  const ok = (disp: string, lat: number, lng: number) => {
    if (!disp.includes(cityRu) || !near(lat, lng)) return false;
    if (!district) return true;
    const keys = ALIAS[district] ?? [district];
    return keys.some((k) => disp.includes(k.slice(0, Math.max(4, k.length - 2))));
  };
  for (const q of [num ? `${street} ${num}, ${cityRu}` : null, `${street}, ${cityRu}`]) {
    if (!q) continue;
    const r = await nominatim(q);
    if (r && ok(r.display_name, +r.lat, +r.lon)) return { lat: +(+r.lat).toFixed(6), lng: +(+r.lon).toFixed(6) };
  }
  return null;
}

/** Ежедневно: до n анкет из реестров без координат. Неудачные помечаем в заметке, чтобы не повторять. */
export async function geocodeImported(n = 40): Promise<{ done: number; failed: number }> {
  const out = { done: 0, failed: 0 };
  const sb = supabase();
  if (!sb) return out;
  const r = await sb
    .from("masters")
    .select("id, place_address, city, admin_note")
    .not("imported_at", "is", null)
    .is("place_lat", null)
    .neq("place_address", "")
    .limit(200);
  const list = ((r.data ?? []) as { id: string; place_address: string; city: string; admin_note: string | null }[]).filter((m) => !(m.admin_note ?? "").includes("Геокод: нет"));
  for (const m of list.slice(0, n)) {
    const g = await geocodeAddress(m.place_address, m.city).catch(() => null);
    if (g) {
      await sb.from("masters").update({ place_lat: g.lat, place_lng: g.lng }).eq("id", m.id);
      out.done++;
    } else {
      await sb.from("masters").update({ admin_note: `${m.admin_note ?? ""}\nГеокод: нет`.trim() }).eq("id", m.id);
      out.failed++;
    }
  }
  return out;
}
