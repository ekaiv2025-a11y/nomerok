"use client";

import { useRef } from "react";
import { PhotoPositioner } from "./PhotoPositioner";
import { withY } from "@/lib/photo-pos";

/** Админка: «подвинуть фото» — меняет ссылку в поле photo_url этой формы (сохранится кнопкой «Сохранить»). */
export function AdminPhotoPos({ url }: { url: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  return (
    <span ref={ref} className="block">
      <PhotoPositioner
        url={url}
        lang="ru"
        onSave={(y) => {
          const input = ref.current?.closest("form")?.querySelector<HTMLInputElement>('input[name="photo_url"]');
          if (!input) return false;
          input.value = withY(input.value || url, y);
          return true;
        }}
      />
      <span className="mt-1 block text-[12px] text-muted">После «Сохранить» здесь нажмите и основную кнопку «Сохранить» внизу формы.</span>
    </span>
  );
}
