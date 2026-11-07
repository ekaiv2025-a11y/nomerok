// Проверка data/registry-import.json перед коммитом: node scripts/check-registry-import.mjs
import { readFileSync } from "node:fs";
const d = JSON.parse(readFileSync(new URL("../data/registry-import.json", import.meta.url), "utf8"));
const CATS = new Set(["notary"]);
const CITIES = new Set(["batumi", "tbilisi", "kutaisi", "rustavi", "kobuleti", "zugdidi", "poti", "gori", "telavi", "borjomi"]);
const AD = /(лучш|ведущ|высококвалифиц|гаранти|№ ?1|самый|надёжн|надежн)/i;
const errs = [];
const ids = new Set();
const urls = new Set();
let n = 0;
for (const b of d.batches ?? []) {
  const at = `пачка ${b.id}`;
  if (!b.id || ids.has(b.id)) errs.push(`${at}: нет id или повтор`);
  ids.add(b.id);
  if (!b.source) errs.push(`${at}: нет source (название реестра)`);
  if (!Array.isArray(b.items) || !b.items.length) errs.push(`${at}: пустой items`);
  for (const [i, s] of (b.items ?? []).entries()) {
    n++;
    const w = `${at}, №${i + 1} (${s?.name ?? "?"})`;
    if (!s?.name || s.name.length < 4 || /[a-z]/i.test(s.name)) errs.push(`${w}: имя — по-русски, кириллицей`);
    if (!CATS.has(s.category)) errs.push(`${w}: category — notary`);
    if (!CITIES.has(s.city)) errs.push(`${w}: city — один из ${[...CITIES].join(", ")} (другие города пропускаем)`);
    if (!Array.isArray(s.phones) || !s.phones.length || s.phones.some((p) => !/^\+995 ?\d[\d ]{7,12}$/.test(p))) errs.push(`${w}: phones — массив номеров вида +995 5XX XXX XXX`);
    if (!s.address_ru || /[a-z]{3}/i.test(s.address_ru)) errs.push(`${w}: address_ru — адрес по-русски`);
    if (!/^https:\/\//.test(s.source_url ?? "") || !s.source_url.includes("#")) errs.push(`${w}: source_url — ссылка на страницу реестра + #метка (уникальная)`);
    if (urls.has(s.source_url)) errs.push(`${w}: повтор source_url`);
    urls.add(s.source_url);
    if (AD.test([s.title, s.services, s.about].join(" "))) errs.push(`${w}: рекламные слова — убери`);
  }
}
if (errs.length) {
  console.error("❌ " + errs.join("\n❌ "));
  process.exit(1);
}
console.log(`✅ data/registry-import.json в порядке: пачек ${d.batches.length}, анкет ${n}`);
