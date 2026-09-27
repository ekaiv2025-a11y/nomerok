import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { href, type Locale } from "@/lib/i18n/config";

// Окончание домена (.ge) показываем серым рядом с названием
const TLD = (() => {
  try {
    return new URL(SITE_URL).hostname.endsWith(".ge") ? ".ge" : "";
  } catch {
    return "";
  }
})();

export function Logo({ lang, small = false }: { lang: Locale; small?: boolean }) {
  return (
    <Link href={href(lang)} className="flex shrink-0 items-center gap-2" aria-label={SITE_NAME}>
      <LogoMark className={small ? "h-7 w-7" : "h-8 w-8"} />
      {/* На очень узких телефонах — только значок, чтобы шапка помещалась */}
      <span className={`font-bold tracking-tight ${small ? "text-[17px]" : "hidden text-[17px] min-[440px]:inline sm:text-[19px]"}`}>
        {SITE_NAME}
        {TLD && <span className={`font-semibold text-muted ${small ? "" : "hidden min-[480px]:inline"}`}>{TLD}</span>}
      </span>
    </Link>
  );
}

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="16" fill="#1f6b4f" />
      <path d="M19 46V18l26 28V18" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="51" cy="13" r="5" fill="#e0a526" />
    </svg>
  );
}
