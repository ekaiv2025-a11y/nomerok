import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/lib/site";
import { isLocale } from "@/lib/i18n/config";

const ADSENSE_CLIENT = "ca-pub-5576253699234226";
// Счётчики: номер Яндекс Метрики и идентификатор Google Analytics 4 (G-…) — задаются в Vercel → Settings → Environment Variables
const YM_ID = process.env.NEXT_PUBLIC_YM_ID?.replace(/\D/g, "") || "";
const GA_ID = /^G-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GA_ID ?? "") ? process.env.NEXT_PUBLIC_GA_ID! : "";

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
      <body className="min-h-screen font-sans antialiased">
        {children}
        {/* Счётчик посещений Vercel (включается во вкладке Analytics проекта) — только на страницах сайта */}
        {ads && <Analytics />}
        {ads && YM_ID && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${YM_ID},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`,
              }}
            />
            <noscript>
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://mc.yandex.ru/watch/${YM_ID}`} style={{ position: "absolute", left: "-9999px" }} alt="" />
              </div>
            </noscript>
          </>
        )}
        {ads && GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
            <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');` }} />
          </>
        )}
      </body>
    </html>
  );
}
