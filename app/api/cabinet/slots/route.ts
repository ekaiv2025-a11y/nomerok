import { NextResponse } from "next/server";
import { currentSpecialistId } from "@/lib/spec-auth";
import { adminUpdateMaster } from "@/lib/db";
import { cleanSlots } from "@/lib/slots";

export async function POST(req: Request) {
  const id = await currentSpecialistId();
  if (!id) return NextResponse.json({ ok: false }, { status: 401 });
  const { slots } = (await req.json().catch(() => ({}))) as { slots?: unknown };
  const clean = cleanSlots(slots);
  try {
    await adminUpdateMaster(id, { slots: clean, last_active_at: new Date().toISOString() });
    return NextResponse.json({ ok: true, slots: clean });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
