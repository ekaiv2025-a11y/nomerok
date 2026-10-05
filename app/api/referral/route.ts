import { NextResponse } from "next/server";
import { getPublishedMasterBySlug, adminGetMaster } from "@/lib/db";
import { findCode, issueCode, liveOffer } from "@/lib/referral-db";
import { currentClient } from "@/lib/client-auth";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-info";
import { SITE_URL } from "@/lib/site";
import { isLocale } from "@/lib/i18n";

/** Друг открыл ссылку с ?ref=КОД — проверяем код и отдаём, кто рекомендует и какой бонус. */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const code = u.searchParams.get("code") ?? "";
  const slug = u.searchParams.get("slug") ?? "";
  const ref = await findCode(code).catch(() => null);
  const m = slug ? await getPublishedMasterBySlug(slug).catch(() => null) : null;
  if (!ref || !m || ref.master_id !== m.id) return NextResponse.json({ ok: false });
  const offer = await liveOffer(m.id);
  // Код уже выдан — бонус по нему действует, даже если новые коды закончились
  const { getOffer } = await import("@/lib/referral-db");
  const o = offer?.offer ?? (await getOffer(m.id));
  if (!o || !o.active) return NextResponse.json({ ok: false });
  return NextResponse.json({ ok: true, code: ref.code, name: ref.name, friend: o.friend });
}

/** Клиент хочет порекомендовать специалиста — выдаём личный код. */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { slug?: string; name?: string; lang?: string };
  const lang = isLocale(b.lang) ? b.lang : "ru";
  const name = String(b.name ?? "").trim().replace(/\s+/g, " ").slice(0, 40);
  if (name.length < 2) return NextResponse.json({ ok: false, error: "name" }, { status: 400 });
  const ip = await clientIp();
  if (!rateLimit(`ref:${ip}`, 6, 60 * 60 * 1000)) return NextResponse.json({ ok: false, error: "limit" }, { status: 429 });
  const m = await getPublishedMasterBySlug(String(b.slug ?? "")).catch(() => null);
  if (!m || m.demo) return NextResponse.json({ ok: false }, { status: 404 });
  const me = await currentClient().catch(() => null);
  const r = await issueCode(m.id, name, me?.chatId ?? null).catch((e) => {
    console.error("[referral]", e);
    return null;
  });
  if (!r) return NextResponse.json({ ok: false, error: "ended" });
  const offer = await liveOffer(m.id);
  if (r.fresh) {
    // Специалисту — чтобы знал, какие коды ждать
    const full = await adminGetMaster(m.id).catch(() => null);
    if (full?.tg_chat_id) {
      const { sendTo, escapeHtml } = await import("@/lib/telegram");
      await sendTo(
        full.tg_chat_id,
        `🎁 <b>${escapeHtml(name)}</b> рекомендует вас другу.\nКод: <code>${r.ref.code}</code>\n\nЕсли новый клиент назовёт этот код — дайте ему бонус, который вы указали в кабинете.`,
      ).catch(() => null);
    }
  }
  return NextResponse.json({
    ok: true,
    code: r.ref.code,
    url: `${SITE_URL}/${lang}/master/${m.slug}?ref=${encodeURIComponent(r.ref.code)}`,
    friend: offer?.offer.friend ?? "",
  });
}
