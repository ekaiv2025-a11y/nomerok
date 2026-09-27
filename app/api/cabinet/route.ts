import { NextResponse } from "next/server";
import { adminGetMaster, adminUpdateMaster } from "@/lib/db";
import { cabinetSchema, firstErrors, langFromBody } from "@/lib/validation";
import { currentSpecialistId } from "@/lib/spec-auth";
import { notifyAdmin, escapeHtml } from "@/lib/telegram";
import { getDict } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

/** Сохранение профиля из кабинета специалиста. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const lang = langFromBody(body);
  const e = getDict(lang).errors;
  const id = await currentSpecialistId();
  if (!id) return NextResponse.json({ ok: false, error: getDict(lang).cabinet.sessionExpired }, { status: 401 });
  const m = await adminGetMaster(id);
  if (!m) return NextResponse.json({ ok: false, error: e.notFound }, { status: 404 });

  const parsed = cabinetSchema(lang).safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, fields: firstErrors(parsed.error) }, { status: 422 });
  const d = parsed.data;
  await adminUpdateMaster(id, {
    name: d.name,
    services: d.services,
    about: d.about,
    credentials: d.credentials,
    experience_years: d.experience_years ?? null,
    languages: d.languages,
    price_from: d.price_from ?? null,
    price_unit: d.price_unit,
    telegram: d.telegram,
    whatsapp: d.whatsapp,
    notify_requests: d.notify_requests,
    lang,
  });
  await notifyAdmin(`✏️ <b>${escapeHtml(d.name)}</b> обновил(а) профиль в кабинете\n${SITE_URL}/admin/masters/${id}`);
  return NextResponse.json({ ok: true });
}
