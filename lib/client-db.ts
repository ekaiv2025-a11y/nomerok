import "server-only";
import { check, dbMode, DbNotConfiguredError, readLocal, supabase, writeLocal } from "./db";
import type { ClientRequest, RequestResponse } from "./types";

/* Данные для кабинета клиента. */

export async function listClientRequests(chatId: number): Promise<ClientRequest[]> {
  const sb = supabase();
  if (sb) return check(await sb.from("requests").select("*").eq("client_tg_chat_id", chatId).neq("status", "spam").order("created_at", { ascending: false }).limit(50)) as ClientRequest[];
  if (dbMode() === "none") throw new DbNotConfiguredError();
  return (await readLocal()).requests.filter((r) => r.client_tg_chat_id === chatId && r.status !== "spam").sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function listResponsesFor(requestIds: string[]): Promise<RequestResponse[]> {
  if (!requestIds.length) return [];
  const sb = supabase();
  if (sb) return check(await sb.from("request_responses").select("*").in("request_id", requestIds)) as RequestResponse[];
  if (dbMode() === "none") throw new DbNotConfiguredError();
  return (await readLocal()).responses.filter((r) => requestIds.includes(r.request_id));
}

type LocalWithFavs = Awaited<ReturnType<typeof readLocal>> & { client_favs?: { chat_id: number; slug: string }[] };

/** Объединяет избранное с устройства и из базы; возвращает общий список. */
export async function syncFavs(chatId: number, fromDevice: string[], removed: string[] = []): Promise<string[]> {
  const clean = (a: string[]) => a.filter((s) => typeof s === "string" && /^[a-z0-9-]{1,120}$/.test(s)).slice(0, 100);
  const add = clean(fromDevice);
  const del = clean(removed);
  const sb = supabase();
  if (sb) {
    if (del.length) await sb.from("client_favs").delete().eq("chat_id", chatId).in("slug", del);
    if (add.length) await sb.from("client_favs").upsert(add.map((slug) => ({ chat_id: chatId, slug })), { onConflict: "chat_id,slug", ignoreDuplicates: true });
    const r = await sb.from("client_favs").select("slug").eq("chat_id", chatId).order("created_at", { ascending: false }).limit(100);
    if (r.error) return add; // таблицы ещё нет — работаем только с устройством
    return (r.data as { slug: string }[]).map((x) => x.slug);
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = (await readLocal()) as LocalWithFavs;
  let list = (d.client_favs ?? []).filter((f) => !(f.chat_id === chatId && del.includes(f.slug)));
  for (const slug of add) if (!list.some((f) => f.chat_id === chatId && f.slug === slug)) list = [{ chat_id: chatId, slug }, ...list];
  d.client_favs = list;
  await writeLocal(d);
  return list.filter((f) => f.chat_id === chatId).map((f) => f.slug);
}
