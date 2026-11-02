import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { fieldLabel, funnelSummary, type FunnelReport } from "@/lib/funnel";

export const dynamic = "force-dynamic";

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
const CLICK: Record<string, string> = { join_tg: "«Через Telegram»", join_google: "Google", join_facebook: "Facebook", join_email: "Почта" };

export default async function AdminFunnel({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const days = [7, 30, 90].includes(Number((await searchParams).d)) ? Number((await searchParams).d) : 7;
  const s = await funnelSummary(days);
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/admin" className="text-[14px] text-muted">← Админка</Link>
      <h1 className="mt-2 text-[26px] font-bold">🧭 Воронки: где теряем клиентов и специалистов</h1>
      <p className="mt-1 max-w-3xl text-[14px] leading-relaxed text-muted">
        Считаются посетители (вкладки), которые открыли страницу формы, начали заполнять, нажали «Отправить» и отправили. Что именно человек вводил — не сохраняется. «Бросили на поле» — последнее поле, в котором был курсор, когда человек ушёл. Опрос «что помешало?» показывается один раз тем, кто уходит, не отправив форму.
      </p>
      <div className="mt-4 flex gap-2">
        {[7, 30, 90].map((d) => (
          <Link key={d} href={`/admin/funnel?d=${d}`} className={`rounded-full border px-3.5 py-1.5 text-[14px] ${d === days ? "border-ink bg-ink text-white" : "border-line bg-white"}`}>
            {d} дней
          </Link>
        ))}
      </div>

      {s.insights.length > 0 && (
        <section className="mt-6 rounded-2xl border border-[#f0d58a] bg-[#fff8e6] p-5">
          <h2 className="text-[18px] font-bold">💡 Что поправить в первую очередь</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed">
            {s.insights.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </section>
      )}
      {s.total === 0 && <p className="mt-6 rounded-2xl bg-white p-5 text-muted">Данных пока нет — они начнут собираться с первыми посетителями.</p>}

      <div className="mt-6 space-y-6">
        {s.funnels.map((f) => (
          <FunnelCard key={f.id} f={f} />
        ))}
      </div>
    </div>
  );
}

function FunnelCard({ f }: { f: FunnelReport }) {
  const first = f.steps[0]?.n ?? 0;
  return (
    <section className="rounded-2xl bg-white p-5">
      <h2 className="text-[20px] font-bold">{f.label}</h2>
      <div className="mt-3 space-y-1.5">
        {f.steps.map((st, i) => {
          const prev = i ? f.steps[i - 1].n : st.n;
          return (
            <div key={st.key} className="grid grid-cols-[1fr_auto] items-center gap-3 text-[14px] sm:grid-cols-[240px_1fr_auto]">
              <span>{st.label}</span>
              <span className="hidden h-6 overflow-hidden rounded-full bg-cream sm:block">
                <span className="block h-full rounded-full bg-brand/70" style={{ width: `${Math.max(2, pct(st.n, first))}%` }} />
              </span>
              <span className="text-right tabular-nums">
                <b>{st.n}</b>
                {i > 0 && <span className="ml-2 text-muted">{pct(st.n, prev)}% от пред.</span>}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[13px] text-muted">
        Отправляют из начавших: с телефона {pct(f.device.mobile[1], f.device.mobile[0])}% ({f.device.mobile[1]}/{f.device.mobile[0]}), с компьютера {pct(f.device.desktop[1], f.device.desktop[0])}% ({f.device.desktop[1]}/{f.device.desktop[0]})
      </p>
      {f.insights.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 rounded-xl bg-[#fff8e6] p-3 pl-7 text-[14px]">
          {f.insights.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      )}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <List title="Бросили на поле" items={f.abandon.map((a) => [fieldLabel(a.field), a.n])} />
        <List title="Ошибки при отправке" items={f.errors.map((e) => [`${fieldLabel(e.field)}${e.msg ? ` — «${e.msg}»` : ""}`, e.n])} />
        <List title="Ответы «что помешало?»" items={f.survey.map((x) => [x.answer, x.n])} />
        {f.clicks.length > 0 && <List title="Нажатия" items={f.clicks.map((c) => [CLICK[c.name] ?? c.name, c.n])} />}
      </div>
      {f.notes.length > 0 && (
        <div className="mt-4">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-muted">Своими словами</p>
          <ul className="mt-1 space-y-1 text-[14px]">
            {f.notes.map((n, i) => (
              <li key={i} className="rounded-lg bg-cream px-3 py-1.5">
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function List({ title, items }: { title: string; items: [string, number][] }) {
  return (
    <div>
      <p className="text-[13px] font-semibold uppercase tracking-wide text-muted">{title}</p>
      {items.length ? (
        <ul className="mt-1 space-y-1 text-[14px]">
          {items.map(([k, n]) => (
            <li key={k} className="flex justify-between gap-3">
              <span>{k}</span>
              <b className="tabular-nums">{n}</b>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-[14px] text-muted">—</p>
      )}
    </div>
  );
}
