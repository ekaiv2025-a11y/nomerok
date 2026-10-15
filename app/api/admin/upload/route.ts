import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { uploadPhoto } from "@/lib/db";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** Загрузка фото для журнала из админки (по одному файлу). */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Нет доступа" }, { status: 403 });
  const fd = await req.formData().catch(() => null);
  const file = fd?.get("file");
  if (!(file instanceof File) || !TYPES[file.type]) return NextResponse.json({ ok: false, error: "Нужно фото JPG, PNG или WEBP" }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ ok: false, error: "Фото больше 4 МБ" }, { status: 400 });
  try {
    const url = await uploadPhoto("journal", file, TYPES[file.type]);
    return NextResponse.json({ ok: true, url });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Ошибка загрузки" }, { status: 500 });
  }
}
