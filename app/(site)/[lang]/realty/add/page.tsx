import { redirect } from "next/navigation";
import { langOf, type LangParams } from "@/lib/i18n/page";

/** «Разместить объект» — короткая ссылка для баннеров и рассылок: ведёт в «Мои объявления» с новой формой. */
export default async function AddListing({ params }: LangParams) {
  const lang = await langOf(params);
  redirect(`/${lang}/realty/my?new=1`);
}
