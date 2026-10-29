// Проверка страниц «Грузия» (data/geo/*.json): node scripts/check-geo.mjs
import fs from "node:fs";
const dir = new URL("../data/geo/", import.meta.url);
const index = fs.readFileSync(new URL("../lib/geo.ts", import.meta.url), "utf8");
const errors = [];
const ok = (c, m) => c || errors.push(m);
const BLOCK = ["h2", "p", "list", "tip", "cta", "link", "map"];
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
  const at = f;
  let g;
  try { g = JSON.parse(fs.readFileSync(new URL(f, dir), "utf8")); } catch (e) { errors.push(`${at}: не JSON — ${e.message}`); continue; }
  ok(`${g.id}.json` === f, `${at}: id должен совпадать с именем файла`);
  ok(new RegExp(`data/geo/${g.id}\\.json`).test(index), `${at}: не подключён в lib/geo.ts (import и строка в GEO)`);
  for (const k of ["name", "nameIn", "nameGen", "title", "description", "lead", "updated"]) ok(typeof g[k] === "string" && g[k].trim(), `${at}: нет поля ${k}`);
  ok(["city", "resort", "region"].includes(g.kind), `${at}: kind — city, resort или region`);
  ok(g.title?.length <= 110, `${at}: title длиннее 110`);
  ok(g.description?.length >= 80 && g.description?.length <= 200, `${at}: description 80–200 знаков`);
  ok(Array.isArray(g.coords) && g.coords[0] > 41 && g.coords[0] < 43.7 && g.coords[1] > 39.9 && g.coords[1] < 46.8, `${at}: coords вне Грузии`);
  ok(g.photo?.q && !/[а-яё]/i.test(g.photo.q), `${at}: photo.q — по-английски`);
  ok(g.facts?.length >= 5, `${at}: facts — минимум 5`);
  ok(g.sections?.some((s) => s.id === "about"), `${at}: нужен раздел about`);
  for (const s of g.sections ?? []) for (const b of s.blocks ?? []) ok(b && BLOCK.some((k) => k in b), `${at}: неизвестный блок в ${s.id}`);
  if (g.kind !== "region") ok(g.sights?.length >= 5, `${at}: sights — минимум 5`);
  for (const s of g.sights ?? []) ok(s.lat == null || (s.lat > 41 && s.lat < 43.7 && s.lng > 39.9 && s.lng < 46.8), `${at}: «${s.name}» — координаты вне Грузии`);
  if (g.climate) {
    ok(g.climate.months?.length === 12, `${at}: climate.months — ровно 12`);
    for (const m of g.climate.months ?? []) ok([m.tmin, m.tmax, m.rain, m.rainDays].every((x) => typeof x === "number") && m.tmax > m.tmin, `${at}: месяц климата без tmin/tmax/rain/rainDays`);
    ok(/^https:\/\//.test(g.climate.source?.url ?? ""), `${at}: у климата нужен источник`);
    ok(g.months?.length === 12 && g.months.every((m) => m.what && m.wear), `${at}: months — 12 строк с what и wear`);
  }
  ok(g.faq?.length >= 4, `${at}: faq — минимум 4`);
  ok(g.sources?.length >= 3 && g.sources.every((s) => /^https:\/\//.test(s.url)), `${at}: sources — минимум 3 с https`);
  const text = JSON.stringify(g);
  ok(!/лучшие мастера|проверенн|whatsapp/i.test(text), `${at}: запрещённые слова`);
  const words = text.replace(/"[a-zA-Z_]+":/g, " ").split(/\s+/).length;
  ok(words >= 1200, `${at}: мало текста (${words} слов, нужно от 1200)`);
}
if (errors.length) { console.error("❌\n" + errors.map((e) => " - " + e).join("\n")); process.exit(1); }
console.log("✅ data/geo в порядке");
