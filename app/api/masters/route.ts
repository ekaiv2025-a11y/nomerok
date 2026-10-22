import { NextResponse } from "next/server";
import { masterApplicationSchema, firstErrors, langFromBody } from "@/lib/validation";
import { adminUpdateMaster, createMaster, uploadPhoto } from "@/lib/db";
import { readJoinToken } from "@/lib/join-token";
import { getJoinStart, joinFailed, joinMark } from "@/lib/join-starts";
import { addMember } from "@/lib/org-db";
import { getPlace } from "@/lib/places-db";
import { setSpecCookies } from "@/lib/spec-auth";
import { botDict } from "@/lib/i18n/bot";
import { botLink, downloadTelegramFile, notifyAdmin, escapeHtml, sendTo, telegramToken } from "@/lib/telegram";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-info";
import { categoryLabel } from "@/lib/categories";
import { formatPhone, normalizePhone } from "@/lib/phone";
import { SITE_URL } from "@/lib/site";
import { getDict, LOCALE_NAMES } from "@/lib/i18n";
import { cityLabel, cityOf } from "@/lib/cities";
import { normalizeLinks } from "@/lib/links";
import { pullLinks } from "@/lib/extract-links";

const TG_REQUIRED = {
  ru: "Анкету можно создать только через Telegram — откройте страницу заново и нажмите «Зарегистрироваться через Telegram».",
  en: "Profiles can only be created via Telegram — reload the page and tap “Sign up with Telegram”.",
  ka: "ანკეტის შექმნა მხოლოდ Telegram-ით შეიძლება — გახსენით გვერდი თავიდან და დააჭირეთ «რეგისტრაცია Telegram-ით».",
} as const;
const TG_EXPIRED = {
  ru: "Ссылка из бота устарела (действует 24 часа). Откройте бота NomerOk, нажмите «📱 Поделиться номером» ещё раз и получите новую ссылку.",
  en: "The bot link has expired (valid 24 hours). Open the NomerOk bot, tap “📱 Share phone number” again and get a new link.",
  ka: "ბოტის ბმულს ვადა გაუვიდა (24 საათი). გახსენით NomerOk ბოტი, კვლავ დააჭირეთ «📱 ნომრის გაზიარებას» და მიიღეთ ახალი ბმული.",
} as const;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const lang = langFromBody(body);
  const e = getDict(lang).errors;
  if (!body) return NextResponse.json({ ok: false, error: e.badRequest }, { status: 400 });

  // Анкета «через Telegram»: номер берём из подписанного токена бота
  const pre = readJoinToken(body.tg);
  // Без Telegram регистрации нет: иначе специалист не получает заявки и не может войти в кабинет
  if (!pre && telegramToken()) {
    const msg = body.tg ? TG_EXPIRED[lang] : TG_REQUIRED[lang];
    return NextResponse.json({ ok: false, error: msg }, { status: 422 });
  }
  // Номер: из Telegram, но специалист может указать другой рабочий
  const tgPhone = pre?.phone ?? null;
  if (pre) {
    if (!normalizePhone(String(body.phone ?? ""))) body.phone = pre.phone;
    if (!body.telegram && pre.username) body.telegram = pre.username;
  }

  const parsed = masterApplicationSchema(lang).safeParse(body);
  if (!parsed.success) {
    const fields = firstErrors(parsed.error);
    if (pre && rateLimit("joinfail:" + pre.chatId, 3))
      await joinFailed(pre.chatId, pre.phone, Object.entries(fields).map(([k, v]) => `${k} — «${v}»`).join("; ")).catch(() => null);
    return NextResponse.json({ ok: false, fields }, { status: 422 });
  }
  const d = parsed.data;
  if (d.website || (d.startedAt && Date.now() - d.startedAt < 2500)) return NextResponse.json({ ok: true });
  if (!rateLimit("master:" + (await clientIp()), 3)) return NextResponse.json({ ok: false, error: e.tooMany }, { status: 429 });

  // Где работает (необязательно): при «у себя» нужна точка на карте
  const mode = ["at_client", "at_place", "both", "online"].includes(body.work_mode) ? (body.work_mode as "at_client" | "at_place" | "both" | "online") : "at_client";
  const lat = Number(body.place_lat);
  const lng = Number(body.place_lng);
  const hasPoint = body.place_lat != null && Number.isFinite(lat) && Number.isFinite(lng) && lat > 41 && lat < 43.7 && lng > 40 && lng < 46.8;
  const needsPlace = mode === "at_place" || mode === "both";
  if (needsPlace && !hasPoint && pre && rateLimit("joinfail:" + pre.chatId, 3)) await joinFailed(pre.chatId, pre.phone, "не отметил(а) точку на карте").catch(() => null);
  if (needsPlace && !hasPoint) return NextResponse.json({ ok: false, fields: { place: getDict(lang).cabinet.placeRequired } }, { status: 422 });
  const where = {
    work_mode: mode,
    service_area: String(body.service_area ?? "").trim().slice(0, 200),
    work_hours: String(body.work_hours ?? "").trim().slice(0, 120),
    place_address: needsPlace ? String(body.place_address ?? "").trim().slice(0, 200) : "",
    place_lat: needsPlace ? Math.round(lat * 1e6) / 1e6 : null,
    place_lng: needsPlace ? Math.round(lng * 1e6) / 1e6 : null,
  };

  const links = pullLinks(d, d.telegram ?? null, normalizeLinks(body.links));

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
    await adminUpdateMaster(m.id, { city: cityOf(body.city) }).catch(() => {});
    if (Object.keys(links).length) await adminUpdateMaster(m.id, { links }).catch(() => {});

    if (pre) {
      const now = new Date().toISOString();
      const samePhone = normalizePhone(m.phone) === tgPhone;
      await adminUpdateMaster(m.id, { tg_chat_id: pre.chatId, tg_username: pre.username, ...(samePhone ? { phone_verified_at: now } : { tg_verified_at: now }) });
      if (pre.photoFileId && body.tgPhoto === true) {
        const f = await downloadTelegramFile(pre.photoFileId).catch(() => null);
        if (f) {
          const url = await uploadPhoto(m.id, new Blob([f.data], { type: f.type }), f.type === "image/png" ? "png" : "jpg").catch(() => null);
          if (url) await adminUpdateMaster(m.id, { photo_url: url });
        }
      }
      await sendTo(pre.chatId, botDict(lang).joinSubmitted);
      await joinMark(pre.chatId, "done_at").catch(() => null);
      // Пришёл по приглашению организации — сразу в команду
      const js = await getJoinStart(pre.chatId).catch(() => null);
      if (js?.org_place_id) {
        const p = await getPlace(js.org_place_id).catch(() => null);
        if (p && (await addMember(p.id, m.id, "active", "invite").catch(() => false))) {
          await sendTo(pre.chatId, `🏢 Вы в команде «${escapeHtml(p.name)}» — анкета появится на странице организации после проверки.`).catch(() => null);
          if (p.owner_chat_id) await sendTo(p.owner_chat_id, `✅ <b>${escapeHtml(m.name)}</b> зарегистрировался(ась) по вашему приглашению и добавлен(а) в команду «${escapeHtml(p.name)}». Анкета появится на сайте после проверки.`).catch(() => null);
        }
      }
    }

    await notifyAdmin(
      [
        "🧑‍💼 <b>Новая анкета специалиста</b>",
        `<b>${escapeHtml(m.name)}</b> — ${escapeHtml(categoryLabel(m.category, "ru"))}`,
        `<b>Услуги:</b> ${escapeHtml(m.services)}`,
        `<b>Телефон:</b> ${escapeHtml(formatPhone(m.phone))}${m.telegram ? ` · @${escapeHtml(m.telegram)}` : ""}`,
        `<b>Город:</b> ${cityLabel(cityOf(body.city), "ru")}`,
        `<b>Язык сайта:</b> ${LOCALE_NAMES[lang]}`,
        pre ? (normalizePhone(m.phone) === tgPhone ? "✅ Номер подтверждён через Telegram" : `✅ Telegram подключён (в Telegram другой номер: ${escapeHtml(formatPhone(tgPhone ?? ""))})`) : "",
        `\nПроверить и опубликовать: ${SITE_URL}/admin/masters/${m.id}`,
      ]
        .filter(Boolean)
        .join("\n"),
    );
    // Сразу «входим» в кабинет новой анкеты — чтобы можно было загрузить фото
    const res = NextResponse.json({ ok: true, verified: !!pre, tgLink: pre ? null : await botLink(`m_${m.tg_link_token}`) });
    setSpecCookies(res, m.id);
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: e.unavailable }, { status: 500 });
  }
}
