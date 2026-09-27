import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import { isLocale } from "@/lib/i18n/config";

export const metadata: Metadata = { metadataBase: new URL(SITE_URL) };

export const viewport: Viewport = { themeColor: "#1f6b4f", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Язык страницы передаёт proxy.ts в заголовке x-nm-lang (админка — всегда русский)
  const h = await headers();
  const l = h.get("x-nm-lang");
  const lang = isLocale(l) ? l : "ru";
  return (
    <html lang={lang}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
