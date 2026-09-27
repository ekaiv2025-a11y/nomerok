import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminGetMaster } from "@/lib/db";
import { unarchiveMaster } from "@/lib/bot";
import { currentSpecialistId } from "@/lib/spec-auth";
import { escapeHtml, notifyAdmin } from "@/lib/telegram";
import { getDict, isLocale } from "@/lib/i18n";

/** Кабинет: вернуть профиль из архива. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const lang = isLocale(body?.lang) ? body.lang : "ru";
  const id = await currentSpecialistId();
  if (!id) return NextResponse.json({ ok: false, error: getDict(lang).cabinet.sessionExpired }, { status: 401 });
  const m = await adminGetMaster(id);
  if (!m) return NextResponse.json({ ok: false }, { status: 404 });
  if (m.archived_at) {
    await unarchiveMaster(m);
    await notifyAdmin(`↩️ <b>${escapeHtml(m.name)}</b> вернул(а) профиль из архива (кабинет)`);
    revalidatePath("/", "layout");
  }
  return NextResponse.json({ ok: true });
}
