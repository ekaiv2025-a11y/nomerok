"use client";

import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { CategoryOptions } from "./CategoryOptions";
import { Field, Honeypot, fc, useSubmit } from "./form-kit";

type Props = { defaultCategory?: string; master?: { slug: string; name: string; category: string } | null };

export function RequestForm({ defaultCategory, master }: Props) {
  const { state, errors, message, submit } = useSubmit("/api/requests");

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-brand/30 bg-brand-soft p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-brand" />
        <h2 className="mt-3 text-xl font-bold">Заявка отправлена</h2>
        <p className="mt-2 text-[15px] text-[#3d5a4c]">
          {master ? `Передадим её специалисту ${master.name.split(" ")[0]}.` : "Подберём специалиста и"} Перезвоним или напишем на указанный номер.
        </p>
        <Link href="/" className="btn-ghost mt-5">На главную</Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    submit({
      category: f.get("category"),
      description: f.get("description"),
      when_text: f.get("when_text"),
      name: f.get("name"),
      phone: f.get("phone"),
      master_slug: master?.slug ?? "",
      website: f.get("website"),
    });
  }

  const initialCat = master?.category ?? (CATEGORIES.some((c) => c.id === defaultCategory) ? defaultCategory : "");

  return (
    <form onSubmit={onSubmit} className="relative space-y-5" noValidate>
      <Honeypot />
      {master && (
        <div className="rounded-xl bg-cream p-3 text-[14px]">
          Заявка специалисту: <b>{master.name}</b>
        </div>
      )}
      <Field label="Кто нужен?" error={errors.category}>
        <select name="category" defaultValue={initialCat} className={fc(errors.category)} required>
          <option value="" disabled>Выберите…</option>
          <CategoryOptions />
        </select>
      </Field>
      <Field label="Что нужно сделать?" hint="Чем подробнее, тем быстрее подберём" error={errors.description}>
        <textarea name="description" rows={4} className={fc(errors.description)} placeholder="Например: течёт смеситель на кухне. Или: ищу репетитора по английскому для ребёнка 8 лет." required />
      </Field>
      <Field label="Когда удобно?" optional error={errors.when_text}>
        <input name="when_text" className={fc(errors.when_text)} placeholder="Сегодня вечером, в выходные…" />
      </Field>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Ваше имя" optional error={errors.name}>
          <input name="name" autoComplete="given-name" className={fc(errors.name)} />
        </Field>
        <Field label="Телефон" hint="Позвоним или напишем в WhatsApp" error={errors.phone}>
          <input name="phone" type="tel" inputMode="tel" autoComplete="tel" className={fc(errors.phone)} placeholder="+995 555 12 34 56" required />
        </Field>
      </div>
      {message && <p className="rounded-xl bg-[#fdecea] p-3 text-[14px] text-danger">{message}</p>}
      <button type="submit" disabled={state === "sending"} className="btn-primary h-12 w-full">
        {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" />} Отправить заявку
      </button>
      <p className="text-center text-[12px] text-muted">
        Нажимая кнопку, вы соглашаетесь, что мы передадим ваш номер специалисту. <Link href="/privacy" className="underline">Подробнее</Link>
      </p>
    </form>
  );
}
