import "server-only";

/*
 * Фото к новостям из Wikimedia Commons — только со свободной лицензией (CC0, CC BY, CC BY-SA, public domain).
 * Ищет сам сайт (сервер Vercel), бот только пишет, что искать: "photo": { "q": "National Bank of Georgia building" }.
 * Результат кешируется на неделю. Автор и лицензия показываются под фото в статье.
 */
export type CommonsPhoto = { url: string; credit: string; license: string; source: string; title: string };

const API = process.env.COMMONS_API || "https://commons.wikimedia.org/w/api.php"; // подмена — только для проверки на своём компьютере
const UA = "NomerOk.ge/1.0 (https://nomerok.ge/ru/contacts) news covers";
const LICENSE_OK = /^(cc0|cc[- ]by(-sa)? \d(\.\d)?|public domain|pd)/i;
const BAD_TITLE = /\b(map|karte|flag|coat of arms|logo|emblem|seal|plan|scheme|diagram|chart|graph|stamp|banknote|signature|icon)\b|\.(svg|png|gif|tif)$/i;

const mem = new Map<string, Promise<CommonsPhoto | null | undefined>>();
// Commons не ответил — 10 минут вообще не обращаемся (иначе каждая страница ждёт таймаут)
let downUntil = 0;

const strip = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

type ImgInfo = {
  thumburl?: string;
  thumbwidth?: number;
  thumbheight?: number;
  width?: number;
  height?: number;
  mime?: string;
  descriptionurl?: string;
  extmetadata?: Record<string, { value?: string }>;
};
type Page = { title: string; index?: number; imageinfo?: ImgInfo[] };

/** Выбрать подходящее фото из ответа Commons (отдельно — чтобы проверить без сети). */
export function pickPhoto(json: unknown): CommonsPhoto | null {
  const pages = Object.values(((json as { query?: { pages?: Record<string, Page> } })?.query?.pages ?? {}) as Record<string, Page>).sort(
    (a, b) => (a.index ?? 99) - (b.index ?? 99),
  );
  for (const p of pages) {
    const ii = p.imageinfo?.[0];
    if (!ii?.thumburl || !ii.descriptionurl) continue;
    if (ii.mime !== "image/jpeg" || BAD_TITLE.test(p.title)) continue;
    const w = ii.width ?? 0;
    const h = ii.height ?? 1;
    if (w < 1000 || w / h < 1.15 || w / h > 2.4) continue; // нужна горизонтальная фотография приличного размера
    const meta = ii.extmetadata ?? {};
    const license = strip(meta.LicenseShortName?.value ?? "");
    if (!LICENSE_OK.test(license)) continue;
    const credit = strip(meta.Artist?.value ?? meta.Credit?.value ?? "").slice(0, 120) || "Wikimedia Commons";
    return { url: ii.thumburl, credit, license, source: ii.descriptionurl, title: p.title.replace(/^File:/, "") };
  }
  return null;
}

/** null — подходящего фото нет; undefined — Commons не ответил (дальше не пробуем, чтобы страница не ждала). */
async function search(q: string): Promise<CommonsPhoto | null | undefined> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrnamespace: "6",
    gsrsearch: `${q} filetype:bitmap`,
    gsrlimit: "15",
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1280",
    iiextmetadatafilter: "Artist|Credit|LicenseShortName",
    origin: "*",
  });
  try {
    const r = await fetch(`${API}?${params}`, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(2500), next: { revalidate: 7 * 86400 } });
    if (!r.ok) {
      downUntil = Date.now() + 10 * 60_000;
      return undefined;
    }
    return pickPhoto(await r.json());
  } catch {
    downUntil = Date.now() + 10 * 60_000;
    return undefined;
  }
}

/** Фото по запросу (английские слова: место, здание, предмет). null — ничего подходящего. */
export function commonsPhoto(q: string | null | undefined): Promise<CommonsPhoto | null | undefined> {
  const key = String(q ?? "").trim().slice(0, 120);
  if (!key) return Promise.resolve(null);
  if (!mem.has(key) && Date.now() < downUntil) return Promise.resolve(undefined);
  if (!mem.has(key)) {
    const p = search(key);
    mem.set(key, p);
    // ошибку сети не запоминаем — в следующий раз попробуем снова
    p.then((v) => v === undefined && mem.delete(key));
  }
  return mem.get(key)!;
}

/** Запасное фото города, если к новости ничего не нашлось. */
export const CITY_PHOTO_QUERY: Record<string, string> = {
  tbilisi: "Tbilisi Old Town panorama",
  batumi: "Batumi skyline boulevard",
  kutaisi: "Kutaisi Rioni river city",
  rustavi: "Rustavi city Georgia",
  kobuleti: "Kobuleti beach Georgia",
  zugdidi: "Zugdidi Dadiani Palace",
  poti: "Poti cathedral Georgia",
  gori: "Gori fortress Georgia",
  telavi: "Telavi Alazani valley",
  borjomi: "Borjomi central park",
  georgia: "Caucasus mountains Kazbegi Georgia",
};
