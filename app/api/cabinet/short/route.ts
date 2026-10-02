import { NextResponse } from "next/server";
import { currentSpecialistId } from "@/lib/spec-auth";
import { setShort } from "@/lib/short-link";

export async function POST(req: Request) {
  const id = await currentSpecialistId();
  if (!id) return NextResponse.json({ ok: false }, { status: 401 });
  const { short } = (await req.json().catch(() => ({}))) as { short?: string };
  try {
    const err = await setShort(id, String(short ?? ""));
    return err ? NextResponse.json({ ok: false, error: err }, { status: 422 }) : NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 500 });
  }
}
