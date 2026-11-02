import { NextResponse } from "next/server";
import { EVENTS, isFunnel, recordEvents, type FunnelEvent } from "@/lib/funnel";
import { visitorId } from "@/lib/request-info";
import { isAdmin } from "@/lib/admin-auth";
import { rateLimit } from "@/lib/rate-limit";

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : undefined);

/** Шаги в формах (см. lib/funnel.ts). Приходят пачкой через sendBeacon. */
export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  if (/bot|crawl|spider|headless|lighthouse/i.test(ua) || (await isAdmin())) return NextResponse.json({ ok: true });
  const b = await req.json().catch(() => null);
  const list = Array.isArray(b?.e) ? b.e.slice(0, 20) : [];
  const sid = clip(b?.sid, 40);
  if (!sid || !list.length) return NextResponse.json({ ok: true });
  const v = await visitorId();
  if (!rateLimit("ev:" + v, 300, 60 * 60 * 1000)) return NextResponse.json({ ok: true });
  const m = /Mobi|Android|iPhone/i.test(ua);
  const now = new Date().toISOString();
  const rows: FunnelEvent[] = [];
  for (const x of list) {
    if (!EVENTS.includes(x?.ev) || !isFunnel(x?.f)) continue;
    const p = x.p && typeof x.p === "object" ? x.p : {};
    const props: Record<string, unknown> = { m };
    if (Array.isArray(p.fields)) props.fields = p.fields.filter((f: unknown) => typeof f === "string").slice(0, 10).map((f: string) => f.slice(0, 40));
    if (Array.isArray(p.msgs)) props.msgs = p.msgs.slice(0, 10).map((m: unknown) => String(m).slice(0, 120));
    for (const k of ["msg", "field", "name", "answer"]) if (clip(p[k], 120)) props[k] = clip(p[k], 120);
    if (clip(p.text, 300)) props.text = clip(p.text, 300);
    rows.push({ created_at: now, visitor: v, sid, ev: x.ev, funnel: x.f, path: clip(x.path, 200) ?? null, props });
  }
  await recordEvents(rows).catch((e) => console.error("[ev]", e));
  return NextResponse.json({ ok: true });
}
