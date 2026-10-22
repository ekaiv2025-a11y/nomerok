import { NextResponse } from "next/server";
import { getListing, updateListing } from "@/lib/realty-db";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-info";
import { notifyAdmin, escapeHtml } from "@/lib/telegram";
import { SITE_URL } from "@/lib/site";

const REASONS: Record<string, string> = { gone: "уже сдано/продано", wrong: "неверные данные", fake: "похоже на обман", other: "другое" };

/** Жалоба на объявление. 3 жалобы — объявление скрывается до проверки. */
export async function POST(req: Request) {
  const fd = await req.formData().catch(() => null);
  const id = String(fd?.get("id") ?? "");
  const lang = ["ru", "en", "ka"].includes(String(fd?.get("lang"))) ? String(fd?.get("lang")) : "ru";
  const reason = REASONS[String(fd?.get("reason") ?? "")] ?? "другое";
  const l = await getListing(id);
  const back = new URL(`/${lang}/realty/${id}?reported=1`, req.url);
  if (!l || !rateLimit("report:" + (await clientIp()) + id, 1, 24 * 3600_000)) return NextResponse.redirect(back, 303);
  const reports = (l.reports ?? 0) + 1;
  await updateListing(l.id, { reports, ...(reports >= 3 ? { status: "hidden" as const } : {}) });
  await notifyAdmin(`🚩 Жалоба на объявление (${escapeHtml(reason)}), всего жалоб: ${reports}${reports >= 3 ? " — объявление скрыто" : ""}\n«${escapeHtml(l.title)}»\n${SITE_URL}/ru/realty/${l.id}\n${SITE_URL}/admin/realty`);
  return NextResponse.redirect(back, 303);
}
