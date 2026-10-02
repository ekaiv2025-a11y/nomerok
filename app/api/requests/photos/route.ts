import { NextResponse } from "next/server";
import { pickImages, uploadImages } from "@/lib/upload";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-info";

/** Фото к заявке: загружаем заранее, в заявку уходят только ссылки. */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ ok: false }, { status: 400 });
  if (!rateLimit("reqphotos:" + (await clientIp()), 10)) return NextResponse.json({ ok: false }, { status: 429 });
  const files = pickImages(form, "photos", 3);
  if (!files) return NextResponse.json({ ok: false }, { status: 422 });
  try {
    return NextResponse.json({ ok: true, urls: await uploadImages("requests", files) });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
