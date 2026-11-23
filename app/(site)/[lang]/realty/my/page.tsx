import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginBox } from "@/components/LoginBox";
import { ListingEditor } from "@/components/ListingEditor";
import { providerEnabled } from "@/lib/oauth";
import { currentPoster } from "@/lib/realty-auth";
import { clientContact } from "@/lib/client-auth";
import { getListing, listingsOfOwner } from "@/lib/realty-db";
import { DEALS, POSTER_KINDS, priceLabel, type Listing, type PosterKind } from "@/lib/realty";
import { PROJECTS } from "@/lib/projects";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";
import type { Locale } from "@/lib/i18n";
import { listingAction } from "@/app/(site)/[lang]/cabinet/realty-actions";

export const dynamic = "force-dynamic";

const T = {
  ru: {
    title: "Мои объявления",
    lead: "Квартиры, дома, коммерческая недвижимость и участки — на продажу, в аренду и посуточно. Разместить может любой: собственник, агент, агентство или застройщик. Бесплатно.",
    login: "Войдите, чтобы разместить объект",
    loginHint: "Через Telegram, почту или Google — пароль не нужен. Так вы сможете потом изменить, продлить или снять объявление.",
    add: "+ Разместить объект",
    empty: "У вас пока нет объявлений.",
    saved: "✅ Сохранено.",
    pending: "✅ Отправлено на проверку. Обычно это занимает до дня — вам придёт сообщение, когда объект появится на сайте.",
    status: { draft: "черновик", pending: "⏳ на проверке", published: "✅ на сайте", archived: "в архиве", hidden: "скрыто (жалобы)" } as Record<Listing["status"], string>,
    edit: "Изменить",
    publish: "Отправить на проверку",
    renew: "Продлить на 60 дней",
    archive: "Снять с сайта",
    del: "Удалить",
    view: "Открыть",
    stats: (v: number, c: number) => `👁 ${v} · 📞 ${c}`,
    life: "Объявление живёт 60 дней, за 3 дня до конца придёт напоминание.",
  },
  en: {
    title: "My listings",
    lead: "Apartments, houses, commercial property and land — for sale, rent or daily. Anyone can post: owner, agent, agency or developer. Free.",
    login: "Log in to post a property",
    loginHint: "With Telegram, email or Google — no password. You'll be able to edit, renew or remove the listing later.",
    add: "+ Post a property",
    empty: "You have no listings yet.",
    saved: "✅ Saved.",
    pending: "✅ Sent for review. It usually takes up to a day — you'll get a message when it's live.",
    status: { draft: "draft", pending: "⏳ under review", published: "✅ live", archived: "archived", hidden: "hidden (reports)" } as Record<Listing["status"], string>,
    edit: "Edit",
    publish: "Send for review",
    renew: "Renew for 60 days",
    archive: "Take down",
    del: "Delete",
    view: "Open",
    stats: (v: number, c: number) => `👁 ${v} · 📞 ${c}`,
    life: "A listing stays live for 60 days; you'll get a reminder 3 days before.",
  },
  ka: {
    title: "ჩემი განცხადებები",
    lead: "ბინები, სახლები, კომერციული ფართი და მიწა — გასაყიდად, ქირით და დღიურად. განთავსება შეუძლია ყველას: მესაკუთრეს, აგენტს, სააგენტოს, დეველოპერს. უფასოდ.",
    login: "შედით, რომ განათავსოთ ობიექტი",
    loginHint: "Telegram-ით, ფოსტით ან Google-ით — პაროლი არ სჭირდება.",
    add: "+ ობიექტის განთავსება",
    empty: "განცხადებები ჯერ არ გაქვთ.",
    saved: "✅ შენახულია.",
    pending: "✅ გაიგზავნა შესამოწმებლად. ჩვეულებრივ ერთ დღემდე.",
    status: { draft: "მონახაზი", pending: "⏳ მოწმდება", published: "✅ საიტზეა", archived: "არქივში", hidden: "დამალულია" } as Record<Listing["status"], string>,
    edit: "შეცვლა",
    publish: "შესამოწმებლად გაგზავნა",
    renew: "გაგრძელება 60 დღით",
    archive: "მოხსნა",
    del: "წაშლა",
    view: "გახსნა",
    stats: (v: number, c: number) => `👁 ${v} · 📞 ${c}`,
    life: "განცხადება 60 დღე ცოცხლობს.",
  },
} as const;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = (await langOf(params)) as Locale;
  return { ...pageMeta(lang, "/realty/my", T[lang].title, T[lang].lead), robots: { index: false } };
}

type SP = { new?: string; edit?: string; saved?: string; project?: string };

export default async function MyListings({ params, searchParams }: LangParams & { searchParams: Promise<SP> }) {
  const lang = (await langOf(params)) as Locale;
  const t = T[lang];
  const sp = await searchParams;
  const who = await currentPoster();
  // Риелтор с анкетой — у него всё в кабинете (там же Telegram-канал и шаблоны)
  if (who?.kind === "realtor") redirect(`/${lang}/cabinet?tab=realty${sp.new ? "&new=1" : sp.edit ? `&edit=${sp.edit}` : ""}`);
  if (!who) {
    const next = `/${lang}/realty/my${sp.new ? `?new=1${sp.project && /^[\w-]+$/.test(sp.project) ? `&project=${sp.project}` : ""}` : ""}`;
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-[26px] font-bold leading-tight">🏠 {t.login}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{t.loginHint}</p>
        <div className="mt-6">
          <LoginBox lang={lang} intent="client" next={next} google={providerEnabled("google")} facebook={providerEnabled("facebook")} />
        </div>
      </div>
    );
  }
  const projects = PROJECTS.map((p) => ({ slug: p.slug, name: p.name, city: p.city ?? "batumi" }));
  if (sp.new || sp.edit) {
    const l = sp.edit ? await getListing(sp.edit) : null;
    const own = l && l.master_id == null && l.owner_chat_id === who.chatId ? l : null;
    const c = await clientContact().catch(() => null);
    const poster = own ? undefined : { kind: "owner" as PosterKind, name: c?.name ?? who.name ?? "", phone: c?.phone ?? "" };
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <ListingEditor lang={lang} initial={own} defaultCity={own?.city ?? PROJECTS.find((p) => p.slug === sp.project)?.city ?? "batumi"} mode="public" poster={poster} projects={projects} startProject={own ? undefined : sp.project} />
      </div>
    );
  }
  const list = await listingsOfOwner(who.chatId);
  const act = (l: Listing, a: string, label: string, primary = false) => (
    <form action={listingAction}>
      <input type="hidden" name="id" value={l.id} />
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="act" value={a} />
      <button className={primary ? "btn-primary h-8 px-3 text-[12px]" : "h-8 rounded-full border border-line px-3 text-[12px] hover:border-ink"}>{label}</button>
    </form>
  );
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] font-bold">🏠 {t.title}</h1>
        <Link href={`/${lang}/realty/my?new=1`} className="btn-primary h-11 px-5 text-[15px]">
          {t.add}
        </Link>
      </div>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">{t.lead}</p>
      {sp.saved && <p className="mt-4 rounded-xl bg-brand-soft p-3 text-[14px] text-brand-dark">{sp.saved === "pending" ? t.pending : t.saved}</p>}
      <p className="mt-3 text-[13px] text-muted">{t.life}</p>
      <div className="mt-4 space-y-3">
        {list.length === 0 && <p className="rounded-2xl border border-dashed border-line bg-cream p-6 text-center text-[15px]">{t.empty}</p>}
        {list.map((l) => (
          <div key={l.id} className="flex gap-3 rounded-2xl border border-line bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {l.photos[0] ? <img src={l.photos[0]} alt="" className="h-20 w-28 shrink-0 rounded-xl object-cover" /> : <span className="h-20 w-28 shrink-0 rounded-xl bg-cream" />}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{l.title}</p>
              <p className="text-[13px] text-muted">
                {DEALS[l.deal][lang]} · {priceLabel(l, lang)} · {t.status[l.status]}
                {l.poster_kind ? ` · ${POSTER_KINDS[l.poster_kind][lang]}` : ""}
                {l.status === "published" ? ` · ${t.stats(l.views ?? 0, l.contacts ?? 0)}` : ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Link href={`/${lang}/realty/my?edit=${l.id}`} className="h-8 rounded-full border border-line px-3 text-[12px] leading-8 hover:border-ink">
                  {t.edit}
                </Link>
                {l.status === "published" && (
                  <Link href={`/${lang}/realty/${l.id}`} className="h-8 rounded-full border border-line px-3 text-[12px] leading-8 hover:border-ink">
                    {t.view}
                  </Link>
                )}
                {l.status === "draft" && act(l, "publish", t.publish, true)}
                {l.status === "archived" && act(l, "renew", t.renew, true)}
                {l.status === "published" && act(l, "archive", t.archive)}
                {act(l, "delete", t.del)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
