"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar } from "./Avatar";

/**
 * Фото в карточке каталога: первое — фото специалиста, дальше — фото работ.
 * На телефоне листаются пальцем, на компьютере — стрелками (появляются при наведении).
 * Нажатие на фото открывает профиль.
 */
export function CardPhotos({ name, photo, works, href, labels }: { name: string; photo: string | null; works: string[]; href: string; labels: { prev: string; next: string } }) {
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const all = [...(photo ? [photo] : []), ...works].filter((u) => !broken.has(u)).slice(0, 10);
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);

  const go = (d: number) => {
    const el = ref.current;
    if (!el) return;
    const n = Math.max(0, Math.min(all.length - 1, i + d));
    el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" });
  };

  if (all.length === 0) {
    return (
      <Link href={href} tabIndex={-1} aria-hidden className="block h-full w-full">
        <Avatar name={name} size={400} className="!h-full !w-full !rounded-none !text-[48px]" />
      </Link>
    );
  }

  return (
    <div className="group/ph relative h-full w-full">
      <div
        ref={ref}
        onScroll={(e) => {
          const el = e.currentTarget;
          setI(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
        }}
        className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {all.map((u, k) => (
          <Link key={u} href={href} tabIndex={k === 0 ? 0 : -1} className="block h-full w-full shrink-0 snap-center snap-always" aria-label={k === 0 ? name : undefined}>
            <img
              src={u}
              alt=""
              loading={k === 0 ? "lazy" : "lazy"}
              draggable={false}
              onError={() => setBroken((s) => new Set(s).add(u))}
              className="h-full w-full select-none object-cover"
            />
          </Link>
        ))}
      </div>

      {all.length > 1 && (
        <>
          {/* Точки — сколько фото и какое сейчас */}
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1">
            {all.map((u, k) => (
              <span key={u} className={`h-1.5 rounded-full bg-white shadow transition-all ${k === i ? "w-4 opacity-100" : "w-1.5 opacity-70"}`} />
            ))}
          </div>
          {i > 0 && (
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={labels.prev}
              className="absolute left-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow transition group-hover/ph:opacity-100 hover:bg-white sm:flex"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {i < all.length - 1 && (
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={labels.next}
              className="absolute right-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow transition group-hover/ph:opacity-100 hover:bg-white sm:flex"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
