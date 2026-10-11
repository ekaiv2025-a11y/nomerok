"use client";

import { useMemo, useState } from "react";

export type PickMaster = {
  id: string;
  name: string;
  cat: string; // подпись раздела
  inCat: boolean; // в разделе заявки
  hasTg: boolean; // бот подключён — уйдёт автоматически
  href: string | null; // чат для ручной пересылки (если бота нет)
  linkToken: string | null;
};

type Req = { id: string; description: string; when: string; client: string; phone: string; catLabel: string };

/** Админка: выбрать конкретных специалистов и отправить им заявку. */
export function AdminPickMasters({ req, masters, bot, action }: { req: Req; masters: PickMaster[]; bot: string | null; action: (fd: FormData) => void }) {
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const f = s ? masters.filter((m) => `${m.name} ${m.cat}`.toLowerCase().includes(s)) : masters;
    return [...f].sort((a, b) => Number(b.inCat) - Number(a.inCat) || Number(b.hasTg) - Number(a.hasTg) || a.name.localeCompare(b.name));
  }, [q, masters]);

  const forwardText = (m: PickMaster) => {
    const first = m.name.split(" ")[0];
    return `Здравствуйте, ${first}! Это NomerOk.ge — у нас есть заявка (${req.catLabel}), возможно, вам подойдёт:\n\n«${req.description}»${req.when ? `\nКогда: ${req.when}` : ""}\n\nКлиент: ${req.client || "—"}, ${req.phone}\nЕсли возьмётесь — свяжитесь с клиентом напрямую.${bot && m.linkToken ? `\n\nЧтобы заявки приходили вам сами, подключите нашего бота: https://t.me/${bot}?start=m_${m.linkToken}` : ""}\n\nДмитрий, NomerOk`;
  };

  return (
    <details className="mt-2 rounded-xl border-2 border-brand/40 bg-white p-3 text-[13px]">
      <summary className="cursor-pointer font-semibold text-brand">🎯 Отправить выбранным специалистам</summary>
      <form action={action} className="mt-2">
        <input type="hidden" name="id" value={req.id} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск по имени или разделу…" className="field mb-2 h-9 w-full text-[13px]" />
        <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
          {list.map((m) => (
            <div key={m.id} className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-cream">
              {m.hasTg ? (
                <label className="flex grow cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    name="mid"
                    value={m.id}
                    checked={picked.has(m.id)}
                    onChange={(e) => {
                      const n = new Set(picked);
                      if (e.target.checked) n.add(m.id);
                      else n.delete(m.id);
                      setPicked(n);
                    }}
                  />
                  <span className="font-medium">{m.name}</span>
                  <span className="text-muted">· {m.cat}</span>
                </label>
              ) : (
                <>
                  <span className="grow">
                    <span className="font-medium">{m.name}</span> <span className="text-muted">· {m.cat} · без бота</span>
                  </span>
                  {m.href && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(forwardText(m));
                        } catch {}
                        setCopied(m.name.split(" ")[0]);
                        window.open(m.href!, "_blank", "noopener");
                      }}
                      className="shrink-0 rounded-full border border-line px-2.5 py-0.5 text-[12px] hover:border-brand"
                      title="Скопирует текст заявки и откроет его Telegram — останется вставить и отправить"
                    >
                      📋 Переслать вручную
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
          {!list.length && <p className="px-2 text-muted">Никого не нашли</p>}
        </div>
        {copied && <p className="mt-2 text-[12px] text-brand-dark">✓ Текст для {copied} скопирован — вставьте его в открывшемся чате</p>}
        <button disabled={!picked.size} className="btn-primary mt-2 h-9 px-4 text-[13px] disabled:opacity-40">
          📨 Отправить в Telegram{picked.size ? ` (${picked.size})` : ""}
        </button>
        <p className="mt-1 text-[12px] text-muted">Придёт от бота с кнопкой «Беру» — даже если специалист из другого раздела. Взявший получит телефон клиента.</p>
      </form>
    </details>
  );
}
