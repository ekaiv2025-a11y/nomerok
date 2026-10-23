import { NextResponse } from "next/server";
import { adminGetMaster, uploadPhoto } from "@/lib/db";
import { currentSpecialistId } from "@/lib/spec-auth";
import { addBoost, boostState } from "@/lib/boosts-db";
import { escapeHtml, notifyAdmin } from "@/lib/telegram";
import { SITE_URL } from "@/lib/site";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** «Поднимем анкету за сторис»: специалист присылает скриншот сторис со своей карточкой. */
export async function POST(req: Request) {
  const id = await currentSpecialistId();
  if (!id) return NextResponse.json({ ok: false, error: "auth" }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("shot");
  if (!(file instanceof Blob) || !TYPES[file.type] || file.size > 8 * 1024 * 1024) return NextResponse.json({ ok: false, error: "type" }, { status: 400 });
  const m = await adminGetMaster(id);
  if (!m || m.status !== "published") return NextResponse.json({ ok: false, error: "status" }, { status: 400 });
  const st = await boostState(id);
  if (!st.canSend) return NextResponse.json({ ok: false, error: "later" }, { status: 429 });
  try {
    const url = await uploadPhoto(id, file, TYPES[file.type]);
    await addBoost(id, url);
    await notifyAdmin(`📈 <b>${escapeHtml(m.name)}</b> выложил(а) карточку в сторис и прислал(а) скриншот.\nПроверить и поднять анкету: ${SITE_URL}/admin/boosts`).catch(() => null);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[boost]", e);
    return NextResponse.json({ ok: false, error: "db" }, { status: 500 });
  }
}
