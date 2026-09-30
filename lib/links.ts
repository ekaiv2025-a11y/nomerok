/** Ссылки специалиста: соцсети, Telegram-канал, сайт. Храним готовые адреса https://… */

export const LINK_KINDS = ["instagram", "facebook", "tiktok", "youtube", "tg_channel", "website"] as const;
export type LinkKind = (typeof LINK_KINDS)[number];
export type MasterLinks = Partial<Record<LinkKind, string>>;

const HOSTS: Record<Exclude<LinkKind, "website">, { re: RegExp; make: (h: string) => string }> = {
  instagram: { re: /(?:instagram\.com|instagr\.am)\/([A-Za-z0-9._]+)/i, make: (h) => `https://instagram.com/${h}` },
  facebook: { re: /(?:facebook\.com|fb\.com|fb\.me)\/([A-Za-z0-9.\-/?=_]+)/i, make: (h) => `https://facebook.com/${h}` },
  tiktok: { re: /tiktok\.com\/@?([A-Za-z0-9._]+)/i, make: (h) => `https://www.tiktok.com/@${h}` },
  youtube: { re: /(?:youtube\.com|youtu\.be)\/(.+)/i, make: (h) => `https://youtube.com/${h.startsWith("@") || h.includes("/") ? h : "@" + h}` },
  tg_channel: { re: /(?:t\.me|telegram\.me)\/([A-Za-z0-9_+]+)/i, make: (h) => `https://t.me/${h}` },
};

/** Превращает то, что ввёл человек (@name, name, ссылку), в нормальную ссылку. Пусто/мусор — null. */
export function normalizeLink(kind: LinkKind, raw: unknown): string | null {
  const v = String(raw ?? "").trim().slice(0, 200);
  if (!v) return null;
  if (kind === "website") {
    const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`;
    try {
      const u = new URL(withProto);
      if (!/\.[a-z]{2,}$/i.test(u.hostname)) return null;
      return u.toString().replace(/\/$/, "");
    } catch {
      return null;
    }
  }
  const h = HOSTS[kind];
  const m = v.match(h.re);
  if (m) return h.make(m[1].replace(/\/+$/, ""));
  if (/^https?:\/\//i.test(v)) return null; // ссылка не на ту соцсеть
  const handle = v.replace(/^@/, "");
  if (kind === "youtube" ? !/^[A-Za-z0-9._-]{2,}$/.test(handle) : !/^[A-Za-z0-9._]{2,}$/.test(handle)) return null;
  return h.make(handle);
}

export function normalizeLinks(input: unknown): MasterLinks {
  const out: MasterLinks = {};
  if (!input || typeof input !== "object") return out;
  for (const k of LINK_KINDS) {
    const n = normalizeLink(k, (input as Record<string, unknown>)[k]);
    if (n) out[k] = n;
  }
  return out;
}

/** Короткая подпись для кнопки: @name или домен сайта. */
const OPEN = { ru: "Открыть профиль", en: "Open profile", ka: "პროფილის გახსნა" } as const;

export function linkLabel(kind: LinkKind, url: string, lang: keyof typeof OPEN = "ru"): string {
  try {
    const u = new URL(url);
    if (kind === "website") return u.hostname.replace(/^www\./, "");
    const path = u.pathname.replace(/^\/+|\/+$/g, "");
    const first = path.split("/")[0];
    // Служебные адреса (facebook.com/share/…, profile.php?id=…, youtube.com/channel/…) — имени в них нет
    if (!first || /^(share|profile\.php|people|pages|p|groups|channel|c|watch|user)$/i.test(first)) return OPEN[lang];
    return path.startsWith("@") ? first : "@" + first;
  } catch {
    return url;
  }
}
