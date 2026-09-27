import { NextResponse } from "next/server";
import { adminGetMaster, adminUpdateMaster } from "@/lib/db";
import { cabinetSchema, firstErrors, langFromBody } from "@/lib/validation";
import { currentSpecialistId } from "@/lib/spec-auth";
import { notifyAdmin, escapeHtml } from "@/lib/telegram";
import { getDict } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import { CATEGORY_IDS } from "@/lib/categories";
import { MAX_EXTRA_CATEGORIES } from "@/lib/availability";

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
  // Дополнительные направления: только существующие, не основное, не больше 3
  const extra = Array.isArray(body.extra_categories)
    ? [...new Set((body.extra_categories as unknown[]).map(String))].filter((c) => (CATEGORY_IDS as readonly string[]).includes(c) && c !== m.category)
    : [];
  if (extra.length > MAX_EXTRA_CATEGORIES) return NextResponse.json({ ok: false, fields: { extra_categories: getDict(lang).cabinet.extraMax } }, { status: 422 });
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
    ...(Array.isArray(body.extra_categories) ? { extra_categories: extra } : {}),
    lang,
  });
  await notifyAdmin(`✏️ <b>${escapeHtml(d.name)}</b> обновил(а) профиль в кабинете\n${SITE_URL}/admin/masters/${id}`);
  return NextResponse.json({ ok: true });
}
