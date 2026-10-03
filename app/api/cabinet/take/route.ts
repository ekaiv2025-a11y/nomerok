import { NextResponse } from "next/server";
import { currentSpecialistId } from "@/lib/spec-auth";
import { adminGetMaster, getRequest } from "@/lib/db";
import { takeRequest } from "@/lib/bot";

/** Отклик на заявку из кабинета на сайте. */
export async function POST(req: Request) {
  const id = await currentSpecialistId();
  if (!id) return NextResponse.json({ ok: false, error: "login" }, { status: 401 });
  const { requestId } = (await req.json().catch(() => ({}))) as { requestId?: string };
  const [m, r] = await Promise.all([adminGetMaster(id), requestId ? getRequest(requestId) : null]);
  if (!m) return NextResponse.json({ ok: false, error: "login" }, { status: 401 });
  if (!r) return NextResponse.json({ ok: false, error: "gone" }, { status: 404 });
  const err = await takeRequest(m, r, { notifyInTelegram: true });
  return err ? NextResponse.json({ ok: false, error: err }, { status: 409 }) : NextResponse.json({ ok: true });
}
