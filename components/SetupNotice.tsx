import Link from "next/link";
import { getDict, href, type Locale } from "@/lib/i18n";

export function SetupNotice({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  return (
    <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-accent/50 bg-[#fdf6e6] p-6 text-center">
      <p className="font-semibold">{t.setup.title}</p>
      <p className="mt-1 text-[14px] text-muted">{t.setup.text}</p>
      <Link href={href(lang, "/request")} className="btn-primary mt-4">
        {t.nav.leaveRequest}
      </Link>
    </div>
  );
}
