import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Окончание домена (.ge) показываем серым рядом с названием
const TLD = (() => {
  try {
    const host = new URL(SITE_URL).hostname;
    return host.endsWith(".ge") ? ".ge" : "";
  } catch {
    return "";
  }
})();

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0" aria-label={`${SITE_NAME} — на главную`}>
      <LogoMark className={small ? "w-7 h-7" : "w-8 h-8"} />
      <span className={`font-bold tracking-tight ${small ? "text-[17px]" : "text-[19px]"}`}>
        {SITE_NAME}
        {TLD && <span className="font-semibold text-muted">{TLD}</span>}
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
