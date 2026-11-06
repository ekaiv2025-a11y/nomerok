import { NextResponse } from "next/server";
import { runFollowups } from "@/lib/bot";
import { listPublishedMasters } from "@/lib/db";
import { translateStale } from "@/lib/translate-db";
import { funnelSummary, pruneEvents, summaryText } from "@/lib/funnel";
import { notifyAdmin } from "@/lib/telegram";
import { applyCommittedEnrichment } from "@/lib/places-enrich-auto";
import { applyStaffImport } from "@/lib/staff-import";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

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
    const followups = await runFollowups();
    // автоперевод анкет, которые ещё не переведены или изменились
    const translations = await translateStale(await listPublishedMasters().catch(() => []), 60).catch((e) => ({ error: String(e) }));
    // воронки: чистим старое; по понедельникам — сводка владельцу в Telegram
    await pruneEvents().catch(() => null);
    // карточки мест, которые наполнила задача по расписанию
    const placesEnriched = await applyCommittedEnrichment().catch((e) => ({ error: String(e) }));
    // анкеты врачей по сайтам клиник (после описаний мест — чтобы у клиники уже были телефон и адрес)
    const staffImported = await applyStaffImport().catch((e) => ({ error: String(e) }));
    let funnel = false;
    if (new Date().toLocaleDateString("en-US", { weekday: "short", timeZone: "Asia/Tbilisi" }) === "Mon") {
      const s = await funnelSummary(7).catch(() => null);
      if (s && s.total > 0) funnel = await notifyAdmin(summaryText(s)).catch(() => false);
    }
    return NextResponse.json({ ok: true, ...followups, translations, funnel, placesEnriched, staffImported });
  } catch (e) {
    console.error("[cron]", e);
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
