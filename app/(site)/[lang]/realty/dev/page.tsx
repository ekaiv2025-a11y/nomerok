import type { Metadata } from "next";
import Link from "next/link";
import { LoginBox } from "@/components/LoginBox";
import { providerEnabled } from "@/lib/oauth";
import { currentDev } from "@/lib/dev-auth";
import { devProjectsOfMaster, devProjectsOfOwner, unitsOf } from "@/lib/dev-projects-db";
import { unitsSummary } from "@/lib/dev-projects";
import { cityLabel } from "@/lib/cities";
import { projectBySlug } from "@/lib/projects";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Кабинет застройщика — NomerOk", robots: { index: false } };

const ST = { draft: ["черновик", "bg-cream text-muted"], pending: ["⏳ на проверке", "bg-[#fdf3dc] text-[#6b4f12]"], published: ["✅ на сайте", "bg-brand-soft text-brand-dark"], hidden: ["скрыт", "bg-cream text-muted"] } as const;

/** Кабинет застройщика: список своих ЖК. Вход — тот же, что для объявлений (Telegram, почта, Google). */
export default async function DevCabinet({ searchParams }: { searchParams: Promise<{ claim?: string }> }) {
  const sp = await searchParams;
  const claim = sp.claim && projectBySlug(sp.claim) ? sp.claim : null;
  const who = await currentDev();
  if (!who) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-[26px] font-bold leading-tight">🏗 Кабинет застройщика</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Добавьте свой ЖК: все квартиры с ценами и планировками, статусы «свободна / бронь / продана», фото и ход стройки. Заявки покупателей — сразу вам. Бесплатно.
        </p>
        <p className="mt-2 text-[14px] text-muted">Войдите через Telegram, почту или Google — пароль не нужен.</p>
        <div className="mt-6">
          <LoginBox lang="ru" intent="client" next={`/ru/realty/dev${claim ? `?claim=${claim}` : ""}`} google={providerEnabled("google")} facebook={providerEnabled("facebook")} />
        </div>
      </div>
    );
  }
  const list = who.kind === "realtor" ? await devProjectsOfMaster(who.m.id) : await devProjectsOfOwner(who.chatId);
  const sums = await Promise.all(list.map(async (d) => unitsSummary(await unitsOf(d.id).catch(() => []))));
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] font-bold">🏗 Мои ЖК</h1>
        <Link href={`/ru/realty/dev/new${claim ? `?claim=${claim}` : ""}`} className="btn-primary h-11 px-5 text-[15px]">
          + Добавить ЖК
        </Link>
      </div>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">
        Квартиры, цены и статусы обновляются на сайте сразу. Первая публикация ЖК — после проверки администратором (обычно до дня). Отдельные квартиры на вторичном рынке — в разделе{" "}
        <Link href="/ru/realty/my" className="text-brand underline">
          «Мои объявления»
        </Link>
        .
      </p>
      {claim && (
        <p className="mt-3 rounded-xl bg-[#fffaf0] p-3 text-[14px]">
          Вы дополняете ЖК «{projectBySlug(claim)!.name}» из нашего каталога — нажмите «+ Добавить ЖК», он уже будет выбран.
        </p>
      )}
      <div className="mt-5 space-y-3">
        {!list.length && <p className="rounded-2xl border border-dashed border-line bg-cream p-6 text-center text-[15px]">ЖК пока нет. Добавьте первый — это займёт 10 минут, квартиры можно вставить прямо из Excel.</p>}
        {list.map((d, i) => (
          <Link key={d.id} href={`/ru/realty/dev/${d.id}`} className="flex gap-3 rounded-2xl border border-line bg-white p-3 hover:border-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {d.photos[0] ? <img src={d.photos[0].url} alt="" className="h-20 w-28 shrink-0 rounded-xl object-cover" /> : <span className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl bg-cream text-[28px]">🏗</span>}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[16px] font-semibold">{d.name}</span>
              <span className="block text-[13px] text-muted">
                {cityLabel(d.city, "ru")}
                {d.completion ? ` · сдача ${d.completion}` : ""}
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px]">
                <span className={`rounded-full px-2 py-0.5 font-semibold ${ST[d.mod_status][1]}`}>{ST[d.mod_status][0]}</span>
                <span className="text-muted">
                  квартир {sums[i].total}, свободно {sums[i].free}
                </span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
