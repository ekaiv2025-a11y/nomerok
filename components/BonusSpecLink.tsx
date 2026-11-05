"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/** Ссылка в блоке бонусов: специалисту — «включить бонус», остальным — «регистрация». Cookie читаем в браузере, чтобы главную можно было кешировать. */
export function BonusSpecLink({ lang, joinHref, on, join }: { lang: string; joinHref: string; on: string; join: string }) {
  const [spec, setSpec] = useState(false);
  useEffect(() => setSpec(/(?:^|;\s*)nm_is_spec=1/.test(document.cookie)), []);
  return (
    <Link href={spec ? `/${lang}/cabinet?tab=promo#bonus` : joinHref} className="mt-2 inline-block text-[13px] font-semibold text-[#6b4f12] underline">
      {spec ? on : join} →
    </Link>
  );
}
