import { isFakePhone } from "@/lib/validation";
import { NextResponse } from "next/server";
import { z } from "zod";
import { revealContacts } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, visitorId } from "@/lib/request-info";
import { langFromBody } from "@/lib/validation";
import { getDict } from "@/lib/i18n";

const schema = z.object({ masterId: z.string().uuid() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const e = getDict(langFromBody(body)).errors;
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: e.badRequest }, { status: 400 });

  // Защита от сбора телефонов роботами
  if (!rateLimit("contacts:" + (await clientIp()), 30, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: e.tooManyContacts }, { status: 429 });
  }
  try {
    const c = await revealContacts(parsed.data.masterId, await visitorId());
    if (!c) return NextResponse.json({ ok: false, error: e.notFound }, { status: 404 });
    // Ненастоящий номер (00 00 00 и т.п.) не показываем — клиенту даём Telegram/Instagram
    const phone = isFakePhone(c.phone) ? null : c.phone;
    return NextResponse.json({ ok: true, phone, telegram: c.telegram, whatsapp: c.whatsapp, instagram: c.instagram });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: e.loadContacts }, { status: 500 });
  }
}
