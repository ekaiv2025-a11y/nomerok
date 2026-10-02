"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MasterCard } from "./MasterCard";
import { readFavs } from "./FavButton";
import { SOCIAL } from "@/lib/social-text";
import { getDict, href, type Locale } from "@/lib/i18n";
import type { PublicMaster } from "@/lib/types";

export function FavList({ masters, lang }: { masters: PublicMaster[]; lang: Locale }) {
  const t = SOCIAL[lang];
  const [slugs, setSlugs] = useState<string[] | null>(null);
  useEffect(() => {
    const sync = () => setSlugs(readFavs());
    sync();
    window.addEventListener("nm:fav", sync);
    return () => window.removeEventListener("nm:fav", sync);
  }, []);
  if (slugs === null) return null;
  const list = slugs.map((s) => masters.find((m) => m.slug === s)).filter((m): m is PublicMaster => !!m);
  if (!list.length)
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-line bg-cream px-5 py-10 text-center">
        <p className="text-[15px]">{t.favEmpty}</p>
        <Link href={href(lang)} className="btn-primary mt-5">
          {getDict(lang).nav.allSpecialists}
        </Link>
      </div>
    );
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {list.map((m) => (
        <MasterCard key={m.id} m={m} lang={lang} />
      ))}
    </div>
  );
}
