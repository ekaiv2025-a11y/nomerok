import { NextResponse } from "next/server";
import { currentSpecialistId } from "@/lib/spec-auth";
import { removeEventOfMaster } from "@/lib/events-db";

/** Специалист снимает своё мероприятие из афиши (из кабинета). */
export async function POST(req: Request) {
  const id = await currentSpecialistId().catch(() => null);
  if (!id) return NextResponse.json({ ok: false }, { status: 401 });
  const b = await req.json().catch(() => null);
  if (!b || typeof b.id !== "string") return NextResponse.json({ ok: false }, { status: 400 });
  await removeEventOfMaster(id, b.id);
  return NextResponse.json({ ok: true });
}
