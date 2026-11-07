import type { Metadata } from "next";
import Link from "next/link";
import { href } from "@/lib/i18n";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";
import { EventAddForm } from "@/components/EventAddForm";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  return pageMeta(lang, "/afisha/add", "Добавить мероприятие в афишу — бесплатно", "Организуете концерт, выставку, мастер-класс или встречу в Грузии? Добавьте событие в афишу NomerOk бесплатно.");
}

export default async function AddEventPage({ params }: LangParams) {
  const lang = await langOf(params);
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      <Link href={href(lang, "/afisha")} className="text-[14px] text-muted hover:text-ink">
        ← Афиша
      </Link>
      <h1 className="mt-3 text-[26px] font-bold leading-tight sm:text-[34px]">Добавить мероприятие</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">Концерт, спектакль, выставка, мастер-класс, вечеринка, детский праздник, встреча — в любом городе Грузии. Бесплатно. Мы проверим и опубликуем, а после даты событие само уйдёт в архив.</p>
      <div className="mt-6">
        <EventAddForm lang={lang} />
      </div>
    </div>
  );
}
