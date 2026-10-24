"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Locale } from "@/lib/i18n";

const T = {
  ru: { title: "📋 Мои шаблоны", hint: "Создайте объявление и нажмите внизу «Сохранить как шаблон». Потом новое объявление начинается с шаблона в одно нажатие.", empty: "Шаблонов пока нет.", use: "Новое по шаблону", rename: "Переименовать", del: "Удалить", sure: "Удалить шаблон?", save: "Сохранить" },
  en: { title: "📋 My templates", hint: "Create a listing and tap “Save as template” at the bottom. Then start a new listing from a template in one tap.", empty: "No templates yet.", use: "New from template", rename: "Rename", del: "Delete", sure: "Delete the template?", save: "Save" },
  ka: { title: "📋 ჩემი შაბლონები", hint: "შექმენით განცხადება და ქვემოთ დააჭირეთ «შაბლონად შენახვას». შემდეგ ახალი განცხადება შაბლონით ერთი დაჭერით იწყება.", empty: "შაბლონები ჯერ არ არის.", use: "ახალი შაბლონით", rename: "სახელის შეცვლა", del: "წაშლა", sure: "წავშალოთ შაბლონი?", save: "შენახვა" },
} as const;

/** Кабинет риелтора: список шаблонов — новое объявление по шаблону, переименовать, удалить. */
export function TemplateList({ lang, initial }: { lang: Locale; initial: { id: string; name: string }[] }) {
  const t = T[lang];
  const [list, setList] = useState(initial);
  const [edit, setEdit] = useState<string | null>(null);
  const [name, setName] = useState("");

  async function rename(id: string) {
    const n = name.trim();
    if (n.length < 2) return;
    const r = await fetch("/api/realty/template", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, name: n }) }).then((x) => x.json()).catch(() => null);
    if (r?.ok) setList((l) => l.map((x) => (x.id === id ? { ...x, name: n } : x)));
    setEdit(null);
  }
  async function remove(id: string) {
    if (!confirm(t.sure)) return;
    await fetch("/api/realty/template", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }).catch(() => null);
    setList((l) => l.filter((x) => x.id !== id));
  }

  return (
    <section className="rounded-2xl border border-[#f0d58a] bg-[#fffaf0] p-5">
      <h2 className="text-[18px] font-bold">{t.title}</h2>
      <p className="mt-1 text-[13px] text-[#5a4410]">{t.hint}</p>
      {list.length === 0 ? (
        <p className="mt-3 text-[13px] text-muted">{t.empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {list.map((x) => (
            <li key={x.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-white px-3 py-2">
              {edit === x.id ? (
                <>
                  <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className="field h-9 min-w-0 flex-1" autoFocus />
                  <button type="button" onClick={() => rename(x.id)} className="btn-primary h-9 px-3 text-[13px]">
                    {t.save}
                  </button>
                </>
              ) : (
                <>
                  <span className="min-w-0 flex-1 text-[15px] font-semibold">{x.name}</span>
                  <a href={`/${lang}/cabinet?tab=realty&new=1&tpl=${x.id}`} className="btn-primary h-9 px-3 text-[13px]">
                    {t.use}
                  </a>
                  <button type="button" onClick={() => (setEdit(x.id), setName(x.name))} className="rounded-full p-2 text-muted hover:text-ink" aria-label={t.rename} title={t.rename}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => remove(x.id)} className="rounded-full p-2 text-muted hover:text-danger" aria-label={t.del} title={t.del}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
