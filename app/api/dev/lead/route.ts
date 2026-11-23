import { NextResponse } from "next/server";
import { getProjectFull } from "@/lib/projects-all";
import { saveProjectLead } from "@/lib/project-leads";
import { escapeHtml, notifyAdmin, sendTo } from "@/lib/telegram";
import { visitorId } from "@/lib/request-info";
import { rateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/site";
import { roomsLabel } from "@/lib/dev-projects";

const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** «Написать застройщику» по ЖК или конкретной квартире: заявка уходит застройщику (в Telegram или на почту) и копия — администратору. */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || b.website) return NextResponse.json({ ok: true });
  const name = s(b.name, 80);
  const contact = s(b.contact, 80);
  if (name.length < 2) return NextResponse.json({ error: "Укажите имя" }, { status: 400 });
  if (!/(\d[\s\-()]*){7,}|@[\w]{4,}/.test(contact)) return NextResponse.json({ error: "Укажите телефон или Telegram (@имя)" }, { status: 400 });
  const v = await visitorId();
  if (!rateLimit("dlead:" + v, 6, 60 * 60 * 1000)) return NextResponse.json({ error: "Слишком много заявок. Попробуйте позже." }, { status: 429 });
  const full = typeof b.project === "string" ? await getProjectFull(b.project) : null;
  if (!full?.dev) return NextResponse.json({ error: "ЖК не найден" }, { status: 404 });
  const { p, dev, units } = full;
  const u = typeof b.unit === "string" ? units.find((x) => x.id === b.unit) : null;
  const unitLine = u ? `Квартира: ${[u.building && `корпус ${u.building}`, u.floor != null && `${u.floor} этаж`, u.number && `№ ${u.number}`, roomsLabel(u.rooms), u.area && `${u.area} м²`].filter(Boolean).join(", ")}` : "";
  const comment = s(b.comment, 600);
  await saveProjectLead({ project: p.slug, mode: "this", name, contact, city: p.city ?? null, budget: null, rooms: u ? roomsLabel(u.rooms) : null, goal: "застройщику", comment: [unitLine, comment].filter(Boolean).join(" · ") || null, visitor: v }).catch(() => null);
  const e = escapeHtml;
  const text = [`🏗 <b>Заявка с NomerOk по ЖК ${e(p.name)}</b>`, unitLine ? e(unitLine) : "", `Имя: ${e(name)}`, `Контакт: ${e(contact)}`, comment ? `Комментарий: ${e(comment)}` : "", `${SITE_URL}/ru/novostroyki/${p.slug}`].filter(Boolean).join("\n");
  let chat = dev.owner_chat_id ?? null;
  if (!chat && dev.master_id) {
    const { adminGetMaster } = await import("@/lib/db");
    chat = (await adminGetMaster(dev.master_id).catch(() => null))?.tg_chat_id ?? null;
  }
  const delivered = chat ? await sendTo(chat, text).catch(() => false) : false;
  await notifyAdmin(`${text}\n\n${delivered ? "✅ Отправлено застройщику" : "⚠️ Застройщику не доставлено — передайте: " + e(dev.contact_phone ?? "")}`, { silent: !!delivered }).catch(() => null);
  return NextResponse.json({ ok: true });
}
