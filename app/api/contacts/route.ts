import { NextResponse } from "next/server";
import { z } from "zod";
import { revealContacts } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, visitorId } from "@/lib/request-info";

const schema = z.object({ masterId: z.string().uuid() });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  // Защита от сбора телефонов роботами
  if (!rateLimit("contacts:" + (await clientIp()), 30, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: "Слишком много запросов. Попробуйте позже." }, { status: 429 });
  }
  try {
    const c = await revealContacts(parsed.data.masterId, await visitorId());
    if (!c) return NextResponse.json({ ok: false, error: "Специалист не найден" }, { status: 404 });
    return NextResponse.json({ ok: true, phone: c.phone, telegram: c.telegram, whatsapp: c.whatsapp });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Не получилось загрузить контакты" }, { status: 500 });
  }
}
