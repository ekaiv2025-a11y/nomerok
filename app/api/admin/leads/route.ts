import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { listOutreach, markOutreach, registeredMatches } from "@/lib/outreach-db";

/** Админка → «Поиск специалистов в чатах»: сверка найденных с базой и отметки «написал / не подходит». */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    candidates?: { userId: string; usernames: string[]; phones: string[] }[];
    userId?: string;
    name?: string;
    category?: string;
    status?: "sent" | "skip" | "reset";
  };
  if (body.action === "check") {
    const [marks, reg] = await Promise.all([listOutreach(), registeredMatches()]);
    const registered: string[] = [];
    for (const c of body.candidates ?? []) {
      if (reg.ids.has(c.userId) || c.usernames.some((u) => reg.usernames.has(u.toLowerCase())) || c.phones.some((p) => reg.phones.has(p))) registered.push(c.userId);
    }
    return NextResponse.json({ ok: true, marks, registered });
  }
  if (body.action === "mark" && body.userId && body.status) {
    try {
      await markOutreach({ tg_user_id: String(body.userId), name: String(body.name ?? "").slice(0, 120), category: String(body.category ?? ""), status: body.status });
      return NextResponse.json({ ok: true });
    } catch (e) {
      return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "error" }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: false }, { status: 400 });
}
