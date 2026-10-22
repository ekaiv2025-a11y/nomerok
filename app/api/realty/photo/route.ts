import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/reviews-db";
import { currentRealtor } from "@/lib/realty-auth";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** Фото для объявления (по одному): возвращает ссылку. */
export async function POST(req: Request) {
  const m = await currentRealtor();
  if (!m) return NextResponse.json({ ok: false, error: "Войдите в кабинет риелтора" }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("photo");
  if (!(file instanceof Blob) || !TYPES[file.type]) return NextResponse.json({ ok: false, error: "Нужно фото JPG, PNG или WEBP" }, { status: 400 });
  if (file.size > 6 * 1024 * 1024) return NextResponse.json({ ok: false, error: "Фото слишком большое" }, { status: 400 });
  try {
    return NextResponse.json({ ok: true, url: await uploadImage(`realty/${m.id}`, file, TYPES[file.type]) });
  } catch (e) {
    console.error("[realty photo]", e);
    return NextResponse.json({ ok: false, error: "Не получилось загрузить фото" }, { status: 500 });
  }
}
