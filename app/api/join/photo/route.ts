import { type NextRequest } from "next/server";
import { readJoinToken } from "@/lib/join-token";
import { downloadTelegramFile } from "@/lib/telegram";

/** Превью аватарки из Telegram для анкеты «через Telegram». */
export async function GET(req: NextRequest) {
  const p = readJoinToken(req.nextUrl.searchParams.get("t"));
  if (!p?.photoFileId) return new Response(null, { status: 404 });
  const f = await downloadTelegramFile(p.photoFileId);
  if (!f) return new Response(null, { status: 404 });
  return new Response(f.data, { headers: { "Content-Type": f.type, "Cache-Control": "private, max-age=3600" } });
}
