"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { splitPhoto } from "@/lib/photo-pos";
import type { Locale } from "@/lib/i18n/config";

const T = {
  ru: { title: "Подвиньте фото", hint: "Потяните фото вверх или вниз — так оно будет выглядеть в карточке.", save: "Сохранить", saved: "✓ Сохранено", cancel: "Отмена", open: "↕ Подвинуть фото" },
  en: { title: "Adjust photo", hint: "Drag the photo up or down — this is how it will look on your card.", save: "Save", saved: "✓ Saved", cancel: "Cancel", open: "↕ Adjust photo" },
  ka: { title: "ფოტოს გასწორება", hint: "გადაწიეთ ფოტო ზემოთ ან ქვემოთ — ასე გამოჩნდება ბარათზე.", save: "შენახვა", saved: "✓ შენახულია", cancel: "გაუქმება", open: "↕ ფოტოს გასწორება" },
} as const;

/**
 * «Подвинуть фото»: квадратное окошко как в карточке; фото тянется пальцем/мышью по вертикали.
 * onSave получает новое положение (0 — верх фото, 100 — низ).
 */
export function PhotoPositioner({ url, lang, onSave }: { url: string; lang: Locale; onSave: (y: number) => Promise<boolean> | boolean }) {
  const t = T[lang];
  const { src, y: initialY } = splitPhoto(url);
  const [open, setOpen] = useState(false);
  const [y, setY] = useState(initialY);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const drag = useRef<{ startY: number; startPos: number; h: number } | null>(null);

  if (!src) return null;

  if (!open)
    return (
      <button type="button" onClick={() => { setY(splitPhoto(url).y); setOpen(true); setState("idle"); }} className="btn-ghost mt-2 h-9 px-4 text-[13px]">
        {t.open}
      </button>
    );

  return (
    <div className="mt-3 rounded-2xl border border-line bg-white p-3">
      <p className="text-[14px] font-semibold">{t.title}</p>
      <p className="mt-0.5 text-[12px] text-muted">{t.hint}</p>
      <div
        className="relative mt-2 aspect-square w-56 max-w-full cursor-grab touch-none select-none overflow-hidden rounded-2xl bg-cream active:cursor-grabbing"
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          drag.current = { startY: e.clientY, startPos: y, h: e.currentTarget.clientHeight };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          // тянем фото вниз → видим его верх → положение уменьшается
          const next = d.startPos - ((e.clientY - d.startY) / d.h) * 100;
          setY(Math.round(Math.min(100, Math.max(0, next))));
          setState("idle");
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        <img src={src} alt="" draggable={false} className="pointer-events-none h-full w-full object-cover" style={{ objectPosition: `50% ${y}%` }} />
      </div>
      <input type="range" min={0} max={100} value={y} onChange={(e) => { setY(Number(e.target.value)); setState("idle"); }} className="mt-2 w-56 max-w-full accent-[#1f6b4f]" aria-label={t.title} />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={state === "saving"}
          onClick={async () => {
            setState("saving");
            const ok = await onSave(y);
            setState(ok ? "saved" : "idle");
            if (ok) setTimeout(() => setOpen(false), 700);
          }}
          className="btn-primary h-9 px-4 text-[13px]"
        >
          {state === "saved" ? t.saved : t.save}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost h-9 px-4 text-[13px]">
          {t.cancel}
        </button>
      </div>
    </div>
  );
}
