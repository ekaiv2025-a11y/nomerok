import { NextResponse } from "next/server";
import { handleUpdate, type TgUpdate } from "@/lib/bot";
import { webhookSecret } from "@/lib/telegram";

/** Сюда Telegram присылает все сообщения и нажатия кнопок в боте. */
export async function POST(req: Request) {
  const secret = webhookSecret();
  if (!secret || req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const update = (await req.json().catch(() => null)) as TgUpdate | null;
  if (update) {
    try {
      await handleUpdate(update);
    } catch (e) {
      // Всегда отвечаем 200, иначе Telegram будет бесконечно повторять то же сообщение
      console.error("[bot] ошибка обработки", e);
    }
  }
  return NextResponse.json({ ok: true });
}
