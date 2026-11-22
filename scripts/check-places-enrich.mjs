// Проверка data/places-enrich.json перед коммитом: node scripts/check-places-enrich.mjs
import { readFileSync } from "node:fs";
const HEAD_OLD = "id,work_status,name_ru,addr_ru,phones,site,instagram,facebook,other_links,hours,desc_ru,desc_en,tags,sources,checked";
const HEAD = HEAD_OLD + ",email,menu,delivery,photos,photo_source";
const d = JSON.parse(readFileSync(new URL("../data/places-enrich.json", import.meta.url), "utf8"));
const errs = [];
const ids = new Set();
for (const b of d.batches ?? []) {
  if (!/^\d{4}-\d{2}-\d{2}-\d{2}$/.test(b.id ?? "")) errs.push(`пачка без правильного id (ГГГГ-ММ-ДД-ЧЧ): ${b.id}`);
  if (ids.has(b.id)) errs.push(`повтор id пачки ${b.id}`);
  ids.add(b.id);
  const lines = (b.csv ?? "").split("\n");
  const head = lines[0].replace(/^﻿/, "").trim();
  if (head !== HEAD && head !== HEAD_OLD) errs.push(`${b.id}: первая строка CSV должна быть ровно: ${HEAD}`);
  if (/wa\.me|whatsapp/i.test(b.csv)) errs.push(`${b.id}: ссылки на WhatsApp не берём — убери`);
  for (const m of b.csv.matchAll(/https:\/\/[^\s,;"|]+\|([^\s,;"]+)/g)) {
    if (!["снаружи", "интерьер", "терраса", "вид", "блюда", "меню"].includes(m[1])) errs.push(`${b.id}: подпись фото «${m[1]}» — можно только: снаружи, интерьер, терраса, вид, блюда, меню`);
  }
  if (/(maps\.googleapis|googleusercontent|lh\d\.google|tripadvisor|yandex\.net\/get-altay|2gis)/i.test(b.csv)) errs.push(`${b.id}: фото с Google/Яндекс-карт, TripAdvisor и 2ГИС брать нельзя — там снимки посетителей`);
  if (lines.length < 2) errs.push(`${b.id}: нет строк`);
  const bad = /(лучш|ведущ|гаранти|№ ?1|самый)/i;
  if (bad.test(b.csv)) errs.push(`${b.id}: рекламные слова («лучший», «ведущий», «гарантия»…) — убери`);
}
if (errs.length) {
  console.error("❌ " + errs.join("\n❌ "));
  process.exit(1);
}
console.log(`✅ data/places-enrich.json в порядке: пачек ${d.batches.length}`);
