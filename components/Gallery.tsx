"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useState } from "react";
import { Img } from "./Img";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { PortfolioItem } from "@/lib/types";

/** Фото работ: сетка превью + просмотр на весь экран (стрелки, свайп, Esc). */
export function Gallery({ items: all, sections = [], allLabel = "Все", moreText = "Показать все ({n})" }: { items: PortfolioItem[]; sections?: { id: string; label: string }[]; allLabel?: string; moreText?: string }) {
  // разделы портфолио (интерьеры, репортажи…) — только те, где есть фото
  const secs = sections.map((x) => ({ ...x, n: all.filter((it) => it.sec === x.id).length })).filter((x) => x.n > 0);
  const [sec, setSec] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const items = sec ? all.filter((it) => it.sec === sec) : all;
  const [open, setOpen] = useState<number | null>(null);
  const [touchX, setTouchX] = useState<number | null>(null);
  const go = useCallback((d: number) => setOpen((i) => (i == null ? i : (i + d + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (open == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, go]);

  const shown = showAll ? items : items.slice(0, 12);
  const chip = (on: boolean) => `whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${on ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"}`;
  return (
    <>
      {secs.length > 0 && (
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" style={{ scrollbarWidth: "none" }}>
          <button type="button" className={chip(!sec)} onClick={() => (setSec(null), setShowAll(false))}>
            {allLabel} <span className="opacity-60">{all.length}</span>
          </button>
          {secs.map((x) => (
            <button key={x.id} type="button" className={chip(sec === x.id)} onClick={() => (setSec(x.id), setShowAll(false))}>
              {x.label} <span className="opacity-60">{x.n}</span>
            </button>
          ))}
        </div>
      )}
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {shown.map((it, i) => (
          <button key={it.url} type="button" onClick={() => setOpen(i)} className="group relative aspect-square overflow-hidden rounded-xl bg-cream">
            <Img src={it.url} alt={it.caption} sizes="(max-width: 640px) 33vw, 220px" className="object-cover transition group-hover:scale-105" />
          </button>
        ))}
      </div>
      {!showAll && items.length > 12 && (
        <button type="button" onClick={() => setShowAll(true)} className="btn-ghost mt-3 h-10 px-4 text-[14px]">
          {moreText.replace("{n}", String(items.length))}
        </button>
      )}
      {open != null && items[open] && (
        <div
          className="fixed inset-0 z-[1000] flex flex-col bg-black/90"
          onClick={() => setOpen(null)}
          onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX == null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            setTouchX(null);
          }}
        >
          <div className="flex items-center justify-between p-3 text-white">
            <span className="text-[14px] opacity-80">
              {open + 1} / {items.length}
            </span>
            <button type="button" className="rounded-full p-2 hover:bg-white/10" aria-label="×" onClick={() => setOpen(null)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2" onClick={(e) => e.stopPropagation()}>
            {items.length > 1 && (
              <button type="button" onClick={() => go(-1)} className="absolute left-2 z-10 rounded-full bg-black/40 p-2 text-white hover:bg-black/60" aria-label="←">
                <ChevronLeft className="h-7 w-7" />
              </button>
            )}
            <img src={items[open].url} alt={items[open].caption} className="max-h-full max-w-full rounded-lg object-contain" />
            {items.length > 1 && (
              <button type="button" onClick={() => go(1)} className="absolute right-2 z-10 rounded-full bg-black/40 p-2 text-white hover:bg-black/60" aria-label="→">
                <ChevronRight className="h-7 w-7" />
              </button>
            )}
          </div>
          <p className="min-h-[52px] px-4 py-3 text-center text-[15px] text-white/90">{items[open].caption}</p>
        </div>
      )}
    </>
  );
}
