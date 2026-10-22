import { NextResponse, type NextRequest } from "next/server";
import { ORG_COOKIE } from "@/lib/org-auth";

export async function GET(req: NextRequest) {
  const lang = ["ru", "en", "ka"].includes(req.nextUrl.searchParams.get("lang") ?? "") ? req.nextUrl.searchParams.get("lang")! : "ru";
  const res = NextResponse.redirect(new URL(`/${lang}/org`, req.url));
  res.cookies.delete(ORG_COOKIE);
  return res;
}
