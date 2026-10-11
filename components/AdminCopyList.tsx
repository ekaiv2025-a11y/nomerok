"use client";

import { useEffect, useState } from "react";

type Item = { key: string; label: string; sub?: string; href: string; text: string };

/** Админка: список «скопировать текст + открыть чат», отмечает, кому уже отправлено (в этом браузере). */
export function AdminCopyList({ items, storeKey }: { items: Item[]; storeKey: string }) {
  const [done, setDone] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      setDone(new Set(JSON.parse(localStorage.getItem(storeKey) || "[]")));
    } catch {}
  }, [storeKey]);
  const mark = (k: string) => {
    const n = new Set(done).add(k);
    setDone(n);
    try {
      localStorage.setItem(storeKey, JSON.stringify([...n]));
    } catch {}
  };
  return (
    <div className="mt-2 divide-y divide-line/60">
      {items.map((it) => (
        <div key={it.key} className="flex items-center gap-2 py-1.5">
          <span className={`grow text-[13px] ${done.has(it.key) ? "text-muted line-through" : ""}`}>
            {it.label} {it.sub && <span className="text-muted">· {it.sub}</span>}
          </span>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(it.text);
              } catch {}
              mark(it.key);
              window.open(it.href, "_blank", "noopener");
            }}
            className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-semibold ${done.has(it.key) ? "border border-line bg-white text-muted" : "bg-brand text-white"}`}
          >
            {done.has(it.key) ? "✓ Ещё раз" : "📋 Скопировать и открыть чат"}
          </button>
        </div>
      ))}
    </div>
  );
}
