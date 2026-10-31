"use client";

import { useState } from "react";

/** Обёртка: фото можно перетащить мышью из папки прямо в этот блок. */
export function DropZone({ onFiles, children, className = "", label = "Отпустите — загрузим фото" }: { onFiles: (files: FileList) => void; children: React.ReactNode; className?: string; label?: string }) {
  const [over, setOver] = useState(0);
  const hasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");
  return (
    <div
      className={`relative ${className}`}
      onDragEnter={(e) => hasFiles(e) && (e.preventDefault(), setOver((n) => n + 1))}
      onDragOver={(e) => hasFiles(e) && e.preventDefault()}
      onDragLeave={(e) => hasFiles(e) && setOver((n) => Math.max(0, n - 1))}
      onDrop={(e) => {
        if (!hasFiles(e)) return;
        e.preventDefault();
        setOver(0);
        const imgs = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
        if (!imgs.length) return;
        const dt = new DataTransfer();
        imgs.forEach((f) => dt.items.add(f));
        onFiles(dt.files);
      }}
    >
      {children}
      {over > 0 && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-2 border-dashed border-brand bg-brand-soft/90 text-[15px] font-semibold text-brand-dark">
          {label}
        </div>
      )}
    </div>
  );
}
