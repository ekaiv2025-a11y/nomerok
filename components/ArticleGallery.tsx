"use client";

import { useEffect, useState } from "react";

/** Галерея фото в статье журнала: сетка + просмотр на весь экран (стрелки, свайп, Esc). */
export function ArticleGallery({ photos }: { photos: string[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [x0, setX0] = useState<number | null>(null);
  const go = (d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length));
  useEffect(() => {
    if (open === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  });
  const one = photos.length === 1;
  return (
    <>
      <div className={`mt-8 grid gap-2 ${one ? "" : "grid-cols-2 sm:grid-cols-3"}`}>
        {photos.map((u, i) => (
          <button key={u} type="button" onClick={() => setOpen(i)} className="overflow-hidden rounded-xl bg-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" loading="lazy" className={`w-full object-cover transition hover:scale-[1.02] ${one ? "max-h-[480px]" : "aspect-square"}`} />
          </button>
        ))}
      </div>
      {open !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setOpen(null)}
          onTouchStart={(e) => setX0(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (x0 === null) return;
            const dx = e.changedTouches[0].clientX - x0;
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
            setX0(null);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[open]} alt="" className="max-h-[92vh] max-w-[96vw] object-contain" onClick={(e) => e.stopPropagation()} />
          {!one && (
            <>
              <button type="button" aria-label="Назад" onClick={(e) => { e.stopPropagation(); go(-1); }} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/55 px-3.5 py-1.5 text-[28px] leading-none text-white ring-1 ring-white/40 hover:bg-black/75">‹</button>
              <button type="button" aria-label="Вперёд" onClick={(e) => { e.stopPropagation(); go(1); }} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/55 px-3.5 py-1.5 text-[28px] leading-none text-white ring-1 ring-white/40 hover:bg-black/75">›</button>
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[13px] text-white/80">{open + 1} / {photos.length}</span>
            </>
          )}
          <button type="button" aria-label="Закрыть" className="absolute right-3 top-3 text-[28px] leading-none text-white">×</button>
        </div>
      )}
    </>
  );
}
