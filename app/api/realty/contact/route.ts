import { NextResponse, type NextRequest } from "next/server";
import { countListing, getListing } from "@/lib/realty-db";
import { adminGetMaster } from "@/lib/db";

/** «Связаться с риелтором»: считаем нажатие (статистика в кабинете) и ведём на анкету риелтора с контактами. */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const lang = ["ru", "en", "ka"].includes(sp.get("lang") ?? "") ? sp.get("lang")! : "ru";
  const l = await getListing(sp.get("id") ?? "");
  const m = l ? await adminGetMaster(l.master_id).catch(() => null) : null;
  if (!l || !m) return NextResponse.redirect(new URL(`/${lang}/realty`, req.url));
  await countListing(l.id, "contacts").catch(() => null);
  return NextResponse.redirect(new URL(`/${lang}/master/${m.slug}?from=realty`, req.url));
}
