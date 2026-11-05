import { NextResponse } from "next/server";
import { requestSchema, firstErrors, langFromBody } from "@/lib/validation";
import { createRequest, getPublishedMasterBySlug } from "@/lib/db";
import { botLink, notifyAdmin, escapeHtml } from "@/lib/telegram";
import { dispatchRequest, heldOf } from "@/lib/request-dispatch";
import { getPlace } from "@/lib/places-db";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-info";
import { categoryLabel } from "@/lib/categories";
import { formatPhone } from "@/lib/phone";
import { getDict } from "@/lib/i18n";
import { cityLabel, cityOf } from "@/lib/cities";
import { currentClient } from "@/lib/client-auth";
import { updateRequest } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const lang = langFromBody(body);
  const e = getDict(lang).errors;
  if (!body) return NextResponse.json({ ok: false, error: e.badRequest }, { status: 400 });

  const parsed = requestSchema(lang).safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, fields: firstErrors(parsed.error) }, { status: 422 });
  const data = parsed.data;

  // Бот заполнил скрытое поле или отправил форму мгновенно — делаем вид, что всё хорошо.
  if (data.website || (data.startedAt && Date.now() - data.startedAt < 2500)) return NextResponse.json({ ok: true });
  if (!rateLimit("req:" + (await clientIp()), 5)) return NextResponse.json({ ok: false, error: e.tooMany }, { status: 429 });

  try {
    const found = data.master_slug ? await getPublishedMasterBySlug(data.master_slug) : null;
    // Пример профиля или специалист на паузе — заявка уходит всем специалистам направления
    const master = found && !found.demo && !found.away ? found : null;
    const saved = await createRequest({
      category: data.category,
      description: data.description,
      when_text: data.when_text,
      name: data.name,
      phone: data.phone,
      master_id: master?.id ?? null,
      lang,
      city: master ? (master.city ?? "batumi") : cityOf(body.city),
    });

    // Клиент вошёл в «Мои заявки» — сразу привязываем заявку к его Telegram: отклики придут туда без лишних шагов
    const photos = (Array.isArray(body.photos) ? body.photos : [])
      .filter((u: unknown): u is string => typeof u === "string" && (/^https:\/\/[a-z0-9-]+\.supabase\.co\//.test(u) || (u.startsWith("data:image/") && process.env.LOCAL_DB === "1")))
      .slice(0, 3);
    if (photos.length) {
      await updateRequest(saved.id, { photos }).catch(() => null);
      saved.photos = photos;
    }
    const me = await currentClient();
    if (me) {
      await updateRequest(saved.id, { client_tg_chat_id: me.chatId }).catch(() => null);
      saved.client_tg_chat_id = me.chatId;
    }

    // Заявка организации: запоминаем, кому она
    const org = !master && typeof body.org === "string" ? await getPlace(body.org.slice(0, 40)).catch(() => null) : null;
    if (org && org.owner_verified_at) {
      await updateRequest(saved.id, { org_place_id: org.id } as never).catch(() => null);
      (saved as { org_place_id?: string }).org_place_id = org.id;
    }
    const held = await heldOf(saved);

    // Клиент уже вошёл (Telegram или аккаунт) — рассылаем сразу. Иначе заявка ждёт, пока он подключит Telegram или войдёт:
    // так у каждой заявки есть способ сообщить клиенту об откликах (решение владельца, 06.11.2026).
    let pending = false;
    if (me) await dispatchRequest(saved, { notSelf: body.notSelf === true });
    else {
      const marked = await updateRequest(saved.id, { pending_client: true } as never).then(() => true, () => false);
      if (marked) {
        pending = true;
        await notifyAdmin(`⏳ <b>Новая заявка ждёт подтверждения клиента</b> (Telegram или вход на сайт)\n<b>Кто нужен:</b> ${escapeHtml(categoryLabel(saved.category, "ru"))} · ${cityLabel(saved.city, "ru")}\n<b>Задача:</b> ${escapeHtml(saved.description.slice(0, 300))}\n<b>Клиент:</b> ${escapeHtml(saved.name || "—")}, ${escapeHtml(formatPhone(saved.phone))}\nЕсли не подтвердит — позвоните сами.`).catch(() => null);
      } else await dispatchRequest(saved, { notSelf: body.notSelf === true }); // база ещё без поля pending_client — по-старому
    }
    return NextResponse.json({ ok: true, held, pending, linked: !!me, claim: me ? null : saved.client_link_token, tgLink: me ? null : await botLink(`r_${saved.client_link_token}`) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: e.unavailable }, { status: 500 });
  }
}
