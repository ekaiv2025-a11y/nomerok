import { NextResponse } from "next/server";
import { currentSpecialistId } from "@/lib/spec-auth";
import { adminUpdateMaster } from "@/lib/db";

/** Кабинет: подписка на общие заявки. */
export async function POST(req: Request) {
  const id = await currentSpecialistId();
  if (!id) return NextResponse.json({ ok: false }, { status: 401 });
  const { on } = (await req.json().catch(() => ({}))) as { on?: boolean };
  await adminUpdateMaster(id, { notify_requests: !!on });
  return NextResponse.json({ ok: true });
}
