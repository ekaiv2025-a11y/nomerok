"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { MasterCard } from "./MasterCard";
import { readFavs, writeFavs } from "./FavButton";
import { MY } from "@/lib/my-text";
import { SOCIAL } from "@/lib/social-text";
import type { Locale } from "@/lib/i18n";
import type { PublicMaster } from "@/lib/types";

/** Избранное в кабинете клиента: объединяем с устройством и аккаунтом. */
export function MyFavs({ masters, lang }: { masters: PublicMaster[]; lang: Locale }) {
  const [slugs, setSlugs] = useState<string[] | null>(null);
  useEffect(() => {
    fetch("/api/my", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "favs", slugs: readFavs() }) })
      .then((r) => r.json())
      .then((d) => {
        const merged: string[] = Array.isArray(d?.slugs) ? d.slugs : readFavs();
        writeFavs(merged);
        setSlugs(merged);
      })
      .catch(() => setSlugs(readFavs()));
    const sync = () => setSlugs(readFavs());
    window.addEventListener("nm:fav", sync);
    return () => window.removeEventListener("nm:fav", sync);
  }, []);
  if (slugs === null) return <Loader2 className="mt-4 h-5 w-5 animate-spin text-muted" />;
  const list = slugs.map((s) => masters.find((m) => m.slug === s)).filter((m): m is PublicMaster => !!m);
  if (!list.length) return <p className="mt-3 rounded-2xl bg-cream p-5 text-[14px] text-muted">{SOCIAL[lang].favEmpty}</p>;
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {list.map((m) => (
        <MasterCard key={m.id} m={m} lang={lang} />
      ))}
    </div>
  );
}

export function CloseRequestButton({ id, lang }: { id: string; lang: Locale }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/my", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "close", id }) }).catch(() => {});
        router.refresh();
      }}
      className="btn-ghost h-9 px-4 text-[13px]"
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" />} {MY[lang].close}
    </button>
  );
}

export function LogoutButton({ lang }: { lang: Locale }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/my", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) }).catch(() => {});
        router.refresh();
      }}
      className="text-[13px] text-muted underline hover:text-ink"
    >
      {MY[lang].logout}
    </button>
  );
}
