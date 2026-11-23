import "server-only";
import { adminGetMaster } from "./db";
import { currentSpecialistId } from "./spec-auth";
import type { Master } from "./types";

export const isRealtor = (m: Pick<Master, "category" | "extra_categories">) => m.category === "realtor" || (m.extra_categories ?? []).includes("realtor");

/** Вошедший специалист-риелтор (или null). */
export async function currentRealtor(): Promise<Master | null> {
  const id = await currentSpecialistId();
  if (!id) return null;
  const m = await adminGetMaster(id);
  return m && isRealtor(m) && m.status !== "rejected" ? m : null;
}

/**
 * Кто размещает объект: риелтор с анкетой (как раньше) или любой вошедший человек —
 * собственник, агент, агентство, застройщик (вход через Telegram или почту/Google, «Мои заявки»).
 */
export type Poster = { kind: "realtor"; m: Master } | { kind: "owner"; chatId: number; name: string };
export async function currentPoster(): Promise<Poster | null> {
  const m = await currentRealtor();
  if (m) return { kind: "realtor", m };
  const { currentClient } = await import("./client-auth");
  const c = await currentClient();
  return c ? { kind: "owner", chatId: c.chatId, name: c.tgName } : null;
}

/** Это объявление принадлежит автору? */
export const ownsListing = (p: Poster, l: { master_id: string | null; owner_chat_id?: number | null }) =>
  p.kind === "realtor" ? l.master_id === p.m.id : l.master_id == null && l.owner_chat_id === p.chatId;
