import { NextResponse } from "next/server";
import { healthCheck } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Открывается по адресу /api/health — показывает, всё ли настроено. Секреты не раскрывает. */
export async function GET() {
  return NextResponse.json(await healthCheck(), { headers: { "Cache-Control": "no-store" } });
}
