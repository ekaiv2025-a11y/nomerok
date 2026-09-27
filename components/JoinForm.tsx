"use client";

import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { LANGUAGES, PRICE_UNITS } from "@/lib/categories";
import { CategoryOptions } from "./CategoryOptions";
import { Field, Honeypot, fc, useSubmit } from "./form-kit";
import { SITE_NAME } from "@/lib/site";

export function JoinForm() {
  const { state, errors, message, submit } = useSubmit("/api/masters");

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-brand/30 bg-brand-soft p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-brand" />
        <h2 className="mt-3 text-xl font-bold">Анкета отправлена</h2>
        <p className="mt-2 text-[15px] text-[#3d5a4c]">
          Мы проверим её и свяжемся с вами, обычно в течение дня. После этого профиль появится на сайте.
        </p>
        <Link href="/" className="btn-ghost mt-5">На главную</Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const num = (k: string) => {
      const v = String(f.get(k) ?? "").trim();
      return v === "" ? null : v;
    };
    submit({
      name: f.get("name"),
      category: f.get("category"),
      services: f.get("services"),
      about: f.get("about"),
      credentials: f.get("credentials"),
      experience_years: num("experience_years"),
      price_from: num("price_from"),
      price_unit: f.get("price_unit"),
      languages: f.getAll("languages"),
      phone: f.get("phone"),
      telegram: f.get("telegram"),
      whatsapp: f.get("whatsapp") === "on",
      consent: f.get("consent") === "on",
      website: f.get("website"),
    });
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-5" noValidate>
      <Honeypot />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Имя и фамилия" hint="Как вас покажем клиентам" error={errors.name}>
          <input name="name" autoComplete="name" className={fc(errors.name)} required />
        </Field>
        <Field label="Направление" error={errors.category}>
          <select name="category" defaultValue="" className={fc(errors.category)} required>
            <option value="" disabled>Выберите…</option>
            <CategoryOptions />
          </select>
        </Field>
      </div>
      <Field label="Услуги" hint="Каждую с новой строки, можно с ценой" error={errors.services}>
        <textarea name="services" rows={5} className={fc(errors.services)} required placeholder={"Замена смесителя — 40 ₾\nИли: Английский для детей — 30 ₾ / занятие"} />
      </Field>
      <Field label="О себе" optional hint="Опыт, чем отличаетесь, в каких районах работаете" error={errors.about}>
        <textarea name="about" rows={4} className={fc(errors.about)} />
      </Field>
      <Field label="Образование и документы" optional hint="Диплом, лицензия, место работы. Для врачей, психологов и юристов — обязательно" error={errors.credentials}>
        <textarea name="credentials" rows={3} className={fc(errors.credentials)} placeholder="Например: ТГМУ, 2012. Лицензия №… Работаю в клинике «…»" />
      </Field>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
        <Field label="Опыт, лет" optional error={errors.experience_years}>
          <input name="experience_years" type="number" min={0} max={70} inputMode="numeric" className={fc(errors.experience_years)} />
        </Field>
        <Field label="Цена от, ₾" optional error={errors.price_from}>
          <input name="price_from" type="number" min={0} inputMode="numeric" className={fc(errors.price_from)} />
        </Field>
        <Field label="За что" error={errors.price_unit}>
          <select name="price_unit" defaultValue="час" className={fc(errors.price_unit)}>
            {PRICE_UNITS.map((u) => (
              <option key={u} value={u}>за {u}</option>
            ))}
          </select>
        </Field>
      </div>
      <fieldset>
        <legend className="text-[14px] font-semibold">Языки</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <label key={l} className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-3.5 py-2 text-[14px] has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
              <input type="checkbox" name="languages" value={l} className="accent-[#1f6b4f]" defaultChecked={l === "Русский"} />
              {l}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Телефон" hint="Его увидят клиенты" error={errors.phone}>
          <input name="phone" type="tel" inputMode="tel" autoComplete="tel" className={fc(errors.phone)} placeholder="+995 555 12 34 56" required />
        </Field>
        <Field label="Ник в Telegram" optional error={errors.telegram}>
          <input name="telegram" className={fc(errors.telegram)} placeholder="@ivan_master" autoCapitalize="off" />
        </Field>
      </div>
      <label className="flex items-center gap-3 text-[15px]">
        <input type="checkbox" name="whatsapp" defaultChecked className="h-5 w-5 accent-[#1f6b4f]" />
        На этом номере есть WhatsApp
      </label>
      <label className="flex items-start gap-3 rounded-xl bg-cream p-3.5 text-[14px] leading-snug">
        <input type="checkbox" name="consent" className="mt-0.5 h-5 w-5 shrink-0 accent-[#1f6b4f]" />
        <span>
          Согласен(на) на публикацию профиля и контактов на {SITE_NAME} и с <Link href="/terms" className="underline">правилами сервиса</Link>.
          {errors.consent && <span className="mt-1 block text-danger">{errors.consent}</span>}
        </span>
      </label>
      {message && <p className="rounded-xl bg-[#fdecea] p-3 text-[14px] text-danger">{message}</p>}
      <button type="submit" disabled={state === "sending"} className="btn-primary h-12 w-full">
        {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" />} Отправить анкету
      </button>
    </form>
  );
}
