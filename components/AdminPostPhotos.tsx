"use client";

import { useEffect, useRef, useState } from "react";
import { DropZone } from "./DropZone";
import { splitPhoto, withY } from "@/lib/photo-pos";
import { resizeImage } from "@/lib/image-resize";

/** Админка журнала: галерея фото — загрузка по одному, порядок, удаление. Ссылки уходят в форму скрытым полем. */
/** Предпросмотр обложки: тянем фото мышью/пальцем вверх-вниз, как оно встанет в карточке журнала. */
function CoverPreview({ url, onChange }: { url: string; onChange: (y: number) => void }) {
  const { src, y } = splitPhoto(url);
  const drag = useRef<{ start: number; pos: number; h: number } | null>(null);
  const frame = (cls: string, label: string) => (
    <div>
      <p className="mb-1 text-[11px] text-muted">{label}</p>
      <div
        className={`relative cursor-ns-resize touch-none select-none overflow-hidden rounded-xl bg-cream ${cls}`}
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          drag.current = { start: e.clientY, pos: y, h: (e.currentTarget as HTMLElement).clientHeight };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          // тянем фото вниз — видим верх (y уменьшается)
          onChange(Math.round(Math.min(100, Math.max(0, d.pos - ((e.clientY - d.start) / d.h) * 100))));
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src!} alt="" draggable={false} className="pointer-events-none h-full w-full object-cover" style={{ objectPosition: `50% ${y}%` }} />
      </div>
    </div>
  );
  return (
    <div className="mt-3 rounded-xl border border-line p-3">
      <p className="text-[13px] font-semibold">Обложка: как будет выглядеть</p>
      <p className="text-[12px] text-muted">Потяните фото вверх или вниз мышью — или двигайте ползунок.</p>
      <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_1.4fr]">
        {frame("h-36", "Карточка в журнале")}
        {frame("h-44", "Начало статьи")}
      </div>
      <input type="range" min={0} max={100} value={y} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full" aria-label="Положение обложки" />
    </div>
  );
}

export function AdminPostPhotos({ initial, hint, cover = true }: { initial: string[]; hint?: string; cover?: boolean }) {
  const [list, setList] = useState<string[]>(initial);
  const [busy, setBusy] = useState(0);
  const [err, setErr] = useState("");

  async function add(files: FileList | null): Promise<string[]> {
    if (!files) return [];
    setErr("");
    const urls: string[] = [];
    for (const f of Array.from(files).slice(0, 20)) {
      setBusy((n) => n + 1);
      try {
        const fd = new FormData();
        fd.append("file", await resizeImage(f, 1600, 0.85));
        const j = await fetch("/api/admin/upload", { method: "POST", body: fd }).then((r) => r.json());
        if (j.ok) {
          setList((l) => [...l, j.url]);
          urls.push(j.url);
        } else setErr(j.error || "Не удалось загрузить");
      } catch {
        setErr("Нет связи — попробуйте ещё раз");
      }
      setBusy((n) => n - 1);
    }
    return urls;
  }

  // Вставить фото в текст статьи там, где стоит курсор (поле «Текст» на этой же странице)
  const body = () => document.querySelector<HTMLTextAreaElement>('textarea[name="body"]');
  function insertInText(url: string, at?: number) {
    const ta = body();
    if (!ta) return;
    const pos = at ?? ta.selectionStart ?? ta.value.length;
    const line = `\n\n@фото: ${url.split("#")[0]} | \n\n`;
    ta.value = (ta.value.slice(0, pos).replace(/\s*$/, "") + line + ta.value.slice(pos).replace(/^\s*/, "")).replace(/^\n+/, "");
    const caret = ta.value.indexOf(line.trim()) + line.trim().length;
    ta.focus();
    ta.setSelectionRange(caret, caret);
  }
  // Перетащили фото прямо в поле текста — загружаем и вставляем в это место
  const [hasBody, setHasBody] = useState(false);
  const addRef = useRef(add);
  addRef.current = add;
  useEffect(() => {
    const ta = body();
    if (!ta) return;
    setHasBody(true);
    const over = (e: DragEvent) => {
      if (Array.from(e.dataTransfer?.types ?? []).includes("Files")) e.preventDefault();
    };
    const drop = async (e: DragEvent) => {
      const files = e.dataTransfer?.files;
      if (!files?.length) return;
      e.preventDefault();
      const pos = ta.selectionStart ?? ta.value.length;
      const urls = await addRef.current(files);
      [...urls].reverse().forEach((u) => insertInText(u, pos));
    };
    ta.addEventListener("dragover", over);
    ta.addEventListener("drop", drop);
    return () => {
      ta.removeEventListener("dragover", over);
      ta.removeEventListener("drop", drop);
    };
  }, []);
  const move = (i: number, d: number) =>
    setList((l) => {
      const n = [...l];
      const j = i + d;
      if (j < 0 || j >= n.length) return l;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  return (
    <DropZone onFiles={(f) => void add(f)}>
      <input type="hidden" name="photos" value={JSON.stringify(list)} />
      {list.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {list.map((u, i) => (
            <div key={u} className="relative overflow-hidden rounded-lg bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="aspect-[4/3] w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 px-1 py-0.5 text-[12px] text-white">
                <button type="button" onClick={() => move(i, -1)} aria-label="Левее">◀</button>
                <button type="button" onClick={() => setList((l) => l.filter((x) => x !== u))}>✕</button>
                {hasBody && (
                  <button type="button" onClick={() => insertInText(u)} title="Вставить фото в текст там, где стоит курсор">
                    ↳ в текст
                  </button>
                )}
                <button type="button" onClick={() => move(i, 1)} aria-label="Правее">▶</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {cover && list[0] && <CoverPreview url={list[0]} onChange={(y) => setList((l) => [withY(l[0], y), ...l.slice(1)])} />}
      <label className="btn-ghost mt-2 inline-flex h-9 cursor-pointer px-4 text-[13px]">
        {busy ? `Загружаю… (${busy})` : "+ Добавить фото"}
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      </label>
      {err && <p className="mt-1 text-[13px] text-danger">{err}</p>}
      <p className="mt-1 text-[12px] text-muted">{hint ?? "Можно выбрать сразу несколько или перетащить мышью сюда. Первое фото — обложка. Остальные покажутся галереей после текста, а нажмите «↳ в текст» — и фото встанет в статью там, где стоит курсор. Можно и сразу перетащить фото в поле текста."}</p>
    </DropZone>
  );
}
