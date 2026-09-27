import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, LOCALES, OG_LOCALE, type Locale } from "./config";

export type LangParams = { params: Promise<{ lang: string }> };

/** Достаёт язык из адреса страницы; если язык неизвестен — 404. */
export async function langOf(params: Promise<{ lang: string }>): Promise<Locale> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return lang;
}

/** Мета-теги с адресами этой же страницы на других языках (для Google). */
export function pageMeta(lang: Locale, path: string, title?: string, description?: string): Metadata {
  const p = path === "/" ? "" : path;
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l] = `/${l}${p}`;
  languages["x-default"] = `/ru${p}`;
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: { canonical: `/${lang}${p}`, languages },
    openGraph: { ...(title ? { title } : {}), ...(description ? { description } : {}), locale: OG_LOCALE[lang], url: `/${lang}${p}`, type: "website" },
  };
}
