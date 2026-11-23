/** График «Как менялась цена за м²» — простая линия по точкам (без библиотек). */
export function PriceChart({ points }: { points: { day: string; v: number }[] }) {
  if (points.length < 2) return null;
  const W = 640, H = 180, P = 28;
  const vs = points.map((p) => p.v);
  const min = Math.min(...vs), max = Math.max(...vs);
  const span = max - min || max * 0.05 || 1;
  const t0 = Date.parse(points[0].day), t1 = Date.parse(points.at(-1)!.day);
  const x = (d: string) => P + ((Date.parse(d) - t0) / (t1 - t0 || 1)) * (W - P * 2);
  const y = (v: number) => H - P - ((v - min) / span) * (H - P * 2);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(p.day).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const fmt = (v: number) => "$" + Math.round(v).toLocaleString("ru-RU").replace(/,/g, " ");
  const date = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("ru-RU", { month: "short", year: "numeric", timeZone: "UTC" });
  const first = points[0].v, last = points.at(-1)!.v;
  const ch = Math.round(((last - first) / first) * 1000) / 10;
  return (
    <figure className="rounded-2xl border border-line bg-white p-4">
      <figcaption className="flex flex-wrap items-baseline gap-x-3 text-[14px]">
        <b>Цена за м²: {fmt(last)}</b>
        <span className={ch > 0 ? "text-[#b23c0a]" : ch < 0 ? "text-brand" : "text-muted"}>
          {ch > 0 ? "▲" : ch < 0 ? "▼" : "="} {Math.abs(ch)}% с {date(points[0].day)}
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 h-auto w-full" role="img" aria-label="График цены за квадратный метр">
        <line x1={P} x2={W - P} y1={H - P} y2={H - P} stroke="currentColor" className="text-line" />
        <path d={path} fill="none" stroke="#1f6b4f" strokeWidth={2.5} strokeLinejoin="round" />
        {points.map((p) => (
          <circle key={p.day} cx={x(p.day)} cy={y(p.v)} r={3.5} fill="#1f6b4f">
            <title>{`${date(p.day)}: ${fmt(p.v)}/м²`}</title>
          </circle>
        ))}
        <text x={P} y={H - 8} fontSize={12} fill="#77736a">{date(points[0].day)}</text>
        <text x={W - P} y={H - 8} fontSize={12} fill="#77736a" textAnchor="end">{date(points.at(-1)!.day)}</text>
        <text x={P} y={14} fontSize={12} fill="#77736a">{fmt(max)}</text>
        <text x={P} y={H - P - 6} fontSize={12} fill="#77736a">{fmt(min)}</text>
      </svg>
      <p className="mt-1 text-[12px] text-muted">Самая низкая цена за м² среди свободных квартир (или из описания ЖК) — на каждую дату, когда она менялась.</p>
    </figure>
  );
}
