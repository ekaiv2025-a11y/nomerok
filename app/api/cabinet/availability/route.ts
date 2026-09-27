import { NextResponse } from "next/server";
import { adminGetMaster, adminUpdateMaster } from "@/lib/db";
import { currentSpecialistId } from "@/lib/spec-auth";
import { getDict, isLocale } from "@/lib/i18n";
import { daysFromToday, todayTbilisi } from "@/lib/availability";
import { escapeHtml, notifyAdmin } from "@/lib/telegram";
import { revalidatePath } from "next/cache";

/** Кабинет: «принимаю заявки» / «пауза до даты» / «пауза без срока». */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const lang = isLocale(body?.lang) ? body.lang : "ru";
  const d = getDict(lang);
  const id = await currentSpecialistId();
  if (!id) return NextResponse.json({ ok: false, error: d.cabinet.sessionExpired }, { status: 401 });
  const m = await adminGetMaster(id);
  if (!m) return NextResponse.json({ ok: false, error: d.errors.notFound }, { status: 404 });

  if (body?.away) {
    const until = typeof body.until === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.until) ? body.until : null;
    if (until && (until < todayTbilisi() || until > daysFromToday(366))) return NextResponse.json({ ok: false, error: d.errors.badRequest }, { status: 400 });
    await adminUpdateMaster(id, { is_away: true, away_until: until });
    await notifyAdmin(`⏸ <b>${escapeHtml(m.name)}</b> поставил(а) паузу ${until ? `до ${until}` : "без срока"}`);
  } else {
    await adminUpdateMaster(id, { is_away: false, away_until: null });
    if (m.is_away) await notifyAdmin(`▶️ <b>${escapeHtml(m.name)}</b> снова принимает заявки`);
  }
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
