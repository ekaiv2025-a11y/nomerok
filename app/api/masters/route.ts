import { NextResponse } from "next/server";
import { masterApplicationSchema, firstErrors, langFromBody } from "@/lib/validation";
import { adminUpdateMaster, createMaster, uploadPhoto } from "@/lib/db";
import { readJoinToken } from "@/lib/join-token";
import { SPEC_COOKIE, specCookieValue } from "@/lib/spec-auth";
import { botDict } from "@/lib/i18n/bot";
import { botLink, downloadTelegramFile, notifyAdmin, escapeHtml, sendTo } from "@/lib/telegram";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-info";
import { categoryLabel } from "@/lib/categories";
import { formatPhone } from "@/lib/phone";
import { SITE_URL } from "@/lib/site";
import { getDict, LOCALE_NAMES } from "@/lib/i18n";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const lang = langFromBody(body);
  const e = getDict(lang).errors;
  if (!body) return NextResponse.json({ ok: false, error: e.badRequest }, { status: 400 });

  // Анкета «через Telegram»: номер берём из подписанного токена бота
  const pre = readJoinToken(body.tg);
  if (pre) {
    body.phone = pre.phone;
    if (!body.telegram && pre.username) body.telegram = pre.username;
  }

  const parsed = masterApplicationSchema(lang).safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, fields: firstErrors(parsed.error) }, { status: 422 });
  const d = parsed.data;
  if (d.website || (d.startedAt && Date.now() - d.startedAt < 2500)) return NextResponse.json({ ok: true });
  if (!rateLimit("master:" + (await clientIp()), 3)) return NextResponse.json({ ok: false, error: e.tooMany }, { status: 429 });

  // Где работает (необязательно): при «у себя» нужна точка на карте
  const mode = ["at_client", "at_place", "both", "online"].includes(body.work_mode) ? (body.work_mode as "at_client" | "at_place" | "both" | "online") : "at_client";
  const lat = Number(body.place_lat);
  const lng = Number(body.place_lng);
  const hasPoint = body.place_lat != null && Number.isFinite(lat) && Number.isFinite(lng) && lat > 41 && lat < 43.7 && lng > 40 && lng < 46.8;
  const needsPlace = mode === "at_place" || mode === "both";
  if (needsPlace && !hasPoint) return NextResponse.json({ ok: false, fields: { place: getDict(lang).cabinet.placeRequired } }, { status: 422 });
  const where = {
    work_mode: mode,
    service_area: String(body.service_area ?? "").trim().slice(0, 200),
    work_hours: String(body.work_hours ?? "").trim().slice(0, 120),
    place_address: needsPlace ? String(body.place_address ?? "").trim().slice(0, 200) : "",
    place_lat: needsPlace ? Math.round(lat * 1e6) / 1e6 : null,
    place_lng: needsPlace ? Math.round(lng * 1e6) / 1e6 : null,
  };

  try {
    const m = await createMaster({
      name: d.name,
      category: d.category,
      services: d.services,
      about: d.about,
      credentials: d.credentials,
      experience_years: d.experience_years ?? null,
      languages: d.languages,
      price_from: d.price_from ?? null,
      price_unit: d.price_unit,
      phone: d.phone,
      telegram: d.telegram,
      whatsapp: d.whatsapp,
      photo_url: null,
      status: "pending",
      consent_at: new Date().toISOString(),
      lang,
    });

    await adminUpdateMaster(m.id, where).catch(() => {});

    if (pre) {
      await adminUpdateMaster(m.id, { tg_chat_id: pre.chatId, tg_username: pre.username, phone_verified_at: new Date().toISOString() });
      if (pre.photoFileId && body.tgPhoto === true) {
        const f = await downloadTelegramFile(pre.photoFileId).catch(() => null);
        if (f) {
          const url = await uploadPhoto(m.id, new Blob([f.data], { type: f.type }), f.type === "image/png" ? "png" : "jpg").catch(() => null);
          if (url) await adminUpdateMaster(m.id, { photo_url: url });
        }
      }
      await sendTo(pre.chatId, botDict(lang).joinSubmitted);
    }

    await notifyAdmin(
      [
        "🧑‍💼 <b>Новая анкета специалиста</b>",
        `<b>${escapeHtml(m.name)}</b> — ${escapeHtml(categoryLabel(m.category, "ru"))}`,
        `<b>Услуги:</b> ${escapeHtml(m.services)}`,
        `<b>Телефон:</b> ${escapeHtml(formatPhone(m.phone))}${m.telegram ? ` · @${escapeHtml(m.telegram)}` : ""}`,
        `<b>Язык сайта:</b> ${LOCALE_NAMES[lang]}`,
        pre ? "✅ Номер подтверждён через Telegram" : "",
        `\nПроверить и опубликовать: ${SITE_URL}/admin/masters/${m.id}`,
      ]
        .filter(Boolean)
        .join("\n"),
    );
    // Сразу «входим» в кабинет новой анкеты — чтобы можно было загрузить фото
    const res = NextResponse.json({ ok: true, verified: !!pre, tgLink: pre ? null : await botLink(`m_${m.tg_link_token}`) });
    const c = specCookieValue(m.id);
    res.cookies.set(SPEC_COOKIE, c.value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: c.maxAge });
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: e.unavailable }, { status: 500 });
  }
}
