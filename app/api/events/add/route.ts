import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createEvent } from "@/lib/events-db";
import { EVENT_KINDS, type EventKind } from "@/lib/events";
import { uploadPhoto } from "@/lib/db";
import { notifyAdmin, escapeHtml } from "@/lib/telegram";
import { visitorId } from "@/lib/request-info";
import { rateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/site";
import { cityLabel, isCity } from "@/lib/cities";
import { currentSpecialistId } from "@/lib/spec-auth";
import { adminGetMaster } from "@/lib/db";

const s = (v: FormDataEntryValue | null, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Организатор добавляет своё мероприятие — оно уходит на проверку владельцу сайта (статус pending). */
export async function POST(req: Request) {
  const fd = await req.formData().catch(() => null);
  if (!fd || s(fd.get("website"), 10)) return NextResponse.json({ ok: true }); // ловушка для ботов
  const v = await visitorId();
  if (!rateLimit("event:" + v, 5, 60 * 60 * 1000)) return NextResponse.json({ error: "Слишком много событий подряд. Попробуйте позже." }, { status: 429 });
  const errors: Record<string, string> = {};
  const title = s(fd.get("title"), 160);
  const city = s(fd.get("city"), 20);
  const kind = s(fd.get("kind"), 20);
  const date = s(fd.get("date"), 10);
  const time = s(fd.get("time"), 5);
  const endDate = s(fd.get("end_date"), 10);
  // Специалист из кабинета: контакт — его анкета, событие привязано к нему
  const specId = await currentSpecialistId().catch(() => null);
  const master = specId ? await adminGetMaster(specId).catch(() => null) : null;
  const contact = master ? master.phone : s(fd.get("contact"), 100);
  if (title.length < 4) errors.title = "Напишите название";
  if (!isCity(city)) errors.city = "Выберите город";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.date = "Укажите дату";
  if (!/(\d[\s\-()]*){7,}|@[\w]{4,}|t\.me\/[\w]{4,}|\S+@\S+\.\S+/.test(contact)) errors.contact = "Телефон, Telegram или почта — для связи с вами (на сайте не показываем)";
  // время Тбилиси: UTC+4
  const startsAt = date ? new Date(`${date}T${/^\d{2}:\d{2}$/.test(time) ? time : "00:00"}:00+04:00`) : null;
  if (startsAt && (Number.isNaN(startsAt.getTime()) || startsAt.getTime() < Date.now() - 86400000)) errors.date = "Дата уже прошла";
  const endsAt = /^\d{4}-\d{2}-\d{2}$/.test(endDate) ? new Date(`${endDate}T23:59:00+04:00`) : null;
  if (endsAt && startsAt && endsAt < startsAt) errors.end_date = "Дата окончания раньше начала";
  const url = s(fd.get("url"), 300);
  if (url && !/^https?:\/\//.test(url)) errors.url = "Ссылка должна начинаться с https://";
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 400 });

  let image: string | null = null;
  const file = fd.get("image");
  if (file && typeof file !== "string" && file.size > 0) {
    if (file.size > 8 * 1024 * 1024 || !file.type.startsWith("image/")) return NextResponse.json({ errors: { image: "Картинка до 8 МБ (jpg, png, webp)" } }, { status: 400 });
    image = await uploadPhoto(`events-${randomBytes(6).toString("hex")}`, file, file.type.split("/")[1] || "jpg").catch(() => null);
  }
  const e = await createEvent({
    title,
    city,
    kind: (EVENT_KINDS.some((k) => k.id === kind) ? kind : "other") as EventKind,
    starts_at: startsAt!.toISOString(),
    ends_at: endsAt ? endsAt.toISOString() : null,
    venue: s(fd.get("venue"), 120) || null,
    address: s(fd.get("address"), 200) || null,
    price: s(fd.get("price"), 80) || null,
    url: url || null,
    image,
    description: s(fd.get("description"), 1500) || null,
    source: "user",
    // опубликованная анкета — сразу в афише (администратор видит и может снять); остальные — на проверку
    status: master && master.status === "published" ? "published" : "pending",
    contact,
    master_id: master?.id ?? null,
  });
  const x = escapeHtml;
  await notifyAdmin(
    [master ? (e.status === "published" ? `🎟 <b>${x(master.name)} опубликовал(а) мероприятие</b>` : `🎟 <b>Мероприятие от ${x(master.name)} на проверку</b>`) : `🎟 <b>Новое событие на проверку</b>`, `<b>${x(e.title)}</b>`, `${x(cityLabel(e.city, "ru"))} · ${x(date)} ${x(time)}`, e.venue ? `Место: ${x(e.venue)}` : "", `Контакт: ${x(contact)}`, `Проверить: ${SITE_URL}/admin/events`].filter(Boolean).join("\n"),
  ).catch(() => false);
  return NextResponse.json({ ok: true, published: e.status === "published", slug: e.slug });
}
