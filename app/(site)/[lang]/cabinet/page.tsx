import type { Metadata } from "next";
import Link from "next/link";
import { adminGetMaster, touchActive } from "@/lib/db";
import { UnarchiveButton } from "@/components/UnarchiveButton";
import { PortfolioEditor } from "@/components/PortfolioEditor";
import { DocumentsEditor } from "@/components/DocumentsEditor";
import { signedUrls } from "@/lib/documents";
import { masterStats, viewsByDay } from "@/lib/stats";
import { StatsCard } from "@/components/StatsCard";
import { QrCards } from "@/components/QrCards";
import { NotifyToggle } from "@/components/NotifyToggle";
import { CabinetOrders } from "@/components/CabinetOrders";
import { ShortLinkCard } from "@/components/ShortLinkCard";
import { ReferralEditor } from "@/components/ReferralEditor";
import { CabinetLogin } from "@/components/CabinetLogin";
import { SpecMark } from "@/components/SpecMark";
import { posStyle } from "@/lib/photo-pos";

const CAB_TABS = {
  ru: [["home", "🏠 Главная"], ["orders", "📩 Заявки"], ["profile", "✏️ Анкета"], ["reviews", "⭐ Отзывы"], ["promo", "🚀 Продвижение"]],
  en: [["home", "🏠 Home"], ["orders", "📩 Requests"], ["profile", "✏️ Profile"], ["reviews", "⭐ Reviews"], ["promo", "🚀 Promotion"]],
  ka: [["home", "🏠 მთავარი"], ["orders", "📩 მოთხოვნები"], ["profile", "✏️ ანკეტა"], ["reviews", "⭐ შეფასებები"], ["promo", "🚀 პოპულარიზაცია"]],
} as const;

const OR = { ru: "или войти по ссылке из бота", en: "or log in with a link from the bot", ka: "ან შედით ბოტის ბმულით" } as const;
import { offerStatus, recentCodes } from "@/lib/referral-db";
import { transliterate } from "@/lib/slug";
import { SITE_URL } from "@/lib/site";
import { getDict, href } from "@/lib/i18n";
import { langOf, type LangParams } from "@/lib/i18n/page";
import { currentSpecialistId } from "@/lib/spec-auth";
import { botLink, botUsername } from "@/lib/telegram";
import { profileSteps } from "@/lib/profile";
import { categoryLabel } from "@/lib/categories";
import { formatPhone } from "@/lib/phone";
import { CabinetForm } from "@/components/CabinetForm";
import { AvailabilityCard } from "@/components/AvailabilityCard";
import { formatDay, isAwayNow } from "@/lib/availability";
import { ReviewReply } from "@/components/ReviewReply";
import { Stars } from "@/components/Stars";
import { listMasterReviews } from "@/lib/reviews-db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  return { title: getDict(lang).cabinet.title, robots: { index: false } };
}

type Props = LangParams & { searchParams: Promise<{ expired?: string; tab?: string }> };

export default async function CabinetPage({ params, searchParams }: Props) {
  const lang = await langOf(params);
  const t = getDict(lang).cabinet;
  const sp = await searchParams;
  const id = await currentSpecialistId();
  const m = id ? await adminGetMaster(id).catch(() => null) : null;

  if (!m) {
    const bot = await botUsername();
    return (
      <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
        <div className="rounded-3xl border border-line bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <h1 className="mt-4 text-center text-[24px] font-bold">{t.title}</h1>
          <p className="mt-2 text-center text-[15px] leading-relaxed text-muted">{t.loginText}</p>
          {sp.expired && <p className="mt-4 rounded-xl bg-[#fdf6e6] p-3 text-[14px] text-[#5a4a22]">{t.expired}</p>}
          <CabinetLogin lang={lang} />
          <p className="mt-5 flex items-center gap-3 text-[13px] text-muted before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">{OR[lang]}</p>
          {bot && (
            <a
              href={`https://t.me/${bot}?start=login`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn mt-4 w-full gap-2.5 rounded-2xl bg-[#229ED9] py-3.5 text-[16px] text-white hover:bg-[#1c89bd]"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
                <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
              </svg>
              {t.loginBtn}
            </a>
          )}
          <div className="mt-6 flex gap-2.5 rounded-2xl bg-cream p-4 text-[13px] leading-relaxed text-muted">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-brand" aria-hidden>
              <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <span>{t.loginSafe}</span>
          </div>
        </div>
        <p className="mt-6 text-center text-[14px] text-muted">
          {t.noProfile}{" "}
          <Link href={href(lang, "/join")} className="font-semibold text-brand underline">
            {t.noProfileLink}
          </Link>
        </p>
      </div>
    );
  }

  // Зашёл в кабинет — значит, на связи
  await touchActive([m]);
  const { steps, percent } = profileSteps(m);
  const rv = getDict(lang).reviews;
  const reviews = await listMasterReviews(m.id).catch(() => []);
  const refStatus = await offerStatus(m.id).catch(() => null);
  const refCodes = refStatus ? await recentCodes(m.id).catch(() => []) : [];
  const zero = { views: 0, contacts: 0, taken: 0 };
  const [week, month, byDay] = await Promise.all([
    masterStats(m.id, 7).catch(() => zero),
    masterStats(m.id, 30).catch(() => zero),
    viewsByDay(m.id, 30).catch(() => []),
  ]);
  const rating = reviews.length ? { value: reviews.reduce((a, r) => a + r.rating, 0) / reviews.length, count: reviews.length } : null;
  const bot = await botUsername();
  const docList = Array.isArray(m.documents) ? m.documents : [];
  const docUrls = await signedUrls(docList.map((x) => x.path)).catch(() => ({}) as Record<string, string>);
  const myDocs = docList.map((x) => ({ id: x.id, title: x.title, kind: x.kind, type: x.type, public: x.public, status: x.status, url: docUrls[x.path] ?? null }));
  const verifyLink = m.phone_verified_at ? null : await botLink(`m_${m.tg_link_token}`);
  const statusColor =
    m.status === "published" ? "bg-brand-soft text-brand-dark" : m.status === "pending" ? "bg-[#fdf6e6] text-[#5a4a22]" : "bg-[#fdecea] text-danger";

  const tab = (["home", "orders", "profile", "reviews", "promo"] as const).find((x) => x === sp.tab) ?? "home";
  const tabHref = (k: string) => `/${lang}/cabinet${k === "home" ? "" : `?tab=${k}`}`;
  const TABS = CAB_TABS[lang];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <SpecMark />
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-cream">
          {m.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.photo_url.split("#")[0]} alt="" className="h-full w-full object-cover" style={posStyle(m.photo_url)} />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[20px] font-bold text-brand">{m.name.slice(0, 1)}</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[22px] font-bold leading-tight sm:text-[26px]">{m.name}</h1>
          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[14px] text-muted">
            {categoryLabel(m.category, lang)}
            <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${statusColor}`}>{t.statuses[m.status]}</span>
          </p>
        </div>
        <a href={`/api/cabinet/logout?lang=${lang}`} className="btn-ghost h-9 shrink-0 px-3 text-[13px]">
          {t.logout}
        </a>
      </div>

      {/* Разделы кабинета */}
      <nav className="no-scrollbar sticky top-14 z-30 -mx-4 mt-5 flex gap-1.5 overflow-x-auto bg-white/95 px-4 py-2 backdrop-blur md:top-16">
        {TABS.map(([k, label]) => (
          <Link
            key={k}
            href={tabHref(k)}
            scroll={false}
            className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold transition ${tab === k ? "bg-brand text-white" : "bg-cream text-ink hover:bg-brand-soft"}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {tab === "home" && (
        <div className="mt-4 space-y-4">
          {m.archived_at && (
            <div className="rounded-2xl border border-danger/40 bg-[#fdecea] p-5">
              <p className="text-[16px] font-semibold">📦 {t.archivedTitle}</p>
              <p className="mt-1 text-[14px] leading-relaxed">{m.archived_reason === "missed" ? t.archivedMissed : t.archivedInactive}</p>
              <UnarchiveButton lang={lang} label={t.unarchiveBtn} />
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line p-5">
              <p className="text-[13px] text-muted">{t.status}</p>
              <span className={`mt-2 inline-block rounded-full px-3 py-1 text-[14px] font-semibold ${statusColor}`}>{t.statuses[m.status]}</span>
              {m.status === "published" && (
                <a href={`/${lang}/master/${m.slug}`} target="_blank" className="mt-3 block text-[14px] font-semibold text-brand hover:underline">
                  {t.viewPublic}
                </a>
              )}
            </div>
            <div className="rounded-2xl border border-line p-5">
              <p className="text-[15px] font-semibold">{t.readiness(percent)}</p>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-cream">
                <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${percent}%` }} />
              </div>
              {percent < 100 && (
                <>
                  <p className="mt-4 text-[13px] font-semibold text-muted">{t.stepsTitle}</p>
                  <ul className="mt-2 space-y-1.5 text-[14px]">
                    {steps.filter((s) => !s.done).map((s) => (
                      <li key={s.id} className="flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line text-[11px]" />
                        <Link href={tabHref("profile")} className="hover:text-brand hover:underline">{t.steps[s.id]}</Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {verifyLink && (
                <a href={verifyLink} target="_blank" rel="noopener noreferrer" className="btn mt-4 h-10 w-full bg-[#229ED9] text-[14px] text-white hover:bg-[#1c89bd]">
                  {t.verifyBtn}
                </a>
              )}
            </div>
          </div>
          <AvailabilityCard lang={lang} away={isAwayNow(m)} untilLabel={m.away_until ? formatDay(m.away_until, lang) : null} />
          <StatsCard lang={lang} week={week} month={month} byDay={byDay} />
        </div>
      )}

      {tab === "orders" && (
        <div className="mt-4">
          <NotifyToggle lang={lang} initial={!!m.notify_requests} hasBot={!!m.tg_chat_id} />
          {m.status === "published" ? <CabinetOrders m={m} lang={lang} /> : <p className="mt-4 text-[14px] text-muted">{t.statuses[m.status]}</p>}
        </div>
      )}

      {tab === "profile" && (
        <div className="mt-4">
          <CabinetForm
            lang={lang}
            phone={formatPhone(m.phone)}
            initial={{
              name: m.name,
              services: m.services,
              about: m.about,
              credentials: m.credentials,
              experience_years: m.experience_years,
              price_from: m.price_from,
              price_unit: m.price_unit,
              languages: m.languages,
              telegram: m.telegram,
              whatsapp: m.whatsapp,
              notify_requests: m.notify_requests,
              photo_url: m.photo_url,
              category: m.category,
              city: m.city ?? "batumi",
              links: m.links ?? {},
              extra_categories: m.extra_categories ?? [],
              where: {
                work_mode: m.work_mode ?? "at_client",
                service_area: m.service_area ?? "",
                work_hours: m.work_hours ?? "",
                place_address: m.place_address ?? "",
                place_lat: m.place_lat ?? null,
                place_lng: m.place_lng ?? null,
              },
            }}
          />
          <div className="mt-8">
            <PortfolioEditor lang={lang} initial={Array.isArray(m.portfolio) ? m.portfolio : []} />
          </div>
          <div className="mt-8">
            <DocumentsEditor lang={lang} initial={myDocs} />
          </div>
        </div>
      )}

      {tab === "reviews" && (
        <section className="mt-4 rounded-2xl border border-line p-5">
          <h2 className="text-[18px] font-bold">{rv.cabinetTitle}</h2>
          {reviews.length === 0 ? (
            <p className="mt-2 text-[14px] leading-relaxed text-muted">{rv.cabinetNone}</p>
          ) : (
            <ul className="mt-4 space-y-5">
              {reviews.map((r) => (
                <li key={r.id} className="border-t border-line pt-4 first:border-0 first:pt-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <b>{r.author_name}</b>
                    <Stars value={r.rating} size={14} />
                  </div>
                  <p className="mt-1 whitespace-pre-line text-[15px] text-[#3a3935]">{r.text}</p>
                  {r.photos.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {r.photos.map((p) => (
                        <a key={p} href={p} target="_blank" rel="noopener noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p} alt="" className="h-16 w-16 rounded-lg object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                  <ReviewReply lang={lang} reviewId={r.id} initial={r.reply} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === "promo" && (
        <div className="mt-4 space-y-4">
          <ReferralEditor
            lang={lang}
            initial={refStatus?.offer ?? null}
            issued={refStatus?.issued ?? 0}
            codes={refCodes.map((c) => ({ code: c.code, name: c.name, created_at: c.created_at }))}
            suggestion={transliterate(m.name.split(/\s+/)[0] ?? "").toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 12) || "NOMEROK"}
          />
          <ShortLinkCard lang={lang} initial={m.short ?? null} suggestion={transliterate(m.name.split(/\s+/)[0] ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 20)} />
          <QrCards
            lang={lang}
            name={m.name}
            category={categoryLabel(m.category, lang)}
            photo={m.photo_url}
            verified={!!m.phone_verified_at}
            rating={rating}
            profileUrl={`${SITE_URL}/${lang}/master/${m.slug}`}
            reviewUrl={bot ? `https://t.me/${bot}?start=rv_${m.id}` : null}
          />
        </div>
      )}
    </div>
  );
}
