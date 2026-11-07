import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href } from "@/lib/i18n";
import { langOf, pageMeta } from "@/lib/i18n/page";
import { cityLabel } from "@/lib/cities";
import { getEvent, upcomingEvents } from "@/lib/events-db";
import { eventWhen, isUpcoming, kindOf } from "@/lib/events";
import { EventCard } from "@/components/EventCard";
import { MasterCard } from "@/components/MasterCard";
import { listPublishedMasters } from "@/lib/db";
import { localizeMasters } from "@/lib/translate-db";

export const revalidate = 600;

type Props = { params: Promise<{ lang: string; slug: string }> };

const T = {
  ru: { back: "← Афиша", when: "Когда", where: "Где", price: "Цена", tickets: "Билеты и подробности", past: "Это событие уже прошло", more: "Ещё в афише", route: "Как добраться", src: "Источник", user: "Добавлено организатором" },
  en: { back: "← Events", when: "When", where: "Where", price: "Price", tickets: "Tickets & details", past: "This event has already passed", more: "More events", route: "Directions", src: "Source", user: "Added by the organizer" },
  ka: { back: "← აფიშა", when: "როდის", where: "სად", price: "ფასი", tickets: "ბილეთები", past: "ღონისძიება უკვე დასრულდა", more: "კიდევ აფიშაში", route: "მარშრუტი", src: "წყარო", user: "დაამატა ორგანიზატორმა" },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lang = await langOf(params);
  const e = await getEvent(slug).catch(() => null);
  if (!e || e.status !== "published") return {};
  const m = pageMeta(lang, `/afisha/${slug}`, `${e.title} — ${eventWhen(e, lang)}, ${cityLabel(e.city, lang)}`, (e.description ?? `${e.venue ?? ""} ${eventWhen(e, lang)}`).slice(0, 180));
  // прошедшие события — в архиве: в поиске не нужны
  return isUpcoming(e) ? m : { ...m, robots: { index: false, follow: true } };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const lang = await langOf(params);
  const t = T[lang];
  const e = await getEvent(slug).catch(() => null);
  if (!e || e.status !== "published") notFound();
  const k = kindOf(e.kind);
  const live = isUpcoming(e);
  const more = live ? (await upcomingEvents({ city: e.city }).catch(() => [])).filter((x) => x.id !== e.id).slice(0, 4) : [];
  const where = [e.venue, e.address].filter(Boolean).join(", ");
  // Организатор — специалист из каталога: показываем его карточку
  const org = e.master_id ? (await listPublishedMasters().catch(() => [])).find((m) => m.id === e.master_id) ?? null : null;
  const ld = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    startDate: e.starts_at,
    ...(e.ends_at ? { endDate: e.ends_at } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    location: { "@type": "Place", name: e.venue ?? cityLabel(e.city, lang), address: e.address ?? cityLabel(e.city, lang) },
    ...(e.image ? { image: [e.image] } : {}),
    ...(e.description ? { description: e.description } : {}),
    ...(e.url ? { offers: { "@type": "Offer", url: e.url } } : {}),
  };
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Link href={href(lang, `/afisha?city=${e.city}`)} className="text-[14px] text-muted hover:text-ink">
        {t.back}
      </Link>
      {!live && <p className="mt-3 rounded-xl bg-[#fdf1f0] px-4 py-2.5 text-[14px] font-semibold text-danger">{t.past}</p>}
      <div className="mt-4 grid gap-6 md:grid-cols-[1fr_300px]">
        <div>
          {e.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={e.image} alt={e.title} className="w-full rounded-2xl border border-line bg-cream object-cover" />
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center rounded-2xl bg-cream text-[80px]" aria-hidden>
              {k.emoji}
            </div>
          )}
          <p className="mt-4 text-[13px] font-semibold text-brand">
            {k.emoji} {k.label[lang]} · {cityLabel(e.city, lang)}
          </p>
          <h1 className="mt-1 text-[26px] font-bold leading-tight sm:text-[34px]">{e.title}</h1>
          {e.description && <div className="mt-4 whitespace-pre-line text-[15.5px] leading-relaxed text-[#3a3935]">{e.description}</div>}
          {e.source === "user" && <p className="mt-6 text-[12px] text-muted">{t.user}</p>}
        </div>
        <aside className="space-y-3 md:sticky md:top-20 md:self-start">
          <div className="rounded-2xl border border-line bg-white p-5 text-[14.5px]">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">{t.when}</p>
            <p className="mt-0.5 font-semibold first-letter:uppercase">{eventWhen(e, lang)}</p>
            {where && (
              <>
                <p className="mt-3 text-[12px] font-semibold uppercase tracking-wide text-muted">{t.where}</p>
                <p className="mt-0.5">{where}</p>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${where}, ${cityLabel(e.city, "en")}`)}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[13px] font-semibold text-brand hover:underline">
                  🧭 {t.route}
                </a>
              </>
            )}
            {e.price && (
              <>
                <p className="mt-3 text-[12px] font-semibold uppercase tracking-wide text-muted">{t.price}</p>
                <p className="mt-0.5">{e.price}</p>
              </>
            )}
            {e.url && live && (
              <a href={e.url} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4 h-11 w-full text-[15px]">
                🎟 {t.tickets}
              </a>
            )}
          </div>
          {org && (
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted">{lang === "ru" ? "Организатор" : lang === "en" ? "Organizer" : "ორგანიზატორი"}</p>
              <MasterCard m={(await localizeMasters([org], lang).catch(() => [org]))[0]} lang={lang} />
            </div>
          )}
        </aside>
      </div>
      {more.length > 0 && (
        <section className="mt-12">
          <h2 className="text-[20px] font-bold">{t.more}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {more.map((x) => (
              <EventCard key={x.id} e={x} lang={lang} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
