import { NextResponse } from "next/server";
import { saveProjectLead } from "@/lib/project-leads";
import { projectBySlug } from "@/lib/projects";
import { notifyAdmin, escapeHtml } from "@/lib/telegram";
import { visitorId } from "@/lib/request-info";
import { rateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/site";
import { cityLabel, isCity } from "@/lib/cities";

const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Заявка «узнать про этот ЖК» или «подобрать вариант» — уходит только владельцу сайта. */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || b.website) return NextResponse.json({ ok: true }); // скрытое поле-ловушка для ботов
  const name = s(b.name, 80);
  const contact = s(b.contact, 80);
  if (name.length < 2) return NextResponse.json({ error: "Укажите имя" }, { status: 400 });
  if (!/(\d[\s\-()]*){7,}|@[\w]{4,}|t\.me\/[\w]{4,}/.test(contact)) return NextResponse.json({ error: "Укажите телефон или Telegram (@имя)" }, { status: 400 });
  if (b.consent !== true) return NextResponse.json({ error: "Нужно согласие на передачу контакта агентству" }, { status: 400 });
  const v = await visitorId();
  if (!rateLimit("plead:" + v, 5, 60 * 60 * 1000)) return NextResponse.json({ error: "Слишком много заявок. Попробуйте позже." }, { status: 429 });
  const p = typeof b.project === "string" ? projectBySlug(b.project) : null;
  const mode = b.mode === "other" || !p ? "other" : "this";
  const city = isCity(b.city) ? b.city : p?.city ?? null;
  const lead = await saveProjectLead({
    project: p?.slug ?? null,
    mode,
    name,
    contact,
    city,
    budget: s(b.budget, 60) || null,
    rooms: s(b.rooms, 30) || null,
    goal: s(b.goal, 30) || null,
    comment: s(b.comment, 600) || null,
    visitor: v,
  });
  const e = escapeHtml;
  await notifyAdmin(
    [
      `🏗 <b>Заявка по новостройкам</b>${mode === "this" && p ? ` — ${e(p.name)}` : " — подобрать вариант"}`,
      p ? `ЖК: <a href="${SITE_URL}/ru/novostroyki/${p.slug}">${e(p.name)}</a>${mode === "other" ? " (просит и другие варианты)" : ""}` : "",
      `Имя: ${e(lead.name)}`,
      `Контакт: ${e(lead.contact)}`,
      city ? `Город: ${e(cityLabel(city, "ru"))}` : "",
      lead.budget ? `Бюджет: ${e(lead.budget)}` : "",
      lead.rooms ? `Комнат: ${e(lead.rooms)}` : "",
      lead.goal ? `Цель: ${e(lead.goal)}` : "",
      lead.comment ? `Комментарий: ${e(lead.comment)}` : "",
      `Все заявки: ${SITE_URL}/admin/projects`,
    ]
      .filter(Boolean)
      .join("\n"),
  ).catch(() => false);
  return NextResponse.json({ ok: true });
}
