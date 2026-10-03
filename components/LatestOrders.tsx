import Link from "next/link";
import { listOrders } from "@/lib/orders-db";
import { OrderCard } from "./OrderCard";
import { ORD } from "@/lib/orders-text";
import { href, type Locale } from "@/lib/i18n";

/** Главная: последние заказы — видно, что сервис живой. */
export async function LatestOrders({ lang }: { lang: Locale }) {
  const list = (await listOrders().catch(() => [])).slice(0, 4);
  if (list.length === 0) return null;
  const t = ORD[lang];
  return (
    <section className="mx-auto mt-12 max-w-6xl px-4 sm:px-6">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-[22px] font-bold">📋 {t.latest}</h2>
        <Link href={href(lang, "/orders")} className="text-[14px] font-semibold text-brand hover:underline">
          {t.all}
        </Link>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {list.map((o) => (
          <OrderCard key={o.id} o={o} lang={lang} />
        ))}
      </div>
    </section>
  );
}
