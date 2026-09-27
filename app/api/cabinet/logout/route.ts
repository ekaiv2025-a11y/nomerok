import { NextResponse, type NextRequest } from "next/server";
import { SPEC_COOKIE } from "@/lib/spec-auth";
import { isLocale } from "@/lib/i18n/config";

export async function GET(req: NextRequest) {
  const l = req.nextUrl.searchParams.get("lang");
  const url = req.nextUrl.clone();
  url.search = "";
  url.pathname = `/${isLocale(l) ? l : "ru"}`;
  const res = NextResponse.redirect(url);
  res.cookies.delete(SPEC_COOKIE);
  return res;
}
