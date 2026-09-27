import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — специалисты в Батуми напрямую`, template: `%s — ${SITE_NAME}` },
  description:
    "Мастера, репетиторы, врачи, няни и другие специалисты в Батуми. Контакты напрямую, без посредников. Не нашли нужного — оставьте заявку, подберём сами.",
  openGraph: { siteName: SITE_NAME, locale: "ru_RU", type: "website" },
};

export const viewport: Viewport = { themeColor: "#1f6b4f", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
