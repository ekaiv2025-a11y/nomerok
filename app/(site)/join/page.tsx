import type { Metadata } from "next";
import Link from "next/link";
import { JoinForm } from "@/components/JoinForm";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Разместить профиль специалиста",
  description: `Специалистам Батуми: разместите профиль на ${SITE_NAME} и получайте заказы напрямую.`,
};

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-[26px] font-bold leading-tight sm:text-[32px]">Разместить профиль специалиста</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        Клиенты будут звонить и писать вам напрямую. Мы проверим анкету и опубликуем её, обычно в течение дня. На старте это бесплатно. <Link href="/how#masters" className="font-semibold text-brand underline">Условия</Link>
      </p>
      <div className="mt-6">
        <JoinForm />
      </div>
    </div>
  );
}
