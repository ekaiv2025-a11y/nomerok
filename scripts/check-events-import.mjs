// Проверка data/events-import.json перед коммитом: node scripts/check-events-import.mjs
import { readFileSync } from "node:fs";
const d = JSON.parse(readFileSync(new URL("../data/events-import.json", import.meta.url), "utf8"));
const CITIES = new Set(["batumi", "tbilisi", "kutaisi", "rustavi", "kobuleti", "zugdidi", "poti", "gori", "telavi", "borjomi"]);
const KINDS = new Set(["concert", "theatre", "kids", "festival", "exhibition", "party", "games", "sport", "talk", "other"]);
const AD = /(лучш|грандиозн|не пропустите|незабываем|№ ?1|самый)/i;
const errs = [];
const ids = new Set();
const src = new Set();
for (const b of d.batches ?? []) {
  if (!/^\d{4}-\d{2}-\d{2}-\d{2}$/.test(b.id ?? "") || ids.has(b.id)) errs.push(`пачка ${b.id}: id ГГГГ-ММ-ДД-ЧЧ, без повторов`);
  ids.add(b.id);
  for (const [i, e] of (b.events ?? []).entries()) {
    const w = `пачка ${b.id}, событие ${i + 1} (${e?.title ?? "?"})`;
    if (!e?.title || e.title.length < 3) errs.push(`${w}: нет title`);
    if (!CITIES.has(e.city)) errs.push(`${w}: city — одно из ${[...CITIES].join(", ")}`);
    if (e.kind && !KINDS.has(e.kind)) errs.push(`${w}: kind — одно из ${[...KINDS].join(", ")}`);
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?\+04:00$/.test(e.starts_at ?? "")) errs.push(`${w}: starts_at в виде 2026-11-14T19:00:00+04:00`);
    if (e.ends_at && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?\+04:00$/.test(e.ends_at)) errs.push(`${w}: ends_at в виде 2026-12-01T23:59:00+04:00`);
    if (!/^https?:\/\//.test(e.source ?? "")) errs.push(`${w}: source — ссылка на страницу события или пост`);
    if (src.has(e.source)) errs.push(`${w}: повтор source`);
    src.add(e.source);
    if (e.url && !/^https?:\/\//.test(e.url)) errs.push(`${w}: url — ссылка`);
    if (e.image && !/^https:\/\//.test(e.image)) errs.push(`${w}: image — ссылка https`);
    if (AD.test(`${e.title} ${e.description ?? ""}`)) errs.push(`${w}: рекламные слова («лучший», «грандиозный», «не пропустите»…) — убери`);
  }
}
if (errs.length) {
  console.error("❌ " + errs.join("\n❌ "));
  process.exit(1);
}
console.log(`✅ data/events-import.json в порядке: пачек ${d.batches.length}, событий ${d.batches.reduce((a, b) => a + (b.events?.length ?? 0), 0)}`);
