// Проверка data/staff-import.json перед коммитом: node scripts/check-staff-import.mjs
import { readFileSync } from "node:fs";
const d = JSON.parse(readFileSync(new URL("../data/staff-import.json", import.meta.url), "utf8"));
const CATS = new Set(["doctor", "dentist", "psychologist", "speech", "massage", "vet"]);
const errs = [];
const ids = new Set();
const urls = new Set();
const AD = /(лучш|ведущ|высококвалифиц|гаранти|вылечим|№ ?1|самый)/i;
const PHONE = /(\+?995[\s-]?\d|\b5\d{2}[\s-]?\d{2}[\s-]?\d{2}[\s-]?\d{2}\b|whatsapp|t\.me\/|@[a-z0-9_]{4,})/i;
for (const b of d.batches ?? []) {
  const at = `пачка ${b.id}`;
  if (!b.id || ids.has(b.id)) errs.push(`${at}: нет id или повтор`);
  ids.add(b.id);
  if (!b.place_id && !(b.clinic?.name && /^https?:\/\//.test(b.clinic?.site ?? "") && b.clinic?.phones?.length && b.clinic?.addr_ru))
    errs.push(`${at}: нужен place_id клиники (https://nomerok.ge/api/place-find?site=…) или clinic {name, site, phones, addr_ru}`);
  if (!Array.isArray(b.staff) || !b.staff.length) errs.push(`${at}: пустой staff`);
  for (const [i, s] of (b.staff ?? []).entries()) {
    const w = `${at}, врач ${i + 1} (${s?.name ?? "?"})`;
    if (!s?.name || s.name.length < 4) errs.push(`${w}: нет имени`);
    if (!CATS.has(s.category)) errs.push(`${w}: category должна быть одной из ${[...CATS].join(", ")}`);
    if (!s.title) errs.push(`${w}: нет title (должность как на сайте)`);
    if (!/^https:\/\//.test(s.source_url ?? "")) errs.push(`${w}: source_url — ссылка https на страницу врача`);
    if (urls.has(s.source_url)) errs.push(`${w}: повтор source_url`);
    urls.add(s.source_url);
    if (s.photo != null && !/^https:\/\//.test(s.photo)) errs.push(`${w}: photo — прямая ссылка https или null`);
    const text = [s.title, s.services, s.about, s.credentials].filter(Boolean).join(" ");
    if (AD.test(text)) errs.push(`${w}: рекламные слова («лучший», «ведущий», «высококвалифицированный»…) — убери`);
    if (PHONE.test(text)) errs.push(`${w}: в тексте телефон, мессенджер или ник — личные контакты не публикуем`);
    if (s.experience_years != null && !(Number.isInteger(s.experience_years) && s.experience_years > 0 && s.experience_years < 70)) errs.push(`${w}: experience_years — целое число или null`);
  }
}
if (errs.length) {
  console.error("❌ " + errs.join("\n❌ "));
  process.exit(1);
}
console.log(`✅ data/staff-import.json в порядке: пачек ${d.batches.length}, врачей ${d.batches.reduce((a, b) => a + b.staff.length, 0)}`);
