import "server-only";
import { check, dbMode, DbNotConfiguredError, readLocal, supabase } from "./db";
import { looksLikeAd } from "./request-check";
import type { ClientRequest, RequestResponse } from "./types";

/* Лента заказов: открытые и недавние заявки клиентов (без имён и телефонов). */

const DAYS = 30;

async function recentRequests(): Promise<ClientRequest[]> {
  const since = new Date(Date.now() - DAYS * 86400000).toISOString();
  const sb = supabase();
  if (sb) return check(await sb.from("requests").select("*").gte("created_at", since).neq("status", "spam").order("created_at", { ascending: false }).limit(300)) as ClientRequest[];
  if (dbMode() === "none") throw new DbNotConfiguredError();
  return (await readLocal()).requests.filter((r) => r.created_at >= since && r.status !== "spam").sort((a, b) => b.created_at.localeCompare(a.created_at));
}

async function responsesFor(ids: string[]): Promise<RequestResponse[]> {
  if (!ids.length) return [];
  const sb = supabase();
  if (sb) return check(await sb.from("request_responses").select("*").in("request_id", ids)) as RequestResponse[];
  if (dbMode() === "none") throw new DbNotConfiguredError();
  return (await readLocal()).responses.filter((r) => ids.includes(r.request_id));
}

export type Order = ClientRequest & { responses: number; responders: string[] };

/** Общие заявки (не личные сообщения), без рекламы, со счётчиком откликов. */
export async function listOrders(): Promise<Order[]> {
  const list = (await recentRequests()).filter((r) => !r.master_id && !looksLikeAd(r).ad);
  const resp = await responsesFor(list.map((r) => r.id));
  return list.map((r) => {
    const rs = resp.filter((x) => x.request_id === r.id);
    return { ...r, responses: rs.length, responders: rs.map((x) => x.master_id) };
  });
}

/** Личные сообщения специалисту (заявки через «Написать через сайт»). */
export async function listDirectFor(masterId: string): Promise<Order[]> {
  const list = (await recentRequests()).filter((r) => r.master_id === masterId);
  const resp = await responsesFor(list.map((r) => r.id));
  return list.map((r) => {
    const rs = resp.filter((x) => x.request_id === r.id);
    return { ...r, responses: rs.length, responders: rs.map((x) => x.master_id) };
  });
}

/** Заявки, на которые специалист откликнулся (за 90 дней). */
export async function listMyResponses(masterId: string): Promise<(ClientRequest & { responded_at: string })[]> {
  const since = new Date(Date.now() - 90 * 86400000).toISOString();
  const sb = supabase();
  let mine: RequestResponse[];
  if (sb) mine = check(await sb.from("request_responses").select("*").eq("master_id", masterId).gte("created_at", since).order("created_at", { ascending: false })) as RequestResponse[];
  else {
    if (dbMode() === "none") throw new DbNotConfiguredError();
    mine = (await readLocal()).responses.filter((r) => r.master_id === masterId && r.created_at >= since).sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  if (!mine.length) return [];
  const ids = mine.map((x) => x.request_id);
  const reqs = sb
    ? (check(await sb.from("requests").select("*").in("id", ids)) as ClientRequest[])
    : (await readLocal()).requests.filter((r) => ids.includes(r.id));
  return mine.map((x) => ({ ...(reqs.find((r) => r.id === x.request_id) as ClientRequest), responded_at: x.created_at })).filter((r) => r.id);
}

/** Текст заявки для публичной ленты: без телефонов, ников, ссылок и почты. */
export function publicText(s: string): string {
  return s
    .replace(/https?:\/\/\S+|www\.\S+|t\.me\/\S+/gi, "…")
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "…")
    .replace(/(^|\s)@[a-z0-9_]{3,}/gi, "$1…")
    .replace(/\+?\d[\d\s\-()]{7,}\d/g, "…")
    .trim();
}
