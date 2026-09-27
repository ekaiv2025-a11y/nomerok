import type { Metadata } from "next";
import Link from "next/link";
import { adminGetMaster } from "@/lib/db";
import { getDict, href } from "@/lib/i18n";
import { langOf, type LangParams } from "@/lib/i18n/page";
import { currentSpecialistId } from "@/lib/spec-auth";
import { botLink, botUsername } from "@/lib/telegram";
import { profileSteps } from "@/lib/profile";
import { categoryLabel } from "@/lib/categories";
import { formatPhone } from "@/lib/phone";
import { CabinetForm } from "@/components/CabinetForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  return { title: getDict(lang).cabinet.title, robots: { index: false } };
}

type Props = LangParams & { searchParams: Promise<{ expired?: string }> };

export default async function CabinetPage({ params, searchParams }: Props) {
  const lang = await langOf(params);
  const t = getDict(lang).cabinet;
  const sp = await searchParams;
  const id = await currentSpecialistId();
  const m = id ? await adminGetMaster(id).catch(() => null) : null;

  if (!m) {
    const bot = await botUsername();
    return (
      <div className="mx-auto max-w-lg px-4 py-10 sm:py-14">
        <h1 className="text-[26px] font-bold">{t.title}</h1>
        {sp.expired && <p className="mt-4 rounded-xl bg-[#fdf6e6] p-3 text-[14px] text-[#5a4a22]">{t.expired}</p>}
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{t.loginText}</p>
        {bot && (
          <a href={`https://t.me/${bot}`} target="_blank" rel="noopener noreferrer" className="btn mt-5 h-12 w-full bg-[#229ED9] text-white hover:bg-[#1c89bd]">
            {t.loginBtn} @{bot}
          </a>
        )}
        <p className="mt-6 text-[14px] text-muted">
          {t.noProfile}{" "}
          <Link href={href(lang, "/join")} className="font-semibold text-brand underline">
            {t.noProfileLink}
          </Link>
        </p>
      </div>
    );
  }

  const { steps, percent } = profileSteps(m);
  const verifyLink = m.phone_verified_at ? null : await botLink(`m_${m.tg_link_token}`);
  const statusColor =
    m.status === "published" ? "bg-brand-soft text-brand-dark" : m.status === "pending" ? "bg-[#fdf6e6] text-[#5a4a22]" : "bg-[#fdecea] text-danger";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold leading-tight">{t.title}</h1>
          <p className="mt-1 text-[15px] text-muted">
            {m.name} · {categoryLabel(m.category, lang)}
          </p>
        </div>
        <a href={`/api/cabinet/logout?lang=${lang}`} className="btn-ghost h-9 px-4 text-[13px]">
          {t.logout}
        </a>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
          <p className="mt-4 text-[13px] font-semibold text-muted">{t.stepsTitle}</p>
          <ul className="mt-2 space-y-1.5 text-[14px]">
            {steps.map((s) => (
              <li key={s.id} className={`flex items-center gap-2 ${s.done ? "text-muted line-through" : ""}`}>
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${s.done ? "bg-brand text-white" : "border border-line"}`}>
                  {s.done ? "✓" : ""}
                </span>
                {t.steps[s.id]}
              </li>
            ))}
          </ul>
          {verifyLink && (
            <a href={verifyLink} target="_blank" rel="noopener noreferrer" className="btn mt-4 h-10 w-full bg-[#229ED9] text-[14px] text-white hover:bg-[#1c89bd]">
              {t.verifyBtn}
            </a>
          )}
        </div>
      </div>

      <div className="mt-6">
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
          }}
        />
      </div>
    </div>
  );
}
