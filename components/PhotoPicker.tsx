"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef } from "react";
import { Camera, X } from "lucide-react";

const TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Выбор до max фото с превью. Файлы хранит родитель. */
export function PhotoPicker({
  files,
  onChange,
  max = 3,
  addLabel,
  onError,
  errorText,
}: {
  files: File[];
  onChange: (f: File[]) => void;
  max?: number;
  addLabel: string;
  onError: (msg: string) => void;
  errorText: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  function add(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (!TYPES.includes(f.type) || f.size > 5 * 1024 * 1024 || next.length >= max) {
        onError(errorText);
        continue;
      }
      next.push(f);
    }
    onChange(next);
    if (input.current) input.current.value = "";
  }
  return (
    <div className="flex flex-wrap gap-2.5">
      {files.map((f, i) => (
        <div key={i} className="relative h-20 w-20">
          <img src={URL.createObjectURL(f)} alt="" className="h-20 w-20 rounded-xl bg-cream object-cover" />
          <button
            type="button"
            onClick={() => onChange(files.filter((_, j) => j !== i))}
            className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white"
            aria-label="×"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      {files.length < max && (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line bg-cream text-[11px] text-muted hover:border-brand hover:text-brand"
        >
          <Camera className="h-6 w-6" />
          {addLabel}
        </button>
      )}
      <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => add(e.target.files)} />
    </div>
  );
}
