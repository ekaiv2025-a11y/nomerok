"use client";

import { useEffect, useState } from "react";

/* Сравнение ЖК: выбранные хранятся в браузере (до 3), внизу экрана — панель «Сравнить». */
const KEY = "nm_cmp";
const read = (): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, 3) : [];
  } catch {
    return [];
  }
};
const write = (v: string[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {}
  window.dispatchEvent(new Event("nm-cmp"));
};
function useCmp() {
  const [v, setV] = useState<string[]>([]);
  useEffect(() => {
    const up = () => setV(read());
    up();
    window.addEventListener("nm-cmp", up);
    window.addEventListener("storage", up);
    return () => {
      window.removeEventListener("nm-cmp", up);
      window.removeEventListener("storage", up);
    };
  }, []);
  return v;
}

export function CompareToggle({ slug, big }: { slug: string; big?: boolean }) {
  const v = useCmp();
  const on = v.includes(slug);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const cur = read();
        write(on ? cur.filter((x) => x !== slug) : [...cur.filter((x) => x !== slug), slug].slice(-3));
      }}
      className={
        big
          ? `btn-ghost h-10 px-4 text-[14px] ${on ? "border-brand bg-brand-soft text-brand-dark" : ""}`
          : `rounded-full px-2.5 py-1 text-[12px] font-semibold shadow-sm ${on ? "bg-brand text-white" : "bg-white/95 text-ink hover:bg-white"}`
      }
      aria-pressed={on}
    >
      {on ? "✓ В сравнении" : "⚖️ Сравнить"}
    </button>
  );
}

export function CompareBar() {
  const v = useCmp();
  if (!v.length) return null;
  return (
    <div className="fixed inset-x-0 bottom-3 z-40 mx-auto flex w-fit max-w-[calc(100%-24px)] items-center gap-2 rounded-full bg-ink px-2 py-2 text-[14px] text-white shadow-lg">
      <span className="pl-2">⚖️ Выбрано ЖК: {v.length}</span>
      {v.length >= 2 ? (
        <a href={`/ru/novostroyki/compare?s=${v.join(",")}`} className="rounded-full bg-accent px-4 py-1.5 font-semibold text-ink">
          Сравнить
        </a>
      ) : (
        <span className="px-2 text-white/70">выберите ещё один</span>
      )}
      <button type="button" onClick={() => write([])} className="rounded-full px-2 text-white/70 hover:text-white" aria-label="Очистить">
        ✕
      </button>
    </div>
  );
}
