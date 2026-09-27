import Link from "next/link";
import { Catalog } from "@/components/Catalog";
import { SetupNotice } from "@/components/SetupNotice";
import { listPublishedMasters, DbNotConfiguredError } from "@/lib/db";
import type { PublicMaster } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let masters: PublicMaster[] = [];
  let notConfigured = false;
  try {
    masters = await listPublishedMasters();
  } catch (e) {
    // Любая ошибка базы — показываем аккуратное сообщение, а не белый экран.
    console.error(e);
    notConfigured = true;
    if (!(e instanceof DbNotConfiguredError)) console.error("Ошибка базы. Проверьте /api/health");
  }

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-6 pt-8 sm:px-6 sm:pt-12">
        <h1 className="max-w-2xl text-[28px] font-bold leading-[1.15] tracking-tight sm:text-[40px]">
          Специалисты в Батуми — <span className="text-brand">напрямую</span>
        </h1>
        <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-muted sm:text-[17px]">
          Выберите специалиста и позвоните или напишите ему сами. Не нашли нужного — оставьте заявку, мы подберём.
        </p>
        <ol className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted">
          <li><b className="text-ink">1.</b> Выбираете специалиста</li>
          <li><b className="text-ink">2.</b> Открываете контакты</li>
          <li><b className="text-ink">3.</b> Договариваетесь напрямую</li>
        </ol>
        <Link href="/join" className="mt-4 inline-block text-[14px] font-semibold text-brand hover:underline sm:hidden">
          Вы специалист? Разместите профиль →
        </Link>
      </section>
      {notConfigured ? <SetupNotice /> : <Catalog masters={masters} />}
    </>
  );
}
