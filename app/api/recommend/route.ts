import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-info";
import { notifyAdmin, escapeHtml } from "@/lib/telegram";

/** «Порекомендовать мастера»: сообщаем администратору, кого порекомендовали (приглашение человек отправляет сам). */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (b.website) return NextResponse.json({ ok: true });
  const s = (k: string, n: number) => String(b[k] ?? "").trim().slice(0, n);
  const master = s("master", 80);
  if (!master) return NextResponse.json({ ok: false }, { status: 400 });
  if (!rateLimit("recommend:" + (await clientIp()), 10, 60 * 60 * 1000)) return NextResponse.json({ ok: true });
  await notifyAdmin(
    `🤝 <b>Порекомендовали специалиста</b>\n${escapeHtml(master)}${s("what", 120) ? ` — ${escapeHtml(s("what", 120))}` : ""}\nКонтакт: ${escapeHtml(s("contact", 80) || "—")}\nОт: ${escapeHtml(s("you", 60) || "—")}`,
    { silent: true },
  ).catch(() => null);
  return NextResponse.json({ ok: true });
}
