// Проверка lib/news/auto.json перед публикацией: node scripts/check-news.mjs
// Ловит ошибки формата, повторы, выдуманные/битые ссылки, запрещённые слова.
import fs from "node:fs";

const FILE = new URL("../lib/news/auto.json", import.meta.url);
const list = JSON.parse(fs.readFileSync(FILE, "utf8"));
const errors = [];
const slugs = new Set();
const urls = new Map();
const BANNED = /(лучш(ий|ие|ая)\s+мастер|провер(енные|ены)\s+(мастера|специалисты|документы)|whatsapp|ватсап)/i;
const BLOCK_KEYS = ["h2", "p", "list", "tip", "cta", "link", "map", "img", "event", "spot"];
const LICENSE = /^(CC BY(-SA)? [0-9.]+|CC0|Public domain|Общественное достояние)/i;
const CITY_IDS = ["batumi", "tbilisi", "kutaisi", "rustavi", "kobuleti", "zugdidi", "poti", "gori", "telavi", "borjomi"];
const today = new Date(Date.now() + 4 * 3600_000).toISOString().slice(0, 10); // дата по Тбилиси

if (!Array.isArray(list)) errors.push("auto.json должен быть массивом");
// Все существующие статьи — чтобы проверить ссылки [текст](/ru/guide/slug)
const libDir = new URL("../lib/", import.meta.url);
const knownSlugs = new Set(list.map((n) => n?.slug));
for (const f of fs.readdirSync(libDir)) if (/^articles.*\.ts$/.test(f)) for (const m of fs.readFileSync(new URL(f, libDir), "utf8").matchAll(/slug: "([a-z0-9-]+)"/g)) knownSlugs.add(m[1]);
const PAGES = /^\/ru(\/(request|phones|places|realty|guide|orders|join)?(\?[\w=&-]*)?)?$|^\/ru\/services\/[a-z]+$|^\/ru\/guide\?[\w=&-]+$/;
for (const [i, n] of list.entries()) {
  const at = `#${i} «${n?.slug}»`;
  if (!n || typeof n !== "object") { errors.push(`${at}: не объект`); continue; }
  for (const k of ["slug", "date", "rubric", "title", "description", "lead"]) if (!n[k] || typeof n[k] !== "string") errors.push(`${at}: нет поля ${k}`);
  if (n.slug && !/^[a-z0-9-]{8,90}$/.test(n.slug)) errors.push(`${at}: slug только латиница, цифры и дефис`);
  if (slugs.has(n.slug)) errors.push(`${at}: повтор slug`);
  slugs.add(n.slug);
  if (n.date && (!/^\d{4}-\d{2}-\d{2}$/.test(n.date) || n.date > today)) errors.push(`${at}: неверная дата ${n.date}`);
  if (!["news", "events", "travel", "life", "picks", "home", "family", "health", "pros"].includes(n.rubric)) errors.push(`${at}: rubric должен быть news, events, travel, life, picks, home, family, health или pros`);
  if (n.title && n.title.length > 110) errors.push(`${at}: заголовок длиннее 110 знаков`);
  if (n.description && (n.description.length < 60 || n.description.length > 200)) errors.push(`${at}: description 60–200 знаков`);
  if (!Array.isArray(n.body) || n.body.length < 3) errors.push(`${at}: body — минимум 3 блока`);
  for (const b of n.body ?? []) if (!b || !BLOCK_KEYS.some((k) => k in b)) errors.push(`${at}: неизвестный блок ${JSON.stringify(b).slice(0, 60)}`);
  if (!Array.isArray(n.sources) || !n.sources.length) errors.push(`${at}: нужен хотя бы один источник`);
  for (const s of n.sources ?? []) {
    if (!s?.name || !/^https:\/\/[^\s]+$/.test(s?.url ?? "")) errors.push(`${at}: источник должен быть с name и https-ссылкой`);
    if (urls.has(s.url) && urls.get(s.url) !== n.slug && n.rubric === "news") errors.push(`${at}: эта ссылка уже использована в «${urls.get(s.url)}» — похоже на повтор новости`);
    urls.set(s.url, n.slug);
  }
  for (const b of n.body ?? []) for (const t of [b.p, b.tip, ...(b.list ?? [])].filter((x) => typeof x === "string"))
    for (const m of t.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
      const u = m[2];
      const g = /^\/ru\/guide\/([a-z0-9-]+)$/.exec(u);
      if (g ? !knownSlugs.has(g[1]) : !(PAGES.test(u) || /^https:\/\//.test(u))) errors.push(`${at}: ссылка «${m[1]}» ведёт на несуществующую страницу ${u}`);
    }
  const text = JSON.stringify(n);
  if (BANNED.test(text)) errors.push(`${at}: запрещённые слова (лучшие мастера / проверенные / WhatsApp)`);
  const words = [n.lead, ...(n.body ?? []).map((b) => b.p || b.h2 || b.tip || (b.list || []).join(" ") || (b.event ? [b.event.title, b.event.what, b.event.venue, b.event.note].join(" ") : b.spot ? [b.spot.name, b.spot.what, b.spot.address].join(" ") : "")), ...(n.faq ?? []).map((f) => `${f.q} ${f.a}`)].join(" ").split(/\s+/).length;
  const minWords = n.rubric === "travel" || n.kind === "guide" ? 1200 : n.rubric === "life" ? 350 : n.rubric === "picks" ? 250 : 120;
  if (words < minWords) errors.push(`${at}: слишком коротко (${words} слов, нужно от ${minWords})`);
  for (const b of n.body ?? []) {
    if ("map" in b) {
      if (!Array.isArray(b.map) || b.map.length < 1) errors.push(`${at}: пустая карта`);
      for (const pt of b.map ?? []) if (!pt?.name || !(pt.lat > 41 && pt.lat < 43.7 && pt.lng > 39.9 && pt.lng < 46.8)) errors.push(`${at}: точка карты «${pt?.name}» вне Грузии или без координат`);
    }
    if ("img" in b) {
      if (!/^https:\/\/upload\.wikimedia\.org\//.test(b.img)) errors.push(`${at}: фото только с upload.wikimedia.org`);
      if (!b.alt || !b.credit || !LICENSE.test(b.license || "") || !/^https:\/\/commons\.wikimedia\.org\//.test(b.source || "")) errors.push(`${at}: у фото нужны alt, автор (credit), лицензия CC BY/CC BY-SA/CC0/Public domain и ссылка на страницу файла на commons.wikimedia.org`);
    }
  }
  if (n.rubric === "events") {
    const evs = (n.body ?? []).filter((b) => "event" in b).map((b) => b.event);
    if (evs.length < 4) errors.push(`${at}: в афише нужно минимум 4 блока event (сейчас ${evs.length})`);
    for (const e of evs) {
      const nm = `«${e?.title}»`;
      if (!e?.title || !e?.when || !e?.venue || !e?.address) errors.push(`${at}: у события ${nm} нужны title, when, venue и address`);
      if (!e?.buy && !e?.info) errors.push(`${at}: у события ${nm} нужна ссылка buy (где купить) или info (страница события)`);
      for (const u of [e?.buy, e?.info]) if (u && !/^https:\/\/\S+$/.test(u)) errors.push(`${at}: у события ${nm} ссылка должна начинаться с https://`);
    }
  }
  if (n.rubric === "picks") {
    const sp = (n.body ?? []).filter((b) => "spot" in b).map((b) => b.spot);
    if (sp.length < 5) errors.push(`${at}: в подборке нужно минимум 5 блоков spot (сейчас ${sp.length})`);
    for (const e of sp) {
      const nm = `«${e?.name}»`;
      if (!e?.name || !e?.what || !e?.address) errors.push(`${at}: у места ${nm} нужны name, what и address`);
      if (!/^https:\/\/\S+$/.test(e?.src ?? "")) errors.push(`${at}: у места ${nm} нужна ссылка src на источник (https://)`);
      for (const u of [e?.site, e?.ig]) if (u && !/^https:\/\/\S+$/.test(u)) errors.push(`${at}: у места ${nm} ссылки должны начинаться с https://`);
      if (e?.lat != null && !(e.lat > 41 && e.lat < 43.7 && e.lng > 39.9 && e.lng < 46.8)) errors.push(`${at}: у места ${nm} координаты вне Грузии`);
    }
  }
  if (n.kind === "guide") {
    if (!Array.isArray(n.faq) || n.faq.length < 5) errors.push(`${at}: в гайде «Жизнь в Грузии» нужно минимум 5 вопросов в faq`);
    if ((n.sources ?? []).length < 3) errors.push(`${at}: в гайде нужно минимум 3 источника`);
    if (!(n.body ?? []).some((b) => "h2" in b)) errors.push(`${at}: в гайде нужны подзаголовки h2`);
    if (["home", "family", "health", "pros"].includes(n.rubric) && !(n.body ?? []).some((b) => "cta" in b)) errors.push(`${at}: в SEO-статье нужна ссылка cta в каталог`);
  }
  if (n.rubric === "travel") {
    if (!(n.body ?? []).some((b) => "map" in b && b.map.length >= 3)) errors.push(`${at}: в статье «Куда поехать» нужна карта минимум с 3 точками`);
    if (!Array.isArray(n.faq) || n.faq.length < 4) errors.push(`${at}: в статье «Куда поехать» нужно минимум 4 вопроса в faq`);
  }
  for (const f of n.faq ?? []) if (!f?.q || !f?.a) errors.push(`${at}: в faq нужны q и a`);
  // Новые заметки (с 25.10.2026): фото с Commons по запросу и место
  if (n.date >= "2026-10-25") {
    if (!n.photo || typeof n.photo.q !== "string" || n.photo.q.trim().length < 4 || /[а-яё]/i.test(n.photo.q))
      errors.push(`${at}: нужен "photo": { "q": "…" } — что искать на Wikimedia Commons, по-английски (место, здание, предмет)`);
    if (n.city && !CITY_IDS.includes(n.city)) errors.push(`${at}: city «${n.city}» — не из списка городов сайта; для другого города пишите "place": "Местиа"`);
  }
}
if (errors.length) {
  console.error("❌ Ошибки в lib/news/auto.json:\n" + errors.map((e) => " - " + e).join("\n"));
  process.exit(1);
}
// Сводка за сегодня: сколько новостей по городам (упор — на Тбилиси)
const todays = list.filter((n) => n.date === today && n.rubric === "news");
if (todays.length) {
  const by = {};
  for (const n of todays) { const k = n.city || n.place || "Вся Грузия"; by[k] = (by[k] || 0) + 1; }
  console.log("Сегодня новостей: " + todays.length + " — " + Object.entries(by).map(([k, v]) => `${k}: ${v}`).join(", "));
}
console.log(`✅ auto.json в порядке: ${list.length} заметок`);
