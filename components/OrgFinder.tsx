"use client";

import { useEffect, useState } from "react";
import { PLACE_CATS, placeName } from "@/lib/places";
import { CITIES } from "@/lib/cities";
import type { Locale } from "@/lib/i18n/config";

type Item = { id: string; slug: string; name: string; name_en: string | null; name_ka: string | null; cat: string; city: string; addr: string | null; verified: boolean };

const T = {
  ru: {
    ph: "Название клиники, салона, центра…",
    hint: "Начните вводить название — покажем, что уже есть на сайте.",
    none: "Ничего не нашли. Попробуйте другое написание (латиницей или по-грузински) или добавьте организацию.",
    mine: "Это моя →",
    taken: "уже подтверждена",
    view: "Открыть",
    how: "Откроется Telegram: нажмите «Старт» и «Поделиться номером». Если номер совпадёт с телефоном организации — подтвердим сразу и пришлём ссылку в кабинет. Если нет — проверим вручную в течение дня.",
    add: "Нет в списке — добавить организацию",
    all: "Все города",
  },
  en: {
    ph: "Name of your clinic, salon, centre…",
    hint: "Start typing the name — we'll show what's already on the site.",
    none: "Nothing found. Try another spelling (Latin or Georgian) or add your organization.",
    mine: "It's mine →",
    taken: "already confirmed",
    view: "Open",
    how: "Telegram will open: press “Start” and “Share phone number”. If it matches the organization's phone, we confirm at once and send a link to the account. If not, we check manually within a day.",
    add: "Not listed — add an organization",
    all: "All cities",
  },
  ka: {
    ph: "კლინიკის, სალონის, ცენტრის სახელი…",
    hint: "დაიწყეთ სახელის აკრეფა — გაჩვენებთ, რაც უკვე არის საიტზე.",
    none: "ვერაფერი მოიძებნა. სცადეთ სხვა წერა (ლათინურად ან ქართულად) ან დაამატეთ ორგანიზაცია.",
    mine: "ეს ჩემია →",
    taken: "უკვე დადასტურებულია",
    view: "გახსნა",
    how: "გაიხსნება Telegram: დააჭირეთ „Start“ და „ნომრის გაზიარება“. თუ ნომერი დაემთხვა ორგანიზაციის ტელეფონს — მაშინვე დავადასტურებთ და გამოგიგზავნით ბმულს კაბინეტში. თუ არა — ხელით შევამოწმებთ დღის განმავლობაში.",
    add: "სიაში არ არის — ორგანიზაციის დამატება",
    all: "ყველა ქალაქი",
  },
} as const;

/** Кабинет организации: найти себя на сайте и подтвердить в Telegram — без регистрации заранее. */
export function OrgFinder({ lang, bot, addHref }: { lang: Locale; bot: string | null; addHref: string | null }) {
  const t = T[lang];
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [items, setItems] = useState<Item[] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const s = q.trim();
    if (s.length < 2) {
      setItems(null);
      return;
    }
    setBusy(true);
    const ctl = new AbortController();
    const id = setTimeout(() => {
      fetch(`/api/org-find?q=${encodeURIComponent(s)}${city ? `&city=${city}` : ""}`, { signal: ctl.signal })
        .then((r) => r.json())
        .then((d) => setItems(d.items ?? []))
        .catch(() => null)
        .finally(() => setBusy(false));
    }, 300);
    return () => {
      clearTimeout(id);
      ctl.abort();
    };
  }, [q, city]);

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.ph}
          autoFocus
          className="field h-12 w-full grow text-[16px]"
          aria-label={t.ph}
        />
        <select value={city} onChange={(e) => setCity(e.target.value)} className="field h-12 sm:w-44">
          <option value="">{t.all}</option>
          {CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label[lang]}
            </option>
          ))}
        </select>
      </div>
      {items === null && !busy && <p className="mt-2 text-[13px] text-muted">{t.hint}</p>}
      {busy && items === null && <p className="mt-2 text-[13px] text-muted">…</p>}
      {items && items.length === 0 && !busy && <p className="mt-3 text-[14px] text-muted">{t.none}</p>}
      {items && items.length > 0 && (
        <>
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
            {items.map((p) => {
              const cat = PLACE_CATS.find((c) => c.id === p.cat);
              const cityLabel = CITIES.find((c) => c.id === p.city)?.label[lang];
              return (
                <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream text-[20px]">{cat?.emoji ?? "🏢"}</span>
                  <div className="min-w-0 grow">
                    <p className="truncate text-[15px] font-semibold">{placeName(p, lang)}</p>
                    <p className="truncate text-[13px] text-muted">{p.addr && cityLabel && p.addr.includes(cityLabel) ? p.addr : [cityLabel, p.addr].filter(Boolean).join(" · ")}</p>
                  </div>
                  <a href={`/${lang}/places/${p.slug}`} target="_blank" rel="noopener noreferrer" className="hidden text-[13px] text-muted hover:text-brand sm:inline">
                    {t.view}
                  </a>
                  {p.verified ? (
                    <span className="shrink-0 rounded-full bg-cream px-3 py-1 text-[12px] text-muted">{t.taken}</span>
                  ) : bot ? (
                    <a href={`https://t.me/${bot}?start=pl_${p.id}`} target="_blank" rel="noopener noreferrer" className="btn h-10 shrink-0 bg-[#229ED9] px-4 text-[14px] text-white hover:bg-[#1c89bd]">
                      {t.mine}
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">{t.how}</p>
        </>
      )}
      {addHref && items !== null && (
        <a href={addHref} target="_blank" rel="noopener noreferrer" className="btn-ghost mt-4 h-11 px-5 text-[14px]">
          ＋ {t.add}
        </a>
      )}
    </div>
  );
}
