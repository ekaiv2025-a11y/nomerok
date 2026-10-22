import { NextResponse, type NextRequest } from "next/server";
import { ORG_COOKIE, ORG_MAX_AGE, orgSessionValue, readOrgLogin } from "@/lib/org-auth";

/** Ссылка из бота → вход в кабинет организации. */
export async function GET(req: NextRequest) {
  const lang = ["ru", "en", "ka"].includes(req.nextUrl.searchParams.get("lang") ?? "") ? req.nextUrl.searchParams.get("lang")! : "ru";
  const d = readOrgLogin(req.nextUrl.searchParams.get("t"));
  const res = NextResponse.redirect(new URL(`/${lang}/org${d ? "" : "?expired=1"}`, req.url));
  if (d) res.cookies.set(ORG_COOKIE, orgSessionValue(d.c, d.n), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: ORG_MAX_AGE });
  return res;
}
