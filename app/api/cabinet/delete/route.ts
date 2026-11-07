import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminGetMaster } from "@/lib/db";
import { currentSpecialistId } from "@/lib/spec-auth";
import { selfDeleteMaster } from "@/lib/master-delete";
import { getDict, isLocale } from "@/lib/i18n";

/** Кабинет: специалист удаляет свою анкету (30 дней можно восстановить). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const lang = isLocale(body?.lang) ? body.lang : "ru";
  const id = await currentSpecialistId();
  if (!id) return NextResponse.json({ ok: false, error: getDict(lang).cabinet.sessionExpired }, { status: 401 });
  if (body?.confirm !== "delete") return NextResponse.json({ ok: false }, { status: 400 });
  const m = await adminGetMaster(id);
  if (!m) return NextResponse.json({ ok: false }, { status: 404 });
  if (m.archived_reason !== "deleted") await selfDeleteMaster(m, String(body?.reason ?? ""), String(body?.note ?? "").trim());
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
