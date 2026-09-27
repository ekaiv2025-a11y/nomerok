import { NextResponse } from "next/server";
import { healthCheck } from "@/lib/db";
import { telegramHealth } from "@/lib/telegram";

export const dynamic = "force-dynamic";

/** Открывается по адресу /api/health — показывает, всё ли настроено. Секреты не раскрывает. */
export async function GET() {
  const [db, telegram] = await Promise.all([healthCheck(), telegramHealth()]);
  return NextResponse.json({ ...db, TELEGRAM: telegram }, { headers: { "Cache-Control": "no-store" } });
}
