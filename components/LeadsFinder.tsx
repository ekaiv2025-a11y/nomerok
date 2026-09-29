"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, categoryLabel } from "@/lib/categories";
import { findLeads, inviteText, messageLink, type Lead } from "@/lib/leads";

type Mark = { status: string; created_at: string };
type View = "new" | "sent" | "skip" | "registered";

export function LeadsFinder() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [marks, setMarks] = useState<Record<string, Mark>>({});
  const [registered, setRegistered] = useState<Set<string>>(new Set());
  const [cats, setCats] = useState<Record<string, string>>({});
  const [catFilter, setCatFilter] = useState("");
  const [view, setView] = useState<View>("new");
  const [copied, setCopied] = useState("");

  async function onFiles(list: FileList | null) {
    if (!list?.length) return;
    setBusy(true);
    setInfo("");
    try {
      const parsed: unknown[] = [];
      for (const f of Array.from(list)) {
        try {
          parsed.push(JSON.parse(await f.text()));
        } catch {
          setInfo(`Файл «${f.name}» не похож на выгрузку Telegram в формате JSON.`);
        }
      }
      const r = findLeads(parsed);
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check", candidates: r.leads.map((l) => ({ userId: l.userId, usernames: l.usernames, phones: l.phones })) }),
      }).then((x) => x.json()).catch(() => null);
      setMarks(res?.marks ?? {});
      setRegistered(new Set(res?.registered ?? []));
      setLeads(r.leads);
      setCats({});
      setView("new");
      setInfo(`Чатов: ${r.chats.length} · сообщений просмотрено: ${r.messages} · найдено специалистов: ${r.leads.length}`);
    } finally {
      setBusy(false);
    }
  }

  const catOf = (l: Lead) => cats[l.userId] ?? l.category;
  const stateOf = (l: Lead): View => (registered.has(l.userId) ? "registered" : marks[l.userId]?.status === "sent" ? "sent" : marks[l.userId]?.status === "skip" ? "skip" : "new");

  const counts = useMemo(() => {
    const c: Record<View, number> = { new: 0, sent: 0, skip: 0, registered: 0 };
    for (const l of leads) c[stateOf(l)]++;
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads, marks, registered]);

  const today = new Date().toISOString().slice(0, 10);
  const sentToday = Object.values(marks).filter((m) => m.status === "sent" && m.created_at.slice(0, 10) === today).length;

  const shown = leads.filter((l) => stateOf(l) === view && (!catFilter || catOf(l) === catFilter));
  const catsPresent = [...new Set(leads.map(catOf))];

  async function mark(l: Lead, status: "sent" | "skip" | "reset") {
    const prev = marks;
    setMarks((m) => {
      const n = { ...m };
      if (status === "reset") delete n[l.userId];
      else n[l.userId] = { status, created_at: new Date().toISOString() };
      return n;
    });
    const res = await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark", userId: l.userId, name: l.name, category: catOf(l), status }),
    }).then((x) => x.json()).catch(() => null);
    if (!res?.ok) {
      setMarks(prev);
      alert("Не удалось сохранить. Проверьте на /api/health, что есть «0011 приглашения: ✓».");
    }
  }

  async function copy(l: Lead) {
    await navigator.clipboard.writeText(inviteText(categoryLabel(catOf(l)), l.name)).catch(() => {});
    setCopied(l.userId);
    setTimeout(() => setCopied(""), 2000);
  }

  const tabs: [View, string][] = [
    ["new", "Новые"],
    ["sent", "Написал"],
    ["skip", "Не подходят"],
    ["registered", "Уже на сайте"],
  ];

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-line bg-white p-6 text-center hover:border-brand">
        <span className="text-[16px] font-semibold">{busy ? "Читаю…" : "📂 Выбрать result.json"}</span>
        <span className="text-[13px] text-muted">можно несколько файлов сразу</span>
        <input type="file" accept=".json,application/json" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
      </label>
      {info && <p className="text-[14px] text-muted">{info}</p>}

      {leads.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {tabs.map(([v, label]) => (
              <button key={v} onClick={() => setView(v)} className={`h-9 rounded-full px-4 text-[13px] font-semibold ${view === v ? "bg-ink text-white" : "bg-white"}`}>
                {label} · {counts[v]}
              </button>
            ))}
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="field h-9 w-auto py-0 text-[13px]">
              <option value="">Все категории</option>
              {catsPresent.map((c) => (
                <option key={c} value={c}>
                  {categoryLabel(c)}
                </option>
              ))}
            </select>
            <span className={`ml-auto rounded-full px-3 py-1 text-[13px] font-semibold ${sentToday >= 30 ? "bg-[#fdecea] text-danger" : "bg-brand-soft text-brand-dark"}`}>
              Сегодня написали: {sentToday} / 30
            </span>
          </div>

          {shown.length === 0 && <p className="rounded-2xl bg-white p-6 text-[15px]">Здесь пусто.</p>}

          {shown.map((l) => {
            const link = messageLink(l);
            const st = stateOf(l);
            return (
              <div key={l.userId} className="rounded-2xl bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <b className="text-[16px]">{l.name}</b>
                  <select
                    value={catOf(l)}
                    onChange={(e) => setCats((c) => ({ ...c, [l.userId]: e.target.value }))}
                    className="rounded-full border border-line bg-cream px-2 py-0.5 text-[12px]"
                    title="Категорию можно поправить — от неё зависит текст приглашения"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label.ru}
                      </option>
                    ))}
                  </select>
                  <span className="text-[12px] text-muted">
                    {l.chat} · {l.date.slice(0, 10)}
                    {l.count > 1 ? ` · объявлений: ${l.count}` : ""}
                  </span>
                </div>
                <p className="mt-2 line-clamp-5 whitespace-pre-line text-[14px] text-[#3a3935]">{l.text}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {link && (
                    <a href={link} target="_blank" rel="noopener noreferrer" className="btn-ghost h-9 px-4 text-[13px]">
                      💬 Открыть сообщение
                    </a>
                  )}
                  {l.usernames[0] ? (
                    <a href={`https://t.me/${l.usernames[0]}`} target="_blank" rel="noopener noreferrer" className="btn-ghost h-9 px-4 text-[13px]">
                      ✉️ @{l.usernames[0]}
                    </a>
                  ) : (
                    <a href={`tg://user?id=${l.userId}`} className="btn-ghost h-9 px-4 text-[13px]">
                      ✉️ Написать
                    </a>
                  )}
                  <button onClick={() => copy(l)} className="btn-ghost h-9 px-4 text-[13px]">
                    {copied === l.userId ? "✓ Скопировано" : "📋 Скопировать приглашение"}
                  </button>
                  <span className="grow" />
                  {st === "new" && (
                    <>
                      <button onClick={() => mark(l, "sent")} className="btn-primary h-9 px-4 text-[13px]">
                        Написал ✓
                      </button>
                      <button onClick={() => mark(l, "skip")} className="btn-ghost h-9 px-4 text-[13px]">
                        Не подходит
                      </button>
                    </>
                  )}
                  {(st === "sent" || st === "skip") && (
                    <button onClick={() => mark(l, "reset")} className="btn-ghost h-9 px-4 text-[13px]">
                      Вернуть в новые
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
