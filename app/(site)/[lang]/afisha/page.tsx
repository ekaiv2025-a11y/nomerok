import type { Metadata } from "next";
import Link from "next/link";
import { href } from "@/lib/i18n";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";
import { CITIES, cityIn, cityLabel, isCity } from "@/lib/cities";
import { upcomingEvents } from "@/lib/events-db";
import { EVENT_KINDS, type CityEvent } from "@/lib/events";
import { EventCard } from "@/components/EventCard";
import type { Locale } from "@/lib/i18n/config";

export const revalidate = 600;

type Props = LangParams & { searchParams: Promise<{ city?: string; kind?: string; when?: string }> };

const T = {
  ru: {
    h1: (c: string) => `Афиша ${c}`,
    all: "Вся Грузия",
    lead: "Концерты, спектакли, выставки, фестивали и события для детей. Только то, что ещё впереди: прошедшие события уходят из афиши сами.",
    when: { all: "Все даты", today: "Сегодня", weekend: "Выходные", week: "7 дней" },
    anyKind: "Всё",
    today: "Сегодня",
    tomorrow: "Завтра",
    empty: "На эти даты событий пока нет. Загляните позже или выберите другие даты.",
    add: "＋ Добавить своё мероприятие",
    addText: "Организуете концерт, выставку, мастер-класс или встречу? Добавьте событие в афишу бесплатно — мы проверим и опубликуем.",
    title: (c: string) => `Афиша ${c} — концерты, театр, выставки, события для детей`,
    desc: (c: string) => `Куда сходить ${c}: концерты, спектакли, выставки, фестивали и детские события на ближайшие дни. Даты, места, цены и билеты.`,
  },
  en: {
    h1: (c: string) => `Events ${c}`,
    all: "All Georgia",
    lead: "Concerts, theatre, exhibitions, festivals and events for kids. Only what's ahead: past events leave the listing automatically.",
    when: { all: "All dates", today: "Today", weekend: "Weekend", week: "7 days" },
    anyKind: "All",
    today: "Today",
    tomorrow: "Tomorrow",
    empty: "No events for these dates yet. Check back later or pick other dates.",
    add: "＋ Add your event",
    addText: "Organizing a concert, exhibition, workshop or meetup? Add it to the listing for free — we'll review and publish it.",
    title: (c: string) => `Events ${c} — concerts, theatre, exhibitions, kids`,
    desc: (c: string) => `What's on ${c}: concerts, theatre, exhibitions, festivals and kids' events. Dates, venues, prices and tickets.`,
  },
  ka: {
    h1: (c: string) => `აფიშა ${c}`,
    all: "მთელი საქართველო",
    lead: "კონცერტები, სპექტაკლები, გამოფენები, ფესტივალები და ღონისძიებები ბავშვებისთვის. მხოლოდ მომავალი ღონისძიებები.",
    when: { all: "ყველა თარიღი", today: "დღეს", weekend: "შაბათ-კვირა", week: "7 დღე" },
    anyKind: "ყველა",
    today: "დღეს",
    tomorrow: "ხვალ",
    empty: "ამ თარიღებზე ღონისძიებები ჯერ არ არის.",
    add: "＋ დაამატეთ თქვენი ღონისძიება",
    addText: "აწყობთ კონცერტს, გამოფენას ან შეხვედრას? დაამატეთ აფიშაში უფასოდ.",
    title: (c: string) => `აფიშა ${c} — კონცერტები, თეატრი, გამოფენები`,
    desc: (c: string) => `სად წავიდეთ ${c}: კონცერტები, სპექტაკლები, გამოფენები, ფესტივალები.`,
  },
} as const;

/** Начало дня по Тбилиси (UTC+4, без перехода на летнее время). */
function dayStart(d: Date) {
  const t = new Date(d.getTime() + 4 * 3600000);
  return new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()) - 4 * 3600000);
}
function range(when: string | undefined): { from?: Date; to?: Date } {
  const now = new Date();
  const d0 = dayStart(now);
  if (when === "today") return { from: now, to: new Date(d0.getTime() + 86400000 - 1) };
  if (when === "week") return { from: now, to: new Date(d0.getTime() + 7 * 86400000) };
  if (when === "weekend") {
    const wd = new Date(d0.getTime() + 4 * 3600000).getUTCDay(); // 0 — вс, 6 — сб
    const toSat = wd === 0 ? -1 : 6 - wd;
    const sat = new Date(d0.getTime() + toSat * 86400000);
    return { from: wd === 0 || wd === 6 ? now : sat, to: new Date(sat.getTime() + 2 * 86400000 - 1) };
  }
  return {};
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const lang = await langOf(params);
  const sp = await searchParams;
  const city = isCity(sp.city) ? sp.city : null;
  const c = city ? cityIn(city, lang) : lang === "ru" ? "в Грузии" : lang === "en" ? "in Georgia" : "საქართველოში";
  return pageMeta(lang, city ? `/afisha?city=${city}` : "/afisha", T[lang].title(c), T[lang].desc(c));
}

function dayLabel(iso: string, lang: Locale) {
  const t = T[lang];
  const d = dayStart(new Date(iso)).getTime();
  const today = dayStart(new Date()).getTime();
  if (d <= today) return t.today;
  if (d === today + 86400000) return t.tomorrow;
  return new Date(iso).toLocaleDateString(lang === "ru" ? "ru-RU" : lang === "ka" ? "ka-GE" : "en-GB", { timeZone: "Asia/Tbilisi", weekday: "long", day: "numeric", month: "long" });
}

export default async function AfishaPage({ params, searchParams }: Props) {
  const lang = await langOf(params);
  const t = T[lang];
  const sp = await searchParams;
  const city = isCity(sp.city) ? sp.city : null;
  const kind = EVENT_KINDS.some((k) => k.id === sp.kind) ? sp.kind! : null;
  const when = sp.when && sp.when in t.when ? sp.when : "all";
  const all = await upcomingEvents().catch(() => [] as CityEvent[]);
  const byCity: Record<string, number> = {};
  for (const e of all) byCity[e.city] = (byCity[e.city] ?? 0) + 1;
  const inCity = all.filter((e) => !city || e.city === city);
  const r = range(when);
  const list = inCity.filter((e) => (!kind || e.kind === kind) && (!r.to || new Date(e.starts_at) <= r.to) && (!r.from || new Date(e.ends_at ?? e.starts_at).getTime() >= r.from.getTime() - 6 * 3600000));
  const kindCounts: Record<string, number> = {};
  for (const e of inCity) kindCounts[e.kind] = (kindCounts[e.kind] ?? 0) + 1;
  // группы по дням; многодневные (выставки) — отдельно «Идут сейчас»
  const long = list.filter((e) => e.ends_at && new Date(e.ends_at).getTime() - new Date(e.starts_at).getTime() > 2 * 86400000);
  const single = list.filter((e) => !long.includes(e));
  const groups: { label: string; items: CityEvent[] }[] = [];
  for (const e of single) {
    const l = dayLabel(e.starts_at, lang);
    const g = groups.find((x) => x.label === l);
    if (g) g.items.push(e);
    else groups.push({ label: l, items: [e] });
  }
  const qs = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams(Object.entries({ city, kind, when: when === "all" ? null : when, ...patch }).filter(([, v]) => v) as [string, string][]);
    return href(lang, `/afisha${p.toString() ? `?${p}` : ""}`);
  };
  const chip = (on: boolean) => `inline-flex h-9 shrink-0 items-center rounded-full border px-3.5 text-[13px] font-medium ${on ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"}`;
  const cityName = city ? cityIn(city, lang) : lang === "ru" ? "Грузии" : lang === "en" ? "in Georgia" : "საქართველოში";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <section className="rounded-3xl border border-line bg-cream px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-[28px] font-bold leading-tight sm:text-[38px]">🎟 {t.h1(cityName)}</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-muted sm:text-[17px]">{t.lead}</p>
          </div>
          <Link href={href(lang, "/afisha/add")} className="btn-primary h-11 px-5 text-[14.5px]">
            {t.add}
          </Link>
        </div>
        <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href={qs({ city: null })} className={chip(!city)}>
            📍 {t.all} · {all.length}
          </Link>
          {CITIES.filter((c) => byCity[c.id] || c.id === city).map((c) => (
            <Link key={c.id} href={qs({ city: c.id })} className={chip(city === c.id)}>
              {c.label[lang]} · {byCity[c.id] ?? 0}
            </Link>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(Object.keys(t.when) as (keyof typeof t.when)[]).map((w) => (
            <Link key={w} href={qs({ when: w === "all" ? null : w })} className={chip(when === w)}>
              {t.when[w]}
            </Link>
          ))}
        </div>
      </section>

      {Object.keys(kindCounts).length > 1 && (
        <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href={qs({ kind: null })} className={chip(!kind)}>
            {t.anyKind}
          </Link>
          {EVENT_KINDS.filter((k) => kindCounts[k.id]).map((k) => (
            <Link key={k.id} href={qs({ kind: k.id })} className={chip(kind === k.id)}>
              {k.emoji} {k.label[lang]} · {kindCounts[k.id]}
            </Link>
          ))}
        </div>
      )}

      {list.length === 0 && <p className="mt-8 rounded-2xl border border-dashed border-line bg-white px-5 py-10 text-center text-[15px] text-muted">{t.empty}</p>}

      {groups.map((g) => (
        <section key={g.label} className="mt-8">
          <h2 className="text-[20px] font-bold first-letter:uppercase">{g.label}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {g.items.map((e) => (
              <EventCard key={e.id} e={e} lang={lang} showCity={!city} />
            ))}
          </div>
        </section>
      ))}

      {long.length > 0 && (
        <section className="mt-10">
          <h2 className="text-[20px] font-bold">{lang === "ru" ? "Выставки и долгие события" : lang === "en" ? "Exhibitions & ongoing" : "გამოფენები"}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {long.map((e) => (
              <EventCard key={e.id} e={e} lang={lang} showCity={!city} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 grid gap-4 rounded-3xl bg-brand px-6 py-7 text-white sm:grid-cols-[1fr_auto] sm:items-center sm:px-8">
        <p className="text-[15px] leading-relaxed text-white/90">{t.addText}</p>
        <Link href={href(lang, "/afisha/add")} className="btn inline-flex h-11 justify-center rounded-full bg-white px-6 text-[15px] font-semibold text-brand hover:bg-cream">
          {t.add}
        </Link>
      </section>
      {city && <p className="sr-only">{cityLabel(city, lang)}</p>}
    </div>
  );
}
