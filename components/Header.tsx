import Link from "next/link";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Link href="/how" className="hidden md:inline-flex h-10 items-center px-3 text-[14px] font-medium text-muted hover:text-ink">
            Как это работает
          </Link>
          <Link href="/join" className="hidden sm:inline-flex h-10 items-center rounded-full px-4 text-[14px] font-semibold text-brand hover:bg-brand-soft">
            Я специалист
          </Link>
          <Link href="/request" className="btn-primary h-10 px-4 text-[14px]">
            Оставить заявку
          </Link>
        </nav>
      </div>
    </header>
  );
}
