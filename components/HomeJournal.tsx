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
        <span className="emo text-[46px]" aria-hidden>
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

const PROMO = [
  { to: "/georgia", emoji: "🗺️", title: "Путеводитель по Грузии", text: "Города, районы, погода по месяцам, что посмотреть" },
  { to: "/places", emoji: "🏥", title: "Полезные контакты", text: "Клиники, нотариусы, городские службы — адреса и телефоны" },
  { to: "/guide?r=life", emoji: "🏠", title: "Жизнь в Грузии", text: "Аренда, налоги, банки, документы — по шагам" },
  { to: "/novostroyki", emoji: "🏗️", title: "Новостройки", text: "Жилые комплексы Грузии: цены, сроки сдачи, застройщики" },
];

export async function HomeJournal({ lang }: { lang: Locale }) {
  if (lang !== "ru") return null;
  const all = await journalArticles().catch(() => [] as Article[]);
  // Три свежие статьи с фото (без фото — в конец), чтобы главная не была бесконечной
  const fresh = [...all.filter((a) => a.cover), ...all.filter((a) => !a.cover)].slice(0, 3);

  return (
    <div className="mx-auto mt-14 max-w-6xl space-y-14 px-4 sm:px-6">
      {fresh.length > 0 && (
        <section>
          <Head title="📰 Журнал: Грузия сегодня" more={{ label: "Все статьи →", to: "/guide" }} lang={lang} />
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {fresh.map((a) => (
              <Link key={a.slug} href={url(a)} className="group flex overflow-hidden rounded-2xl border border-line bg-white transition hover:border-brand sm:block">
                <Cover a={a} h="h-auto min-h-20 sm:aspect-[16/10] sm:h-auto" cls="w-24 shrink-0 sm:w-auto [&>.emo]:text-[34px] sm:[&>.emo]:text-[46px]" />
                <span className="block p-3 sm:p-4">
                  <span className="block text-[15px] font-semibold leading-snug group-hover:text-brand sm:text-[16px]">{a.title}</span>
                  <span className="mt-1 block text-[12px] text-muted">
                    {RUBRICS[a.rubric ?? "home"].label} · {formatArticleDate(a.date)}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Разделы-справочники */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PROMO.map((x) => (
          <Link key={x.to} href={href(lang, x.to)} className="group flex items-start gap-3 rounded-2xl border border-line bg-cream p-4 transition hover:border-brand sm:p-5">
            <span className="text-[30px] leading-none" aria-hidden>
              {x.emoji}
            </span>
            <span>
              <span className="block text-[16px] font-bold group-hover:text-brand">{x.title} →</span>
              <span className="mt-1 block text-[13.5px] leading-snug text-muted">{x.text}</span>
            </span>
          </Link>
        ))}
      </section>

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
