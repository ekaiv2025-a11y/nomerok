import { linkLabel, LINK_KINDS, type LinkKind, type MasterLinks } from "@/lib/links";
import type { Locale } from "@/lib/i18n";

import { TgContactButton } from "./TgContactButton";

export const LINK_TEXT: Record<Locale, { title: string; hint: string; placeholder: string; names: Record<LinkKind, string> }> = {
  ru: {
    title: "Соцсети и сайт",
    hint: "Клиенты смогут посмотреть больше ваших работ. Можно вставить ссылку или @имя.",
    placeholder: "@имя или ссылка",
    names: { instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok", youtube: "YouTube", tg_channel: "Telegram-канал", website: "Сайт" },
  },
  en: {
    title: "Social media & website",
    hint: "Clients can see more of your work. Paste a link or @username.",
    placeholder: "@username or link",
    names: { instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok", youtube: "YouTube", tg_channel: "Telegram channel", website: "Website" },
  },
  ka: {
    title: "სოციალური ქსელები და საიტი",
    hint: "კლიენტები მეტ ნამუშევარს ნახავენ. ჩასვით ბმული ან @სახელი.",
    placeholder: "@სახელი ან ბმული",
    names: { instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok", youtube: "YouTube", tg_channel: "Telegram არხი", website: "საიტი" },
  },
};

/** Фирменные значки (упрощённые) и цвета кнопок. */
const STYLE: Record<LinkKind, { bg: string; icon: React.ReactNode }> = {
  instagram: {
    bg: "linear-gradient(45deg,#f58529,#dd2a7b 50%,#8134af 80%,#515bd4)",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  facebook: {
    bg: "#1877F2",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.3c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2H7.5v3.3h2.8V21H14v-9.2h2.8l.4-3.3H14z" />
      </svg>
    ),
  },
  tiktok: {
    bg: "#111111",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M16.5 3c.4 2.2 1.8 3.7 4 4v3.1c-1.5 0-2.9-.4-4-1.2v6.3c0 3.3-2.6 5.8-5.9 5.8S4.8 18.4 4.8 15.2s2.6-5.8 5.8-5.8c.3 0 .7 0 1 .1v3.2c-.3-.1-.6-.2-1-.2-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7 2.8-1.2 2.8-2.9V3h3.1z" />
      </svg>
    ),
  },
  youtube: {
    bg: "#FF0000",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M22 8.2c-.2-1.6-1-2.7-2.6-2.9C16.9 5 12 5 12 5s-4.9 0-7.4.3C3 5.5 2.2 6.6 2 8.2 1.8 9.5 1.8 12 1.8 12s0 2.5.2 3.8c.2 1.6 1 2.7 2.6 2.9 2.5.3 7.4.3 7.4.3s4.9 0 7.4-.3c1.6-.2 2.4-1.3 2.6-2.9.2-1.3.2-3.8.2-3.8s0-2.5-.2-3.8zM10 15V9l5.2 3L10 15z" />
      </svg>
    ),
  },
  tg_channel: {
    bg: "#229ED9",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
      </svg>
    ),
  },
  website: {
    bg: "#1f6b4f",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" />
      </svg>
    ),
  },
};

/** Профиль: кнопки соцсетей в фирменных цветах. */
export function SocialLinks({ links, lang, tgMasterId }: { links: MasterLinks; lang: Locale; tgMasterId?: string | null }) {
  const items = LINK_KINDS.filter((k) => links[k]);
  if (!items.length && !tgMasterId) return null;
  const t = LINK_TEXT[lang];
  return (
    <section className="mt-8">
      <h2 className="text-[18px] font-bold">{t.title}</h2>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {tgMasterId && <TgContactButton masterId={tgMasterId} lang={lang} icon={STYLE.tg_channel.icon} bg={STYLE.tg_channel.bg} />}
        {items.map((k) => (
          <a
            key={k}
            href={links[k]}
            target="_blank"
            rel="nofollow noopener noreferrer ugc"
            className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-2.5 pr-4 transition hover:border-[#cfcac0] hover:shadow-[0_6px_18px_rgba(0,0,0,0.06)]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: STYLE[k].bg }}>
              {STYLE[k].icon}
            </span>
            <span className="min-w-0">
              <span className="block text-[12.5px] text-muted">{t.names[k]}</span>
              <span className="block truncate text-[15px] font-semibold group-hover:text-brand">{linkLabel(k, links[k]!, lang)}</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

/** Поля ввода ссылок (анкета, кабинет). Имена полей: link_instagram, link_facebook, … */
export function LinkFields({ lang, initial = {} }: { lang: Locale; initial?: MasterLinks }) {
  const t = LINK_TEXT[lang];
  return (
    <fieldset>
      <legend className="text-[14px] font-semibold">{t.title}</legend>
      <p className="mt-0.5 text-[13px] leading-snug text-muted">{t.hint}</p>
      <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {LINK_KINDS.map((k) => (
          <label key={k} className="flex items-center gap-2 rounded-xl border border-line bg-white pl-2 focus-within:border-brand">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: STYLE[k].bg }} title={t.names[k]}>
              {STYLE[k].icon}
            </span>
            <input
              name={`link_${k}`}
              defaultValue={initial[k] ?? ""}
              placeholder={k === "website" ? "example.ge" : `${t.names[k]}: ${t.placeholder}`}
              autoCapitalize="off"
              className="h-11 min-w-0 flex-1 bg-transparent pr-3 text-[16px] outline-none sm:text-[15px]"
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Собирает ссылки из формы. */
export function readLinkFields(f: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of LINK_KINDS) out[k] = String(f.get(`link_${k}`) ?? "");
  return out;
}
