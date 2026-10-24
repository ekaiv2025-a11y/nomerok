import { NextResponse } from "next/server";
import { currentSpecialistId } from "@/lib/spec-auth";
import { offerStatus, saveOffer } from "@/lib/referral-db";

/** Кабинет: условия бонуса за рекомендацию. */
export async function POST(req: Request) {
  const id = await currentSpecialistId();
  if (!id) return NextResponse.json({ ok: false }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { active?: boolean; friend?: string; reward?: string; max_uses?: number; prefix?: string; restart?: boolean; repost?: string; repost_active?: boolean };
  const friend = String(b.friend ?? "").trim();
  if (b.active && friend.length < 3) return NextResponse.json({ ok: false, error: "friend" }, { status: 400 });
  const repost = String(b.repost ?? "").trim();
  if (b.repost_active && repost.length < 3) return NextResponse.json({ ok: false, error: "repost" }, { status: 400 });
  try {
    await saveOffer(id, { active: !!b.active, friend, reward: String(b.reward ?? ""), max_uses: Number(b.max_uses ?? 10), prefix: String(b.prefix ?? ""), restart: !!b.restart, repost, repost_active: !!b.repost_active });
  } catch (e) {
    console.error("[referral]", e);
    return NextResponse.json({ ok: false, error: "db" }, { status: 500 });
  }
  const s = await offerStatus(id);
  return NextResponse.json({ ok: true, issued: s?.issued ?? 0 });
}

/** Кабинет: отметить код рекомендации — «друг пришёл» / «бонус выдан» / снять отметку. Рекомендателю — уведомление. */
export async function PATCH(req: Request) {
  const id = await currentSpecialistId();
  if (!id) return NextResponse.json({ ok: false }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { code?: string; action?: string };
  const action = b.action === "used" || b.action === "rewarded" || b.action === "undo" ? b.action : null;
  if (!action || !b.code) return NextResponse.json({ ok: false }, { status: 400 });
  const { markReferral, findCode, getOffer } = await import("@/lib/referral-db");
  const before = await findCode(b.code);
  const r = await markReferral(id, b.code, action);
  if (!r) return NextResponse.json({ ok: false }, { status: 404 });
  // Рекомендателю: друг пришёл — какой бонус и как его получить
  if (action === "used" && !before?.used_at && r.chat_id) {
    const { adminGetMaster } = await import("@/lib/db");
    const { sendTo, escapeHtml } = await import("@/lib/telegram");
    const { SITE_URL } = await import("@/lib/site");
    const m = await adminGetMaster(id).catch(() => null);
    const o = await getOffer(id).catch(() => null);
    if (m) {
      const lines = [
        `🎁 <b>Ваш друг пришёл к специалисту по вашей рекомендации!</b>`,
        `Специалист: ${escapeHtml(m.name)} — ${SITE_URL}/ru/master/${m.slug}`,
        o?.reward
          ? `\nВаш бонус: <b>${escapeHtml(o.reward)}</b>\nЧтобы получить его, при следующем обращении назовите специалисту ваш код <code>${r.code}</code>.`
          : `\nСпасибо, что посоветовали! Специалист не указал бонус для рекомендателя.`,
      ];
      await sendTo(r.chat_id, lines.join("\n")).catch(() => null);
    }
  }
  return NextResponse.json({ ok: true, used_at: r.used_at, reward_at: r.reward_at ?? null });
}
