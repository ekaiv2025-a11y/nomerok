import { NextResponse } from "next/server";
import { currentSpecialistId } from "@/lib/spec-auth";
import { offerStatus, saveOffer } from "@/lib/referral-db";

/** Кабинет: условия бонуса за рекомендацию. */
export async function POST(req: Request) {
  const id = await currentSpecialistId();
  if (!id) return NextResponse.json({ ok: false }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { active?: boolean; friend?: string; reward?: string; max_uses?: number; prefix?: string; restart?: boolean };
  const friend = String(b.friend ?? "").trim();
  if (b.active && friend.length < 3) return NextResponse.json({ ok: false, error: "friend" }, { status: 400 });
  try {
    await saveOffer(id, { active: !!b.active, friend, reward: String(b.reward ?? ""), max_uses: Number(b.max_uses ?? 10), prefix: String(b.prefix ?? ""), restart: !!b.restart });
  } catch (e) {
    console.error("[referral]", e);
    return NextResponse.json({ ok: false, error: "db" }, { status: 500 });
  }
  const s = await offerStatus(id);
  return NextResponse.json({ ok: true, issued: s?.issued ?? 0 });
}
