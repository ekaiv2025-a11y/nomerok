"use client";

import { useState } from "react";

/** «Показать телефон» в объявлении без анкеты (собственник, агент, застройщик): номер приходит по нажатию и считается обращением. */
export function ListingPhone({ id, label }: { id: string; label: string }) {
  const [phone, setPhone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (phone)
    return (
      <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="btn-primary h-12 w-full px-5 text-[17px] sm:w-auto">
        📞 {phone}
      </a>
    );
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const r = await fetch(`/api/realty/contact?id=${id}`).then((x) => x.json()).catch(() => null);
        setBusy(false);
        if (r?.phone) setPhone(r.phone);
      }}
      className="btn-primary h-12 w-full px-5 sm:w-auto"
    >
      {label}
    </button>
  );
}
