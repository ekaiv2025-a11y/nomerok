import "server-only";
import { createHash, createHmac, timingSafeEqual } from "crypto";

/*
 * «Заполнить анкету через Telegram»: бот получает номер (кнопка «Поделиться номером»),
 * ник и фото и отдаёт ссылку на сайт с подписанным токеном. В базе ничего не хранится —
 * данные лежат в самом токене, подпись не даёт их подделать. Живёт 24 часа.
 */
export type JoinPrefill = {
  chatId: number;
  phone: string;
  username: string | null;
  name: string;
  photoFileId: string | null;
};

const HOURS = 24;

function secret(): string {
  const base = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.ADMIN_PASSWORD || "nomerok-dev";
  return createHash("sha256").update("nomerok-join|" + base).digest("hex");
}

function sig(body: string): string {
  return createHmac("sha256", secret()).update(body).digest("base64url").slice(0, 32);
}

export function makeJoinToken(p: JoinPrefill): string {
  const body = Buffer.from(
    JSON.stringify({ c: p.chatId, p: p.phone, u: p.username, n: p.name, f: p.photoFileId, e: Math.floor(Date.now() / 1000) + HOURS * 3600 }),
  ).toString("base64url");
  return `${body}.${sig(body)}`;
}

export function readJoinToken(token: string | null | undefined): JoinPrefill | null {
  if (!token || typeof token !== "string") return null;
  const [body, s] = token.split(".");
  if (!body || !s) return null;
  const good = sig(body);
  if (good.length !== s.length || !timingSafeEqual(Buffer.from(good), Buffer.from(s))) return null;
  try {
    const d = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!d.e || d.e < Date.now() / 1000) return null;
    return { chatId: Number(d.c), phone: String(d.p), username: d.u ?? null, name: String(d.n ?? ""), photoFileId: d.f ?? null };
  } catch {
    return null;
  }
}
