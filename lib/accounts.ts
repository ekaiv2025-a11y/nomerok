import "server-only";
import { randomUUID } from "crypto";
import { dbMode, readLocal, supabase, writeLocal } from "./db";

/*
 * Аккаунты сайта: вход через почту (код), Google или Facebook.
 * Чтобы не переписывать заявки, избранное и отзывы (они привязаны к id чата Telegram),
 * у аккаунта есть «внутренний id чата» — отрицательное число вне диапазона Telegram.
 * Сообщения бота на такой id уходят письмом (см. lib/mail-bridge.ts).
 */
export type Account = {
  id: string;
  num: number;
  email: string | null;
  google_sub: string | null;
  facebook_id: string | null;
  name: string;
  lang: string;
  created_at: string;
  last_login_at: string | null;
};

const BASE = 5_000_000_000_000_000; // больше любого id Telegram (они меньше 2^52 ≈ 4,5e15)
export const accountChatId = (num: number) => -(BASE + num);
export const isAccountChat = (id: number | string | null | undefined) => typeof id === "number" ? id <= -BASE : typeof id === "string" && /^-\d{16,}$/.test(id) && Number(id) <= -BASE;
export const accountNumOf = (chatId: number) => -chatId - BASE;

type L = { accounts?: Account[] };
const local = async () => ((await readLocal()) as unknown as L);

export const normEmail = (e: string) => e.trim().toLowerCase();
export const validEmail = (e: string) => /^[^\s@<>()"',;]{1,64}@[a-z0-9.-]{1,190}\.[a-z]{2,24}$/i.test(e.trim());

export async function getAccount(id: string): Promise<Account | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const sb = supabase();
  if (sb) {
    const r = await sb.from("accounts").select("*").eq("id", id).maybeSingle();
    return r.error ? null : ((r.data as Account) ?? null);
  }
  if (dbMode() === "none") return null;
  return ((await local()).accounts ?? []).find((a) => a.id === id) ?? null;
}

export async function accountByChatId(chatId: number): Promise<Account | null> {
  if (!isAccountChat(chatId)) return null;
  const num = accountNumOf(chatId);
  const sb = supabase();
  if (sb) {
    const r = await sb.from("accounts").select("*").eq("num", num).maybeSingle();
    return r.error ? null : ((r.data as Account) ?? null);
  }
  if (dbMode() === "none") return null;
  return ((await local()).accounts ?? []).find((a) => a.num === num) ?? null;
}

async function findBy(field: "email" | "google_sub" | "facebook_id", value: string): Promise<Account | null> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("accounts").select("*").eq(field, value).maybeSingle();
    return r.error ? null : ((r.data as Account) ?? null);
  }
  if (dbMode() === "none") return null;
  return ((await local()).accounts ?? []).find((a) => a[field] === value) ?? null;
}

async function patch(id: string, p: Partial<Account>): Promise<void> {
  const sb = supabase();
  if (sb) {
    await sb.from("accounts").update(p).eq("id", id);
    return;
  }
  const d = await local();
  d.accounts = (d.accounts ?? []).map((a) => (a.id === id ? { ...a, ...p } : a));
  await writeLocal(d as never);
}

async function create(p: Pick<Account, "email" | "google_sub" | "facebook_id" | "name" | "lang">): Promise<Account> {
  const now = new Date().toISOString();
  const sb = supabase();
  if (sb) {
    const r = await sb.from("accounts").insert({ ...p, last_login_at: now }).select("*").single();
    if (r.error) throw new Error(r.error.message);
    return r.data as Account;
  }
  const d = await local();
  const list = d.accounts ?? [];
  const row: Account = { ...p, id: randomUUID(), num: list.reduce((n, a) => Math.max(n, a.num), 0) + 1, created_at: now, last_login_at: now };
  d.accounts = [...list, row];
  await writeLocal(d as never);
  return row;
}

/**
 * Найти или создать аккаунт после входа.
 * Сначала — по самому способу входа (google_sub / facebook_id / почта), потом — по подтверждённой почте:
 * так один человек, вошедший сначала по почте, а потом через Google с той же почтой, попадёт в тот же аккаунт.
 */
export async function loginAccount(input: { provider: "email" | "google" | "facebook"; key: string; email: string | null; emailVerified: boolean; name: string; lang: string }): Promise<Account> {
  const email = input.email && validEmail(input.email) ? normEmail(input.email) : null;
  const field = input.provider === "google" ? "google_sub" : input.provider === "facebook" ? "facebook_id" : "email";
  const key = input.provider === "email" ? normEmail(input.key) : input.key;
  let acc = await findBy(field, key);
  if (!acc && email && input.emailVerified) acc = await findBy("email", email);
  const now = new Date().toISOString();
  if (acc) {
    const p: Partial<Account> = { last_login_at: now };
    if (field !== "email" && !acc[field]) p[field] = key;
    if (!acc.email && email && input.emailVerified && !(await findBy("email", email))) p.email = email;
    if (!acc.name && input.name) p.name = input.name.slice(0, 80);
    await patch(acc.id, p);
    return { ...acc, ...p };
  }
  return create({
    email: email && input.emailVerified ? email : null,
    google_sub: input.provider === "google" ? key : null,
    facebook_id: input.provider === "facebook" ? key : null,
    name: input.name.slice(0, 80),
    lang: ["ru", "en", "ka"].includes(input.lang) ? input.lang : "ru",
  });
}

/** Задать почту аккаунту (после подтверждения кодом), если она ни у кого не занята. */
export async function setAccountEmail(id: string, email: string): Promise<boolean> {
  const e = normEmail(email);
  const other = await findBy("email", e);
  if (other && other.id !== id) return false;
  await patch(id, { email: e });
  return true;
}
