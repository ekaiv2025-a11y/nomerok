import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminGetMaster, adminUpdateMaster } from "@/lib/db";
import { uploadImage } from "@/lib/reviews-db";
import { currentSpecialistId } from "@/lib/spec-auth";
import { getDict, isLocale } from "@/lib/i18n";
import type { PortfolioItem } from "@/lib/types";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_FILE = 5 * 1024 * 1024;
const MAX_PORTFOLIO_ITEMS = 12;

async function me(lang: "ru" | "en" | "ka") {
  const id = await currentSpecialistId();
  if (!id) return { error: NextResponse.json({ ok: false, error: getDict(lang).cabinet.sessionExpired }, { status: 401 }) };
  const m = await adminGetMaster(id);
  if (!m) return { error: NextResponse.json({ ok: false }, { status: 404 }) };
  return { m };
}

async function save(id: string, items: PortfolioItem[]) {
  await adminUpdateMaster(id, { portfolio: items });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, portfolio: items });
}

/** Добавить фото работы. */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const l = form?.get("lang");
  const lang = isLocale(l) ? l : "ru";
  const t = getDict(lang).cabinet;
  const r = await me(lang);
  if (r.error) return r.error;
  const items = Array.isArray(r.m.portfolio) ? r.m.portfolio : [];
  if (items.length >= MAX_PORTFOLIO_ITEMS) return NextResponse.json({ ok: false, error: t.portfolioFull }, { status: 400 });
  const file = form?.get("photo");
  if (!(file instanceof Blob) || !TYPES[file.type]) return NextResponse.json({ ok: false, error: t.photoType }, { status: 400 });
  if (file.size > MAX_FILE) return NextResponse.json({ ok: false, error: t.photoSize }, { status: 400 });
  try {
    const url = await uploadImage(`portfolio/${r.m.id}`, file, TYPES[file.type]);
    const caption = String(form?.get("caption") ?? "").trim().slice(0, 120);
    return save(r.m.id, [...items, { url, caption }]);
  } catch (e) {
    console.error("[portfolio]", e);
    return NextResponse.json({ ok: false, error: t.photoError }, { status: 500 });
  }
}

/** Изменить подпись или порядок: { index, caption } или { from, to }. */
export async function PATCH(req: Request) {
  const body = await req.json().catch(() => null);
  const lang = isLocale(body?.lang) ? body.lang : "ru";
  const r = await me(lang);
  if (r.error) return r.error;
  const items = [...(r.m.portfolio ?? [])];
  if (Number.isInteger(body?.index) && items[body.index]) {
    items[body.index] = { ...items[body.index], caption: String(body.caption ?? "").trim().slice(0, 120) };
  } else if (Number.isInteger(body?.from) && Number.isInteger(body?.to) && items[body.from] && body.to >= 0 && body.to < items.length) {
    const [x] = items.splice(body.from, 1);
    items.splice(body.to, 0, x);
  } else return NextResponse.json({ ok: false }, { status: 400 });
  return save(r.m.id, items);
}

/** Удалить фото: { index }. */
export async function DELETE(req: Request) {
  const body = await req.json().catch(() => null);
  const lang = isLocale(body?.lang) ? body.lang : "ru";
  const r = await me(lang);
  if (r.error) return r.error;
  const items = [...(r.m.portfolio ?? [])];
  if (!Number.isInteger(body?.index) || !items[body.index]) return NextResponse.json({ ok: false }, { status: 400 });
  items.splice(body.index, 1);
  return save(r.m.id, items);
}
