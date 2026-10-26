#!/usr/bin/env node
// Готовая подборка новостей от сборщика с компьютера владельца (ветка «feed», файл feed/latest.json).
// Экономит поиск: сначала смотри подборку, по сайтам ходи только за недостающим.
//
//   node scripts/feed.mjs status                 — когда обновлялась подборка и какие источники сломаны
//   node scripts/feed.mjs list [--hours 24] [--city tbilisi] [--q слово] [--tg]
//                                                — список свежих материалов (без уже опубликованных в auto.json)
//   node scripts/feed.mjs show <id> [<id> …]     — текст выбранных материалов
import { execSync } from "node:child_process";
import fs from "node:fs";

const args = process.argv.slice(2);
const cmd = args[0] ?? "list";
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] ?? true : def;
};

function load() {
  try {
    execSync("git fetch -q origin feed", { stdio: "ignore" });
    return JSON.parse(execSync("git show origin/feed:feed/latest.json", { maxBuffer: 64 * 1024 * 1024 }).toString("utf8"));
  } catch {
    console.log("Подборки нет (сборщик ещё не отправлял или ветка feed недоступна) — ищи новости сам, как в инструкции.");
    process.exit(0);
  }
}

const feed = load();
const ageH = (Date.now() - Date.parse(feed.generated_at)) / 3600_000;
if (ageH > 8) console.log(`⚠️ Подборка старая: обновлялась ${Math.round(ageH)} ч назад (компьютер выключен?). Используй её, но свежее ищи сам.`);

if (cmd === "status") {
  console.log(`Обновлено: ${feed.generated_at} (${ageH.toFixed(1)} ч назад), материалов: ${feed.items.length}`);
  for (const s of feed.sources) console.log(s.ok ? `✓ ${s.source}: найдено ${s.found}, новых ${s.new}` : `✗ ${s.source}: ${s.error}`);
  process.exit(0);
}

if (cmd === "show") {
  for (const id of args.slice(1)) {
    const x = feed.items.find((i) => i.id === id);
    if (!x) {
      console.log(`\n### ${id}: не найдено`);
      continue;
    }
    console.log(`\n### ${x.id} · ${x.source}${x.city ? ` · ${x.city}` : ""} · ${x.date ?? x.first_seen}\n${x.title}\n${x.url}\n\n${x.text || "(текста нет — открой ссылку)"}`);
  }
  process.exit(0);
}

// list
const used = new Set();
try {
  for (const n of JSON.parse(fs.readFileSync("lib/news/auto.json", "utf8"))) for (const s of n.sources ?? []) used.add(s.url);
} catch {}
const hours = Number(opt("hours", 36));
const since = new Date(Date.now() - hours * 3600_000).toISOString();
const city = opt("city", null);
const q = typeof opt("q", null) === "string" ? opt("q").toLowerCase() : null;
const onlyTg = args.includes("--tg");
const list = feed.items.filter(
  (x) =>
    !used.has(x.url) &&
    (x.date ?? x.first_seen) >= since &&
    (!city || x.city === city || `${x.title} ${x.text}`.toLowerCase().includes(String(city).slice(0, 5))) &&
    (!q || `${x.title} ${x.text}`.toLowerCase().includes(q)) &&
    (!onlyTg || x.url.startsWith("https://t.me/")),
);
console.log(`Материалов: ${list.length} (за ${hours} ч, без уже опубликованных). Текст: node scripts/feed.mjs show <id>`);
for (const x of list) console.log(`${x.id} | ${x.source}${x.city ? `/${x.city}` : ""} | ${(x.date ?? x.first_seen).slice(5, 16)} | ${x.title.replace(/\s+/g, " ").slice(0, 140)}`);
