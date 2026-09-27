"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { CATEGORIES, categoryLabel } from "@/lib/categories";
import type { PublicMaster } from "@/lib/types";
import { MasterCard } from "./MasterCard";

export function Catalog({ masters }: { masters: PublicMaster[] }) {
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const m of masters) c[m.category] = (c[m.category] ?? 0) + 1;
    return c;
  }, [masters]);

  const visibleCats = CATEGORIES.filter((c) => counts[c.id]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return masters.filter((m) => {
      if (cat !== "all" && m.category !== cat) return false;
      if (!query) return true;
      const hay = `${m.name} ${m.services} ${m.about} ${categoryLabel(m.category)}`.toLowerCase();
      return query.split(/\s+/).every((w) => hay.includes(w));
    });
  }, [masters, cat, q]);

  const requestHref = `/request${cat !== "all" ? `?category=${cat}` : ""}`;

  return (
    <section id="masters" className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex h-12 items-center rounded-full border-2 border-line bg-white pl-4 pr-1.5 focus-within:border-brand">
        <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Кого ищете? Сантехник, репетитор, врач…"
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-[15px] outline-none"
          aria-label="Поиск специалиста"
        />
        {q && (
          <button onClick={() => setQ("")} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-cream" aria-label="Очистить">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {visibleCats.length > 1 && (
        <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" style={{ scrollbarWidth: "none" }}>
          <Chip active={cat === "all"} onClick={() => setCat("all")}>Все · {masters.length}</Chip>
          {visibleCats.map((c) => (
            <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
              {c.plural} · {counts[c.id]}
            </Chip>
          ))}
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <MasterCard key={m.id} m={m} />
          ))}
          <NotFoundCard href={requestHref} />
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-cream px-5 py-10 text-center">
          <p className="font-semibold">{masters.length === 0 ? "Первые специалисты появятся здесь совсем скоро" : "По этому запросу пока никого нет"}</p>
          <p className="mx-auto mt-1 max-w-md text-[14px] text-muted">
            Оставьте заявку — мы сами найдём подходящего специалиста и перезвоним.
          </p>
          <Link href={requestHref} className="btn-primary mt-5">Оставить заявку</Link>
        </div>
      )}
    </section>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`h-9 shrink-0 whitespace-nowrap rounded-full border px-4 text-[13px] font-medium transition-colors ${
        active ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}

function NotFoundCard({ href }: { href: string }) {
  return (
    <Link href={href} className="flex flex-col justify-center rounded-2xl border border-dashed border-brand/40 bg-brand-soft p-5 transition hover:border-brand">
      <p className="font-semibold text-brand-dark">Не нашли нужного специалиста?</p>
      <p className="mt-1 text-[14px] text-[#3d5a4c]">Опишите задачу — подберём специалиста сами и перезвоним.</p>
      <span className="mt-3 text-[14px] font-semibold text-brand">Оставить заявку →</span>
    </Link>
  );
}
