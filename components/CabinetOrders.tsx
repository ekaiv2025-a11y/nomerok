import Link from "next/link";
import { listDirectFor, listMyResponses, listOrders } from "@/lib/orders-db";
import { OrderCard } from "./OrderCard";
import { TakeButton } from "./TakeButton";
import { ORD } from "@/lib/orders-text";
import { categoryLabel } from "@/lib/categories";
import { formatPhone, telegramLink } from "@/lib/phone";
import { servesCategory } from "@/lib/availability";
import { href, type Locale } from "@/lib/i18n";
import type { Master } from "@/lib/types";

/** Кабинет: заказы для специалиста, его отклики и личные сообщения. */
export async function CabinetOrders({ m, lang }: { m: Master; lang: Locale }) {
  const t = ORD[lang];
  const [orders, mine, direct] = await Promise.all([
    listOrders().catch(() => []),
    listMyResponses(m.id).catch(() => []),
    listDirectFor(m.id).catch(() => []),
  ]);
  const forYou = orders.filter(
    (o) => servesCategory(m, o.category) && (o.city ?? "batumi") === (m.city ?? "batumi") && o.status !== "done" && o.responses < 3 && !o.responders.includes(m.id),
  );
  const directOpen = direct.filter((o) => !o.responders.includes(m.id) && o.status !== "done");
  const fmt = (iso: string) => new Date(iso).toLocaleDateString(lang === "ka" ? "ka-GE" : lang === "en" ? "en-GB" : "ru-RU", { day: "numeric", month: "short" });

  return (
    <div id="orders" className="mt-4 scroll-mt-20 space-y-4">
      {directOpen.length > 0 && (
        <section className="rounded-2xl border-2 border-brand/40 bg-brand-soft p-5">
          <h2 className="text-[18px] font-bold">✉️ {t.direct} · {directOpen.length}</h2>
          <div className="mt-3 space-y-3">
            {directOpen.map((o) => (
              <div key={o.id} id={`o-${o.id}`} className="scroll-mt-24">
                <OrderCard o={o} lang={lang} action={<TakeButton id={o.id} lang={lang} />} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-line p-5">
        <h2 className="text-[18px] font-bold">🔥 {t.forYou} {forYou.length > 0 && `· ${forYou.length}`}</h2>
        <p className="mt-1 text-[14px] leading-relaxed text-muted">{t.forYouHint}</p>
        {forYou.length === 0 ? (
          <p className="mt-3 rounded-xl bg-cream p-4 text-[14px] text-muted">{t.forYouEmpty}</p>
        ) : (
          <div className="mt-3 space-y-3">
            {forYou.map((o) => (
              <div key={o.id} id={`o-${o.id}`} className="scroll-mt-24">
                <OrderCard o={o} lang={lang} action={<TakeButton id={o.id} lang={lang} />} />
              </div>
            ))}
          </div>
        )}
        {!m.notify_requests && <p className="mt-3 text-[13px] text-[#8a5a00]">🔔 {t.subscribeHint}</p>}
        <Link href={href(lang, "/orders")} className="mt-3 inline-block text-[14px] font-semibold text-brand hover:underline">
          {t.all}
        </Link>
      </section>

      <section className="rounded-2xl border border-line p-5">
        <h2 className="text-[18px] font-bold">✋ {t.mine} {mine.length > 0 && `· ${mine.length}`}</h2>
        {mine.length === 0 ? (
          <p className="mt-3 rounded-xl bg-cream p-4 text-[14px] text-muted">{t.mineEmpty}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {mine.map((r) => (
              <li key={r.id} className="rounded-xl border border-line bg-white p-4">
                <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
                  <span className="font-semibold text-ink">{categoryLabel(r.category, lang)}</span>
                  <span>· {fmt(r.responded_at)}</span>
                  {r.master_id && <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[12px] text-brand-dark">✉️ {t.direct}</span>}
                  {r.outcome_master_id === m.id && <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[12px] text-brand-dark">🤝</span>}
                  {r.status === "done" && <span className="rounded-full bg-cream px-2 py-0.5 text-[12px]">{t.closed}</span>}
                </div>
                <p className="mt-2 whitespace-pre-line text-[15px]">{r.description}</p>
                {r.when_text && <p className="mt-1 text-[13px] text-muted">🕒 {r.when_text}</p>}
                {(r.photos ?? []).length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {(r.photos ?? []).map((u) => (
                      <a key={u} href={u} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u} alt="" className="h-16 w-16 rounded-lg object-cover" />
                      </a>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[14px]">
                  <span className="text-muted">{t.client}:</span>
                  <b>{r.name || "—"}</b>
                  <a href={`tel:${r.phone}`} className="btn-ghost h-9 px-3 text-[13px]">📞 {formatPhone(r.phone)}</a>
                  <a href={telegramLink(null, r.phone)} target="_blank" rel="noopener noreferrer" className="btn h-9 bg-[#229ED9] px-3 text-[13px] text-white hover:bg-[#1c89bd]">
                    {t.write}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
