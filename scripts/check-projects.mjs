// Проверка новостроек (data/projects.json): node scripts/check-projects.mjs
import fs from "node:fs";
const list = JSON.parse(fs.readFileSync(new URL("../data/projects.json", import.meta.url), "utf8"));
const CITY_IDS = ["batumi", "tbilisi", "kutaisi", "rustavi", "kobuleti", "zugdidi", "poti", "gori", "telavi", "borjomi"];
const CATS = [...fs.readFileSync(new URL("../lib/categories.ts", import.meta.url), "utf8").matchAll(/\{ id: "([a-z]+)", group/g)].map((m) => m[1]);
const BLOCK = ["h2", "p", "list", "tip", "cta", "link", "map"];
const BAD = /лучш(ий|ая|ие|ее) (жк|застройщик|предложени)|гарантир|выгодн(ее|ейш)|самый надёжн|проверенн/i;
const errors = [];
const ok = (c, m) => c || errors.push(m);
const seen = new Set();
const words = (s) => (s.match(/[A-Za-zА-Яа-яЁё0-9]+/g) || []).length;
if (!Array.isArray(list)) errors.push("data/projects.json должен быть массивом");
for (const [i, p] of (Array.isArray(list) ? list : []).entries()) {
  const at = `#${i} ${p?.slug ?? "?"}`;
  ok(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug ?? ""), `${at}: slug — латиница через дефис`);
  ok(!seen.has(p.slug), `${at}: повтор slug`);
  seen.add(p.slug);
  for (const k of ["name", "developer", "lead", "updated", "added"]) ok(typeof p[k] === "string" && p[k].trim(), `${at}: нет поля ${k}`);
  ok(!/^жк\s/i.test(p.name ?? ""), `${at}: name без «ЖК» — сайт сам добавит`);
  ok(["presale", "building", "done"].includes(p.status), `${at}: status — presale, building или done`);
  ok(p.city ? CITY_IDS.includes(p.city) : typeof p.place === "string", `${at}: нужен city (id города сайта) или place`);
  for (const k of ["updated", "added"]) ok(/^\d{4}-\d{2}-\d{2}$/.test(p[k] ?? ""), `${at}: ${k} — YYYY-MM-DD`);
  if (p.coords) ok(Array.isArray(p.coords) && p.coords[0] > 41 && p.coords[0] < 43.7 && p.coords[1] > 39.9 && p.coords[1] < 46.8, `${at}: coords вне Грузии`);
  if (p.price) {
    ok(p.price.perM2 > 100 || p.price.from > 5000, `${at}: в price нужна perM2 или from (числа)`);
    ok(typeof p.price.date === "string" && p.price.date.length >= 4, `${at}: у цены нужна дата («ноябрь 2026»)`);
    ok(/^https:\/\//.test(p.price.src ?? ""), `${at}: у цены нужна ссылка src на источник`);
  }
  ok(p.photo == null || (p.photo.q && !/[а-яё]/i.test(p.photo.q)), `${at}: photo.q — по-английски`);
  ok(Array.isArray(p.body) && p.body.length >= 4, `${at}: body — минимум 4 блока`);
  for (const b of p.body ?? []) {
    const k = Object.keys(b).find((x) => BLOCK.includes(x));
    ok(k, `${at}: неизвестный блок ${JSON.stringify(b).slice(0, 60)}`);
    if (b.cta) ok(CATS.includes(b.cat), `${at}: cta — неизвестная категория ${b.cat}`);
  }
  const text = [p.lead, ...(p.body ?? []).flatMap((b) => [b.p, b.tip, b.h2, ...(b.list ?? [])]), ...(p.faq ?? []).flatMap((f) => [f.q, f.a])].filter(Boolean).join(" ");
  ok(words(text) >= 400, `${at}: мало текста (${words(text)} слов, нужно от 400)`);
  ok(!BAD.test(text), `${at}: рекламные слова (лучший, гарантирует, выгоднее, проверенный) — убрать`);
  ok(Array.isArray(p.faq) && p.faq.length >= 3, `${at}: faq — минимум 3`);
  ok(Array.isArray(p.sources) && p.sources.length >= 2 && p.sources.every((s) => s.name && /^https:\/\//.test(s.url)), `${at}: sources — минимум 2 со ссылками https`);
}
if (errors.length) {
  console.error("❌ Ошибки в data/projects.json:\n" + errors.map((e) => " - " + e).join("\n"));
  process.exit(1);
}
console.log(`✅ data/projects.json в порядке: ${list.length} ЖК`);
