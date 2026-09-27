/*
 * Автоматическое обновление базы при каждом выкладывании сайта (Vercel → npm run build).
 * Берёт файлы supabase/migrations/*.sql и выполняет те, что ещё не выполнялись.
 * Какие выполнены — записано в таблице public.schema_migrations.
 * Если DATABASE_URL не задан — просто пропускает (сайт собирается как обычно).
 * Если обновление упало — сборка останавливается, и на сайте остаётся прошлая рабочая версия.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const url = (process.env.DATABASE_URL ?? "").replace(/[\s"'`«»]/g, "");
const dir = process.env.MIGRATIONS_DIR || path.join(process.cwd(), "supabase", "migrations");

if (!url) {
  console.log("[migrate] DATABASE_URL не задан — обновление базы пропущено");
  process.exit(0);
}

const client = new pg.Client({
  connectionString: url,
  ssl: /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(`create table if not exists public.schema_migrations (
    name text primary key,
    applied_at timestamptz not null default now()
  )`);
  await client.query("alter table public.schema_migrations enable row level security");

  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  const done = new Set((await client.query("select name from public.schema_migrations")).rows.map((r) => r.name));

  // Первый запуск на уже рабочей базе: всё, что руками выполнили раньше, отмечаем как выполненное
  if (done.size === 0) {
    const { rows } = await client.query("select to_regclass('public.masters') is not null as has");
    const upTo = process.env.MIGRATIONS_BASELINE || "0005";
    if (rows[0].has) {
      for (const f of files.filter((f) => f.slice(0, 4) <= upTo)) {
        await client.query("insert into public.schema_migrations (name) values ($1) on conflict do nothing", [f]);
        done.add(f);
        console.log(`[migrate] ${f} — уже был выполнен вручную, отмечен`);
      }
    }
  }

  for (const f of files) {
    if (done.has(f)) continue;
    const sql = await readFile(path.join(dir, f), "utf8");
    console.log(`[migrate] выполняю ${f}…`);
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("insert into public.schema_migrations (name) values ($1)", [f]);
      await client.query("commit");
    } catch (e) {
      await client.query("rollback");
      throw new Error(`${f}: ${e.message}`);
    }
    console.log(`[migrate] ${f} — готово`);
  }
  console.log("[migrate] база в актуальном состоянии");
} catch (e) {
  console.error("[migrate] ОШИБКА:", e.message);
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
