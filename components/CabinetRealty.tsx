import Link from "next/link";
import { channelsOf, getListing, listingsOf, nextBumpAt } from "@/lib/realty-db";
import { DEALS, listingQuality, priceLabel, type Listing } from "@/lib/realty";
import { botUsername } from "@/lib/telegram";
import { href, type Locale } from "@/lib/i18n";
import type { Master } from "@/lib/types";
import { ListingEditor } from "./ListingEditor";
import { channelAction, listingAction } from "@/app/(site)/[lang]/cabinet/realty-actions";

const T = {
  ru: { title: "Мои объявления", add: "+ Новое объявление", saved: "✅ Сохранено", empty: "Объявлений пока нет. Добавьте вручную или подключите свой Telegram-канал — посты сами станут объявлениями.", status: { draft: "черновик", published: "опубликовано", archived: "в архиве", hidden: "скрыто (жалобы)" }, until: "до", edit: "Изменить", publish: "Опубликовать", renew: "Продлить на 60 дней", archive: "В архив", del: "Удалить", view: "Открыть", tgTitle: "Автоматически из Telegram-канала", tgSteps: (bot: string) => [`Откройте свой канал → «Администраторы» → «Добавить администратора».`, `Найдите @${bot} и добавьте. Достаточно права «Публикация сообщений» — бот ничего не пишет в канал.`, "Готово: каждый новый пост с фото и описанием квартиры станет объявлением на NomerOk. Бот сам найдёт цену, комнаты, площадь и район."], tgNone: "Каналы не подключены.", auto: "Публиковать сразу", manual: "Сначала в черновики", on: "сразу на сайт", off: "в черновики", disconnect: "Отключить", life: "Объявления живут 60 дней. За 3 дня до конца бот напомнит — продлить можно одной кнопкой.", src: "из Telegram", stats: (v: number, c: number) => `👁 ${v} просмотров · 📞 ${c} обращений`, total: (n: number, v: number, c: number) => `Активных объявлений: ${n} · просмотров: ${v} · обращений: ${c}`, q: (p: number) => `заполнено ${p}%`, bump: "⬆ Поднять", bumpHint: "Поднять бесплатно можно раз в 7 дней — объявление снова будет как новое.", bumpAt: (d: string) => `поднять можно с ${d}`, copy: "Копировать", fix: "Дополнить" },
  en: { title: "My listings", add: "+ New listing", saved: "✅ Saved", empty: "No listings yet. Add one manually or connect your Telegram channel — posts will become listings automatically.", status: { draft: "draft", published: "published", archived: "archived", hidden: "hidden (reports)" }, until: "until", edit: "Edit", publish: "Publish", renew: "Renew for 60 days", archive: "Archive", del: "Delete", view: "Open", tgTitle: "Automatically from a Telegram channel", tgSteps: (bot: string) => ["Open your channel → Administrators → Add admin.", `Find @${bot} and add it. “Post messages” permission is enough — the bot never posts in your channel.`, "Done: each new post with photos and an apartment description becomes a NomerOk listing. Price, rooms, area and district are detected automatically."], tgNone: "No channels connected.", auto: "Publish immediately", manual: "Save as drafts first", on: "published right away", off: "saved as drafts", disconnect: "Disconnect", life: "Listings stay live for 60 days. The bot reminds you 3 days before — renew in one click.", src: "from Telegram", stats: (v: number, c: number) => `👁 ${v} views · 📞 ${c} contacts`, total: (n: number, v: number, c: number) => `Active listings: ${n} · views: ${v} · contacts: ${c}`, q: (p: number) => `${p}% complete`, bump: "⬆ Bump", bumpHint: "You can bump a listing for free once every 7 days — it becomes fresh again.", bumpAt: (d: string) => `bump from ${d}`, copy: "Copy", fix: "Complete it" },
  ka: { title: "ჩემი განცხადებები", add: "+ ახალი განცხადება", saved: "✅ შენახულია", empty: "განცხადებები ჯერ არ არის. დაამატეთ ხელით ან დააკავშირეთ თქვენი Telegram-არხი — პოსტები თავად გახდება განცხადებები.", status: { draft: "მონახაზი", published: "გამოქვეყნებულია", archived: "არქივში", hidden: "დამალულია (საჩივრები)" }, until: "მდე", edit: "შეცვლა", publish: "გამოქვეყნება", renew: "გაგრძელება 60 დღით", archive: "არქივში", del: "წაშლა", view: "გახსნა", tgTitle: "ავტომატურად Telegram-არხიდან", tgSteps: (bot: string) => ["გახსენით არხი → ადმინისტრატორები → ადმინის დამატება.", `იპოვეთ @${bot} და დაამატეთ. საკმარისია „შეტყობინებების გამოქვეყნების“ უფლება — ბოტი არხში არაფერს წერს.`, "მზადაა: ყოველი ახალი პოსტი ფოტოთი და ბინის აღწერით NomerOk-ზე განცხადებად იქცევა."], tgNone: "არხები არ არის დაკავშირებული.", auto: "მაშინვე გამოქვეყნება", manual: "ჯერ მონახაზებში", on: "მაშინვე საიტზე", off: "მონახაზებში", disconnect: "გათიშვა", life: "განცხადებები 60 დღე ცოცხლობს. ბოტი 3 დღით ადრე შეგახსენებთ.", src: "Telegram-იდან", stats: (v: number, c: number) => `👁 ${v} ნახვა · 📞 ${c} მიმართვა`, total: (n: number, v: number, c: number) => `აქტიური: ${n} · ნახვა: ${v} · მიმართვა: ${c}`, q: (p: number) => `შევსებულია ${p}%`, bump: "⬆ აწევა", bumpHint: "აწევა უფასოა კვირაში ერთხელ — განცხადება კვლავ ახალივით იქნება.", bumpAt: (d: string) => `აწევა ${d}-დან`, copy: "კოპირება", fix: "შევსება" },
} as const;

const btn = "h-8 rounded-full border border-line px-3 text-[12px] hover:border-ink";

export async function CabinetRealty({ m, lang, editId, isNew, saved }: { m: Master; lang: Locale; editId?: string; isNew?: boolean; saved?: boolean }) {
  const t = T[lang];
  if (isNew || editId) {
    const l = editId ? await getListing(editId) : null;
    return <ListingEditor lang={lang} initial={l && l.master_id === m.id ? l : null} defaultCity={m.city ?? "batumi"} />;
  }
  const [list, channels, bot] = await Promise.all([listingsOf(m.id), channelsOf(m.id), botUsername().catch(() => null)]);
  const act = (l: Listing, a: string, label: string, primary = false) => (
    <form action={listingAction}>
      <input type="hidden" name="id" value={l.id} />
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="act" value={a} />
      <button className={primary ? "btn-primary h-8 px-3 text-[12px]" : btn}>{label}</button>
    </form>
  );
  return (
    <div className="space-y-6">
      {saved && <p className="rounded-xl bg-brand-soft p-3 text-[14px]">{t.saved}</p>}
      <section className="rounded-2xl border border-line p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[18px] font-bold">🏠 {t.title}</h2>
          <Link href={`/${lang}/cabinet?tab=realty&new=1`} className="btn-primary h-10 px-4 text-[14px]">
            {t.add}
          </Link>
        </div>
        <p className="mt-1 text-[13px] text-muted">{t.life}</p>
        <p className="mt-1 text-[13px] text-muted">{t.bumpHint}</p>
        {list.some((l) => l.status === "published") && (
          <p className="mt-2 rounded-xl bg-brand-soft px-3 py-2 text-[13px] font-medium text-brand-dark">
            {t.total(
              list.filter((l) => l.status === "published").length,
              list.reduce((a, l) => a + (l.views ?? 0), 0),
              list.reduce((a, l) => a + (l.contacts ?? 0), 0),
            )}
          </p>
        )}
        {list.length === 0 && <p className="mt-4 text-[14px] text-muted">{t.empty}</p>}
        <div className="mt-4 space-y-2">
          {list.map((l) => (
            <div key={l.id} className="flex gap-3 rounded-xl bg-cream p-2">
              <span className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-white">
                {l.photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.photos[0]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-[28px]">🏠</span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold">{l.title}</p>
                <p className="text-[13px]">
                  {priceLabel(l, lang)} · {DEALS[l.deal][lang]}
                </p>
                <p className="text-[12px] text-muted">
                  {t.status[l.status]}
                  {l.status === "published" && l.expires_at ? ` ${t.until} ${new Date(l.expires_at).toLocaleDateString("ru-RU")}` : ""}
                  {l.source === "telegram" ? ` · ${t.src}` : ""}
                </p>
                <p className="text-[12px] text-muted">
                  {t.stats(l.views ?? 0, l.contacts ?? 0)} ·{" "}
                  <span className={listingQuality(l).percent >= 85 ? "text-brand" : "text-[#8a6a1f]"}>{t.q(listingQuality(l).percent)}</span>
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Link href={`/${lang}/cabinet?tab=realty&edit=${l.id}`} className={`${btn} inline-flex items-center`}>
                    {t.edit}
                  </Link>
                  {l.status === "published" && (
                    <Link href={href(lang, `/realty/${l.id}`)} className={`${btn} inline-flex items-center`}>
                      {t.view}
                    </Link>
                  )}
                  {l.status === "draft" && act(l, "publish", t.publish, true)}
                  {(l.status === "archived" || (l.status === "published" && l.expire_warned_at)) && act(l, "renew", t.renew, true)}
                  {listingQuality(l).percent < 85 && (
                    <Link href={`/${lang}/cabinet?tab=realty&edit=${l.id}`} className={`${btn} inline-flex items-center border-accent text-[#6b4f12]`}>
                      {t.fix}
                    </Link>
                  )}
                  {l.status === "published" &&
                    (Date.parse(nextBumpAt(l)) <= Date.now() ? act(l, "bump", t.bump, true) : <span className="inline-flex h-8 items-center px-1 text-[11px] text-muted">{t.bumpAt(new Date(nextBumpAt(l)).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }))}</span>)}
                  {act(l, "copy", t.copy)}
                  {l.status === "published" && act(l, "archive", t.archive)}
                  {act(l, "delete", t.del)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#229ED9]/30 bg-[#eaf6fc] p-5">
        <h2 className="text-[18px] font-bold text-[#0f5c82]">📣 {t.tgTitle}</h2>
        {bot && (
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[14px] text-[#2f5d74]">
            {t.tgSteps(bot).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
        )}
        <div className="mt-4 space-y-2">
          {channels.length === 0 && <p className="text-[13px] text-[#2f5d74]">{t.tgNone}</p>}
          {channels.map((c) => (
            <div key={c.chat_id} className="flex flex-wrap items-center gap-2 rounded-xl bg-white px-3 py-2 text-[14px]">
              <span className="min-w-0 flex-1 font-semibold">
                {c.title ?? c.username ?? c.chat_id} <span className="font-normal text-muted">· {c.auto_publish ? t.on : t.off}</span>
              </span>
              <form action={channelAction}>
                <input type="hidden" name="chat" value={c.chat_id} />
                <input type="hidden" name="act" value="auto" />
                <button className={btn}>{c.auto_publish ? t.manual : t.auto}</button>
              </form>
              <form action={channelAction}>
                <input type="hidden" name="chat" value={c.chat_id} />
                <input type="hidden" name="act" value="remove" />
                <button className={btn}>{t.disconnect}</button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
