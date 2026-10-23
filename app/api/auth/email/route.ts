import { NextResponse } from "next/server";
import { AUTH } from "@/lib/auth-text";
import { issueCode, checkCode } from "@/lib/auth-codes";
import { getAccount, loginAccount, normEmail, setAccountEmail, validEmail, type Account } from "@/lib/accounts";
import { applyCookies, asIntent, asLang, currentAccount, finishLogin, safeNext } from "@/lib/account-auth";
import { mailEnabled, mailLayout, sendMail } from "@/lib/mail";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-info";

/** Вход по почте: send — прислать код, verify — проверить код и войти. */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const lang = asLang(b.lang);
  const t = AUTH[lang];
  const email = String(b.email ?? "").trim();
  if (!validEmail(email)) return NextResponse.json({ ok: false, error: t.badEmail }, { status: 422 });
  if (!mailEnabled()) return NextResponse.json({ ok: false, error: t.mailOff }, { status: 503 });
  const ip = await clientIp();

  if (b.action === "send") {
    if (!rateLimit("authmail:" + ip, 20)) return NextResponse.json({ ok: false, error: t.tooMany }, { status: 429 });
    const code = await issueCode(email);
    if (!code) return NextResponse.json({ ok: false, error: t.tooMany }, { status: 429 });
    const ok = await sendMail({ to: normEmail(email), subject: t.subject(code), html: mailLayout({ title: t.mailTitle, bodyHtml: t.mailBody(code) }) });
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ ok: false, error: t.failed }, { status: 502 });
  }

  if (b.action === "verify") {
    if (!rateLimit("authcode:" + ip, 20)) return NextResponse.json({ ok: false, error: t.tooMany }, { status: 429 });
    const res = await checkCode(email, String(b.code ?? ""));
    if (res !== "ok") return NextResponse.json({ ok: false, error: res === "bad" ? t.badCode : t.expired, expired: res === "expired" }, { status: 422 });
    const intent = asIntent(b.intent);
    // Уже вошёл (например, через Facebook без почты) и подтверждает почту для заявок — добавляем её к тому же аккаунту
    const cur = await currentAccount();
    const curAcc = cur ? await getAccount(cur.id) : null;
    let acc: Account | null = curAcc && !curAcc.email && (await setAccountEmail(curAcc.id, email)) ? { ...curAcc, email: normEmail(email) } : null;
    if (!acc) acc = await loginAccount({ provider: "email", key: email, email, emailVerified: true, name: String(b.name ?? "").trim(), lang });
    const done = await finishLogin(acc!, intent, lang, safeNext(b.next, lang), typeof b.claim === "string" ? b.claim : null);
    return applyCookies(NextResponse.json({ ok: true, url: done.url }), done.cookies);
  }
  return NextResponse.json({ ok: false }, { status: 400 });
}
