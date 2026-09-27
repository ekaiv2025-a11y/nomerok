export const LOCALES = ["ru", "ka", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ru";
export const LANG_COOKIE = "nm_lang";

export const LOCALE_NAMES: Record<Locale, string> = { ru: "Русский", ka: "ქართული", en: "English" };
export const LOCALE_SHORT: Record<Locale, string> = { ru: "RU", ka: "KA", en: "EN" };
export const OG_LOCALE: Record<Locale, string> = { ru: "ru_RU", ka: "ka_GE", en: "en_US" };

export function isLocale(x: unknown): x is Locale {
  return typeof x === "string" && (LOCALES as readonly string[]).includes(x);
}

/** Ссылка внутри сайта с языком: href("ka", "/join") → "/ka/join" */
export function href(lang: Locale, path = "/"): string {
  const p = path.startsWith("/") ? path : "/" + path;
  return p === "/" ? `/${lang}` : `/${lang}${p}`;
}

/** Меняет язык в текущем пути: /ru/master/x → /en/master/x */
export function switchLocalePath(pathname: string, to: Locale): string {
  const parts = pathname.split("/");
  if (isLocale(parts[1])) parts[1] = to;
  else parts.splice(1, 0, to);
  return parts.join("/") || `/${to}`;
}

/** Выбор языка по заголовку браузера Accept-Language. */
export function pickLocale(acceptLanguage: string | null): Locale {
  const langs = (acceptLanguage ?? "")
    .split(",")
    .map((p) => p.split(";")[0].trim().toLowerCase().slice(0, 2));
  for (const l of langs) {
    if (l === "ka") return "ka";
    if (["ru", "uk", "be", "kk", "hy", "az"].includes(l)) return "ru";
    if (l === "en") return "en";
  }
  return langs.length && langs[0] && langs[0] !== "" ? "en" : DEFAULT_LOCALE;
}
