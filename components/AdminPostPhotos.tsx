"use client";

import { useState } from "react";
import { resizeImage } from "@/lib/image-resize";

/** Админка журнала: галерея фото — загрузка по одному, порядок, удаление. Ссылки уходят в форму скрытым полем. */
export function AdminPostPhotos({ initial }: { initial: string[] }) {
  const [list, setList] = useState<string[]>(initial);
  const [busy, setBusy] = useState(0);
  const [err, setErr] = useState("");

  async function add(files: FileList | null) {
    if (!files) return;
    setErr("");
    for (const f of Array.from(files).slice(0, 20)) {
      setBusy((n) => n + 1);
      try {
        const fd = new FormData();
        fd.append("file", await resizeImage(f, 1600, 0.85));
        const j = await fetch("/api/admin/upload", { method: "POST", body: fd }).then((r) => r.json());
        if (j.ok) setList((l) => [...l, j.url]);
        else setErr(j.error || "Не удалось загрузить");
      } catch {
        setErr("Нет связи — попробуйте ещё раз");
      }
      setBusy((n) => n - 1);
    }
  }
  const move = (i: number, d: number) =>
    setList((l) => {
      const n = [...l];
      const j = i + d;
      if (j < 0 || j >= n.length) return l;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  return (
    <div>
      <input type="hidden" name="photos" value={JSON.stringify(list)} />
      {list.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {list.map((u, i) => (
            <div key={u} className="relative overflow-hidden rounded-lg bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="aspect-[4/3] w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 px-1 py-0.5 text-[12px] text-white">
                <button type="button" onClick={() => move(i, -1)} aria-label="Левее">◀</button>
                <button type="button" onClick={() => setList((l) => l.filter((x) => x !== u))}>✕ убрать</button>
                <button type="button" onClick={() => move(i, 1)} aria-label="Правее">▶</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <label className="btn-ghost mt-2 inline-flex h-9 cursor-pointer px-4 text-[13px]">
        {busy ? `Загружаю… (${busy})` : "+ Добавить фото"}
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      </label>
      {err && <p className="mt-1 text-[13px] text-danger">{err}</p>}
      <p className="mt-1 text-[12px] text-muted">Можно выбрать сразу несколько. Покажутся галереей после текста. Порядок — стрелками.</p>
    </div>
  );
}
