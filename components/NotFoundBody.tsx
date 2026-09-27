import Link from "next/link";
import { headers } from "next/headers";
import { getDict, href, isLocale } from "@/lib/i18n";

export async function NotFoundBody({ kind = "page" }: { kind?: "page" | "master" }) {
  const l = (await headers()).get("x-nm-lang");
  const lang = isLocale(l) ? l : "ru";
  const d = getDict(lang);
  const title = kind === "master" ? d.master.notFoundTitle : d.notFound.title;
  const text = kind === "master" ? d.master.notFoundText : d.notFound.text;
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-muted">{text}</p>
      <div className="mt-6 flex justify-center gap-2">
        <Link href={href(lang)} className="btn-ghost">
          {d.notFound.home}
        </Link>
        <Link href={href(lang, "/request")} className="btn-primary">
          {d.nav.leaveRequest}
        </Link>
      </div>
    </div>
  );
}
