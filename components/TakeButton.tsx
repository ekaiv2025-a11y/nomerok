"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ORD } from "@/lib/orders-text";
import type { Locale } from "@/lib/i18n";

export function TakeButton({ id, lang }: { id: string; lang: Locale }) {
  const t = ORD[lang];
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setErr("");
          const r = await fetch("/api/cabinet/take", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId: id }) }).catch(() => null);
          const d = await r?.json().catch(() => null);
          setBusy(false);
          if (r?.ok) router.refresh();
          else setErr(t.errors[d?.error] ?? t.errors.gone);
        }}
        className="btn-primary h-10 px-5 text-[14px]"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} ✋ {t.take}
      </button>
      {err && <p className="mt-1 text-[13px] text-danger">{err}</p>}
    </div>
  );
}
