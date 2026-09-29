import { normalizeLink, type LinkKind, type MasterLinks } from "./links";

/*
 * Находит в тексте анкеты ссылки на соцсети/Telegram/сайт, чтобы перенести их в поле «Соцсети и сайт».
 * Возвращает найденные ссылки и текст без них (пустые строки-«подписи» вроде «Мой канал:» убираем).
 */

const URL_RE = /(?:https?:\/\/)?(?:www\.)?(?:t\.me|telegram\.me|instagram\.com|instagr\.am|facebook\.com|fb\.com|fb\.me|tiktok\.com|youtube\.com|youtu\.be)\/[^\s,;)<>«»"]+|https?:\/\/[^\s,;)<>«»"]+/gi;

const LABEL_ONLY = /^[\s\p{P}\p{S}]*(?:(?:мой|моя|мои|наш|my|our|подписывайтесь( на)?|смотрите|ссылка|link|telegram|телеграм|телеграмм|тг|tg|канал|channel|instagram|инстаграм|инстаграмм|инста|inst|insta|facebook|фейсбук|tiktok|тикток|youtube|ютуб|сайт|site|website|портфолио|portfolio|работы|здесь|тут)[\s\p{P}\p{S}]*)*$/iu;

function kindOf(url: string): LinkKind {
  if (/t\.me|telegram\.me/i.test(url)) return "tg_channel";
  if (/instagram\.com|instagr\.am/i.test(url)) return "instagram";
  if (/facebook\.com|fb\.com|fb\.me/i.test(url)) return "facebook";
  if (/tiktok\.com/i.test(url)) return "tiktok";
  if (/youtube\.com|youtu\.be/i.test(url)) return "youtube";
  return "website";
}

export type Extracted = { links: MasterLinks; text: string; changed: boolean; found: boolean };

/**
 * Идём по строкам. Ссылки из строки добавляем в «Соцсети и сайт».
 * Строку удаляем, только если в ней кроме ссылки ничего нет (или подпись вроде «Мой канал:»),
 * а ссылки внутри обычного предложения оставляем в тексте как есть — чтобы не испортить фразу.
 * personal — Telegram-ник самого специалиста: это контакт, а не канал, в ссылки его не добавляем.
 */
export function extractLinks(text: string, personal: string | null): Extracted {
  const links: MasterLinks = {};
  let found = false;
  const lines = text.split("\n").filter((line) => {
    const urls = line.match(URL_RE) ?? [];
    if (!urls.length) return true;
    let recognized = 0;
    for (const raw of urls) {
      const kind = kindOf(raw);
      const norm = normalizeLink(kind, raw.replace(/[.!?]+$/, ""));
      if (!norm) continue;
      recognized++;
      found = true;
      if (kind === "tg_channel" && personal && norm.split("/").pop()!.toLowerCase() === personal.toLowerCase()) continue;
      if (!links[kind]) links[kind] = norm;
    }
    if (recognized !== urls.length) return true;
    const rest = line.replace(URL_RE, "");
    return !(rest.trim() === "" || LABEL_ONLY.test(rest));
  });
  const cleaned = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return { links, text: cleaned, changed: cleaned !== text.trim(), found };
}

/**
 * При сохранении анкеты: достаёт ссылки на соцсети из текстов (услуги / о себе / образование)
 * и возвращает их вместе с заполненными полями «Соцсети и сайт» (заполненное вручную важнее).
 * Тексты в `d` чистит на месте; пустое поле после чистки не оставляем — тогда текст не трогаем.
 */
export function pullLinks(
  d: { services: string; about: string; credentials: string },
  personal: string | null,
  links: MasterLinks,
): MasterLinks {
  const found: MasterLinks = {};
  for (const f of ["services", "about", "credentials"] as const) {
    const r = extractLinks(d[f] ?? "", personal);
    if (!r.found) continue;
    Object.assign(found, Object.fromEntries(Object.entries(r.links).filter(([k]) => !(k in found))));
    if (r.changed && (r.text.trim() || f !== "services")) d[f] = r.text;
  }
  return { ...found, ...links };
}
