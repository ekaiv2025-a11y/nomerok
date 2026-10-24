"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";

export type RefCode = { code: string; name: string; created_at: string; used_at: string | null; reward_at: string | null };

const T = {
  ru: {
    title: "Коды рекомендаций",
    how: "Новый клиент называет код (или он приходит вместе с сообщением с сайта). Нажмите «Друг пришёл» — мы сообщим тому, кто вас порекомендовал, что ему положен бонус. Когда выдадите бонус — нажмите «Бонус выдан».",
    from: "посоветовал(а)",
    wait: "Ждём друга",
    used: "Друг пришёл — бонус рекомендателю положен",
    done: "Бонус выдан ✓",
    btnUsed: "Друг пришёл",
    btnReward: "Бонус выдан",
    undo: "Отменить",
    noPhone: "без уведомления: человек не вошёл на сайт",
  },
  en: {
    title: "Referral codes",
    how: "A new client names the code (or it comes with a message from the site). Tap “Friend came” — we'll tell the person who recommended you that their bonus is due. When you've given the bonus, tap “Bonus given”.",
    from: "recommended by",
    wait: "Waiting for the friend",
    used: "Friend came — the recommender's bonus is due",
    done: "Bonus given ✓",
    btnUsed: "Friend came",
    btnReward: "Bonus given",
    undo: "Undo",
    noPhone: "no notification: the person didn't sign in",
  },
  ka: {
    title: "რეკომენდაციის კოდები",
    how: "ახალი კლიენტი გეუბნებათ კოდს (ან ის საიტიდან შეტყობინებასთან ერთად მოდის). დააჭირეთ «მეგობარი მოვიდა» — შევატყობინებთ რეკომენდატორს, რომ ბონუსი ეკუთვნის. ბონუსის გაცემის შემდეგ დააჭირეთ «ბონუსი გაცემულია».",
    from: "ურჩია",
    wait: "მეგობარს ველოდებით",
    used: "მეგობარი მოვიდა — რეკომენდატორს ბონუსი ეკუთვნის",
    done: "ბონუსი გაცემულია ✓",
    btnUsed: "მეგობარი მოვიდა",
    btnReward: "ბონუსი გაცემულია",
    undo: "გაუქმება",
    noPhone: "შეტყობინების გარეშე: არ შესულა საიტზე",
  },
} as const;

/** Кабинет: коды рекомендаций со статусами «ждём друга → друг пришёл → бонус выдан». */
export function RefCodes({ lang, codes: initial, hasReward }: { lang: Locale; codes: (RefCode & { notify: boolean })[]; hasReward: boolean }) {
  const t = T[lang];
  const [codes, setCodes] = useState(initial);
  const [busy, setBusy] = useState("");
  if (!codes.length) return null;

  async function act(code: string, action: "used" | "rewarded" | "undo") {
    setBusy(code);
    const r = await fetch("/api/cabinet/referral", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, action }) }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    setBusy("");
    if (j.ok) setCodes((list) => list.map((c) => (c.code === code ? { ...c, used_at: j.used_at, reward_at: j.reward_at } : c)));
  }
  const fmt = (iso: string) => new Date(iso).toLocaleDateString(lang === "ka" ? "ka-GE" : lang === "en" ? "en-GB" : "ru-RU", { day: "numeric", month: "short" });

  return (
    <div className="mt-3 rounded-2xl bg-cream p-4">
      <p className="text-[16px] font-bold">🎟 {t.title}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-muted">{t.how}</p>
      <ul className="mt-3 space-y-2">
        {codes.map((c) => {
          const state = c.reward_at ? "done" : c.used_at ? "used" : "wait";
          return (
            <li key={c.code} className="rounded-xl bg-white p-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-mono text-[15px] font-bold tracking-wider">{c.code}</span>
                <span className="text-[13px] text-muted">
                  {t.from} {c.name} · {fmt(c.created_at)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${state === "done" ? "bg-brand-soft text-brand-dark" : state === "used" ? "bg-[#fdf3dc] text-[#6b4f12]" : "bg-cream text-muted"}`}>
                  {state === "done" ? t.done : state === "used" ? t.used : t.wait}
                </span>
                {state === "wait" && (
                  <button type="button" disabled={busy === c.code} onClick={() => act(c.code, "used")} className="btn-primary h-8 px-3 text-[13px]">
                    ✅ {t.btnUsed}
                  </button>
                )}
                {state === "used" && hasReward && (
                  <button type="button" disabled={busy === c.code} onClick={() => act(c.code, "rewarded")} className="btn-primary h-8 px-3 text-[13px]">
                    🎁 {t.btnReward}
                  </button>
                )}
                {state !== "wait" && (
                  <button type="button" disabled={busy === c.code} onClick={() => act(c.code, "undo")} className="text-[12px] text-muted underline">
                    {t.undo}
                  </button>
                )}
                {!c.notify && state === "wait" && <span className="text-[11px] text-muted">({t.noPhone})</span>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
