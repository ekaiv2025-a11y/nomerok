import { NextResponse } from "next/server";
import { healthCheck } from "@/lib/db";
import { telegramHealth } from "@/lib/telegram";
import { mailEnabled } from "@/lib/mail";
import { providerEnabled } from "@/lib/oauth";

export const dynamic = "force-dynamic";

/** Открывается по адресу /api/health — показывает, всё ли настроено. Секреты не раскрывает. */
export async function GET() {
  const [db, telegram] = await Promise.all([healthCheck(), telegramHealth()]);
  const EMAIL = { почта_настроена: !!(process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) };
  const LOGIN = { вход_по_почте: mailEnabled(), вход_через_Google: providerEnabled("google"), вход_через_Facebook: providerEnabled("facebook") };
  return NextResponse.json({ ...db, TELEGRAM: telegram, EMAIL, LOGIN }, { headers: { "Cache-Control": "no-store" } });
}
