"use client";

import { useMemo, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { resizeImage } from "@/lib/image-resize";
import { UNIT_STATUS, roomsLabel, type DevUnit, type UnitStatus } from "@/lib/dev-projects";

/*
 * Квартиры ЖК: таблица, генератор «этажи × квартиры на этаже» и вставка из Excel.
 * Статус меняется одной кнопкой; всё остальное сохраняется кнопкой «Сохранить квартиры».
 */
type Row = { id?: string; key: string; building: string; floor: string; number: string; rooms: string; area: string; price: string; currency: "USD" | "GEL"; status: UnitStatus; plan_url: string };
const toRow = (u: DevUnit): Row => ({
  id: u.id,
  key: u.id,
  building: u.building,
  floor: u.floor == null ? "" : String(u.floor),
  number: u.number,
  rooms: u.rooms == null ? "" : String(u.rooms),
  area: u.area == null ? "" : String(u.area),
  price: u.price == null ? "" : String(u.price),
  currency: u.currency,
  status: u.status,
  plan_url: u.plan_url ?? "",
});
let seq = 0;
const blank = (p: Partial<Row>): Row => ({ key: `n${++seq}`, building: "", floor: "", number: "", rooms: "", area: "", price: "", currency: "USD", status: "free", plan_url: "", ...p });
const ST_ORDER: UnitStatus[] = ["free", "reserved", "sold"];
const parseStatus = (s: string): UnitStatus => (/прод|sold|გაყ/i.test(s) ? "sold" : /брон|резерв|reserv/i.test(s) ? "reserved" : "free");

export function DevUnitsEditor({ projectId, initial }: { projectId: string; initial: DevUnit[] }) {
  const [rows, setRows] = useState<Row[]>(() => initial.map(toRow));
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [gen, setGen] = useState({ building: "", from: "2", to: "10", per: "4", rooms: "1", area: "", price: "", step: "" });
  const [paste, setPaste] = useState("");
  const [showGen, setShowGen] = useState(initial.length === 0);
  const [showPaste, setShowPaste] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [planBusy, setPlanBusy] = useState(false);

  const edit = (key: string, patch: Partial<Row>) => {
    setRows((r) => r.map((x) => (x.key === key ? { ...x, ...patch } : x)));
    setDirty(true);
  };
  const counts = useMemo(() => Object.fromEntries(ST_ORDER.map((s) => [s, rows.filter((r) => r.status === s).length])) as Record<UnitStatus, number>, [rows]);

  async function quickStatus(r: Row) {
    const next = ST_ORDER[(ST_ORDER.indexOf(r.status) + 1) % 3];
    edit(r.key, { status: next });
    // сохранённая квартира — статус сразу на сайт
    if (r.id) {
      await fetch("/api/dev/units", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId, unitId: r.id, status: next }) }).catch(() => null);
    }
  }

  function generate() {
    const from = Number(gen.from), to = Number(gen.to), per = Math.min(30, Number(gen.per));
    if (!Number.isFinite(from) || !Number.isFinite(to) || to < from || to - from > 120 || !per) return setErr("Проверьте этажи и число квартир на этаже");
    const out: Row[] = [];
    for (let fl = from; fl <= to; fl++)
      for (let n = 1; n <= per; n++) {
        const price = gen.price ? Math.round(Number(gen.price) + (Number(gen.step) || 0) * (fl - from)) : "";
        out.push(blank({ building: gen.building, floor: String(fl), number: `${fl}${String(n).padStart(2, "0")}`, rooms: gen.rooms, area: gen.area, price: String(price) }));
      }
    setRows((r) => [...r, ...out]);
    setDirty(true);
    setErr("");
    setMsg(`Добавлено ${out.length} квартир — проверьте и нажмите «Сохранить квартиры»`);
    setShowGen(false);
  }

  function importPaste() {
    // Колонки: корпус, этаж, номер, спальни (0 — студия), площадь, цена, статус — как в Excel (табуляция) или через «;»
    const out: Row[] = [];
    for (const line of paste.split(/\r?\n/)) {
      const c = line.split(/\t|;/).map((x) => x.trim());
      if (c.length < 3 || !/\d/.test(c[1] + c[2])) continue;
      out.push(blank({ building: c[0] ?? "", floor: (c[1] ?? "").replace(/\D/g, ""), number: c[2] ?? "", rooms: /студ|studio/i.test(c[3] ?? "") ? "0" : (c[3] ?? "").replace(/\D/g, ""), area: (c[4] ?? "").replace(",", ".").replace(/[^\d.]/g, ""), price: (c[5] ?? "").replace(/[^\d]/g, ""), status: parseStatus(c[6] ?? "") }));
    }
    if (!out.length) return setErr("Не нашли строк. Скопируйте из Excel колонки: корпус, этаж, номер, спальни, площадь, цена, статус.");
    setRows((r) => [...r, ...out]);
    setPaste("");
    setShowPaste(false);
    setDirty(true);
    setErr("");
    setMsg(`Добавлено ${out.length} квартир — нажмите «Сохранить квартиры»`);
  }

  async function setPlanForSelected(file: File | undefined) {
    if (!file || !sel.size) return;
    setPlanBusy(true);
    const fd = new FormData();
    fd.append("photo", await resizeImage(file, 1800, 0.9));
    const r = await fetch("/api/realty/photo", { method: "POST", body: fd }).then((x) => x.json()).catch(() => null);
    setPlanBusy(false);
    if (!r?.ok) return setErr("Не получилось загрузить планировку");
    setRows((rs) => rs.map((x) => (sel.has(x.key) ? { ...x, plan_url: r.url } : x)));
    setDirty(true);
    setMsg(`Планировка добавлена к ${sel.size} кв.`);
  }

  async function saveAll() {
    setBusy(true);
    setErr("");
    setMsg("");
    const r = await fetch("/api/dev/units", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, units: rows.map((x) => ({ ...x, key: undefined })) }),
    })
      .then((x) => x.json())
      .catch(() => null);
    setBusy(false);
    if (!r?.ok) return setErr(r?.error ?? "Не получилось сохранить");
    setDirty(false);
    setMsg(`✅ Сохранено квартир: ${r.saved}`);
    location.reload();
  }

  const allSel = rows.length > 0 && sel.size === rows.length;
  const cell = "field h-9 w-full px-2 text-[13px]";
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-white p-4">
        <p className="text-[14px] font-semibold">Всего {rows.length}</p>
        {ST_ORDER.map((s) => (
          <span key={s} className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${UNIT_STATUS[s].cls.replace("line-through", "")}`}>
            {UNIT_STATUS[s].label}: {counts[s]}
          </span>
        ))}
        <span className="ml-auto flex flex-wrap gap-2">
          <button type="button" onClick={() => setShowGen((v) => !v)} className="btn-ghost h-9 px-3 text-[13px]">⚡ Сгенерировать этажи</button>
          <button type="button" onClick={() => setShowPaste((v) => !v)} className="btn-ghost h-9 px-3 text-[13px]">📋 Вставить из Excel</button>
          <button type="button" onClick={() => (setRows((r) => [...r, blank({ building: r.at(-1)?.building ?? "", currency: r.at(-1)?.currency ?? "USD" })]), setDirty(true))} className="btn-ghost h-9 px-3 text-[13px]">+ Квартира</button>
        </span>
      </div>

      {showGen && (
        <div className="rounded-2xl border-2 border-[#f0d58a] bg-[#fffaf0] p-4">
          <p className="font-semibold">⚡ Быстро добавить квартиры по этажам</p>
          <p className="mt-0.5 text-[13px] text-[#5a4410]">Например, этажи 2–25, по 6 квартир: получится 144 строки с номерами 201, 202… Потом поправьте площадь и цену там, где отличаются.</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(
              [
                ["building", "Корпус (необяз.)", "A"],
                ["from", "Этаж с", "2"],
                ["to", "Этаж по", "25"],
                ["per", "Квартир на этаже", "6"],
                ["rooms", "Спальни (0 — студия)", "1"],
                ["area", "Площадь, м²", "45"],
                ["price", "Цена, $", "60000"],
                ["step", "+$ за каждый этаж выше", "500"],
              ] as const
            ).map(([k, l, ph]) => (
              <label key={k} className="text-[12px] font-medium">
                {l}
                <input value={gen[k]} onChange={(e) => setGen({ ...gen, [k]: e.target.value })} placeholder={ph} className="field mt-1 h-10 w-full text-[14px]" />
              </label>
            ))}
          </div>
          <button type="button" onClick={generate} className="btn-primary mt-3 h-10 px-4 text-[14px]">Добавить</button>
        </div>
      )}

      {showPaste && (
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="font-semibold">📋 Вставить из Excel или Google Таблиц</p>
          <p className="mt-0.5 text-[13px] text-muted">Выделите в таблице колонки по порядку: <b>корпус, этаж, номер, спальни, площадь, цена, статус</b> (свободна / бронь / продана) — скопируйте и вставьте сюда.</p>
          <textarea value={paste} onChange={(e) => setPaste(e.target.value)} rows={6} className="field mt-2 w-full py-2 font-mono text-[12px]" placeholder={"A\t5\t501\t1\t45.5\t62000\tсвободна\nA\t5\t502\tстудия\t31\t43000\tпродана"} />
          <button type="button" onClick={importPaste} className="btn-primary mt-2 h-10 px-4 text-[14px]">Добавить строки</button>
        </div>
      )}

      {sel.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-ink p-3 text-[13px] text-white">
          <span>Выбрано: {sel.size}</span>
          {ST_ORDER.map((s) => (
            <button key={s} type="button" onClick={() => (setRows((r) => r.map((x) => (sel.has(x.key) ? { ...x, status: s } : x))), setDirty(true))} className="rounded-full bg-white/15 px-3 py-1 hover:bg-white/25">
              → {UNIT_STATUS[s].label}
            </button>
          ))}
          <label className="cursor-pointer rounded-full bg-white/15 px-3 py-1 hover:bg-white/25">
            {planBusy ? "Загружаем…" : "🖼 Планировка для выбранных"}
            <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => setPlanForSelected(e.target.files?.[0])} />
          </label>
          <button type="button" onClick={() => (setRows((r) => r.filter((x) => !sel.has(x.key))), setSel(new Set()), setDirty(true))} className="rounded-full bg-[#b23c0a] px-3 py-1">
            Удалить
          </button>
          <button type="button" onClick={() => setSel(new Set())} className="ml-auto underline">Снять выбор</button>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[860px] text-left text-[13px]">
          <thead className="bg-cream text-[12px] text-muted">
            <tr>
              <th className="w-8 px-2 py-2">
                <input type="checkbox" checked={allSel} onChange={() => setSel(allSel ? new Set() : new Set(rows.map((r) => r.key)))} aria-label="Выбрать все" />
              </th>
              <th className="px-1 py-2">Корпус</th>
              <th className="px-1 py-2">Этаж</th>
              <th className="px-1 py-2">№</th>
              <th className="px-1 py-2">Спальни</th>
              <th className="px-1 py-2">м²</th>
              <th className="px-1 py-2">Цена</th>
              <th className="px-1 py-2"></th>
              <th className="px-1 py-2">Статус</th>
              <th className="px-1 py-2">План</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.key} className={sel.has(r.key) ? "bg-brand-soft/50" : ""}>
                <td className="px-2">
                  <input type="checkbox" checked={sel.has(r.key)} onChange={() => setSel((s) => { const n = new Set(s); if (n.has(r.key)) n.delete(r.key); else n.add(r.key); return n; })} aria-label="Выбрать" />
                </td>
                <td className="w-16 px-1 py-1"><input value={r.building} onChange={(e) => edit(r.key, { building: e.target.value })} className={cell} /></td>
                <td className="w-16 px-1"><input value={r.floor} onChange={(e) => edit(r.key, { floor: e.target.value })} inputMode="numeric" className={cell} /></td>
                <td className="w-20 px-1"><input value={r.number} onChange={(e) => edit(r.key, { number: e.target.value })} className={cell} /></td>
                <td className="w-32 px-1">
                  <select value={r.rooms} onChange={(e) => edit(r.key, { rooms: e.target.value })} className={cell}>
                    <option value="">—</option>
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{roomsLabel(n)}</option>
                    ))}
                  </select>
                </td>
                <td className="w-20 px-1"><input value={r.area} onChange={(e) => edit(r.key, { area: e.target.value })} inputMode="decimal" className={cell} /></td>
                <td className="w-28 px-1"><input value={r.price} onChange={(e) => edit(r.key, { price: e.target.value })} inputMode="numeric" className={cell} /></td>
                <td className="w-16 px-1">
                  <select value={r.currency} onChange={(e) => edit(r.key, { currency: e.target.value as Row["currency"] })} className={cell}>
                    <option value="USD">$</option>
                    <option value="GEL">₾</option>
                  </select>
                </td>
                <td className="w-28 px-1">
                  <button type="button" onClick={() => quickStatus(r)} title="Нажмите, чтобы сменить" className={`w-full rounded-full px-2 py-1 text-[12px] font-semibold ${UNIT_STATUS[r.status].cls.replace("line-through", "")}`}>
                    {UNIT_STATUS[r.status].label}
                  </button>
                </td>
                <td className="w-14 px-1">
                  {r.plan_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <a href={r.plan_url} target="_blank"><img src={r.plan_url} alt="план" className="h-8 w-10 rounded object-cover" /></a>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="px-1">
                  <button type="button" onClick={() => (setRows((x) => x.filter((y) => y.key !== r.key)), setDirty(true))} className="rounded-full p-1.5 text-danger hover:bg-cream" aria-label="Удалить">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-muted">Квартир пока нет — сгенерируйте по этажам или вставьте из Excel.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[12px] text-muted">Статус меняется нажатием на него и у сохранённых квартир сразу попадает на сайт. Чтобы добавить планировку, отметьте квартиры галочками → «Планировка для выбранных».</p>

      <div className="sticky bottom-3 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-white/95 p-2.5 shadow-sm backdrop-blur">
        <button type="button" disabled={busy} onClick={saveAll} className="btn-primary h-11 px-5 text-[14px]">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Сохранить квартиры
        </button>
        {dirty && <span className="text-[13px] text-[#b4532a]">Есть несохранённые изменения</span>}
        {msg && <span className="text-[13px] font-medium text-brand">{msg}</span>}
        {err && <span className="text-[13px] font-medium text-danger">{err}</span>}
      </div>
    </section>
  );
}
