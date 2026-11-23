import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectFull } from "@/lib/projects-all";
import { PROJECT_STATUS, fmtMoney, projectPlace } from "@/lib/projects";
import { unitsSummary, roomsLabel } from "@/lib/dev-projects";
import { cityLabel } from "@/lib/cities";
import { CompareBar, CompareToggle } from "@/components/CompareProjects";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Сравнение ЖК — Новостройки Грузии — NomerOk", robots: { index: false } };

/** Сравнение 2–3 ЖК в одной таблице: цена, сроки, застройщик, квартиры, условия, инфраструктура. */
export default async function Compare({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ s?: string }> }) {
  if ((await params).lang !== "ru") notFound();
  const slugs = ((await searchParams).s ?? "").split(",").filter((x) => /^[\w-]{3,80}$/.test(x)).slice(0, 3);
  const items = (await Promise.all(slugs.map((s) => getProjectFull(s)))).filter((x): x is NonNullable<typeof x> => !!x);
  const label = (id: string) => cityLabel(id, "ru");
  const rows: [string, (i: (typeof items)[number]) => React.ReactNode][] = [
    ["Где", ({ p }) => [projectPlace(p, label), p.district].filter(Boolean).join(", ")],
    ["Застройщик", ({ p }) => p.developer],
    ["Статус", ({ p }) => PROJECT_STATUS[p.status].label],
    ["Срок сдачи", ({ p }) => p.completion ?? "—"],
    ["Цена за м²", ({ p }) => (p.price?.perM2 ? `от ${fmtMoney(p.price.perM2, p.price.currency ?? "USD")}` : "—")],
    ["Квартиры", ({ p }) => (p.price?.from ? `от ${fmtMoney(p.price.from, p.price.currency ?? "USD")}` : "—")],
    ["Этажей", ({ p }) => p.floors ?? "—"],
    [
      "Свободно сейчас",
      ({ units }) => {
        if (!units.length) return "—";
        const s = unitsSummary(units);
        return (
          <span>
            {s.free} из {s.total}
            {s.byRooms.map(([r, x]) => (
              <span key={r} className="block text-[12px] text-muted">
                {roomsLabel(r)}: {x.n}
                {x.from ? `, от ${fmtMoney(x.from)}` : ""}
              </span>
            ))}
          </span>
        );
      },
    ],
    ["Условия покупки", ({ p }) => (p.payment?.length ? <ul className="space-y-1">{p.payment.map((x) => <li key={x}>• {x}</li>)}</ul> : "—")],
    ["В комплексе", ({ p }) => (p.amenities?.length ? <ul className="space-y-1">{p.amenities.slice(0, 12).map((x) => <li key={x}>✓ {x}</li>)}</ul> : "—")],
    ["Цены на", ({ p }) => p.price?.date ?? "—"],
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/ru/novostroyki" className="text-[14px] text-muted hover:text-ink">← Новостройки</Link>
      <h1 className="mt-2 text-[28px] font-bold">⚖️ Сравнение ЖК</h1>
      {items.length < 2 ? (
        <p className="mt-4 rounded-2xl bg-cream p-6 text-[15px]">Выберите 2–3 ЖК кнопкой «⚖️ Сравнить» на карточках в разделе «Новостройки».</p>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[640px] table-fixed text-left align-top text-[14px]">
            <thead>
              <tr className="border-b border-line">
                <th className="w-40 p-3" />
                {items.map(({ p }) => (
                  <th key={p.slug} className="p-3 align-top">
                    <Link href={`/ru/novostroyki/${p.slug}`} className="text-[17px] font-bold hover:text-brand">
                      ЖК {p.name}
                    </Link>
                    <div className="mt-2">
                      <CompareToggle slug={p.slug} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map(([k, f]) => (
                <tr key={k}>
                  <th className="bg-cream/60 p-3 text-[13px] font-semibold text-muted">{k}</th>
                  {items.map((x) => (
                    <td key={x.p.slug} className="p-3 align-top">
                      {f(x)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-[12px] text-muted">Данные — из описаний ЖК и от застройщиков на дату в строке «Цены на». Условия могут меняться.</p>
      <CompareBar />
    </div>
  );
}
