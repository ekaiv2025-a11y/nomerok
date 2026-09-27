import { NextResponse } from "next/server";
import { getReview, updateReview } from "@/lib/reviews-db";
import { currentSpecialistId } from "@/lib/spec-auth";
import { getDict, isLocale } from "@/lib/i18n";
import { revalidatePath } from "next/cache";

/** Ответ специалиста на отзыв (из кабинета). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const lang = isLocale(body?.lang) ? body.lang : "ru";
  const d = getDict(lang);
  const id = await currentSpecialistId();
  if (!id) return NextResponse.json({ ok: false, error: d.cabinet.sessionExpired }, { status: 401 });
  const rv = body?.reviewId ? await getReview(String(body.reviewId)).catch(() => null) : null;
  if (!rv || rv.master_id !== id || rv.status !== "published") return NextResponse.json({ ok: false, error: d.errors.badRequest }, { status: 404 });
  const reply = String(body.reply ?? "").trim().slice(0, 1500);
  await updateReview(rv.id, { reply, reply_at: reply ? new Date().toISOString() : null });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
