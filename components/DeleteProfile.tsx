"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import type { Locale } from "@/lib/i18n";

const T = {
  ru: {
    open: "Удалить анкету",
    title: "Удалить анкету?",
    pauseQ: "Уезжаете или нужен перерыв?",
    pause: "Лучше поставьте анкету на паузу: она останется на сайте, но заявки приходить не будут. Вернуться можно в любой момент.",
    pauseBtn: "Поставить на паузу",
    what: "Что произойдёт при удалении:",
    list: ["анкета сразу исчезнет с сайта и из поиска", "заявки и сообщения от NomerOk приходить перестанут", "ваши мероприятия снимутся с афиши", "30 дней анкету можно восстановить со всеми фото и отзывами, потом удалим насовсем"],
    why: "Почему удаляете? (необязательно)",
    reasons: [["noclients", "Нет клиентов"], ["stopped", "Больше не работаю"], ["leaving", "Уезжаю"], ["duplicate", "Сделаю новую анкету"], ["other", "Другое"]],
    note: "Что нам улучшить? (необязательно)",
    next: "Удалить анкету",
    sure: (n: string) => `Вы точно хотите удалить анкету «${n}»?`,
    yes: "Да, удалить",
    cancel: "Отмена",
    err: "Не получилось удалить. Обновите страницу и попробуйте ещё раз.",
  },
  en: {
    open: "Delete profile",
    title: "Delete your profile?",
    pauseQ: "Going away or need a break?",
    pause: "Better pause your profile: it stays on the site but you won't get requests. You can come back any time.",
    pauseBtn: "Pause profile",
    what: "What happens when you delete:",
    list: ["the profile disappears from the site and search at once", "requests and messages from NomerOk stop", "your events are removed from the listings", "for 30 days you can restore it with all photos and reviews, then it is deleted for good"],
    why: "Why are you leaving? (optional)",
    reasons: [["noclients", "No clients"], ["stopped", "I no longer work"], ["leaving", "Moving away"], ["duplicate", "Will create a new profile"], ["other", "Other"]],
    note: "What should we improve? (optional)",
    next: "Delete profile",
    sure: (n: string) => `Are you sure you want to delete the profile “${n}”?`,
    yes: "Yes, delete",
    cancel: "Cancel",
    err: "Couldn't delete. Refresh the page and try again.",
  },
  ka: {
    open: "ანკეტის წაშლა",
    title: "წავშალოთ ანკეტა?",
    pauseQ: "მიემგზავრებით ან შესვენება გჭირდებათ?",
    pause: "უმჯობესია ანკეტა დააპაუზოთ: საიტზე დარჩება, მაგრამ განაცხადები არ მოგივათ. დაბრუნება ნებისმიერ დროს შეიძლება.",
    pauseBtn: "პაუზა",
    what: "რა მოხდება წაშლისას:",
    list: ["ანკეტა მაშინვე გაქრება საიტიდან და ძიებიდან", "განაცხადები და შეტყობინებები აღარ მოგივათ", "თქვენი ღონისძიებები მოიხსნება აფიშიდან", "30 დღის განმავლობაში შეგიძლიათ აღადგინოთ ფოტოებითა და შეფასებებით, შემდეგ სამუდამოდ წაიშლება"],
    why: "რატომ შლით? (არასავალდებულო)",
    reasons: [["noclients", "კლიენტები არ არის"], ["stopped", "აღარ ვმუშაობ"], ["leaving", "მივემგზავრები"], ["duplicate", "ახალ ანკეტას შევქმნი"], ["other", "სხვა"]],
    note: "რა გავაუმჯობესოთ? (არასავალდებულო)",
    next: "ანკეტის წაშლა",
    sure: (n: string) => `ნამდვილად გსურთ ანკეტის „${n}“ წაშლა?`,
    yes: "დიახ, წაშლა",
    cancel: "გაუქმება",
    err: "წაშლა ვერ მოხერხდა. განაახლეთ გვერდი და სცადეთ ხელახლა.",
  },
} as const;

/** Кабинет → Анкета: удалить анкету (с предложением паузы и двойным подтверждением). */
export function DeleteProfile({ lang, name }: { lang: Locale; name: string }) {
  const t = T[lang];
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);

  if (step === 0)
    return (
      <div className="mt-10 border-t border-line pt-5">
        <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-2 text-[14px] text-muted hover:text-danger">
          <Trash2 className="h-4 w-4" /> {t.open}
        </button>
      </div>
    );

  return (
    <section className="mt-10 rounded-2xl border border-danger/40 bg-[#fdf3f2] p-5">
      <h2 className="text-[19px] font-bold">{t.title}</h2>

      <div className="mt-3 rounded-xl bg-white p-4">
        <p className="text-[15px] font-semibold">⏸ {t.pauseQ}</p>
        <p className="mt-1 text-[14px] leading-relaxed text-muted">{t.pause}</p>
        <Link href={`/${lang}/cabinet?tab=home#pause`} className="btn-primary mt-3 h-10 px-4 text-[14px]">
          {t.pauseBtn}
        </Link>
      </div>

      <p className="mt-4 text-[14px] font-semibold">{t.what}</p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-[14px] leading-relaxed">
        {t.list.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>

      <p className="mt-4 text-[14px] font-semibold">{t.why}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {t.reasons.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setReason(reason === id ? "" : id)}
            className={`rounded-full border px-3 py-1.5 text-[13.5px] ${reason === id ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={500} placeholder={t.note} className="field mt-3 w-full py-2 text-[14px]" />

      {step === 1 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setStep(2)} className="btn h-11 bg-danger px-5 text-white hover:opacity-90">
            {t.next}
          </button>
          <button type="button" onClick={() => setStep(0)} className="btn-ghost h-11 px-5">
            {t.cancel}
          </button>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-danger bg-white p-4" role="alertdialog" aria-label={t.sure(name)}>
          <p className="text-[16px] font-bold">{t.sure(name)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setErr(false);
                const r = await fetch("/api/cabinet/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lang, confirm: "delete", reason, note }) }).catch(() => null);
                if (r?.ok) {
                  router.push(`/${lang}/cabinet?tab=home`);
                  router.refresh();
                } else {
                  setErr(true);
                  setBusy(false);
                }
              }}
              className="btn h-11 gap-2 bg-danger px-5 text-white hover:opacity-90"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} {t.yes}
            </button>
            <button type="button" disabled={busy} onClick={() => setStep(0)} className="btn-ghost h-11 px-5">
              {t.cancel}
            </button>
          </div>
          {err && <p className="mt-2 text-[13px] text-danger">{t.err}</p>}
        </div>
      )}
    </section>
  );
}
