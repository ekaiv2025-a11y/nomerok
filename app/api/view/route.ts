import { NextResponse } from "next/server";
import { adminGetMaster } from "@/lib/db";
import { recordProfileView } from "@/lib/stats";
import { visitorId } from "@/lib/request-info";
import { currentSpecialistId } from "@/lib/spec-auth";
import { isDemoSlug } from "@/lib/demo";

const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|telegram|whatsapp|headless|lighthouse/i;

/** Отмечает просмотр профиля (вызывается из браузера, чтобы не считать роботов). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const id = typeof body?.masterId === "string" ? body.masterId : "";
  if (!/^[0-9a-f-]{36}$/i.test(id) || BOTS.test(req.headers.get("user-agent") ?? "")) return NextResponse.json({ ok: true });
  // Свои просмотры специалисту не считаем
  if ((await currentSpecialistId()) === id) return NextResponse.json({ ok: true });
  const m = await adminGetMaster(id).catch(() => null);
  if (!m || m.status !== "published" || isDemoSlug(m.slug)) return NextResponse.json({ ok: true });
  await recordProfileView(id, await visitorId()).catch(() => null);
  return NextResponse.json({ ok: true });
}
