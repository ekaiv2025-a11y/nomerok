import { clientContact } from "@/lib/client-auth";
import type { Metadata } from "next";
import Link from "next/link";
import { getPlace } from "@/lib/places-db";
import { publicTeamOf } from "@/lib/org-db";
import { localizeMasters } from "@/lib/translate-db";
import { placeName } from "@/lib/places";
import { redirect } from "next/navigation";
import { RequestForm } from "@/components/RequestForm";
import { getDict, href } from "@/lib/i18n";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  const t = getDict(lang).meta;
  return pageMeta(lang, "/request", t.request, t.requestDesc);
}

const SPEC_HINT = { ru: "Эта форма — чтобы найти специалиста. Хотите рассказать о своих услугах?", en: "This form is for finding a specialist. Want to offer your services?", ka: "ეს ფორმა სპეციალისტის მოსაძებნადაა. გსურთ თქვენი მომსახურების შეთავაზება?" } as const;
const SPEC_LINK = { ru: "Зарегистрируйтесь как специалист →", en: "Register as a specialist →", ka: "დარეგისტრირდით სპეციალისტად →" } as const;

type Props = LangParams & { searchParams: Promise<{ category?: string; master?: string; city?: string; text?: string; org?: string }> };

const ORG_NOTE = {
  ru: (n: string) => `Заявка в «${n}» — её получат организация и её специалисты.`,
  en: (n: string) => `Request to “${n}” — the organization and its specialists will receive it.`,
  ka: (n: string) => `განაცხადი „${n}“-ში — მას მიიღებს ორგანიზაცია და მისი სპეციალისტები.`,
} as const;
/** Тип места → раздел каталога по умолчанию для заявки организации. */
const ORG_CAT: Record<string, string> = { health: "doctor", beauty: "beauty", education: "tutor", repair: "appliances", home: "repair", auto: "other", kids: "nanny" };

/** Общая заявка: её получают все специалисты направления. Написать конкретному — на странице специалиста. */
export default async function RequestPage({ params, searchParams }: Props) {
  const lang = await langOf(params);
  const t = getDict(lang).request;
  const sp = await searchParams;
  // Старые ссылки «заявка конкретному специалисту» ведут теперь на отдельную страницу сообщения
  if (sp.master) redirect(href(lang, `/master/${encodeURIComponent(sp.master)}/message`));
  // Заявка организации (со страницы места): получат владелец и команда
  const org = sp.org ? await getPlace(sp.org).catch(() => null) : null;
  const orgOk = org && org.owner_verified_at ? org : null;
  const team = orgOk ? await publicTeamOf(orgOk.id).then((x) => localizeMasters(x, lang)).catch(() => []) : [];
  const orgCat = team[0]?.category ?? ORG_CAT[orgOk?.cat ?? ""];
  return (
    <div className="mx-auto max-w-xl px-4 py-6 sm:py-12">
      <h1 className="text-[26px] font-bold leading-tight sm:text-[32px]">{t.title}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{t.subGeneral}</p>
      <ol className="mt-4 grid grid-cols-3 gap-2">
        {t.steps.map((s, i) => (
          <li key={i} className="rounded-xl bg-cream p-2.5 text-[12.5px] leading-snug">
            <span className="mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[12px] font-bold text-white">{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      <p className="mt-4 rounded-xl border border-line bg-white p-3 text-[13px] leading-snug text-muted">
        {SPEC_HINT[lang]}{" "}
        <Link href={href(lang, "/join")} className="font-semibold text-brand underline">
          {SPEC_LINK[lang]}
        </Link>
      </p>
      {orgOk && (
        <p className="mt-4 rounded-xl bg-brand-soft p-3 text-[14px] font-semibold text-brand-dark">
          🏢 {ORG_NOTE[lang](placeName(orgOk, lang))}
        </p>
      )}
      <div className="mt-6">
        <RequestForm
          lang={lang}
          defaultCategory={sp.category ?? orgCat}
          defaultCity={sp.city ?? orgOk?.city ?? orgOk?.area}
          defaultText={sp.text?.slice(0, 200)}
          org={orgOk?.id}
          me={await clientContact()}
        />
      </div>
      <p className="mt-6 text-center text-[14px]">
        <Link href={href(lang) + "#masters"} className="font-semibold text-brand hover:underline">
          {t.pickInstead}
        </Link>
      </p>
    </div>
  );
}
