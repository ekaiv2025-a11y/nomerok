import { NextResponse } from "next/server";
import { feedbackSchema, firstErrors, langFromBody } from "@/lib/validation";
import { notifyAdmin, escapeHtml, botLink } from "@/lib/telegram";
import { randomBytes } from "crypto";
import { supabase } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-info";
import { getDict, LOCALE_NAMES } from "@/lib/i18n";

/** Форма «Написать нам»: сообщение сразу уходит владельцу в Telegram (и на почту, если настроена). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const lang = langFromBody(body);
  const e = getDict(lang).errors;
  if (!body) return NextResponse.json({ ok: false, error: e.badRequest }, { status: 400 });

  const parsed = feedbackSchema(lang).safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, fields: firstErrors(parsed.error) }, { status: 422 });
  const d = parsed.data;
  if (d.website || (d.startedAt && Date.now() - d.startedAt < 2500)) return NextResponse.json({ ok: true });
  if (!rateLimit("fb:" + (await clientIp()), 5)) return NextResponse.json({ ok: false, error: e.tooMany }, { status: 429 });

  const sent = await notifyAdmin(
    [
      "✉️ <b>Сообщение с сайта</b>",
      `<b>От:</b> ${escapeHtml(d.name || "—")}`,
      `<b>Связь:</b> ${escapeHtml(d.contact)}`,
      `<b>Язык сайта:</b> ${LOCALE_NAMES[lang]}`,
      "",
      escapeHtml(d.message),
      "",
      "<i>Ответить: по контакту выше. Если человек подключит Telegram, придёт сообщение «🔗 …» — на него можно ответить прямо через бота.</i>",
    ].join("\n"),
  );
  if (!sent) return NextResponse.json({ ok: false, error: e.unavailable }, { status: 500 });
  // Чтобы ответить через бота: человек подключает Telegram по ссылке t.me/бот?start=fb_КОД
  const token = randomBytes(6).toString("hex");
  const clip = (x: string) => x.replace(/[|\n]/g, " ").slice(0, 80);
  await supabase()?.from("_nm_once").insert({ key: `fb:${token}|${clip(d.name || "—")}|${clip(d.contact)}` }).then(() => null, () => null);
  const tg = await botLink(`fb_${token}`).catch(() => null);
  return NextResponse.json({ ok: true, tg });
}
