// Проверка lib/news/auto.json перед публикацией: node scripts/check-news.mjs
// Ловит ошибки формата, повторы, выдуманные/битые ссылки, запрещённые слова.
import fs from "node:fs";

const FILE = new URL("../lib/news/auto.json", import.meta.url);
const list = JSON.parse(fs.readFileSync(FILE, "utf8"));
const errors = [];
const slugs = new Set();
const urls = new Map();
const BANNED = /(лучш(ий|ие|ая)\s+мастер|провер(енные|ены)\s+(мастера|специалисты|документы)|whatsapp|ватсап)/i;
const BLOCK_KEYS = ["h2", "p", "list", "tip", "cta", "link"];
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
  if (!["news", "events"].includes(n.rubric)) errors.push(`${at}: rubric должен быть news или events`);
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
  const words = [n.lead, ...(n.body ?? []).map((b) => b.p || b.h2 || b.tip || (b.list || []).join(" ") || "")].join(" ").split(/\s+/).length;
  if (words < 120) errors.push(`${at}: слишком коротко (${words} слов, нужно от 120)`);
}
if (errors.length) {
  console.error("❌ Ошибки в lib/news/auto.json:\n" + errors.map((e) => " - " + e).join("\n"));
  process.exit(1);
}
console.log(`✅ auto.json в порядке: ${list.length} заметок`);
