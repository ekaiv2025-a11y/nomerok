import { NextResponse } from "next/server";
import { recordSearch } from "@/lib/site-stats";
import { visitorId } from "@/lib/request-info";
import { isAdmin } from "@/lib/admin-auth";
import { rateLimit } from "@/lib/rate-limit";

/** Что искали в каталоге и сколько нашли — чтобы понимать, каких специалистов не хватает. */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const q = typeof b?.q === "string" ? b.q.trim() : "";
  if (q.length < 3 || q.length > 80 || /bot|crawl|spider/i.test(req.headers.get("user-agent") ?? "") || (await isAdmin())) return NextResponse.json({ ok: true });
  const v = await visitorId();
  if (!rateLimit("search:" + v, 20)) return NextResponse.json({ ok: true });
  const cat = typeof b.cat === "string" ? b.cat.slice(0, 30) : null;
  await recordSearch(q, cat, Math.max(0, Math.min(999, Number(b.found) || 0)), v).catch(() => null);
  return NextResponse.json({ ok: true });
}
