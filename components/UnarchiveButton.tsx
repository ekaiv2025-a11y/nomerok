"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { Locale } from "@/lib/i18n";

export function UnarchiveButton({ lang, label }: { lang: Locale; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/cabinet/unarchive", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lang }) }).catch(() => null);
        router.refresh();
        setBusy(false);
      }}
      className="btn-primary mt-3 h-11 w-full"
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" />} {label}
    </button>
  );
}
