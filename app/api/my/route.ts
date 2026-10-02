import { NextResponse } from "next/server";
import { CLIENT_COOKIE, currentClientChatId } from "@/lib/client-auth";
import { syncFavs } from "@/lib/client-db";
import { getRequest, updateRequest } from "@/lib/db";
import { notifyAdmin, escapeHtml } from "@/lib/telegram";

/** Кабинет клиента: закрыть заявку, синхронизировать избранное, выйти. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { action?: string; id?: string; slugs?: string[]; removed?: string[] };
  if (body.action === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(CLIENT_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  }
  const chatId = await currentClientChatId();
  if (!chatId) return NextResponse.json({ ok: false }, { status: 401 });
  if (body.action === "favs") {
    const slugs = await syncFavs(chatId, Array.isArray(body.slugs) ? body.slugs : [], Array.isArray(body.removed) ? body.removed : []).catch(() => body.slugs ?? []);
    return NextResponse.json({ ok: true, slugs });
  }
  if (body.action === "close" && body.id) {
    const r = await getRequest(body.id);
    if (!r || r.client_tg_chat_id !== chatId) return NextResponse.json({ ok: false }, { status: 404 });
    if (r.status !== "done") {
      const now = new Date().toISOString();
      await updateRequest(r.id, { status: "done", outcome: r.outcome ?? "closed", outcome_at: r.outcome_at ?? now });
      await notifyAdmin(`🔒 Клиент закрыл заявку на сайте: «${escapeHtml(r.description.slice(0, 60))}»`, { silent: true }).catch(() => null);
    }
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 400 });
}
