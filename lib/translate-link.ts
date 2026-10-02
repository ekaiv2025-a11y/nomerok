import type { Locale } from "./i18n/config";

/* «Перевести описание»: открываем Google Переводчик с текстом анкеты на языке сайта. */
export function textLang(text: string): "ru" | "ka" | "en" | null {
  const cyr = (text.match(/[а-яё]/gi) ?? []).length;
  const geo = (text.match(/[Ⴀ-ჿ]/g) ?? []).length;
  const lat = (text.match(/[a-z]/gi) ?? []).length;
  const max = Math.max(cyr, geo, lat);
  if (max < 10) return null;
  return max === cyr ? "ru" : max === geo ? "ka" : "en";
}

export function translateUrl(text: string, to: Locale): string {
  return `https://translate.google.com/?sl=auto&tl=${to}&op=translate&text=${encodeURIComponent(text.slice(0, 1800))}`;
}

export const TRANSLATE_TEXT: Record<Locale, string> = {
  ru: "🌐 Перевести описание на русский",
  en: "🌐 Translate the description into English",
  ka: "🌐 აღწერის თარგმნა ქართულად",
};
