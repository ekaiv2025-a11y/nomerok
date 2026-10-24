import Link from "next/link";
import { RUBRICS, formatArticleDate, type Article } from "@/lib/articles";
import { journalArticles } from "@/lib/journal";
import { href, type Locale } from "@/lib/i18n";
import { posStyle } from "@/lib/photo-pos";
import { cityLabel, isCity } from "@/lib/cities";

/*
 * Главная: живой журнал под каталогом — новости, афиша, куда поехать, подборки, советы.
 * Всё наполняется само (автоновости и статьи), специалисты остаются сверху страницы.
 * Статьи пока только на русском — на других языках блок не показываем.
 */

const url = (a: Article) => `/ru/guide/${a.slug}`;

function Cover({ a, h = "h-32", cls = "" }: { a: Article; h?: string; cls?: string }) {
  const rub = RUBRICS[a.rubric ?? "home"];
  return (
    <span className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${rub.bg} ${h} ${cls}`}>
      {a.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={a.cover} alt="" className="absolute inset-0 h-full w-full object-cover" style={posStyle(a.cover)} loading="lazy" />
      ) : (
        <span className="text-[46px]" aria-hidden>
          {a.emoji}
        </span>
      )}
      {(a.rubric === "news" || a.rubric === "events") && (
        <span className="absolute bottom-2 left-2 rounded-full bg-ink/75 px-2 py-0.5 text-[11px] font-semibold text-white">📍 {a.place || (isCity(a.city) ? cityLabel(a.city, "ru") : "Вся Грузия")}</span>
      )}
    </span>
  );
}

function Head({ title, more, lang }: { title: string; more?: { label: string; to: string }; lang: Locale }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <h2 className="text-[22px] font-bold leading-tight">{title}</h2>
      {more && (
        <Link href={href(lang, more.to)} className="shrink-0 text-[14px] font-semibold text-brand hover:underline">
          {more.label}
        </Link>
      )}
    </div>
  );
}

export async function HomeJournal({ lang }: { lang: Locale }) {
  if (lang !== "ru") return null;
  const all = await journalArticles().catch(() => [] as Article[]);
  const by = (r: string) => all.filter((a) => a.rubric === r);
  const news = by("news").slice(0, 3);
  const event = by("events")[0];
  const travel = by("travel").slice(0, 8);
  const picks = by("picks").slice(0, 3);
  const useful = all.filter((a) => ["home", "life", "family", "health"].includes(a.rubric ?? "home")).slice(0, 4);
  if (!all.length) return null;

  return (
    <div className="mx-auto mt-14 max-w-6xl space-y-14 px-4 sm:px-6">
      {/* Новости + афиша */}
      {(news.length > 0 || event) && (
        <section>
          <Head title="📰 Жизнь в Грузии: новости" more={{ label: "Все новости →", to: "/guide?r=news" }} lang={lang} />
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <div className="space-y-3 lg:col-span-2">
              {news.map((a) => (
                <Link key={a.slug} href={url(a)} className="flex gap-4 rounded-2xl border border-line bg-white p-4 transition hover:border-brand">
                  <span className="text-[30px] leading-none" aria-hidden>
                    {a.emoji}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[16px] font-semibold leading-snug">{a.title}</span>
                    <span className="mt-1 line-clamp-2 block text-[14px] text-muted">{a.description}</span>
                    <span className="mt-1 block text-[12px] text-muted">{formatArticleDate(a.date)}</span>
                  </span>
                </Link>
              ))}
            </div>
            {event && (
              <Link href={url(event)} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:border-brand">
                <Cover a={event} h="aspect-[16/10]" />
                <span className="p-4">
                  <span className="text-[12px] font-semibold uppercase tracking-wide text-brand">🎟️ Афиша</span>
                  <span className="mt-1 block text-[17px] font-bold leading-snug group-hover:text-brand">{event.title}</span>
                  <span className="mt-1 line-clamp-3 block text-[14px] text-muted">{event.description}</span>
                </span>
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Куда поехать — карусель */}
      {travel.length > 0 && (
        <section>
          <Head title="🧭 Куда поехать в Грузии" more={{ label: "Все маршруты →", to: "/guide?r=travel" }} lang={lang} />
          <div className="no-scrollbar -mx-4 mt-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {travel.map((a) => (
              <Link key={a.slug} href={url(a)} className="group w-[260px] shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-white transition hover:border-brand sm:w-[300px]">
                <Cover a={a} h="aspect-[16/10]" />
                <span className="block p-4">
                  <span className="block text-[16px] font-bold leading-snug group-hover:text-brand">{a.title}</span>
                  <span className="mt-1 line-clamp-2 block text-[13px] text-muted">{a.description}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Подборки мест */}
      {picks.length > 0 && (
        <section>
          <Head title="📍 Подборки мест" more={{ label: "Все места →", to: "/places" }} lang={lang} />
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {picks.map((a) => (
              <Link key={a.slug} href={url(a)} className="group flex overflow-hidden rounded-2xl border border-line bg-white transition hover:border-brand sm:block">
                <Cover a={a} h="h-auto min-h-20 sm:aspect-[16/10] sm:h-auto" cls="w-24 shrink-0 sm:w-auto [&>span]:text-[34px] sm:[&>span]:text-[46px]" />
                <span className="flex items-center p-3 text-[15px] font-semibold leading-snug group-hover:text-brand sm:block sm:p-4 sm:text-[16px]">{a.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Полезное */}
      {useful.length > 0 && (
        <section>
          <Head title="💡 Полезно знать" more={{ label: "Весь журнал →", to: "/guide" }} lang={lang} />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {useful.map((a) => (
              <Link key={a.slug} href={url(a)} className="group flex overflow-hidden rounded-2xl border border-line bg-white transition hover:border-brand sm:block">
                <Cover a={a} h="h-auto min-h-20 sm:aspect-[16/10] sm:h-auto" cls="w-24 shrink-0 sm:w-auto [&>span]:text-[34px] sm:[&>span]:text-[46px]" />
                <span className="flex items-center p-3 text-[15px] font-semibold leading-snug group-hover:text-brand sm:block sm:p-4">{a.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Для специалистов */}
      <section className="rounded-3xl bg-brand p-6 text-white sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
        <div>
          <p className="text-[22px] font-bold leading-tight sm:text-[26px]">Вы специалист? Клиенты найдут вас сами</p>
          <p className="mt-2 text-[15px] text-[#cfe6da]">Регистрация через Telegram за 3 минуты · заявки приходят в Telegram · без комиссии и посредников</p>
        </div>
        <Link href={href(lang, "/join")} className="mt-4 inline-flex h-12 shrink-0 items-center rounded-full bg-[#e0a526] px-6 text-[16px] font-bold text-ink hover:brightness-105 sm:mt-0">
          Зарегистрироваться
        </Link>
      </section>
    </div>
  );
}
