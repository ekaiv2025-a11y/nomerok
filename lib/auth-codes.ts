import "server-only";
import { createHash, randomInt, timingSafeEqual } from "crypto";
import { dbMode, readLocal, supabase, writeLocal } from "./db";
import { normEmail } from "./accounts";

/*
 * Одноразовые коды входа по почте: 6 цифр, живут 15 минут, 5 попыток ввода.
 * В базе хранится только хеш кода. Не больше 5 писем на один адрес за час.
 */
type Row = { email: string; hash: string; attempts: number; sends: number; first_sent_at: string; expires_at: string };
type L = { auth_codes?: Row[] };

const TTL_MIN = 15;
const MAX_SENDS = 5;
const MAX_TRIES = 5;

const hashOf = (email: string, code: string) => {
  const base = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.ADMIN_PASSWORD || "nomerok-dev";
  return createHash("sha256").update(`nomerok-code|${base}|${email}|${code}`).digest("hex");
};

async function getRow(email: string): Promise<Row | null> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("auth_codes").select("*").eq("email", email).maybeSingle();
    return r.error ? null : ((r.data as Row) ?? null);
  }
  if (dbMode() === "none") return null;
  return (((await readLocal()) as unknown as L).auth_codes ?? []).find((x) => x.email === email) ?? null;
}

async function putRow(row: Row | null, email: string): Promise<void> {
  const sb = supabase();
  if (sb) {
    if (row) await sb.from("auth_codes").upsert(row);
    else await sb.from("auth_codes").delete().eq("email", email);
    return;
  }
  const d = (await readLocal()) as unknown as L;
  d.auth_codes = [...(d.auth_codes ?? []).filter((x) => x.email !== email), ...(row ? [row] : [])];
  await writeLocal(d as never);
}

/** Новый код для адреса. null — слишком много писем за час. */
export async function issueCode(rawEmail: string): Promise<string | null> {
  const email = normEmail(rawEmail);
  const old = await getRow(email);
  const now = Date.now();
  const fresh = !old || now - Date.parse(old.first_sent_at) > 3600_000;
  if (!fresh && old!.sends >= MAX_SENDS) return null;
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await putRow(
    {
      email,
      hash: hashOf(email, code),
      attempts: 0,
      sends: fresh ? 1 : old!.sends + 1,
      first_sent_at: fresh ? new Date(now).toISOString() : old!.first_sent_at,
      expires_at: new Date(now + TTL_MIN * 60_000).toISOString(),
    },
    email,
  );
  return code;
}

/** Проверить код: ok — верный (код сгорает), bad — неверный, expired — устарел или попытки кончились. */
export async function checkCode(rawEmail: string, rawCode: string): Promise<"ok" | "bad" | "expired"> {
  const email = normEmail(rawEmail);
  const code = String(rawCode ?? "").replace(/\D/g, "");
  const row = await getRow(email);
  if (!row || Date.parse(row.expires_at) < Date.now() || row.attempts >= MAX_TRIES) return "expired";
  const a = Buffer.from(hashOf(email, code));
  const b = Buffer.from(row.hash);
  if (code.length === 6 && a.length === b.length && timingSafeEqual(a, b)) {
    // код сгорает, но счётчик писем за час сохраняем
    await putRow({ ...row, hash: "-", attempts: MAX_TRIES }, email);
    return "ok";
  }
  await putRow({ ...row, attempts: row.attempts + 1 }, email);
  return row.attempts + 1 >= MAX_TRIES ? "expired" : "bad";
}
