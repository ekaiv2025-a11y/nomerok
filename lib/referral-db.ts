import "server-only";
import { randomInt } from "crypto";
import { check, dbMode, DbNotConfiguredError, readLocal, supabase, writeLocal } from "./db";

/*
 * Бонусы за рекомендацию.
 * Специалист задаёт условия (offer), клиенты получают личные коды для друзей (referrals).
 * Бонус выдаёт сам специалист — сайт только передаёт код и считает, сколько кодов выдано.
 */

export type Offer = { master_id: string; active: boolean; friend: string; reward: string; max_uses: number; prefix: string; since: string; updated_at: string };
export type Referral = { code: string; master_id: string; name: string; chat_id: number | null; created_at: string; used_at: string | null };

export const LIMITS = [5, 10, 20, 50, 0] as const; // 0 — без ограничения

export function cleanPrefix(s: string): string {
  return s.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
}

const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // без 0/O и 1/I — чтобы не путали, диктуя код
function tail(n = 3) {
  let s = "";
  for (let i = 0; i < n; i++) s += ALPHA[randomInt(ALPHA.length)];
  return s;
}

function missingTable(err: { message?: string; code?: string } | null) {
  return !!err && (err.code === "42P01" || err.code === "PGRST205" || /does not exist|schema cache/i.test(err.message ?? ""));
}

export async function getOffer(masterId: string): Promise<Offer | null> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("referral_offers").select("*").eq("master_id", masterId).maybeSingle();
    if (r.error) return null; // таблицы ещё нет
    return (r.data as Offer) ?? null;
  }
  if (dbMode() === "none") return null;
  return (await readLocal()).referral_offers?.find((o) => o.master_id === masterId) ?? null;
}

export async function saveOffer(masterId: string, o: { active: boolean; friend: string; reward: string; max_uses: number; prefix: string; restart?: boolean }): Promise<Offer> {
  const now = new Date().toISOString();
  const prev = await getOffer(masterId);
  const row: Offer = {
    master_id: masterId,
    active: o.active,
    friend: o.friend.trim().slice(0, 140),
    reward: o.reward.trim().slice(0, 140),
    max_uses: (LIMITS as readonly number[]).includes(o.max_uses) ? o.max_uses : 10,
    prefix: cleanPrefix(o.prefix) || "NOMEROK",
    since: o.restart || !prev ? now : prev.since,
    updated_at: now,
  };
  const sb = supabase();
  if (sb) {
    check(await sb.from("referral_offers").upsert(row));
    return row;
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = await readLocal();
  d.referral_offers = [...(d.referral_offers ?? []).filter((x) => x.master_id !== masterId), row];
  await writeLocal(d);
  return row;
}

async function listCodes(masterId: string, since?: string): Promise<Referral[]> {
  const sb = supabase();
  if (sb) {
    let q = sb.from("referrals").select("*").eq("master_id", masterId).order("created_at", { ascending: false }).limit(500);
    if (since) q = q.gte("created_at", since);
    const r = await q;
    if (r.error) return [];
    return r.data as Referral[];
  }
  if (dbMode() === "none") return [];
  return ((await readLocal()).referrals ?? [])
    .filter((x) => x.master_id === masterId && (!since || x.created_at >= since))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/** Сколько бонусов ещё осталось (null — без ограничения). */
export async function offerStatus(masterId: string): Promise<{ offer: Offer; issued: number; left: number | null } | null> {
  const offer = await getOffer(masterId);
  if (!offer) return null;
  const issued = (await listCodes(masterId, offer.since)).length;
  const left = offer.max_uses ? Math.max(0, offer.max_uses - issued) : null;
  return { offer, issued, left };
}

/** Действующее предложение для страницы специалиста (или null — бонусов нет/закончились). */
export async function liveOffer(masterId: string) {
  const s = await offerStatus(masterId).catch(() => null);
  if (!s || !s.offer.active || !s.offer.friend || s.left === 0) return null;
  return s;
}

/** У каких специалистов сейчас есть бонус — для значка 🎁 в каталоге. */
export async function mastersWithBonus(): Promise<Set<string>> {
  const out = new Set<string>();
  const sb = supabase();
  let offers: Offer[] = [];
  if (sb) {
    const r = await sb.from("referral_offers").select("*").eq("active", true);
    if (r.error) return out;
    offers = r.data as Offer[];
  } else if (dbMode() !== "none") offers = ((await readLocal()).referral_offers ?? []).filter((o) => o.active);
  for (const o of offers) {
    if (!o.friend) continue;
    if (!o.max_uses) out.add(o.master_id);
    else if ((await listCodes(o.master_id, o.since)).length < o.max_uses) out.add(o.master_id);
  }
  return out;
}

export async function findCode(code: string): Promise<Referral | null> {
  const c = code.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 20);
  if (!c) return null;
  const sb = supabase();
  if (sb) {
    const r = await sb.from("referrals").select("*").eq("code", c).maybeSingle();
    if (r.error) return null;
    return (r.data as Referral) ?? null;
  }
  if (dbMode() === "none") return null;
  return (await readLocal()).referrals?.find((x) => x.code === c) ?? null;
}

/**
 * Выдать код рекомендателю. Тот же человек (по Telegram или по имени) получает свой прежний код — повторно лимит не тратится.
 * Возвращает null, если бонусы закончились или выключены.
 */
export async function issueCode(masterId: string, name: string, chatId: number | null): Promise<{ ref: Referral; fresh: boolean } | null> {
  const s = await liveOffer(masterId);
  if (!s) return null;
  const codes = await listCodes(masterId);
  const nm = name.trim().slice(0, 40);
  const same = codes.find((x) => (chatId && x.chat_id === chatId) || x.name.toLowerCase() === nm.toLowerCase());
  if (same) return { ref: same, fresh: false };
  const sb = supabase();
  for (let i = 0; i < 5; i++) {
    const ref: Referral = { code: `${s.offer.prefix}-${tail()}`, master_id: masterId, name: nm, chat_id: chatId, created_at: new Date().toISOString(), used_at: null };
    if (sb) {
      const r = await sb.from("referrals").insert(ref);
      if (!r.error) return { ref, fresh: true };
      if (missingTable(r.error)) return null;
      continue; // такой код уже есть — пробуем другой хвост
    }
    if (dbMode() === "none") throw new DbNotConfiguredError();
    const d = await readLocal();
    if ((d.referrals ?? []).some((x) => x.code === ref.code)) continue;
    d.referrals = [...(d.referrals ?? []), ref];
    await writeLocal(d);
    return { ref, fresh: true };
  }
  return null;
}

/** Для кабинета: последние коды. */
export async function recentCodes(masterId: string, limit = 30): Promise<Referral[]> {
  return (await listCodes(masterId)).slice(0, limit);
}
