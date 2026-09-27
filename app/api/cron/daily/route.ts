import { NextResponse } from "next/server";
import { runFollowups } from "@/lib/bot";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Раз в день (настройка в vercel.json): напоминания клиентам —
 * «никто не взял заявку», «удалось договориться?», «оставьте отзыв».
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  const ua = req.headers.get("user-agent") ?? "";
  const ok = secret ? auth === `Bearer ${secret}` : ua.startsWith("vercel-cron/");
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, ...(await runFollowups()) });
  } catch (e) {
    console.error("[cron]", e);
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
