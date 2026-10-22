import { NextResponse } from "next/server";
import { recordVisit, sourceOf } from "@/lib/site-stats";
import { visitorId } from "@/lib/request-info";
import { isAdmin } from "@/lib/admin-auth";

const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|telegram|whatsapp|headless|lighthouse/i;

/** Посетитель открыл сайт (из браузера; роботов и админа не считаем). */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || BOTS.test(req.headers.get("user-agent") ?? "") || (await isAdmin())) return NextResponse.json({ ok: true });
  const host = new URL(req.url).hostname.replace(/^www\./, "");
  const src = sourceOf(String(b.ref ?? ""), String(b.utm ?? ""), host);
  await recordVisit(await visitorId(), src, String(b.path ?? "")).catch(() => null);
  return NextResponse.json({ ok: true });
}
