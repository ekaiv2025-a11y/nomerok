import "server-only";
import { notifyAdmin } from "./telegram";
import { formatPhone } from "./phone";
import { dbMode, readLocal, supabase, writeLocal } from "./db";

/* Начатые регистрации через бота: поделился номером → получил ссылку на анкету → (открыл) → (отправил). */
export type JoinStart = { chat_id: number; phone: string | null; name: string | null; lang: string; created_at: string; opened_at: string | null; reminded_at: string | null; done_at: string | null };
type L = { join_starts?: JoinStart[] };

async function patchLocal(chatId: number, patch: Partial<JoinStart>, create?: JoinStart) {
  if (dbMode() === "none") return;
  const d = (await readLocal()) as unknown as L;
  const list = d.join_starts ?? [];
  const i = list.findIndex((x) => x.chat_id === chatId);
  if (i >= 0) list[i] = { ...list[i], ...patch };
  else if (create) list.push({ ...create, ...patch });
  d.join_starts = list;
  await writeLocal(d as never);
}

export async function joinStarted(chatId: number, phone: string, name: string, lang: string) {
  const row: JoinStart = { chat_id: chatId, phone, name, lang, created_at: new Date().toISOString(), opened_at: null, reminded_at: null, done_at: null };
  const sb = supabase();
  if (sb) {
    await sb.from("join_starts").upsert(row, { onConflict: "chat_id" });
    return;
  }
  await patchLocal(chatId, row, row);
}

export async function joinMark(chatId: number, what: "opened_at" | "reminded_at" | "done_at") {
  const patch = { [what]: new Date().toISOString() } as Partial<JoinStart>;
  const sb = supabase();
  if (sb) {
    await sb.from("join_starts").update(patch).eq("chat_id", chatId);
    return;
  }
  await patchLocal(chatId, patch);
}

export async function getJoinStart(chatId: number): Promise<JoinStart | null> {
  const sb = supabase();
  if (sb) return ((await sb.from("join_starts").select("*").eq("chat_id", chatId).maybeSingle()).data as JoinStart) ?? null;
  if (dbMode() === "none") return null;
  return ((await readLocal()) as unknown as L).join_starts?.find((x) => x.chat_id === chatId) ?? null;
}

/** Начали, но не закончили: старше 3 часов, моложе 7 дней, без напоминания. */
export async function joinsToRemind(): Promise<JoinStart[]> {
  const old = new Date(Date.now() - 3 * 3600_000).toISOString();
  const fresh = new Date(Date.now() - 7 * 86400_000).toISOString();
  const sb = supabase();
  if (sb) {
    const r = await sb.from("join_starts").select("*").is("done_at", null).is("reminded_at", null).lt("created_at", old).gt("created_at", fresh).limit(50);
    return r.error ? [] : (r.data as JoinStart[]);
  }
  if (dbMode() === "none") return [];
  return (((await readLocal()) as unknown as L).join_starts ?? []).filter((x) => !x.done_at && !x.reminded_at && x.created_at < old && x.created_at > fresh);
}

/** Человек открыл анкету по ссылке из бота — сообщить админу один раз. */
export async function joinOpened(chatId: number, name: string, phone: string) {
  const j = await getJoinStart(chatId);
  if (j?.opened_at || j?.done_at) return;
  await joinMark(chatId, "opened_at");
  await notifyAdmin(`👀 ${name || "—"} (${formatPhone(phone)}) открыл(а) анкету по ссылке из бота. #u${chatId}`, { silent: true });
}

/** Анкета из бота не прошла проверку — показать админу, на чём споткнулись. */
export async function joinFailed(chatId: number, phone: string, why: string) {
  await notifyAdmin(`⚠️ Анкета от ${formatPhone(phone)} не отправилась: ${why}. #u${chatId}`, { silent: true });
}

/** За `days` дней: сколько начали регистрацию в боте, открыли анкету и отправили. */
export async function joinFunnel(days: number): Promise<{ started: number; opened: number; done: number }> {
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  let rows: JoinStart[] = [];
  const sb = supabase();
  if (sb) {
    const r = await sb.from("join_starts").select("*").gte("created_at", since).limit(5000);
    rows = r.error ? [] : (r.data as JoinStart[]);
  } else if (dbMode() !== "none") rows = (((await readLocal()) as unknown as L).join_starts ?? []).filter((x) => x.created_at >= since);
  return { started: rows.length, opened: rows.filter((x) => x.opened_at || x.done_at).length, done: rows.filter((x) => x.done_at).length };
}
