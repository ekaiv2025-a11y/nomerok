import { headers } from "next/headers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NotFoundBody } from "@/components/NotFoundBody";
import { isLocale } from "@/lib/i18n";

export default async function NotFound() {
  const l = (await headers()).get("x-nm-lang");
  const lang = isLocale(l) ? l : "ru";
  return (
    <>
      <Header lang={lang} />
      <NotFoundBody />
      <Footer lang={lang} />
    </>
  );
}
