import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import { isLocale } from "@/lib/i18n/config";

const ADSENSE_CLIENT = "ca-pub-5576253699234226";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Подтверждение сайта в Google Search Console и Яндекс Вебмастере
  verification: { google: "aP1Zi8ZLQQ8sCMkHwzWjo1_KSyFPKDUuGy0r4-VXWtA", yandex: "ee91b2713be96947" },
};

export const viewport: Viewport = { themeColor: "#1f6b4f", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Язык страницы передаёт proxy.ts в заголовке x-nm-lang (админка — всегда русский)
  const h = await headers();
  const l = h.get("x-nm-lang");
  const lang = isLocale(l) ? l : "ru";
  // Google AdSense — только на страницах сайта (x-nm-lang есть только у них), не в админке
  const ads = isLocale(l);
  return (
    <html lang={lang}>
      {ads && (
        <head>
          <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
          <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`} crossOrigin="anonymous" />
        </head>
      )}
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
