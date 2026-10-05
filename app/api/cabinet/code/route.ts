import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash, randomInt, timingSafeEqual } from "crypto";
import { adminListMasters } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-info";
import { readSigned, signData } from "@/lib/signed";
import { setSpecCookies } from "@/lib/spec-auth";

/*
 * Простой вход в кабинет: номер телефона → бот присылает 6-значный код → ввели код на сайте.
 * Код нигде не хранится: в cookie лежит только его хеш с подписью, живёт 10 минут, 5 попыток.
 */
const COOKIE = "nm_code";
const hash = (id: string, code: string) => createHash("sha256").update(`${id}|${code}|${process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "nomerok-dev"}`).digest("hex");

const MSG = {
  ru: (c: string) => `🔐 Код для входа в кабинет NomerOk: <b>${c}</b>\n\nНикому его не сообщайте. Если это были не вы — просто проигнорируйте.`,
  en: (c: string) => `🔐 Your NomerOk login code: <b>${c}</b>\n\nDon't share it with anyone. If it wasn't you, just ignore this.`,
  ka: (c: string) => `🔐 NomerOk-ის კაბინეტში შესვლის კოდი: <b>${c}</b>\n\nარავის უთხრათ. თუ ეს თქვენ არ იყავით — უბრალოდ ყურადღება არ მიაქციოთ.`,
};

/** Шаг 1: прислать код. */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { phone?: string; code?: string };
  if (b.code !== undefined) return verify(String(b.code));
  const phone = normalizePhone(String(b.phone ?? ""));
  if (!phone) return NextResponse.json({ ok: false, error: "phone" }, { status: 400 });
  const ip = await clientIp();
  if (!rateLimit(`code-ip:${ip}`, 10, 60 * 60 * 1000) || !rateLimit(`code-ph:${phone}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: "limit" }, { status: 429 });
  }
  const all = await adminListMasters().catch(() => []);
  const m = all.find((x) => normalizePhone(x.phone) === phone && x.status !== "rejected");
  if (!m) return NextResponse.json({ ok: false, error: "notfound" });
  if (!m.tg_chat_id) return NextResponse.json({ ok: false, error: "nobot" });
  const code = String(randomInt(100000, 1000000));
  const { sendTo } = await import("@/lib/telegram");
  const sent = await sendTo(m.tg_chat_id, (MSG[m.lang as keyof typeof MSG] ?? MSG.ru)(code)).catch(() => null);
  if (!sent) return NextResponse.json({ ok: false, error: "nobot" });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, signData("login-code", { id: m.id, h: hash(m.id, code), n: 0 }, 1 / 6), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}

/** Шаг 2: проверить код. */
async function verify(code: string) {
  const ip = await clientIp();
  if (!rateLimit(`code-verify:${ip}`, 20, 10 * 60 * 1000)) return NextResponse.json({ ok: false, error: "limit" }, { status: 429 });
  const raw = (await cookies()).get(COOKIE)?.value;
  const d = readSigned<{ id: string; h: string; n: number }>("login-code", raw);
  if (!d) return NextResponse.json({ ok: false, error: "expired" });
  const clean = code.replace(/\D/g, "");
  const good = Buffer.from(d.h);
  const got = Buffer.from(hash(d.id, clean));
  if (clean.length === 6 && good.length === got.length && timingSafeEqual(good, got)) {
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(COOKIE);
    setSpecCookies(res, d.id);
    return res;
  }
  const res = NextResponse.json({ ok: false, error: d.n >= 4 ? "expired" : "wrong" });
  if (d.n >= 4) res.cookies.delete(COOKIE);
  else
    res.cookies.set(COOKIE, signData("login-code", { id: d.id, h: d.h, n: d.n + 1 }, 1 / 6), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
  return res;
}
