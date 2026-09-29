import "server-only";
import { check, dbMode, DbNotConfiguredError, readLocal, supabase, writeLocal } from "./db";
import { normalizePhone } from "./phone";

/* Поиск специалистов в чатах: кому уже писали и кто уже есть на сайте. */

export type OutreachMark = { status: string; created_at: string };

export async function listOutreach(): Promise<Record<string, OutreachMark>> {
  const sb = supabase();
  const out: Record<string, OutreachMark> = {};
  if (sb) {
    const res = await sb.from("outreach").select("tg_user_id,status,created_at").limit(20000);
    if (res.error) return out; // таблицы ещё нет — просто ничего не помним
    for (const r of res.data as { tg_user_id: string; status: string; created_at: string }[]) out[r.tg_user_id] = { status: r.status, created_at: r.created_at };
    return out;
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  for (const r of (await readLocal()).outreach ?? []) out[r.tg_user_id] = { status: r.status, created_at: r.created_at };
  return out;
}

export async function markOutreach(row: { tg_user_id: string; name: string; category: string; status: "sent" | "skip" | "reset" }) {
  const sb = supabase();
  if (sb) {
    if (row.status === "reset") check(await sb.from("outreach").delete().eq("tg_user_id", row.tg_user_id));
    else check(await sb.from("outreach").upsert({ tg_user_id: row.tg_user_id, name: row.name, category: row.category, status: row.status }));
    return;
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = await readLocal();
  const list = (d.outreach ?? []).filter((x) => x.tg_user_id !== row.tg_user_id);
  if (row.status !== "reset") list.push({ ...row, created_at: new Date().toISOString() });
  d.outreach = list;
  await writeLocal(d);
}

/** Кто из кандидатов уже зарегистрирован: по Telegram-id (бот), @нику или телефону. */
export async function registeredMatches(): Promise<{ ids: Set<string>; usernames: Set<string>; phones: Set<string> }> {
  const { adminListMasters } = await import("./db");
  const all = await adminListMasters();
  const ids = new Set<string>(), usernames = new Set<string>(), phones = new Set<string>();
  for (const m of all) {
    if (m.tg_chat_id) ids.add(String(m.tg_chat_id));
    for (const u of [m.telegram, m.tg_username]) if (u) usernames.add(u.toLowerCase().replace(/^@/, ""));
    if (m.phone) phones.add(normalizePhone(m.phone) ?? m.phone);
  }
  return { ids, usernames, phones };
}
