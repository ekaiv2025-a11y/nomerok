import Link from "next/link";
import { Logo } from "./Logo";
import { SITE_NAME, SUPPORT_TELEGRAM } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-cream">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-10 sm:px-6 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Logo small />
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            Специалисты в Батуми. Связывайтесь напрямую — без посредников и наценок.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-[13px] font-semibold">Клиентам</h4>
          <ul className="space-y-2 text-[13px] text-muted">
            <li><Link className="hover:text-ink" href="/">Все специалисты</Link></li>
            <li><Link className="hover:text-ink" href="/request">Оставить заявку</Link></li>
            <li><Link className="hover:text-ink" href="/how">Как это работает</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-[13px] font-semibold">Специалистам</h4>
          <ul className="space-y-2 text-[13px] text-muted">
            <li><Link className="hover:text-ink" href="/join">Разместить профиль</Link></li>
            <li><Link className="hover:text-ink" href="/how#masters">Условия для специалистов</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-[13px] font-semibold">{SITE_NAME}</h4>
          <ul className="space-y-2 text-[13px] text-muted">
            {SUPPORT_TELEGRAM && (
              <li><a className="hover:text-ink" href={`https://t.me/${SUPPORT_TELEGRAM}`} target="_blank" rel="noopener noreferrer">Написать нам в Telegram</a></li>
            )}
            <li><Link className="hover:text-ink" href="/terms">Правила сервиса</Link></li>
            <li><Link className="hover:text-ink" href="/privacy">Конфиденциальность</Link></li>
            <li className="pt-1 text-[12px]">© {new Date().getFullYear()} {SITE_NAME}</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
