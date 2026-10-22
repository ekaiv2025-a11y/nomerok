// Проверка lib/news/auto.json перед публикацией: node scripts/check-news.mjs
// Ловит ошибки формата, повторы, выдуманные/битые ссылки, запрещённые слова.
import fs from "node:fs";

const FILE = new URL("../lib/news/auto.json", import.meta.url);
const list = JSON.parse(fs.readFileSync(FILE, "utf8"));
const errors = [];
const slugs = new Set();
const urls = new Map();
const BANNED = /(лучш(ий|ие|ая)\s+мастер|провер(енные|ены)\s+(мастера|специалисты|документы)|whatsapp|ватсап)/i;
const BLOCK_KEYS = ["h2", "p", "list", "tip", "cta", "link", "map", "img", "event"];
const LICENSE = /^(CC BY(-SA)? [0-9.]+|CC0|Public domain|Общественное достояние)/i;
const today = new Date(Date.now() + 4 * 3600_000).toISOString().slice(0, 10); // дата по Тбилиси

if (!Array.isArray(list)) errors.push("auto.json должен быть массивом");
for (const [i, n] of list.entries()) {
  const at = `#${i} «${n?.slug}»`;
  if (!n || typeof n !== "object") { errors.push(`${at}: не объект`); continue; }
  for (const k of ["slug", "date", "rubric", "title", "description", "lead"]) if (!n[k] || typeof n[k] !== "string") errors.push(`${at}: нет поля ${k}`);
  if (n.slug && !/^[a-z0-9-]{8,90}$/.test(n.slug)) errors.push(`${at}: slug только латиница, цифры и дефис`);
  if (slugs.has(n.slug)) errors.push(`${at}: повтор slug`);
  slugs.add(n.slug);
  if (n.date && (!/^\d{4}-\d{2}-\d{2}$/.test(n.date) || n.date > today)) errors.push(`${at}: неверная дата ${n.date}`);
  if (!["news", "events", "travel"].includes(n.rubric)) errors.push(`${at}: rubric должен быть news, events или travel`);
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
  const text = JSON.stringify(n);
  if (BANNED.test(text)) errors.push(`${at}: запрещённые слова (лучшие мастера / проверенные / WhatsApp)`);
  const words = [n.lead, ...(n.body ?? []).map((b) => b.p || b.h2 || b.tip || (b.list || []).join(" ") || (b.event ? [b.event.title, b.event.what, b.event.venue, b.event.note].join(" ") : "")), ...(n.faq ?? []).map((f) => `${f.q} ${f.a}`)].join(" ").split(/\s+/).length;
  const minWords = n.rubric === "travel" ? 1200 : 120;
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
  if (n.rubric === "travel") {
    if (!(n.body ?? []).some((b) => "map" in b && b.map.length >= 3)) errors.push(`${at}: в статье «Куда поехать» нужна карта минимум с 3 точками`);
    if (!Array.isArray(n.faq) || n.faq.length < 4) errors.push(`${at}: в статье «Куда поехать» нужно минимум 4 вопроса в faq`);
  }
  for (const f of n.faq ?? []) if (!f?.q || !f?.a) errors.push(`${at}: в faq нужны q и a`);
}
if (errors.length) {
  console.error("❌ Ошибки в lib/news/auto.json:\n" + errors.map((e) => " - " + e).join("\n"));
  process.exit(1);
}
console.log(`✅ auto.json в порядке: ${list.length} заметок`);
