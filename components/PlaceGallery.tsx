"use client";

import { useState } from "react";
import { ArticleGallery } from "./ArticleGallery";
import type { Locale } from "@/lib/i18n/config";

/*
 * Фото места с вкладками по подписям: интерьер, блюда, меню, снаружи…
 * Без подписей — обычная сетка.
 */
const KIND: Record<string, Record<Locale, string>> = {
  интерьер: { ru: "Интерьер", en: "Interior", ka: "ინტერიერი" },
  снаружи: { ru: "Снаружи", en: "Outside", ka: "გარედან" },
  терраса: { ru: "Терраса", en: "Terrace", ka: "ტერასა" },
  вид: { ru: "Вид", en: "View", ka: "ხედი" },
  блюда: { ru: "Блюда", en: "Dishes", ka: "კერძები" },
  меню: { ru: "Меню", en: "Menu", ka: "მენიუ" },
};
const ALL = { ru: "Все фото", en: "All photos", ka: "ყველა ფოტო" };

export function PlaceGallery({ photos, kinds, lang, credit }: { photos: string[]; kinds: string[]; lang: Locale; credit?: string | null }) {
  const [tab, setTab] = useState<string>("");
  const present = Object.keys(KIND).filter((k) => kinds.includes(k));
  const idx = photos.map((_, i) => i).filter((i) => !tab || kinds[i] === tab);
  const chip = (on: boolean) => `whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-medium ${on ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"}`;
  return (
    <section className="mt-8">
      {present.length > 1 && (
        <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <button type="button" onClick={() => setTab("")} className={chip(!tab)}>
            {ALL[lang]} <span className="opacity-60">{photos.length}</span>
          </button>
          {present.map((k) => (
            <button key={k} type="button" onClick={() => setTab(k)} className={chip(tab === k)}>
              {KIND[k][lang]} <span className="opacity-60">{kinds.filter((x) => x === k).length}</span>
            </button>
          ))}
        </div>
      )}
      <ArticleGallery key={tab} className="" photos={idx.map((i) => photos[i])} captions={idx.map((i) => (kinds[i] ? KIND[kinds[i]]?.[lang] ?? "" : ""))} />
      {credit && <p className="mt-2 text-[12px] text-muted">{credit}</p>}
    </section>
  );
}
