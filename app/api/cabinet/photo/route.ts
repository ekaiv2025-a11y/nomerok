import { NextResponse } from "next/server";
import { adminGetMaster, adminUpdateMaster, uploadPhoto } from "@/lib/db";
import { currentSpecialistId } from "@/lib/spec-auth";
import { getDict, isLocale } from "@/lib/i18n";
import { withY } from "@/lib/photo-pos";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX = 5 * 1024 * 1024;

/** Загрузка фото из кабинета специалиста. */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const l = form?.get("lang");
  const t = getDict(isLocale(l) ? l : "ru").cabinet;
  const id = await currentSpecialistId();
  if (!id) return NextResponse.json({ ok: false, error: t.sessionExpired }, { status: 401 });
  const file = form?.get("photo");
  if (!(file instanceof Blob) || !TYPES[file.type]) return NextResponse.json({ ok: false, error: t.photoType }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ ok: false, error: t.photoSize }, { status: 400 });
  if (!(await adminGetMaster(id))) return NextResponse.json({ ok: false }, { status: 404 });
  try {
    const url = await uploadPhoto(id, file, TYPES[file.type]);
    await adminUpdateMaster(id, { photo_url: url });
    return NextResponse.json({ ok: true, url });
  } catch (e) {
    console.error("[photo]", e);
    return NextResponse.json({ ok: false, error: t.photoError }, { status: 500 });
  }
}

/** «Подвинуть фото»: сохраняем положение фото в рамке. */
export async function PATCH(req: Request) {
  const id = await currentSpecialistId();
  if (!id) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const y = Number(body?.y);
  if (!Number.isFinite(y)) return NextResponse.json({ ok: false }, { status: 400 });
  const m = await adminGetMaster(id);
  if (!m?.photo_url) return NextResponse.json({ ok: false }, { status: 404 });
  const url = withY(m.photo_url, y);
  await adminUpdateMaster(id, { photo_url: url });
  return NextResponse.json({ ok: true, url });
}
