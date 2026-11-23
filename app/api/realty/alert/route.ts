import { NextResponse } from "next/server";
import { createAlert } from "@/lib/realty-extras-db";
import { botLink } from "@/lib/telegram";
import { visitorId } from "@/lib/request-info";
import { rateLimit } from "@/lib/rate-limit";
import { isCity } from "@/lib/cities";
import { projectBySlug } from "@/lib/projects";

/** «🔔 Сообщать о новых квартирах»: создаём подписку и отдаём ссылку на бота — подписка включится, когда человек нажмёт «Старт». */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ ok: false }, { status: 400 });
  if (!rateLimit("alert:" + (await visitorId()), 10, 60 * 60 * 1000)) return NextResponse.json({ ok: false, error: "Слишком часто" }, { status: 429 });
  const rooms = b.rooms === "" || b.rooms == null ? null : Math.max(0, Math.min(6, Math.round(Number(b.rooms)) || 0));
  const max = Number(String(b.max_price ?? "").replace(/\D/g, ""));
  const project = typeof b.project === "string" && /^[\w-]{3,80}$/.test(b.project) ? b.project : null;
  const a = await createAlert({
    city: isCity(b.city) ? b.city : project ? (projectBySlug(project)?.city ?? null) : null,
    rooms,
    max_price: max > 0 ? max : null,
    project,
    deal: ["sale", "rent", "daily", "pledge"].includes(b.deal) && !project ? b.deal : "sale",
  });
  const link = await botLink(`al_${a.token}`);
  return link ? NextResponse.json({ ok: true, link }) : NextResponse.json({ ok: false, error: "Бот не подключён" }, { status: 503 });
}
