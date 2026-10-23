import { NextResponse, type NextRequest } from "next/server";
import { asLang, clearAllSessions } from "@/lib/account-auth";

/** Выйти из аккаунта на этом устройстве. */
export async function GET(req: NextRequest) {
  const lang = asLang(req.nextUrl.searchParams.get("lang"));
  return clearAllSessions(NextResponse.redirect(new URL(`/${lang}`, req.url)));
}
