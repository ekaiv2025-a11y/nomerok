import type { Metadata } from "next";
import Link from "next/link";
import { Send } from "lucide-react";
import { currentClientChatId } from "@/lib/client-auth";
import { listClientRequests, listResponsesFor } from "@/lib/client-db";
import { listPublishedMasters } from "@/lib/db";
import { hasReviewFrom } from "@/lib/reviews-db";
import { reviewToken } from "@/lib/signed";
import { botLink } from "@/lib/telegram";
import { categoryLabel } from "@/lib/categories";
import { MY } from "@/lib/my-text";
import { href } from "@/lib/i18n";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";
import { CloseRequestButton, LogoutButton, MyFavs } from "@/components/MyClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  return { ...pageMeta(lang, "/my", MY[lang].title), robots: { index: false } };
}

export default async function MyPage({ params, searchParams }: LangParams & { searchParams: Promise<{ expired?: string }> }) {
  const lang = await langOf(params);
  const t = MY[lang];
  const chatId = await currentClientChatId();

  if (!chatId) {
    const link = await botLink(`my_${lang}`);
    const { expired } = await searchParams;
    return (
      <div className="mx-auto max-w-xl px-4 py-10 sm:py-14">
        <h1 className="text-[26px] font-bold sm:text-[32px]">📋 {t.title}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{t.loginLead}</p>
        {expired && <p className="mt-3 rounded-xl bg-[#fdf6e6] p-3 text-[14px]">⏰ Ссылка устарела — войдите ещё раз.</p>}
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="btn mt-6 h-12 w-full bg-[#229ED9] text-white hover:bg-[#1c89bd]">
            <Send className="h-4 w-4" /> {t.loginBtn}
          </a>
        ) : (
          <p className="mt-6 text-danger">{t.noBot}</p>
        )}
        <p className="mt-2 text-center text-[13px] text-muted">{t.loginNote}</p>
      </div>
    );
  }

  const [requests, masters] = await Promise.all([listClientRequests(chatId).catch(() => []), listPublishedMasters().catch(() => [])]);
  const responses = await listResponsesFor(requests.map((r) => r.id)).catch(() => []);
  const byId = new Map(masters.map((m) => [m.id, m]));
  const fmt = (iso: string) => new Date(iso).toLocaleDateString(lang === "ka" ? "ka-GE" : lang === "en" ? "en-GB" : "ru-RU", { day: "numeric", month: "long" });

  const rows = await Promise.all(
    requests.map(async (r) => {
      const ids = [...new Set([r.outcome_master_id, ...responses.filter((x) => x.request_id === r.id).map((x) => x.master_id)].filter(Boolean) as string[])];
      const people = await Promise.all(
        ids.map(async (id) => {
          const m = byId.get(id);
          if (!m) return null;
          const reviewed = await hasReviewFrom(id, chatId).catch(() => true);
          return { m, review: reviewed ? null : href(lang, `/review?t=${reviewToken({ m: id, c: chatId, n: (r.name || "").slice(0, 60), r: r.id })}`), agreed: r.outcome_master_id === id };
        }),
      );
      return { r, people: people.filter((p): p is NonNullable<typeof p> => !!p) };
    }),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] font-bold sm:text-[32px]">📋 {t.title}</h1>
        <div className="flex items-center gap-4">
          <Link href={href(lang, "/request")} className="btn-primary h-10 px-4 text-[14px]">
            + {t.newRequest}
          </Link>
          <LogoutButton lang={lang} />
        </div>
      </div>

      <h2 className="mt-8 text-[19px] font-bold">{t.requests}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 rounded-2xl bg-cream p-5 text-[14px] text-muted">{t.noRequests}</p>
      ) : (
        <div className="mt-3 space-y-3">
          {rows.map(({ r, people }) => (
            <div key={r.id} className="rounded-2xl border border-line bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
                <span className="font-semibold text-ink">{categoryLabel(r.category, lang)}</span>
                <span>· {fmt(r.created_at)}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-medium ${r.status === "done" ? "bg-cream text-muted" : r.status === "taken" ? "bg-brand-soft text-brand-dark" : "bg-[#fdf6e6] text-[#5a4a22]"}`}>
                  {t.status[r.status] ?? r.status}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-line text-[15px]">{r.description}</p>
                {(r.photos ?? []).length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {(r.photos ?? []).map((u) => (
                      <a key={u} href={u} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u} alt="" className="h-20 w-20 rounded-lg object-cover" />
                      </a>
                    ))}
                  </div>
                )}
              {r.when_text && (
                <p className="mt-1 text-[13px] text-muted">
                  {t.when}: {r.when_text}
                </p>
              )}
              <div className="mt-3">
                <p className="text-[13px] font-semibold">{t.responded}</p>
                {people.length === 0 ? (
                  <p className="mt-1 text-[13px] text-muted">{r.status === "done" ? "—" : t.noResponses}</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {people.map(({ m, review, agreed }) => (
                      <li key={m.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-cream px-3 py-2">
                        <span className="font-semibold">{m.name}</span>
                        <span className="text-[13px] text-muted">{categoryLabel(m.category, lang)}</span>
                        {agreed && <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[12px] text-brand-dark">🤝 {t.worked}</span>}
                        <span className="grow" />
                        <Link href={href(lang, `/master/${m.slug}`)} className="btn-ghost h-8 px-3 text-[13px]">
                          {t.profile}
                        </Link>
                        {review && (
                          <Link href={review} className="btn-ghost h-8 px-3 text-[13px]">
                            ⭐ {t.review}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {r.status !== "done" && <CloseRequestButton id={r.id} lang={lang} />}
                <Link href={href(lang, `/request?category=${r.category}${r.city && r.city !== "batumi" ? `&city=${r.city}` : ""}`)} className="btn-ghost h-9 px-4 text-[13px]">
                  ↻ {t.similar}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-10 text-[19px] font-bold">❤️ {t.favs}</h2>
      <p className="text-[13px] text-muted">{t.favsNote}</p>
      <MyFavs masters={masters} lang={lang} />
    </div>
  );
}
