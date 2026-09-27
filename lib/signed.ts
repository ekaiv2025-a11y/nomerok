import "server-only";
import { createHash, createHmac, timingSafeEqual } from "crypto";

/*
 * Подписанные ссылки: данные лежат прямо в ссылке, подпись не даёт их подделать.
 * kind разделяет назначения (ссылка на отзыв не подойдёт для чего-то ещё).
 */
function secret(kind: string): string {
  const base = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.ADMIN_PASSWORD || "nomerok-dev";
  return createHash("sha256").update(`nomerok-${kind}|${base}`).digest("hex");
}

export function signData(kind: string, data: Record<string, unknown>, hours: number): string {
  const body = Buffer.from(JSON.stringify({ ...data, _e: Math.floor(Date.now() / 1000) + hours * 3600 })).toString("base64url");
  const sig = createHmac("sha256", secret(kind)).update(body).digest("base64url").slice(0, 32);
  return `${body}.${sig}`;
}

export function readSigned<T>(kind: string, token: string | null | undefined): T | null {
  if (!token || typeof token !== "string") return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const good = createHmac("sha256", secret(kind)).update(body).digest("base64url").slice(0, 32);
  if (good.length !== sig.length || !timingSafeEqual(Buffer.from(good), Buffer.from(sig))) return null;
  try {
    const d = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!d._e || d._e < Date.now() / 1000) return null;
    return d as T;
  } catch {
    return null;
  }
}

/** Ссылка на отзыв: кто пишет (Telegram) и о ком. */
export type ReviewTicket = { m: string; c: number; n: string; r: string | null };
export const REVIEW_KIND = "review";
export const reviewToken = (t: ReviewTicket) => signData(REVIEW_KIND, t, 24 * 7);
export const readReviewToken = (t: string | null | undefined) => readSigned<ReviewTicket>(REVIEW_KIND, t);
