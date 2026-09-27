import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = { title: "Как это работает" };

export default function HowPage() {
  return (
    <div className="prose-page mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-[26px] font-bold sm:text-[32px]">Как это работает</h1>

      <h2>Для клиентов</h2>
      <ul>
        <li>Выберите специалиста в каталоге и нажмите «Показать контакты» — позвоните или напишите ему в WhatsApp или Telegram.</li>
        <li>Не нашли подходящего — <Link href="/request" className="font-semibold text-brand underline">оставьте заявку</Link>. Мы подберём специалиста и перезвоним.</li>
        <li>О цене, сроках и оплате вы договариваетесь со специалистом напрямую. {SITE_NAME} не берёт с клиентов денег и не делает наценку.</li>
      </ul>

      <h2 id="masters">Для специалистов</h2>
      <ul>
        <li>Заполните <Link href="/join" className="font-semibold text-brand underline">анкету</Link>. Мы проверим её, при необходимости уточним детали и опубликуем профиль.</li>
        <li>Клиенты связываются с вами напрямую, по вашему телефону, WhatsApp или Telegram.</li>
        <li>На старте размещение бесплатное. Если условия изменятся, мы заранее предупредим всех специалистов, и вы сами решите, оставаться ли на сайте.</li>
        <li>Хотите убрать или изменить профиль — напишите нам, сделаем в тот же день.</li>
      </ul>

      <h2>Отзывы</h2>
      <p>Мы публикуем только отзывы реальных клиентов. Пока их нет, у специалиста нет рейтинга — это честнее, чем придуманные звёзды.</p>
    </div>
  );
}
